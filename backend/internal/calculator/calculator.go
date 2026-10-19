// Package calculator implements the arithmetic core of the service.
//
// It has no knowledge of HTTP: the API layer decodes and validates the JSON
// envelope, then delegates the actual arithmetic and numeric domain rules to
// Calculate. No function in this package ever returns a NaN or ±Infinity
// result; such outcomes are reported as errors instead.
package calculator

import (
	"fmt"
	"math"
)

// Operation identifies a supported calculation.
type Operation string

// Supported operation identifiers.
const (
	Add        Operation = "add"
	Subtract   Operation = "subtract"
	Multiply   Operation = "multiply"
	Divide     Operation = "divide"
	Power      Operation = "power"
	Sqrt       Operation = "sqrt"
	Percentage Operation = "percentage"
)

// ErrorCode is a stable, machine-readable failure identifier. Codes are shared
// with the API layer and are part of the public contract.
type ErrorCode string

// Error codes produced by this package.
const (
	// CodeMissingOperand means a required operand was not supplied.
	CodeMissingOperand ErrorCode = "MISSING_OPERAND"
	// CodeUnsupportedOperation means the operation identifier is unknown.
	CodeUnsupportedOperation ErrorCode = "UNSUPPORTED_OPERATION"
	// CodeInvalidOperand means an operand is unusable: not finite, an
	// unexpected extra operand, or outside an operation's domain.
	CodeInvalidOperand ErrorCode = "INVALID_OPERAND"
	// CodeDivisionByZero means the denominator was zero.
	CodeDivisionByZero ErrorCode = "DIVISION_BY_ZERO"
	// CodeInvalidResult means the arithmetic produced NaN or ±Infinity.
	CodeInvalidResult ErrorCode = "INVALID_RESULT"
)

// Error is a calculation failure carrying a stable code.
type Error struct {
	Code    ErrorCode
	Message string
}

func (e *Error) Error() string { return e.Message }

func newError(code ErrorCode, format string, args ...any) *Error {
	return &Error{Code: code, Message: fmt.Sprintf(format, args...)}
}

// Calculate validates operand presence and arity, then evaluates op.
//
// b must be nil for unary operations (sqrt) and non-nil for binary operations.
// Operands must be finite; NaN and ±Infinity are rejected. The returned result
// is always finite.
func Calculate(op Operation, a float64, b *float64) (float64, error) {
	if !op.supported() {
		return 0, newError(CodeUnsupportedOperation, "unsupported operation %q", string(op))
	}
	if !isFinite(a) {
		return 0, newError(CodeInvalidOperand, "operand a must be a finite number")
	}
	if b != nil && !isFinite(*b) {
		return 0, newError(CodeInvalidOperand, "operand b must be a finite number")
	}

	var result float64
	if op == Sqrt {
		if b != nil {
			return 0, newError(CodeInvalidOperand, "operation %q does not accept operand b", op)
		}
		if a < 0 {
			return 0, newError(CodeInvalidOperand, "cannot take the square root of a negative number")
		}
		result = math.Sqrt(a)
	} else {
		if b == nil {
			return 0, newError(CodeMissingOperand, "operation %q requires operand b", op)
		}
		var err error
		result, err = binary(op, a, *b)
		if err != nil {
			return 0, err
		}
	}

	if !isFinite(result) {
		return 0, newError(CodeInvalidResult, "operation %q produced a non-finite result", op)
	}
	return result, nil
}

func binary(op Operation, a, b float64) (float64, error) {
	switch op {
	case Add:
		return a + b, nil
	case Subtract:
		return a - b, nil
	case Multiply:
		return a * b, nil
	case Divide:
		if b == 0 {
			return 0, newError(CodeDivisionByZero, "cannot divide by zero")
		}
		return a / b, nil
	case Percentage:
		// a as a percentage of b: a/b*100.
		if b == 0 {
			return 0, newError(CodeDivisionByZero, "cannot calculate a percentage of zero")
		}
		return a / b * 100, nil
	case Power:
		// math.Pow yields NaN or ±Infinity for invalid combinations; the
		// caller converts those into CodeInvalidResult.
		return math.Pow(a, b), nil
	}
	return 0, newError(CodeUnsupportedOperation, "unsupported operation %q", string(op))
}

func (op Operation) supported() bool {
	switch op {
	case Add, Subtract, Multiply, Divide, Power, Sqrt, Percentage:
		return true
	}
	return false
}

func isFinite(f float64) bool {
	return !math.IsNaN(f) && !math.IsInf(f, 0)
}
