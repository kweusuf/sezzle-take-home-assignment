/**
 * Operation identifiers accepted by the backend
 * (`backend/internal/calculator/calculator.go`). Keep both lists in sync.
 */
export type Operation =
  | 'add'
  | 'subtract'
  | 'multiply'
  | 'divide'
  | 'power'
  | 'sqrt'
  | 'percentage';
