package api

import (
	"encoding/json"
	"math"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

const (
	calcPath        = "/api/v1/calculate"
	healthPath      = "/health"
	jsonContentType = "application/json; charset=utf-8"
)

func send(method, path, body string) *httptest.ResponseRecorder {
	req := httptest.NewRequest(method, path, strings.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()
	NewHandler().ServeHTTP(rec, req)
	return rec
}

func TestCalculateSuccess(t *testing.T) {
	tests := []struct {
		name string
		body string
		want float64
	}{
		{name: "add", body: `{"operation":"add","a":10,"b":5}`, want: 15},
		{name: "add negative operands", body: `{"operation":"add","a":-8,"b":3}`, want: -5},
		{name: "subtract", body: `{"operation":"subtract","a":10,"b":5}`, want: 5},
		{name: "multiply", body: `{"operation":"multiply","a":7,"b":6}`, want: 42},
		{name: "divide", body: `{"operation":"divide","a":7,"b":2}`, want: 3.5},
		{name: "divide zero numerator", body: `{"operation":"divide","a":0,"b":5}`, want: 0},
		{name: "power", body: `{"operation":"power","a":2,"b":10}`, want: 1024},
		{name: "sqrt", body: `{"operation":"sqrt","a":25}`, want: 5},
		{name: "sqrt zero", body: `{"operation":"sqrt","a":0}`, want: 0},
		{name: "percentage", body: `{"operation":"percentage","a":25,"b":200}`, want: 12.5},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			rec := send(http.MethodPost, calcPath, tt.body)

			if rec.Code != http.StatusOK {
				t.Fatalf("status = %d, want 200; body = %s", rec.Code, rec.Body.String())
			}
			if got := rec.Header().Get("Content-Type"); got != jsonContentType {
				t.Fatalf("Content-Type = %q, want %q", got, jsonContentType)
			}

			var payload map[string]float64
			if err := json.Unmarshal(rec.Body.Bytes(), &payload); err != nil {
				t.Fatalf("response is not JSON: %v (%s)", err, rec.Body.String())
			}
			if len(payload) != 1 {
				t.Fatalf("response has %d fields, want 1: %s", len(payload), rec.Body.String())
			}
			if got := payload["result"]; got != tt.want {
				t.Fatalf("result = %v, want %v", got, tt.want)
			}
		})
	}
}

func TestCalculateSuccessBodyIsExact(t *testing.T) {
	rec := send(http.MethodPost, calcPath, `{"operation":"add","a":10,"b":5}`)
	if got, want := rec.Body.String(), "{\"result\":15}\n"; got != want {
		t.Fatalf("body = %q, want %q", got, want)
	}
}

func TestCalculateErrors(t *testing.T) {
	tests := []struct {
		name      string
		method    string
		path      string
		body      string
		wantCode  string
		wantAllow string
		wantStat  int
	}{
		{name: "divide by zero", method: http.MethodPost, path: calcPath, body: `{"operation":"divide","a":1,"b":0}`, wantStat: 400, wantCode: "DIVISION_BY_ZERO"},
		{name: "percentage of zero", method: http.MethodPost, path: calcPath, body: `{"operation":"percentage","a":5,"b":0}`, wantStat: 400, wantCode: "DIVISION_BY_ZERO"},
		{name: "negative square root", method: http.MethodPost, path: calcPath, body: `{"operation":"sqrt","a":-1}`, wantStat: 400, wantCode: "INVALID_OPERAND"},
		{name: "sqrt rejects operand b", method: http.MethodPost, path: calcPath, body: `{"operation":"sqrt","a":4,"b":2}`, wantStat: 400, wantCode: "INVALID_OPERAND"},
		{name: "missing operand a", method: http.MethodPost, path: calcPath, body: `{"operation":"add","b":2}`, wantStat: 400, wantCode: "MISSING_OPERAND"},
		{name: "null operand a", method: http.MethodPost, path: calcPath, body: `{"operation":"add","a":null,"b":2}`, wantStat: 400, wantCode: "MISSING_OPERAND"},
		{name: "missing operand b", method: http.MethodPost, path: calcPath, body: `{"operation":"add","a":1}`, wantStat: 400, wantCode: "MISSING_OPERAND"},
		{name: "missing operation", method: http.MethodPost, path: calcPath, body: `{"a":1,"b":2}`, wantStat: 400, wantCode: "INVALID_REQUEST"},
		{name: "empty operation", method: http.MethodPost, path: calcPath, body: `{"operation":"","a":1,"b":2}`, wantStat: 400, wantCode: "INVALID_REQUEST"},
		{name: "unsupported operation", method: http.MethodPost, path: calcPath, body: `{"operation":"modulo","a":1,"b":2}`, wantStat: 400, wantCode: "UNSUPPORTED_OPERATION"},
		{name: "operation case sensitive", method: http.MethodPost, path: calcPath, body: `{"operation":"ADD","a":1,"b":2}`, wantStat: 400, wantCode: "UNSUPPORTED_OPERATION"},
		{name: "overflowing result", method: http.MethodPost, path: calcPath, body: `{"operation":"multiply","a":1e308,"b":10}`, wantStat: 400, wantCode: "INVALID_RESULT"},
		{name: "non-finite result", method: http.MethodPost, path: calcPath, body: `{"operation":"power","a":0,"b":-1}`, wantStat: 400, wantCode: "INVALID_RESULT"},
		{name: "malformed json", method: http.MethodPost, path: calcPath, body: `{"operation":`, wantStat: 400, wantCode: "INVALID_JSON"},
		{name: "empty body", method: http.MethodPost, path: calcPath, body: ``, wantStat: 400, wantCode: "INVALID_JSON"},
		{name: "trailing value", method: http.MethodPost, path: calcPath, body: `{"operation":"add","a":1,"b":2} 5`, wantStat: 400, wantCode: "INVALID_JSON"},
		{name: "two objects", method: http.MethodPost, path: calcPath, body: `{"operation":"add","a":1,"b":2}{"operation":"add","a":1,"b":2}`, wantStat: 400, wantCode: "INVALID_JSON"},
		{name: "unknown field", method: http.MethodPost, path: calcPath, body: `{"operation":"add","a":1,"b":2,"c":3}`, wantStat: 400, wantCode: "INVALID_JSON"},
		{name: "wrong operand type", method: http.MethodPost, path: calcPath, body: `{"operation":"add","a":"1","b":2}`, wantStat: 400, wantCode: "INVALID_JSON"},
		{name: "array body", method: http.MethodPost, path: calcPath, body: `[1,2]`, wantStat: 400, wantCode: "INVALID_JSON"},
		{name: "number out of float64 range", method: http.MethodPost, path: calcPath, body: `{"operation":"add","a":1e400,"b":1}`, wantStat: 400, wantCode: "INVALID_JSON"},
		{name: "calculate wrong method get", method: http.MethodGet, path: calcPath, wantStat: 405, wantCode: "METHOD_NOT_ALLOWED", wantAllow: http.MethodPost},
		{name: "calculate wrong method put", method: http.MethodPut, path: calcPath, body: `{"operation":"add","a":1,"b":2}`, wantStat: 405, wantCode: "METHOD_NOT_ALLOWED", wantAllow: http.MethodPost},
		{name: "health wrong method post", method: http.MethodPost, path: healthPath, wantStat: 405, wantCode: "METHOD_NOT_ALLOWED", wantAllow: http.MethodGet},
		{name: "unknown api route", method: http.MethodGet, path: "/api/v1/unknown", wantStat: 404, wantCode: "NOT_FOUND"},
		{name: "root route", method: http.MethodGet, path: "/", wantStat: 404, wantCode: "NOT_FOUND"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			rec := send(tt.method, tt.path, tt.body)

			if rec.Code != tt.wantStat {
				t.Fatalf("status = %d, want %d; body = %s", rec.Code, tt.wantStat, rec.Body.String())
			}
			if got := rec.Header().Get("Content-Type"); got != jsonContentType {
				t.Fatalf("Content-Type = %q, want %q", got, jsonContentType)
			}
			if tt.wantAllow != "" {
				if got := rec.Header().Get("Allow"); got != tt.wantAllow {
					t.Fatalf("Allow = %q, want %q", got, tt.wantAllow)
				}
			}

			var payload struct {
				Error struct {
					Code    string `json:"code"`
					Message string `json:"message"`
				} `json:"error"`
			}
			if err := json.Unmarshal(rec.Body.Bytes(), &payload); err != nil {
				t.Fatalf("error response is not JSON: %v (%s)", err, rec.Body.String())
			}
			if payload.Error.Code != tt.wantCode {
				t.Fatalf("error code = %q, want %q; body = %s", payload.Error.Code, tt.wantCode, rec.Body.String())
			}
			if payload.Error.Message == "" {
				t.Fatalf("error message is empty; body = %s", rec.Body.String())
			}

			body := rec.Body.String()
			for _, leaked := range []string{"goroutine", "panic:", "calculator-app/backend", ".go:"} {
				if strings.Contains(body, leaked) {
					t.Fatalf("error response leaks internals (%q): %s", leaked, body)
				}
			}
		})
	}
}

func TestCalculateBodyTooLarge(t *testing.T) {
	padding := strings.Repeat(" ", MaxBodyBytes+1)
	rec := send(http.MethodPost, calcPath, `{"operation":"add","a":1,"b":2}`+padding)

	if rec.Code != http.StatusRequestEntityTooLarge {
		t.Fatalf("status = %d, want 413; body = %s", rec.Code, rec.Body.String())
	}
	if got := rec.Header().Get("Content-Type"); got != jsonContentType {
		t.Fatalf("Content-Type = %q, want %q", got, jsonContentType)
	}
	var payload struct {
		Error struct {
			Code string `json:"code"`
		} `json:"error"`
	}
	if err := json.Unmarshal(rec.Body.Bytes(), &payload); err != nil {
		t.Fatalf("error response is not JSON: %v (%s)", err, rec.Body.String())
	}
	if payload.Error.Code != "REQUEST_TOO_LARGE" {
		t.Fatalf("error code = %q, want REQUEST_TOO_LARGE", payload.Error.Code)
	}
}

func TestHealth(t *testing.T) {
	rec := send(http.MethodGet, healthPath, "")

	if rec.Code != http.StatusOK {
		t.Fatalf("status = %d, want 200", rec.Code)
	}
	if got := rec.Header().Get("Content-Type"); got != jsonContentType {
		t.Fatalf("Content-Type = %q, want %q", got, jsonContentType)
	}
	if got, want := rec.Body.String(), "{\"status\":\"ok\"}\n"; got != want {
		t.Fatalf("body = %q, want %q", got, want)
	}
}

func TestPanicRecoveryReturnsInternalError(t *testing.T) {
	handler := recoverPanics(http.HandlerFunc(func(http.ResponseWriter, *http.Request) {
		panic("boom")
	}))
	rec := httptest.NewRecorder()
	handler.ServeHTTP(rec, httptest.NewRequest(http.MethodGet, healthPath, nil))

	if rec.Code != http.StatusInternalServerError {
		t.Fatalf("status = %d, want 500", rec.Code)
	}
	if got := rec.Header().Get("Content-Type"); got != jsonContentType {
		t.Fatalf("Content-Type = %q, want %q", got, jsonContentType)
	}
	if body := rec.Body.String(); !strings.Contains(body, "INTERNAL_ERROR") || strings.Contains(body, "boom") {
		t.Fatalf("recovery body = %s, want INTERNAL_ERROR without panic detail", body)
	}
}

// TestZeroAndNegativeZeroEncoding documents that -0 is returned as 0 in JSON.
func TestZeroAndNegativeZeroEncoding(t *testing.T) {
	rec := send(http.MethodPost, calcPath, `{"operation":"multiply","a":-0,"b":5}`)
	if rec.Code != http.StatusOK {
		t.Fatalf("status = %d, want 200", rec.Code)
	}
	var payload struct {
		Result float64 `json:"result"`
	}
	if err := json.Unmarshal(rec.Body.Bytes(), &payload); err != nil {
		t.Fatalf("response is not JSON: %v", err)
	}
	if math.Abs(payload.Result) != 0 {
		t.Fatalf("result = %v, want 0", payload.Result)
	}
}
