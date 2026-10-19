import { useState } from 'react';
import { ApiError, calculate } from '../api/client';
import type { Operation } from '../types/calculator';

type Mode = 'basic' | 'scientific';
type ImmediateRun = 'sqrt' | 'square' | 'reciprocal';

const OPERATOR_SYMBOLS: Record<Operation, string> = {
  add: '+',
  subtract: '−',
  multiply: '×',
  divide: '÷',
  power: '^',
  sqrt: '√',
  percentage: '%',
};

type KeyDef =
  | { kind: 'digit'; label: string }
  | { kind: 'dot'; label: string; name: string }
  | { kind: 'sign'; label: string; name: string }
  | { kind: 'backspace'; label: string; name: string }
  | { kind: 'clear'; label: string; name: string }
  | { kind: 'equals'; label: string; name: string }
  | { kind: 'operator'; label: string; name: string; op: Operation }
  | { kind: 'immediate'; label: string; name: string; run: ImmediateRun };

const BASIC_KEYS: readonly KeyDef[] = [
  { kind: 'clear', label: 'C', name: 'Clear' },
  { kind: 'backspace', label: '⌫', name: 'Backspace' },
  {
    kind: 'operator',
    label: '%',
    name: 'Percentage: left value as a percent of right value',
    op: 'percentage',
  },
  { kind: 'operator', label: '÷', name: 'Divide', op: 'divide' },
  { kind: 'digit', label: '7' },
  { kind: 'digit', label: '8' },
  { kind: 'digit', label: '9' },
  { kind: 'operator', label: '×', name: 'Multiply', op: 'multiply' },
  { kind: 'digit', label: '4' },
  { kind: 'digit', label: '5' },
  { kind: 'digit', label: '6' },
  { kind: 'operator', label: '−', name: 'Subtract', op: 'subtract' },
  { kind: 'digit', label: '1' },
  { kind: 'digit', label: '2' },
  { kind: 'digit', label: '3' },
  { kind: 'operator', label: '+', name: 'Add', op: 'add' },
  { kind: 'sign', label: '±', name: 'Toggle sign' },
  { kind: 'digit', label: '0' },
  { kind: 'dot', label: '.', name: 'Decimal point' },
  { kind: 'equals', label: '=', name: 'Equals' },
];

const SCIENTIFIC_KEYS: readonly KeyDef[] = [
  { kind: 'immediate', label: '√', name: 'Square root', run: 'sqrt' },
  { kind: 'immediate', label: 'x²', name: 'Square', run: 'square' },
  { kind: 'operator', label: 'xʸ', name: 'Power', op: 'power' },
  { kind: 'immediate', label: '1/x', name: 'Reciprocal', run: 'reciprocal' },
];

function keyClassName(key: KeyDef): string {
  switch (key.kind) {
    case 'digit':
      return 'key key--digit';
    case 'operator':
    case 'immediate':
      return 'key key--operator';
    case 'equals':
      return 'key key--equals';
    case 'clear':
      return 'key key--clear';
    default:
      return 'key key--function';
  }
}

/**
 * Classic immediate-execution calculator.
 *
 * The component only assembles operands and calls the API: every arithmetic
 * result (including unary square root, square, and reciprocal) comes from the
 * backend. Digit entry, sign, backspace, and clear are text operations.
 */
export function Calculator() {
  const [mode, setMode] = useState<Mode>('basic');
  const [display, setDisplay] = useState('0');
  const [expression, setExpression] = useState('');
  const [pendingOp, setPendingOp] = useState<{ op: Operation; left: number } | null>(null);
  const [awaitingOperand, setAwaitingOperand] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const scientific = mode === 'scientific';

  function reset() {
    setDisplay('0');
    setExpression('');
    setPendingOp(null);
    setAwaitingOperand(true);
    setError(null);
  }

  /** Calls the backend and renders the outcome; returns null on failure. */
  async function evaluate(op: Operation, a: number, b?: number): Promise<number | null> {
    setPending(true);
    setError(null);
    try {
      return await calculate(op, a, b);
    } catch (caught) {
      setError(
        caught instanceof ApiError ? caught.message : 'Something went wrong. Please try again.',
      );
      setExpression('');
      setPendingOp(null);
      setDisplay('0');
      setAwaitingOperand(true);
      return null;
    } finally {
      setPending(false);
    }
  }

  /** Any key press after a failure starts a clean slate. */
  function clearError() {
    if (error === null) {
      return false;
    }
    setError(null);
    setDisplay('0');
    setExpression('');
    setPendingOp(null);
    setAwaitingOperand(true);
    return true;
  }

  function inputDigit(digit: string) {
    if (clearError() || awaitingOperand) {
      setDisplay(digit);
      setAwaitingOperand(false);
      return;
    }
    setDisplay(display === '0' ? digit : display + digit);
  }

  function inputDot() {
    if (clearError() || awaitingOperand) {
      setDisplay('0.');
      setAwaitingOperand(false);
      return;
    }
    if (!display.includes('.')) {
      setDisplay(`${display}.`);
    }
  }

  function toggleSign() {
    if (clearError()) {
      return;
    }
    setDisplay(display.startsWith('-') ? display.slice(1) : `-${display}`);
  }

  function backspace() {
    if (clearError() || awaitingOperand) {
      return;
    }
    const next = display.slice(0, -1);
    setDisplay(next === '' || next === '-' ? '0' : next);
  }

  async function chooseOperator(op: Operation) {
    const current = Number(display);
    if (pendingOp === null || awaitingOperand) {
      setError(null);
      setPendingOp({ op, left: current });
      setExpression(`${display} ${OPERATOR_SYMBOLS[op]}`);
      setAwaitingOperand(true);
      return;
    }

    const left = pendingOp.left;
    const value = await evaluate(pendingOp.op, left, current);
    if (value === null) {
      return;
    }
    setDisplay(String(value));
    setPendingOp({ op, left: value });
    setExpression(`${String(value)} ${OPERATOR_SYMBOLS[op]}`);
    setAwaitingOperand(true);
  }

  async function equals() {
    if (pendingOp === null) {
      return;
    }
    const current = Number(display);
    const { op, left } = pendingOp;
    const value = await evaluate(op, left, current);
    if (value === null) {
      return;
    }
    setExpression(`${String(left)} ${OPERATOR_SYMBOLS[op]} ${String(current)} =`);
    setDisplay(String(value));
    setPendingOp(null);
    setAwaitingOperand(true);
  }

  /** Applies a unary operation to the displayed value straight away. */
  async function applyImmediate(op: Operation, a: number, b: number | undefined, label: string) {
    if (clearError()) {
      return;
    }
    const value = await evaluate(op, a, b);
    if (value === null) {
      return;
    }
    setExpression(label);
    setDisplay(String(value));
    setAwaitingOperand(true);
  }

  function handleKey(key: KeyDef) {
    switch (key.kind) {
      case 'digit':
        return inputDigit(key.label);
      case 'dot':
        return inputDot();
      case 'sign':
        return toggleSign();
      case 'backspace':
        return backspace();
      case 'clear':
        return reset();
      case 'equals':
        void equals();
        return;
      case 'operator':
        void chooseOperator(key.op);
        return;
      case 'immediate':
        if (key.run === 'sqrt') {
          void applyImmediate('sqrt', Number(display), undefined, `√(${display})`);
        } else if (key.run === 'square') {
          void applyImmediate('power', Number(display), 2, `(${display})²`);
        } else {
          void applyImmediate('divide', 1, Number(display), `1/(${display})`);
        }
        return;
    }
  }

  function renderKey(key: KeyDef) {
    const accessibleName = 'name' in key ? key.name : undefined;
    return (
      <button
        key={key.label}
        type="button"
        className={keyClassName(key)}
        aria-label={accessibleName}
        disabled={pending}
        onClick={() => handleKey(key)}
      >
        {key.label}
      </button>
    );
  }

  return (
    <section className="calculator" data-busy={pending || undefined}>
      <div className="calculator__bar">
        <h1 className="calculator__title">Calculator</h1>
        <div className="mode-toggle" role="group" aria-label="Calculator mode">
          <button
            type="button"
            aria-pressed={!scientific}
            onClick={() => setMode('basic')}
          >
            Basic
          </button>
          <button
            type="button"
            aria-pressed={scientific}
            aria-controls="scientific-keys"
            aria-expanded={scientific}
            onClick={() => setMode('scientific')}
          >
            Scientific
          </button>
        </div>
      </div>

      <div className="display">
        <span className="display__expression" data-testid="expression" aria-hidden="true">
          {expression}
        </span>
        <output
          className="display__value"
          data-long={display.length > 11 || undefined}
          aria-live="polite"
        >
          {error ? 'Error' : display}
        </output>
        {error && (
          <p className="display__error" role="alert">
            {error}
          </p>
        )}
      </div>

      <div
        className={`keypad-reveal${scientific ? ' keypad-reveal--open' : ''}`}
        data-testid="scientific-keys"
        aria-hidden={!scientific}
        inert={scientific ? undefined : true}
      >
        <div className="keypad-reveal__inner">
          <div className="keypad keypad--scientific">{SCIENTIFIC_KEYS.map(renderKey)}</div>
        </div>
      </div>

      <div className="keypad keypad--basic">{BASIC_KEYS.map(renderKey)}</div>
    </section>
  );
}
