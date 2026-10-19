# API Contract

Status: M0 planned contract. Implementation status is tracked in
[MILESTONES.md](MILESTONES.md). This file will be updated with observed curl
output after M2.

Base URL (development): `http://localhost:8080`

All responses are `application/json; charset=utf-8`.

## POST /api/v1/calculate

Request body:

```json
{ "operation": "add", "a": 10, "b": 5 }
```

- `operation` (string, required): one of `add`, `subtract`, `multiply`,
  `divide`, `power`, `sqrt`, `percentage`.
- `a` (number, required for every operation).
- `b` (number, required for binary operations; must be absent for `sqrt`).
- Unknown fields, trailing JSON values, wrongly typed values, and bodies over
  64 KiB are rejected.

Success: `200 OK`

```json
{ "result": 15 }
```

### Operations

| Operation | Arity | Semantics | Error cases |
| --- | --- | --- | --- |
| `add` | 2 | `a + b` | non-finite result |
| `subtract` | 2 | `a - b` | non-finite result |
| `multiply` | 2 | `a * b` | non-finite result (overflow) |
| `divide` | 2 | `a / b` | `b = 0` → `DIVISION_BY_ZERO`; non-finite result |
| `power` | 2 | `math.Pow(a, b)` | negative base with non-integer exponent, `0` to a negative power, overflow → `INVALID_RESULT` |
| `sqrt` | 1 | `math.Sqrt(a)` | `a < 0` → `INVALID_OPERAND` |
| `percentage` | 2 | `a / b * 100` | `b = 0` → `DIVISION_BY_ZERO`; non-finite result |

### Errors

Envelope:

```json
{ "error": { "code": "DIVISION_BY_ZERO", "message": "Cannot divide by zero" } }
```

| HTTP | Code | Meaning |
| --- | --- | --- |
| 400 | `INVALID_JSON` | Malformed JSON, wrong types, unknown fields, trailing values. |
| 400 | `INVALID_REQUEST` | Missing/empty `operation`, or body is not a JSON object. |
| 400 | `MISSING_OPERAND` | Required `a` (or `b`) is absent or `null`. |
| 400 | `UNSUPPORTED_OPERATION` | Operation identifier not in the table. |
| 400 | `INVALID_OPERAND` | NaN/Infinity input, unexpected `b` for `sqrt`, negative square root. |
| 400 | `DIVISION_BY_ZERO` | Zero denominator for `divide` or `percentage`. |
| 400 | `INVALID_RESULT` | Arithmetic produced NaN or ±Infinity. |
| 404 | `NOT_FOUND` | Unknown route. |
| 405 | `METHOD_NOT_ALLOWED` | Known route, unsupported method. |
| 413 | `REQUEST_TOO_LARGE` | Body exceeds 64 KiB. |
| 500 | `INTERNAL_ERROR` | Unexpected server failure (no details exposed). |

## GET /health

`200 OK`

```json
{ "status": "ok" }
```

Any other method on `/health` returns `405 METHOD_NOT_ALLOWED`.

## curl examples

```bash
curl -sS -X POST http://localhost:8080/api/v1/calculate \
  -H 'Content-Type: application/json' \
  -d '{"operation":"add","a":10,"b":5}'
# {"result":15}

curl -sS -X POST http://localhost:8080/api/v1/calculate \
  -H 'Content-Type: application/json' \
  -d '{"operation":"sqrt","a":25}'
# {"result":5}

curl -sS -X POST http://localhost:8080/api/v1/calculate \
  -H 'Content-Type: application/json' \
  -d '{"operation":"divide","a":1,"b":0}'
# {"error":{"code":"DIVISION_BY_ZERO","message":"Cannot divide by zero"}}

curl -sS http://localhost:8080/health
# {"status":"ok"}
```

## Numerical behavior

- Operands and results use IEEE-754 `float64`.
- No rounding or formatting is applied by the backend; JSON exposes the full
  representable value (e.g. `1/3` → `0.3333333333333333`).
- NaN and ±Infinity are rejected both as inputs and results. Use `-0` freely;
  it behaves as zero.
- Values outside `float64` range are rejected by JSON decoding (`INVALID_JSON`)
  or as a non-finite result (`INVALID_RESULT`).
- Percentage is not a fraction of a value; it is a ratio: `percentage(25, 200)
  = 12.5`.
