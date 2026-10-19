import { useState, type FormEvent, type ChangeEvent } from 'react';
import { ApiError, calculate } from '../api/client';
import {
  DEFAULT_OPERATION,
  OPERATIONS,
  operationOption,
  type Operation,
} from '../types/calculator';

interface FieldErrors {
  a?: string;
  b?: string;
}

/**
 * Parses an operand from the text input. Returns null for anything that is not
 * a plain finite decimal number, so the backend stays authoritative for the
 * actual arithmetic.
 */
function parseOperand(raw: string): number | null {
  const trimmed = raw.trim();
  if (trimmed === '') {
    return null;
  }
  if (!/^[+-]?(\d+(\.\d*)?|\.\d+)([eE][+-]?\d+)?$/.test(trimmed)) {
    return null;
  }
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : null;
}

export function Calculator() {
  const [operation, setOperation] = useState<Operation>(DEFAULT_OPERATION);
  const [operandA, setOperandA] = useState('');
  const [operandB, setOperandB] = useState('');
  const [result, setResult] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [pending, setPending] = useState(false);

  const selected = operationOption(operation);

  function clearFeedback() {
    setResult(null);
    setError(null);
    setFieldErrors({});
  }

  function handleOperationChange(event: ChangeEvent<HTMLSelectElement>) {
    setOperation(event.target.value as Operation);
    clearFeedback();
  }

  function handleOperandAChange(event: ChangeEvent<HTMLInputElement>) {
    setOperandA(event.target.value);
    clearFeedback();
  }

  function handleOperandBChange(event: ChangeEvent<HTMLInputElement>) {
    setOperandB(event.target.value);
    clearFeedback();
  }

  function handleReset() {
    setOperation(DEFAULT_OPERATION);
    setOperandA('');
    setOperandB('');
    setPending(false);
    clearFeedback();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) {
      return;
    }

    const a = parseOperand(operandA);
    const b = selected.unary ? null : parseOperand(operandB);

    const nextErrors: FieldErrors = {};
    if (a === null) {
      nextErrors.a =
        operandA.trim() === '' ? 'Enter a value for a.' : 'Enter a valid number for a.';
    }
    if (!selected.unary && b === null) {
      nextErrors.b =
        operandB.trim() === '' ? 'Enter a value for b.' : 'Enter a valid number for b.';
    }
    setFieldErrors(nextErrors);
    if (a === null || (!selected.unary && b === null)) {
      setResult(null);
      return;
    }

    setResult(null);
    setError(null);
    setPending(true);
    try {
      const value = await calculate(operation, a, b ?? undefined);
      setResult(value);
    } catch (caught) {
      setError(
        caught instanceof ApiError
          ? caught.message
          : 'Something went wrong. Please try again.',
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="calculator" aria-labelledby="calculator-title">
      <header className="calculator__header">
        <h1 id="calculator-title">Calculator</h1>
        <p className="calculator__subtitle">
          Arithmetic is calculated by the backend service.
        </p>
      </header>

      <form
        className="calculator__form"
        onSubmit={handleSubmit}
        noValidate
        aria-busy={pending}
      >
        <div className="field">
          <label htmlFor="operation">Operation</label>
          <select
            id="operation"
            value={operation}
            onChange={handleOperationChange}
            disabled={pending}
          >
            {OPERATIONS.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="operand-a">First operand (a)</label>
          <input
            id="operand-a"
            type="text"
            inputMode="decimal"
            autoComplete="off"
            placeholder="e.g. 10"
            value={operandA}
            onChange={handleOperandAChange}
            aria-invalid={fieldErrors.a ? true : undefined}
            aria-describedby={fieldErrors.a ? 'operand-a-error' : undefined}
          />
          {fieldErrors.a && (
            <p className="field-error" id="operand-a-error">
              {fieldErrors.a}
            </p>
          )}
        </div>

        {!selected.unary && (
          <div className="field">
            <label htmlFor="operand-b">Second operand (b)</label>
            <input
              id="operand-b"
              type="text"
              inputMode="decimal"
              autoComplete="off"
              placeholder="e.g. 5"
              value={operandB}
              onChange={handleOperandBChange}
              aria-invalid={fieldErrors.b ? true : undefined}
              aria-describedby={fieldErrors.b ? 'operand-b-error' : undefined}
            />
            {fieldErrors.b && (
              <p className="field-error" id="operand-b-error">
                {fieldErrors.b}
              </p>
            )}
          </div>
        )}

        <div className="actions">
          <button type="submit" className="primary" disabled={pending}>
            {pending ? 'Calculating…' : 'Calculate'}
          </button>
          <button type="button" onClick={handleReset} disabled={pending}>
            Reset
          </button>
        </div>
      </form>

      <div className="feedback">
        <p className="result" role="status" aria-live="polite">
          {result !== null ? (
            <>
              Result: <strong>{result}</strong>
            </>
          ) : (
            ''
          )}
        </p>
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
      </div>
    </section>
  );
}
