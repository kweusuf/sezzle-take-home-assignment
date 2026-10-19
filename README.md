# Calculator App

A small full-stack calculator: a React + TypeScript single-page frontend and a
Go REST API. The frontend consumes the backend for every calculation.

> Status: **M2 complete** — the backend REST API is implemented, tested, and
> versioned. The frontend does not exist yet (M3). Live status:
> [docs/MILESTONES.md](docs/MILESTONES.md), [docs/PROGRESS.md](docs/PROGRESS.md).

## Implemented so far

**Backend (runnable)**

- Operations: add, subtract, multiply, divide, power, sqrt, percentage.
- `POST /api/v1/calculate` and `GET /health`.
- Strict request validation: single JSON object, known fields, 64 KiB body
  limit, no trailing values.
- Consistent JSON errors with stable codes and correct status codes
  (400/404/405/413/500). No stack traces or internal details leak.
- Port configurable via `PORT` (default `8080`); graceful shutdown.
- Tests: 47 table-driven core cases + a finite-result invariant test, 10 HTTP
  success cases, 26 HTTP error cases, body-limit, health, and panic-recovery
  tests.

**Planned**

- React + TypeScript calculator UI (operation selector, operands, unary
  handling, loading/error/result/reset, responsive layout).
- Frontend tests, smoke test, coverage reports, final documentation.

## Technology stack

| Layer    | Technology |
| --- | --- |
| Frontend | React, TypeScript (strict), Vite, Vitest, React Testing Library (M3) |
| Backend | Go 1.22+, standard library `net/http` and `encoding/json` |
| Tooling | npm, Make, Git |

No database, no state-management library, no Docker (see
[docs/DECISIONS.md](docs/DECISIONS.md)).

## Architecture

```text
Browser (React SPA) --/api/v1/calculate--> Go HTTP service --> calculator core
```

The calculator core has no knowledge of HTTP. The frontend validates input for
usability only; the backend is authoritative. The Vite dev server proxies `/api`
to `localhost:8080`, so no CORS configuration is needed in development. Details
and diagram: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Repository structure

```text
.
├── backend/
│   ├── cmd/server/            # main: config, timeouts, graceful shutdown
│   ├── internal/api/          # router, decoding, error envelope, HTTP tests
│   ├── internal/calculator/   # arithmetic core + unit tests
│   ├── internal/config/       # PORT handling
│   └── go.mod
├── frontend/                  # React SPA (M3)
├── docs/                      # project management and technical docs
├── Makefile                   # backend targets (frontend targets in M3)
└── README.md
```

## Prerequisites

- Go 1.22 or newer (verified with 1.27.2)
- Node.js 20 or newer and npm (verified with 26.12.0 / 11.20.0) — needed from M3
- `curl` for the smoke test
- Make (optional; raw commands are listed for every target)

## Setup

```bash
git clone <repository-url>   # after publication
cd take-home-assignment
cd backend && go mod download
```

## How to run the backend

```bash
make run-backend             # listens on :8080
PORT=9000 make run-backend   # custom port
```

or without Make:

```bash
cd backend && go run ./cmd/server
```

Verify:

```bash
curl -sS http://localhost:8080/health
# {"status":"ok"}
```

## How to run the frontend

Not implemented yet (M3). The plan: `cd frontend && npm install && npm run dev`,
serving on `:5173` with `/api` proxied to `:8080`.

## How to run tests

```bash
make test-backend
# or
cd backend && go test ./...
```

Also available: `go test ./... -cover`, `go test -race ./...`, `make
coverage-backend`, `make fmt-check` (gofmt + `go vet`). Frontend test commands
arrive with M3. Observed results and coverage numbers:
[docs/TESTING.md](docs/TESTING.md).

## Build

```bash
make build-backend           # cd backend && go build ./...
```

## API summary

| Method | Path | Purpose |
| --- | --- | --- |
| POST | `/api/v1/calculate` | Evaluate one operation. |
| GET | `/health` | Liveness check. |

Request: `{"operation": "add", "a": 10, "b": 5}` → `{"result": 15}`.
Binary operations need `a` and `b`; `sqrt` needs only `a`.

Errors always use one envelope:

```json
{ "error": { "code": "DIVISION_BY_ZERO", "message": "cannot divide by zero" } }
```

Full contract, operation table, and every error code:
[docs/API.md](docs/API.md).

### curl examples

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
# {"error":{"code":"DIVISION_BY_ZERO","message":"cannot divide by zero"}}
```

## Design decisions and assumptions

- **Single endpoint with an operation identifier** rather than one route per
  operation: one validation path, trivially extensible.
- **Standard-library Go**: two routes do not justify a framework.
- **Backend is authoritative**; the frontend validates only for fast feedback.
- **Percentage is a ratio**: `percentage(a, b) = a / b * 100` ("a is what
  percent of b"), and a zero denominator is an error.
- **Floating-point arithmetic with no backend rounding**; NaN and ±Infinity are
  rejected as inputs and results.
- **Strict JSON**: unknown fields, trailing values, and bodies over 64 KiB are
  rejected; `0` is distinguished from a missing operand.
- **Dev proxy instead of CORS**.
- No database: the API is stateless.

Rationale and alternatives: [docs/DECISIONS.md](docs/DECISIONS.md).

## Known limitations

- Frontend, smoke test, and coverage reports are still pending (M3/M4).
- `0.1 + 0.2` returns `0.30000000000000004`; binary floating-point artifacts are
  not hidden.
- Percentage is a ratio, not "percent of".
- Duplicate JSON keys are accepted by Go's decoder (last value wins); detecting
  them would need a custom decoder.
- No authentication, rate limiting, or persistence; none were requested.
- Docker support was deliberately skipped (optional in the assignment).

## Evaluating the application

1. `cd backend && go test ./...` — core and HTTP tests.
2. `make run-backend` in one terminal.
3. Run the curl examples above and compare with the documented responses.
4. Try the edge cases: divide by zero, `sqrt` of a negative number, a `sqrt`
   request that also sends `b`, unknown fields, and an unknown route.
5. Once M3 lands: `make run-frontend` and use the UI against this backend.

## Documentation

- [Problem statement](docs/Problem.md) — the assignment.
- [Assignment prompt](docs/Prompt.md) — the governing spec.
- [Milestones](docs/MILESTONES.md) · [Progress](docs/PROGRESS.md) ·
  [Handoff](docs/HANDOFF.md)
- [Architecture](docs/ARCHITECTURE.md) · [API](docs/API.md) ·
  [Testing](docs/TESTING.md) · [Decisions](docs/DECISIONS.md) ·
  [AI prompts](docs/AI_PROMPTS.md)

## Publication status

The repository is **local-only**. No Git remote is configured. To publish:

```bash
git remote add origin <repository-url>
git push -u origin main
```
