// Package api exposes the calculator over HTTP.
//
// The package owns transport concerns only: routing, request size limits,
// strict JSON decoding, HTTP status codes, and the JSON error envelope.
// Arithmetic and numeric domain rules live in the calculator package.
package api

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log"
	"net/http"

	"calculator-app/backend/internal/calculator"
)

// MaxBodyBytes limits the request body size (64 KiB is generous for two
// operands and an operation name).
const MaxBodyBytes = 64 << 10

// HTTP-level error codes. Domain codes are defined by the calculator package.
const (
	codeInvalidJSON      = "INVALID_JSON"
	codeInvalidRequest   = "INVALID_REQUEST"
	codeNotFound         = "NOT_FOUND"
	codeMethodNotAllowed = "METHOD_NOT_ALLOWED"
	codeRequestTooLarge  = "REQUEST_TOO_LARGE"
	codeInternalError    = "INTERNAL_ERROR"
)

// NewHandler returns the HTTP handler for the calculator service.
func NewHandler() http.Handler {
	mux := http.NewServeMux()
	mux.HandleFunc("/api/v1/calculate", handleCalculate)
	mux.HandleFunc("/health", handleHealth)
	mux.HandleFunc("/", handleNotFound)
	return recoverPanics(mux)
}

// calculationRequest is the decoded request body. Operands are pointers so a
// missing or null field is distinguishable from 0.
type calculationRequest struct {
	Operation string   `json:"operation"`
	A         *float64 `json:"a"`
	B         *float64 `json:"b"`
}

type calculationResponse struct {
	Result float64 `json:"result"`
}

type healthResponse struct {
	Status string `json:"status"`
}

type errorResponse struct {
	Error errorDetail `json:"error"`
}

type errorDetail struct {
	Code    string `json:"code"`
	Message string `json:"message"`
}

func handleCalculate(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		w.Header().Set("Allow", http.MethodPost)
		writeError(w, http.StatusMethodNotAllowed, codeMethodNotAllowed, "use POST for this endpoint")
		return
	}

	req, errResp := decodeRequest(w, r)
	if errResp != nil {
		writeError(w, errResp.status, errResp.code, errResp.message)
		return
	}

	if req.Operation == "" {
		writeError(w, http.StatusBadRequest, codeInvalidRequest, "operation is required")
		return
	}
	if req.A == nil {
		writeError(w, http.StatusBadRequest, string(calculator.CodeMissingOperand), "operand a is required")
		return
	}

	result, err := calculator.Calculate(calculator.Operation(req.Operation), *req.A, req.B)
	if err != nil {
		var calcErr *calculator.Error
		if errors.As(err, &calcErr) {
			writeError(w, http.StatusBadRequest, string(calcErr.Code), calcErr.Message)
			return
		}
		// Unexpected domain failure: do not leak details.
		log.Printf("unexpected calculation error: %v", err)
		writeError(w, http.StatusInternalServerError, codeInternalError, "internal server error")
		return
	}

	writeJSON(w, http.StatusOK, calculationResponse{Result: result})
}

func handleHealth(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		w.Header().Set("Allow", http.MethodGet)
		writeError(w, http.StatusMethodNotAllowed, codeMethodNotAllowed, "use GET for this endpoint")
		return
	}
	writeJSON(w, http.StatusOK, healthResponse{Status: "ok"})
}

func handleNotFound(w http.ResponseWriter, r *http.Request) {
	writeError(w, http.StatusNotFound, codeNotFound, "unknown route")
}

// decodeRequest applies the size limit and strict JSON rules: a single JSON
// object, known fields only, correct types, and no trailing values.
func decodeRequest(w http.ResponseWriter, r *http.Request) (calculationRequest, *errorResponseSpec) {
	r.Body = http.MaxBytesReader(w, r.Body, MaxBodyBytes)
	decoder := json.NewDecoder(r.Body)
	decoder.DisallowUnknownFields()

	var req calculationRequest
	if err := decoder.Decode(&req); err != nil {
		if isTooLarge(err) {
			return req, tooLargeSpec()
		}
		if errors.Is(err, io.EOF) {
			return req, &errorResponseSpec{
				status:  http.StatusBadRequest,
				code:    codeInvalidJSON,
				message: "request body is required",
			}
		}
		return req, &errorResponseSpec{
			status:  http.StatusBadRequest,
			code:    codeInvalidJSON,
			message: jsonDecodeMessage(err),
		}
	}

	if err := decoder.Decode(&json.RawMessage{}); !errors.Is(err, io.EOF) {
		if isTooLarge(err) {
			return req, tooLargeSpec()
		}
		return req, &errorResponseSpec{
			status:  http.StatusBadRequest,
			code:    codeInvalidJSON,
			message: "request body must contain a single JSON object",
		}
	}

	return req, nil
}

func isTooLarge(err error) bool {
	var maxBytesErr *http.MaxBytesError
	return errors.As(err, &maxBytesErr)
}

func tooLargeSpec() *errorResponseSpec {
	return &errorResponseSpec{
		status:  http.StatusRequestEntityTooLarge,
		code:    codeRequestTooLarge,
		message: fmt.Sprintf("request body exceeds %d KiB", MaxBodyBytes/1024),
	}
}

// jsonDecodeMessage keeps decode errors stable and free of Go type names.
func jsonDecodeMessage(err error) string {
	var syntaxErr *json.SyntaxError
	if errors.As(err, &syntaxErr) || errors.Is(err, io.ErrUnexpectedEOF) {
		return "request body is not valid JSON"
	}
	return "request body must be a JSON object with known fields of the correct type"
}

type errorResponseSpec struct {
	status  int
	code    string
	message string
}

func writeJSON(w http.ResponseWriter, status int, body any) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(body)
}

func writeError(w http.ResponseWriter, status int, code, message string) {
	writeJSON(w, status, errorResponse{Error: errorDetail{Code: code, Message: message}})
}

// recoverPanics converts a panic into a JSON 500 without exposing internals.
func recoverPanics(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		defer func() {
			if recovered := recover(); recovered != nil {
				log.Printf("panic serving %s %s: %v", r.Method, r.URL.Path, recovered)
				writeError(w, http.StatusInternalServerError, codeInternalError, "internal server error")
			}
		}()
		next.ServeHTTP(w, r)
	})
}
