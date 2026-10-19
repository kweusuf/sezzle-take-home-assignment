package calculator

import (
	"errors"
	"math"
	"testing"
)

func ptr(v float64) *float64 { return &v }

func TestCalculate(t *testing.T) {
	tests := []struct {
		name     string
		op       Operation
		a        float64
		b        *float64
		want     float64
		wantCode ErrorCode
	}{
		// Addition
		{name: "add positive integers", op: Add, a: 10, b: ptr(5), want: 15},
		{name: "add negative and positive", op: Add, a: -8, b: ptr(3), want: -5},
		{name: "add zero", op: Add, a: 0, b: ptr(0), want: 0},
		{name: "add fractions", op: Add, a: 0.5, b: ptr(0.25), want: 0.75},
		{name: "add overflow", op: Add, a: math.MaxFloat64, b: ptr(math.MaxFloat64), wantCode: CodeInvalidResult},

		// Subtraction
		{name: "subtract", op: Subtract, a: 10, b: ptr(5), want: 5},
		{name: "subtract to negative", op: Subtract, a: 5, b: ptr(10), want: -5},
		{name: "subtract negative", op: Subtract, a: -5, b: ptr(-10), want: 5},
		{name: "subtract fractions", op: Subtract, a: 0.3, b: ptr(0.1), want: 0.2},

		// Multiplication
		{name: "multiply", op: Multiply, a: 7, b: ptr(6), want: 42},
		{name: "multiply by zero", op: Multiply, a: 7, b: ptr(0), want: 0},
		{name: "multiply negatives", op: Multiply, a: -3, b: ptr(-4), want: 12},
		{name: "multiply fractions", op: Multiply, a: 0.1, b: ptr(0.2), want: 0.02},
		{name: "multiply overflow", op: Multiply, a: math.MaxFloat64, b: ptr(2), wantCode: CodeInvalidResult},

		// Division
		{name: "divide", op: Divide, a: 7, b: ptr(2), want: 3.5},
		{name: "divide zero numerator", op: Divide, a: 0, b: ptr(5), want: 0},
		{name: "divide negatives", op: Divide, a: -9, b: ptr(3), want: -3},
		{name: "divide by zero", op: Divide, a: 1, b: ptr(0), wantCode: CodeDivisionByZero},
		{name: "divide by negative zero", op: Divide, a: 1, b: ptr(math.Copysign(0, -1)), wantCode: CodeDivisionByZero},

		// Percentage: a as a percentage of b
		{name: "percentage quarter", op: Percentage, a: 25, b: ptr(100), want: 25},
		{name: "percentage fraction", op: Percentage, a: 25, b: ptr(200), want: 12.5},
		{name: "percentage zero numerator", op: Percentage, a: 0, b: ptr(50), want: 0},
		{name: "percentage of zero", op: Percentage, a: 5, b: ptr(0), wantCode: CodeDivisionByZero},

		// Power
		{name: "power integer exponent", op: Power, a: 2, b: ptr(10), want: 1024},
		{name: "power zero exponent", op: Power, a: 5, b: ptr(0), want: 1},
		{name: "power fractional exponent", op: Power, a: 9, b: ptr(0.5), want: 3},
		{name: "power negative exponent", op: Power, a: 2, b: ptr(-2), want: 0.25},
		{name: "power negative base fractional exponent", op: Power, a: -8, b: ptr(0.5), wantCode: CodeInvalidResult},
		{name: "power zero to negative exponent", op: Power, a: 0, b: ptr(-1), wantCode: CodeInvalidResult},
		{name: "power overflow", op: Power, a: 10, b: ptr(400), wantCode: CodeInvalidResult},
		{name: "power negative base integer exponent", op: Power, a: -2, b: ptr(3), want: -8},

		// Square root
		{name: "sqrt perfect square", op: Sqrt, a: 25, want: 5},
		{name: "sqrt zero", op: Sqrt, a: 0, want: 0},
		{name: "sqrt fraction", op: Sqrt, a: 0.25, want: 0.5},
		{name: "sqrt negative", op: Sqrt, a: -1, wantCode: CodeInvalidOperand},
		{name: "sqrt rejects operand b", op: Sqrt, a: 4, b: ptr(2), wantCode: CodeInvalidOperand},

		// Arity
		{name: "add missing b", op: Add, a: 1, wantCode: CodeMissingOperand},
		{name: "divide missing b", op: Divide, a: 1, wantCode: CodeMissingOperand},
		{name: "power missing b", op: Power, a: 1, wantCode: CodeMissingOperand},
		{name: "percentage missing b", op: Percentage, a: 1, wantCode: CodeMissingOperand},

		// Operation validation
		{name: "unsupported operation", op: Operation("modulo"), a: 1, b: ptr(2), wantCode: CodeUnsupportedOperation},
		{name: "empty operation", op: Operation(""), a: 1, b: ptr(2), wantCode: CodeUnsupportedOperation},
		{name: "operation is case sensitive", op: Operation("ADD"), a: 1, b: ptr(2), wantCode: CodeUnsupportedOperation},

		// Non-finite operands
		{name: "NaN operand a", op: Add, a: math.NaN(), b: ptr(1), wantCode: CodeInvalidOperand},
		{name: "NaN operand b", op: Add, a: 1, b: ptr(math.NaN()), wantCode: CodeInvalidOperand},
		{name: "Inf operand a", op: Divide, a: math.Inf(1), b: ptr(2), wantCode: CodeInvalidOperand},
		{name: "negative Inf operand b", op: Multiply, a: 2, b: ptr(math.Inf(-1)), wantCode: CodeInvalidOperand},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := Calculate(tt.op, tt.a, tt.b)

			if tt.wantCode == "" {
				if err != nil {
					t.Fatalf("Calculate(%q, %v, %v) returned unexpected error: %v", tt.op, tt.a, tt.b, err)
				}
				if math.Abs(got-tt.want) > 1e-9 {
					t.Fatalf("Calculate(%q, %v, %v) = %v, want %v", tt.op, tt.a, tt.b, got, tt.want)
				}
				return
			}

			if err == nil {
				t.Fatalf("Calculate(%q, %v, %v) = %v, want error %s", tt.op, tt.a, tt.b, got, tt.wantCode)
			}
			var calcErr *Error
			if !errors.As(err, &calcErr) {
				t.Fatalf("error type = %T, want *calculator.Error", err)
			}
			if calcErr.Code != tt.wantCode {
				t.Fatalf("error code = %s, want %s", calcErr.Code, tt.wantCode)
			}
			if calcErr.Message == "" {
				t.Fatal("error message is empty")
			}
			if gotErr, wantErr := calcErr.Error(), calcErr.Message; gotErr != wantErr {
				t.Fatalf("Error() = %q, want %q", gotErr, wantErr)
			}
		})
	}
}

// TestResultsAreAlwaysFinite guards the package invariant that no successful
// call can return NaN or ±Infinity.
func TestResultsAreAlwaysFinite(t *testing.T) {
	operands := []float64{0, -0, 1, -1, 0.5, math.MaxFloat64, math.SmallestNonzeroFloat64}
	ops := []Operation{Add, Subtract, Multiply, Divide, Power, Percentage}

	for _, op := range ops {
		for _, a := range operands {
			for _, b := range operands {
				got, err := Calculate(op, a, ptr(b))
				if err != nil {
					continue
				}
				if math.IsNaN(got) || math.IsInf(got, 0) {
					t.Fatalf("Calculate(%q, %v, %v) = %v, want finite result or error", op, a, b, got)
				}
			}
		}
	}
}
