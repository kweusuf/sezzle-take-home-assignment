import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiError, calculate, CLIENT_ERROR_CODES } from './client';

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function mockFetch(
  impl: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>,
) {
  const fetchMock = vi.fn(impl);
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('calculate', () => {
  it('posts the operation and operands, and returns the result', async () => {
    const fetchMock = mockFetch(async () => jsonResponse(200, { result: 15 }));

    await expect(calculate('add', 10, 5)).resolves.toBe(15);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/v1/calculate');
    expect(init?.method).toBe('POST');
    expect(JSON.parse(String(init?.body))).toEqual({
      operation: 'add',
      a: 10,
      b: 5,
    });
  });

  it('omits b for unary operations', async () => {
    const fetchMock = mockFetch(async () => jsonResponse(200, { result: 5 }));

    await expect(calculate('sqrt', 25)).resolves.toBe(5);

    const [, init] = fetchMock.mock.calls[0];
    expect(JSON.parse(String(init?.body))).toEqual({ operation: 'sqrt', a: 25 });
  });

  it('maps a backend error envelope to ApiError', async () => {
    mockFetch(async () =>
      jsonResponse(400, {
        error: { code: 'DIVISION_BY_ZERO', message: 'cannot divide by zero' },
      }),
    );

    const failure = await calculate('divide', 1, 0).catch((error: unknown) => error);

    expect(failure).toBeInstanceOf(ApiError);
    expect(failure).toMatchObject({
      code: 'DIVISION_BY_ZERO',
      message: 'cannot divide by zero',
      status: 400,
    });
  });

  it('falls back to UNKNOWN_ERROR when an error response has no envelope', async () => {
    mockFetch(async () => new Response('gateway down', { status: 502 }));

    const failure = await calculate('add', 1, 2).catch((error: unknown) => error);

    expect(failure).toBeInstanceOf(ApiError);
    expect((failure as ApiError).code).toBe(CLIENT_ERROR_CODES.unknown);
    expect((failure as ApiError).status).toBe(502);
  });

  it('reports a network failure when fetch rejects', async () => {
    mockFetch(async () => {
      throw new TypeError('Failed to fetch');
    });

    const failure = await calculate('add', 1, 2).catch((error: unknown) => error);

    expect(failure).toBeInstanceOf(ApiError);
    expect((failure as ApiError).code).toBe(CLIENT_ERROR_CODES.network);
    expect((failure as ApiError).status).toBe(0);
  });

  it('reports INVALID_RESPONSE for a 200 without a numeric result', async () => {
    mockFetch(async () => jsonResponse(200, { result: '15' }));

    const failure = await calculate('add', 1, 2).catch((error: unknown) => error);

    expect(failure).toBeInstanceOf(ApiError);
    expect((failure as ApiError).code).toBe(CLIENT_ERROR_CODES.invalidResponse);
  });
});
