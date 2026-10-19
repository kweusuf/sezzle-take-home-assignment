export type Operation =
  | 'add'
  | 'subtract'
  | 'multiply'
  | 'divide'
  | 'power'
  | 'sqrt'
  | 'percentage';

export interface OperationOption {
  readonly id: Operation;
  readonly label: string;
  /** Unary operations need only operand a, so the b field is hidden. */
  readonly unary: boolean;
}

/** Mirrors the operation identifiers accepted by the backend. */
export const OPERATIONS: readonly OperationOption[] = [
  { id: 'add', label: 'Add (a + b)', unary: false },
  { id: 'subtract', label: 'Subtract (a − b)', unary: false },
  { id: 'multiply', label: 'Multiply (a × b)', unary: false },
  { id: 'divide', label: 'Divide (a ÷ b)', unary: false },
  { id: 'power', label: 'Power (a ^ b)', unary: false },
  { id: 'sqrt', label: 'Square root (√a)', unary: true },
  { id: 'percentage', label: 'Percentage (a is what % of b)', unary: false },
];

export const DEFAULT_OPERATION: Operation = 'add';

/** Returns the metadata for an operation, falling back to the default. */
export function operationOption(id: Operation): OperationOption {
  return OPERATIONS.find((option) => option.id === id) ?? OPERATIONS[0];
}
