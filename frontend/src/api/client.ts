import type { Operation } from '../types/calculator';

/** Client-side error codes that never come from the backend. */
export const CLIENT_ERROR_CODES = {
  network: 'NETWORK_ERROR',
  invalidResponse: 'INVALID_RESPONSE',
  unknown: 'UNKNOWN_ERROR',
} as const;

/** An error raised by the API client, either from the backend or the transport. */
export class ApiError extends Error {
  readonly code: string;
  readonly status: number;

  constructor(code: string, message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
  }
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

interface ErrorPayload {
  error: { code: string; message: string };
}

function hasErrorPayload(value: unknown): value is ErrorPayload {
  if (typeof value !== 'object' || value === null || !('error' in value)) {
    return false;
  }
  const { error } = value as { error: unknown };
  return (
    typeof error === 'object' &&
    error !== null &&
    typeof (error as { code?: unknown }).code === 'string' &&
    typeof (error as { message?: unknown }).message === 'string'
  );
}

function isResultPayload(value: unknown): value is { result: number } {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as { result?: unknown }).result === 'number'
  );
}

async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return undefined;
  }
}

/**
 * Calls POST /api/v1/calculate and returns the numeric result.
 * Throws ApiError for backend errors, transport failures, and malformed
 * responses; it never computes a result locally.
 */
export async function calculate(
  operation: Operation,
  a: number,
  b?: number,
): Promise<number> {
  const payload: Record<string, number | string> = { operation, a };
  if (b !== undefined) {
    payload.b = b;
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/api/v1/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new ApiError(
      CLIENT_ERROR_CODES.network,
      'Cannot reach the calculator service. Check that the backend is running.',
      0,
    );
  }

  const body = await readJson(response);

  if (!response.ok) {
    if (hasErrorPayload(body)) {
      throw new ApiError(body.error.code, body.error.message, response.status);
    }
    throw new ApiError(
      CLIENT_ERROR_CODES.unknown,
      `The calculator service returned an unexpected error (HTTP ${response.status}).`,
      response.status,
    );
  }

  if (!isResultPayload(body)) {
    throw new ApiError(
      CLIENT_ERROR_CODES.invalidResponse,
      'The calculator service returned an unexpected response.',
      response.status,
    );
  }

  return body.result;
}
