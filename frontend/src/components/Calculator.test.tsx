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
  const promise = new Promise<T>((res) => {
    resolve = res;
  });
  return { promise, resolve };
}

function renderCalculator() {
  const user = userEvent.setup();
  render(<Calculator />);
  return { user };
}

/** Clicks keypad buttons by their accessible name, in order. */
async function press(user: ReturnType<typeof userEvent.setup>, keys: string[]) {
  for (const name of keys) {
    await user.click(screen.getByRole('button', { name }));
  }
}

const display = () => screen.getByRole('status');
const expression = () => screen.getByTestId('expression');
const scientificRow = () => screen.getByTestId('scientific-keys');

beforeEach(() => {
  calculateMock.mockReset();
});

describe('Calculator keypad', () => {
  it('renders a classic keypad in basic mode', () => {
    renderCalculator();

    for (const name of ['Clear', 'Backspace', 'Divide', 'Multiply', 'Subtract', 'Add', 'Equals']) {
      expect(screen.getByRole('button', { name })).toBeEnabled();
    }
    for (const digit of ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']) {
      expect(screen.getByRole('button', { name: digit })).toBeEnabled();
    }
    expect(screen.getByRole('button', { name: 'Decimal point' })).toBeInTheDocument();
    expect(display()).toHaveTextContent('0');
  });

  it('starts with the scientific row collapsed', () => {
    renderCalculator();

    expect(scientificRow()).toHaveClass('keypad-reveal');
    expect(scientificRow()).not.toHaveClass('keypad-reveal--open');
    expect(scientificRow()).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByRole('button', { name: 'Scientific' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
  });

  it('expands into scientific mode when the mode button is clicked', async () => {
    const { user } = renderCalculator();

    await user.click(screen.getByRole('button', { name: 'Scientific' }));

    expect(scientificRow()).toHaveClass('keypad-reveal--open');
    expect(scientificRow()).toHaveAttribute('aria-hidden', 'false');
    expect(screen.getByRole('button', { name: 'Scientific' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    expect(screen.getByRole('button', { name: 'Square root' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Square' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Power' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Reciprocal' })).toBeEnabled();
  });

  it('collapses back to basic mode', async () => {
    const { user } = renderCalculator();

    await user.click(screen.getByRole('button', { name: 'Scientific' }));
    await user.click(screen.getByRole('button', { name: 'Basic' }));

    expect(scientificRow()).not.toHaveClass('keypad-reveal--open');
    expect(scientificRow()).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByRole('button', { name: 'Basic' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });
});

describe('Calculator entry', () => {
  it('builds a number from digit keys', async () => {
    const { user } = renderCalculator();

    await press(user, ['7', '8', '9']);

    expect(display()).toHaveTextContent('789');
  });

  it('adds a decimal point once and ignores a second one', async () => {
    const { user } = renderCalculator();

    await press(user, ['1', 'Decimal point', '5', 'Decimal point', '2']);

    expect(display()).toHaveTextContent('1.52');
  });

  it('starts a fresh number after a result', async () => {
    calculateMock.mockResolvedValue(15);
    const { user } = renderCalculator();

    await press(user, ['1', '0', 'Add', '5', 'Equals']);
    await waitFor(() => expect(display()).toHaveTextContent('15'));

    await press(user, ['7']);

    expect(display()).toHaveTextContent('7');
  });

  it('toggles the sign of the displayed value', async () => {
    const { user } = renderCalculator();

    await press(user, ['4', '2', 'Toggle sign']);
    expect(display()).toHaveTextContent('-42');

    await press(user, ['Toggle sign']);
    expect(display()).toHaveTextContent('42');
  });

  it('backspaces digits and clears with C', async () => {
    const { user } = renderCalculator();

    await press(user, ['1', '2', '3', 'Backspace']);
    expect(display()).toHaveTextContent('12');

    await press(user, ['Backspace', 'Backspace']);
    expect(display()).toHaveTextContent('0');

    await press(user, ['9', 'Clear']);
    expect(display()).toHaveTextContent('0');
    expect(expression()).toHaveTextContent('');
  });
});

describe('Calculator calculations', () => {
  it('sends a binary operation to the API on equals', async () => {
    calculateMock.mockResolvedValue(15);
    const { user } = renderCalculator();

    await press(user, ['1', '0', 'Add', '5', 'Equals']);

    expect(calculateMock).toHaveBeenCalledWith('add', 10, 5);
    await waitFor(() => expect(display()).toHaveTextContent('15'));
    expect(expression()).toHaveTextContent('10 + 5 =');
  });

  it('shows the pending operator while entering the second operand', async () => {
    const { user } = renderCalculator();

    await press(user, ['8', 'Multiply']);

    expect(expression()).toHaveTextContent('8 ×');
    expect(calculateMock).not.toHaveBeenCalled();
  });

  it('evaluates the pending operation before chaining a new one', async () => {
    calculateMock.mockResolvedValueOnce(5).mockResolvedValueOnce(20);
    const { user } = renderCalculator();

    await press(user, ['2', 'Add', '3', 'Multiply', '4', 'Equals']);

    expect(calculateMock).toHaveBeenNthCalledWith(1, 'add', 2, 3);
    expect(calculateMock).toHaveBeenNthCalledWith(2, 'multiply', 5, 4);
    await waitFor(() => expect(display()).toHaveTextContent('20'));
  });

  it('replaces the pending operator when it is pressed twice', async () => {
    calculateMock.mockResolvedValue(9);
    const { user } = renderCalculator();

    await press(user, ['6', 'Add', 'Multiply', '3', 'Equals']);

    expect(calculateMock).toHaveBeenCalledTimes(1);
    expect(calculateMock).toHaveBeenCalledWith('multiply', 6, 3);
    await waitFor(() => expect(display()).toHaveTextContent('9'));
  });

  it('uses the percentage operation', async () => {
    calculateMock.mockResolvedValue(12.5);
    const { user } = renderCalculator();

    await press(user, [
      '2',
      '5',
      'Percentage: left value as a percent of right value',
      '2',
      '0',
      '0',
      'Equals',
    ]);

    expect(calculateMock).toHaveBeenCalledWith('percentage', 25, 200);
    await waitFor(() => expect(display()).toHaveTextContent('12.5'));
  });

  it('applies square root immediately', async () => {
    calculateMock.mockResolvedValue(5);
    const { user } = renderCalculator();

    await user.click(screen.getByRole('button', { name: 'Scientific' }));
    await press(user, ['2', '5', 'Square root']);

    expect(calculateMock).toHaveBeenCalledWith('sqrt', 25, undefined);
    await waitFor(() => expect(display()).toHaveTextContent('5'));
    expect(expression()).toHaveTextContent('√(25)');
  });

  it('applies square as power with exponent 2', async () => {
    calculateMock.mockResolvedValue(49);
    const { user } = renderCalculator();

    await user.click(screen.getByRole('button', { name: 'Scientific' }));
    await press(user, ['7', 'Square']);

    expect(calculateMock).toHaveBeenCalledWith('power', 7, 2);
    await waitFor(() => expect(display()).toHaveTextContent('49'));
  });

  it('applies the reciprocal as one divided by the value', async () => {
    calculateMock.mockResolvedValue(0.25);
    const { user } = renderCalculator();

    await user.click(screen.getByRole('button', { name: 'Scientific' }));
    await press(user, ['4', 'Reciprocal']);

    expect(calculateMock).toHaveBeenCalledWith('divide', 1, 4);
    await waitFor(() => expect(display()).toHaveTextContent('0.25'));
  });

  it('uses the power operation from the scientific row', async () => {
    calculateMock.mockResolvedValue(1024);
    const { user } = renderCalculator();

    await user.click(screen.getByRole('button', { name: 'Scientific' }));
    await press(user, ['2', 'Power', '1', '0', 'Equals']);

    expect(calculateMock).toHaveBeenCalledWith('power', 2, 10);
    await waitFor(() => expect(display()).toHaveTextContent('1024'));
  });
});

describe('Calculator failures', () => {
  it('shows the backend error and clears the expression', async () => {
    calculateMock.mockRejectedValue(
      new ApiError('DIVISION_BY_ZERO', 'cannot divide by zero', 400),
    );
    const { user } = renderCalculator();

    await press(user, ['5', 'Divide', '0', 'Equals']);

    expect(await screen.findByRole('alert')).toHaveTextContent('cannot divide by zero');
    expect(display()).toHaveTextContent('Error');
    expect(expression()).toHaveTextContent('');
  });

  it('shows a network failure message', async () => {
    calculateMock.mockRejectedValue(
      new ApiError('NETWORK_ERROR', 'Cannot reach the calculator service.', 0),
    );
    const { user } = renderCalculator();

    await press(user, ['1', 'Add', '2', 'Equals']);

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Cannot reach the calculator service.',
    );
  });

  it('shows a fallback message for unexpected failures', async () => {
    calculateMock.mockRejectedValue(new Error('boom'));
    const { user } = renderCalculator();

    await press(user, ['1', 'Add', '2', 'Equals']);

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Something went wrong. Please try again.',
    );
  });

  it('clears the error when a new digit is pressed', async () => {
    calculateMock.mockRejectedValue(new ApiError('INVALID_RESULT', 'bad result', 400));
    const { user } = renderCalculator();

    await press(user, ['1', 'Add', '2', 'Equals']);
    expect(await screen.findByRole('alert')).toBeInTheDocument();

    await press(user, ['7']);

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(display()).toHaveTextContent('7');
  });

  it('clears the error on decimal point, sign, backspace, and scientific keys', async () => {
    calculateMock.mockRejectedValue(new ApiError('INVALID_RESULT', 'bad result', 400));
    const { user } = renderCalculator();

    await user.click(screen.getByRole('button', { name: 'Scientific' }));

    for (const key of ['Decimal point', 'Toggle sign', 'Backspace', 'Square root']) {
      await press(user, ['1', 'Divide', '0', 'Equals']);
      expect(await screen.findByRole('alert')).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: key }));

      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
      expect(display()).toHaveTextContent('0');
    }

    // Only the four failed divisions reached the API; the recovery keys did not.
    expect(calculateMock).toHaveBeenCalledTimes(4);
  });

  it('ignores equals when no operation is pending', async () => {
    const { user } = renderCalculator();

    await press(user, ['5', 'Equals', 'Clear', 'Equals']);

    expect(calculateMock).not.toHaveBeenCalled();
    expect(display()).toHaveTextContent('0');
  });

  it('surfaces a failure from a chained operator press', async () => {
    calculateMock.mockRejectedValue(
      new ApiError('DIVISION_BY_ZERO', 'cannot divide by zero', 400),
    );
    const { user } = renderCalculator();

    await press(user, ['1', 'Divide', '0', 'Add']);

    expect(await screen.findByRole('alert')).toHaveTextContent('cannot divide by zero');
    expect(expression()).toHaveTextContent('');
  });

  it('surfaces a failure from a scientific key', async () => {
    calculateMock.mockRejectedValue(
      new ApiError('DIVISION_BY_ZERO', 'cannot divide by zero', 400),
    );
    const { user } = renderCalculator();

    await user.click(screen.getByRole('button', { name: 'Scientific' }));
    await press(user, ['0', 'Reciprocal']);

    expect(calculateMock).toHaveBeenCalledWith('divide', 1, 0);
    expect(await screen.findByRole('alert')).toHaveTextContent('cannot divide by zero');
  });

  it('disables the keypad while a request is pending and ignores extra clicks', async () => {
    const pending = deferred<number>();
    calculateMock.mockReturnValue(pending.promise);
    const { user } = renderCalculator();

    await press(user, ['1', '0', 'Add', '5']);
    await user.click(screen.getByRole('button', { name: 'Equals' }));

    expect(screen.getByRole('button', { name: '7' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Equals' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Clear' })).toBeDisabled();

    await user.click(screen.getByRole('button', { name: 'Equals' }));
    expect(calculateMock).toHaveBeenCalledTimes(1);

    pending.resolve(15);
    await waitFor(() => expect(display()).toHaveTextContent('15'));
    expect(screen.getByRole('button', { name: '7' })).toBeEnabled();
  });
});
