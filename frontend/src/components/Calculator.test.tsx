import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError, calculate } from '../api/client';
import { Calculator } from './Calculator';

vi.mock('../api/client', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../api/client')>();
  return { ...actual, calculate: vi.fn() };
});

const calculateMock = vi.mocked(calculate);

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

function renderCalculator() {
  const user = userEvent.setup();
  render(<Calculator />);
  return {
    user,
    operation: screen.getByLabelText('Operation'),
    operandA: screen.getByLabelText(/first operand/i),
    calculateButton: screen.getByRole('button', { name: /calculate/i }),
    resetButton: screen.getByRole('button', { name: /reset/i }),
    status: screen.getByRole('status'),
  };
}

beforeEach(() => {
  calculateMock.mockReset();
});

describe('Calculator', () => {
  it('renders the interface with all operations', () => {
    const { operation, operandA, calculateButton, resetButton } = renderCalculator();

    expect(screen.getByRole('heading', { name: /calculator/i })).toBeInTheDocument();
    expect(operation).toHaveValue('add');
    expect(screen.getAllByRole('option')).toHaveLength(7);
    expect(operandA).toHaveValue('');
    expect(screen.getByLabelText(/second operand/i)).toHaveValue('');
    expect(calculateButton).toBeEnabled();
    expect(resetButton).toBeEnabled();
  });

  it('hides the second operand for the unary square root operation', async () => {
    const { user, operation } = renderCalculator();

    await user.selectOptions(operation, 'sqrt');

    expect(screen.queryByLabelText(/second operand/i)).not.toBeInTheDocument();
    expect(screen.getByLabelText(/first operand/i)).toBeInTheDocument();
  });

  it('sends binary operations to the API and renders the result', async () => {
    calculateMock.mockResolvedValue(15);
    const { user, operandA, calculateButton, status } = renderCalculator();

    await user.type(operandA, '10');
    await user.type(screen.getByLabelText(/second operand/i), '5');
    await user.click(calculateButton);

    expect(calculateMock).toHaveBeenCalledWith('add', 10, 5);
    await waitFor(() => expect(status).toHaveTextContent('Result: 15'));
  });

  it('sends unary operations without a second operand', async () => {
    calculateMock.mockResolvedValue(5);
    const { user, operation, operandA, calculateButton, status } = renderCalculator();

    await user.selectOptions(operation, 'sqrt');
    await user.type(operandA, '25');
    await user.click(calculateButton);

    expect(calculateMock).toHaveBeenCalledWith('sqrt', 25, undefined);
    await waitFor(() => expect(status).toHaveTextContent('Result: 5'));
  });

  it('accepts fractions and negative numbers', async () => {
    calculateMock.mockResolvedValue(-1.5);
    const { user, operation, operandA, calculateButton } = renderCalculator();

    await user.selectOptions(operation, 'divide');
    await user.type(operandA, '-3');
    await user.type(screen.getByLabelText(/second operand/i), '2');
    await user.click(calculateButton);

    expect(calculateMock).toHaveBeenCalledWith('divide', -3, 2);
  });

  it('validates empty operands without calling the API', async () => {
    const { user, calculateButton } = renderCalculator();

    await user.click(calculateButton);

    expect(screen.getByText('Enter a value for a.')).toBeInTheDocument();
    expect(screen.getByText('Enter a value for b.')).toBeInTheDocument();
    expect(screen.getByLabelText(/first operand/i)).toHaveAttribute('aria-invalid', 'true');
    expect(calculateMock).not.toHaveBeenCalled();
  });

  it('validates non-numeric operands without calling the API', async () => {
    const { user, operandA, calculateButton } = renderCalculator();

    await user.type(operandA, 'abc');
    await user.type(screen.getByLabelText(/second operand/i), '5');
    await user.click(calculateButton);

    expect(screen.getByText('Enter a valid number for a.')).toBeInTheDocument();
    expect(screen.queryByText('Enter a valid number for b.')).not.toBeInTheDocument();
    expect(calculateMock).not.toHaveBeenCalled();
  });

  it('shows the backend error message', async () => {
    calculateMock.mockRejectedValue(
      new ApiError('DIVISION_BY_ZERO', 'cannot divide by zero', 400),
    );
    const { user, operation, operandA, calculateButton, status } = renderCalculator();

    await user.selectOptions(operation, 'divide');
    await user.type(operandA, '1');
    await user.type(screen.getByLabelText(/second operand/i), '0');
    await user.click(calculateButton);

    expect(await screen.findByRole('alert')).toHaveTextContent('cannot divide by zero');
    expect(status.textContent).toBe('');
  });

  it('shows a network failure message', async () => {
    calculateMock.mockRejectedValue(
      new ApiError('NETWORK_ERROR', 'Cannot reach the calculator service.', 0),
    );
    const { user, operandA, calculateButton } = renderCalculator();

    await user.type(operandA, '1');
    await user.type(screen.getByLabelText(/second operand/i), '2');
    await user.click(calculateButton);

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Cannot reach the calculator service.',
    );
  });

  it('shows a fallback message for unexpected failures', async () => {
    calculateMock.mockRejectedValue(new Error('boom'));
    const { user, operandA, calculateButton } = renderCalculator();

    await user.type(operandA, '1');
    await user.type(screen.getByLabelText(/second operand/i), '2');
    await user.click(calculateButton);

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Something went wrong. Please try again.',
    );
  });

  it('disables the form while a request is pending and ignores duplicate submits', async () => {
    const pending = deferred<number>();
    calculateMock.mockReturnValue(pending.promise);
    const { user, operation, operandA, calculateButton } = renderCalculator();

    await user.type(operandA, '10');
    await user.type(screen.getByLabelText(/second operand/i), '5');
    await user.click(calculateButton);

    const busyButton = screen.getByRole('button', { name: /calculating/i });
    expect(busyButton).toBeDisabled();
    expect(operation).toBeDisabled();

    await user.click(busyButton);
    expect(calculateMock).toHaveBeenCalledTimes(1);

    pending.resolve(15);
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Result: 15'));
    expect(screen.getByRole('button', { name: /calculate/i })).toBeEnabled();
  });

  it('clears a stale result when an operand changes', async () => {
    calculateMock.mockResolvedValue(15);
    const { user, operandA, calculateButton, status } = renderCalculator();

    await user.type(operandA, '10');
    await user.type(screen.getByLabelText(/second operand/i), '5');
    await user.click(calculateButton);
    await waitFor(() => expect(status).toHaveTextContent('Result: 15'));

    await user.type(operandA, '0');

    expect(status.textContent).toBe('');
  });

  it('clears a displayed error when the input changes', async () => {
    calculateMock.mockRejectedValue(new ApiError('INVALID_OPERAND', 'bad operand', 400));
    const { user, operandA, calculateButton } = renderCalculator();

    await user.type(operandA, '1');
    await user.type(screen.getByLabelText(/second operand/i), '2');
    await user.click(calculateButton);
    expect(await screen.findByRole('alert')).toBeInTheDocument();

    await user.type(operandA, '2');

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('resets inputs, operation, result, and errors', async () => {
    calculateMock.mockResolvedValue(15);
    const { user, operation, operandA, calculateButton, resetButton, status } =
      renderCalculator();

    await user.selectOptions(operation, 'multiply');
    await user.type(operandA, '3');
    await user.type(screen.getByLabelText(/second operand/i), '5');
    await user.click(calculateButton);
    await waitFor(() => expect(status).toHaveTextContent('Result: 15'));

    await user.click(resetButton);

    expect(operation).toHaveValue('add');
    expect(operandA).toHaveValue('');
    expect(screen.getByLabelText(/second operand/i)).toHaveValue('');
    expect(status.textContent).toBe('');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
