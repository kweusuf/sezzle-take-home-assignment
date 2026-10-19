# Calculator App

A small full-stack calculator: a React + TypeScript single-page frontend and a
Go REST API. Every calculation is performed by the backend.

> Status: **complete** — M0–M5 done. Backend and frontend are implemented,
> tested, and verified together; coverage, smoke test, and documentation are in
> place. Live status: [docs/MILESTONES.md](docs/MILESTONES.md),
> [docs/PROGRESS.md](docs/PROGRESS.md).

## Features

- Operations: add, subtract, multiply, divide, power, square root, percentage.
- Calculator UI: operation selector, operand inputs, calculate, reset,
  responsive layout, visible focus states, keyboard submit.
- The second operand is hidden for unary operations (square root).
- Client-side validation of empty/non-numeric input; backend is authoritative.
- Loading state prevents duplicate submissions; stale results and errors are
  cleared when input changes.
- Backend validation: single JSON object, known fields, 64 KiB body limit, no
  trailing values, finite inputs and results only.
- Consistent JSON errors with stable codes: `DIVISION_BY_ZERO`,
  `INVALID_OPERAND`, `MISSING_OPERAND`, `UNSUPPORTED_OPERATION`,
  `INVALID_RESULT`, `INVALID_JSON`, `INVALID_REQUEST`, `NOT_FOUND`,
  `METHOD_NOT_ALLOWED`, `REQUEST_TOO_LARGE`, `INTERNAL_ERROR`.
- Tests: 47 backend core cases + invariant test; 10 HTTP success cases, 26 HTTP
  error cases, plus body-limit, health, exact-body, and panic-recovery tests;
  20 frontend tests.

## Technology stack

| Layer    | Technology |
| --- | --- |
| Frontend | React 19, TypeScript (strict), Vite 8, Vitest 5, React Testing Library |
| Backend | Go 1.22+, standard library `net/http` and `encoding/json` |
| Tooling | npm, Make, Git |

No database, no state-management library, no CSS framework, no Docker (see
[docs/DECISIONS.md](docs/DECISIONS.md)).

## Architecture

```text
Browser (React SPA) --/api/v1/calculate--> Go HTTP service --> calculator core
```

- The calculator core (`backend/internal/calculator`) has no knowledge of HTTP.
- The API layer owns routing, strict decoding, status codes, and the error
  envelope.
- The frontend owns presentation and usability validation only.
- In development the Vite dev server proxies `/api` to `localhost:8080`, so no
  CORS configuration is needed.

Details and diagram: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Repository structure

```text
.
├── backend/
│   ├── cmd/server/            # main: config, timeouts, graceful shutdown
│   ├── internal/api/          # router, decoding, error envelope, HTTP tests
│   ├── internal/calculator/   # arithmetic core + unit tests
│   ├── internal/config/       # PORT handling
│   └── go.mod
├── frontend/
│   ├── src/api/               # typed API client + tests
│   ├── src/components/        # Calculator component + tests
│   ├── src/types/             # Operation union and operation metadata
│   ├── src/App.tsx, main.tsx, index.css
│   ├── index.html, vite.config.ts, tsconfig.json, package.json
├── docs/                      # project management and technical docs
├── Makefile
└── README.md
```

## Prerequisites

- Go 1.22 or newer (verified with 1.27.2)
- Node.js 20 or newer and npm (verified with 26.12.0 / 11.20.0)
- `curl` for manual API checks
- Make (optional; raw commands are given for every target)

## Setup

```bash
git clone <repository-url>      # after publication
cd take-home-assignment

cd backend && go mod download
cd ../frontend && npm ci
```

## How to run the application

Two terminals:

```bash
# terminal 1 — backend on http://localhost:8080
make run-backend

# terminal 2 — frontend on http://localhost:5173 (proxies /api to :8080)
make run-frontend
```

Then open <http://localhost:5173>.

Without Make:

```bash
cd backend && go run ./cmd/server     # PORT=9000 to change the port
cd frontend && npm run dev
```

## How to run tests

```bash
make test            # backend + frontend
make test-backend    # cd backend && go test ./...
make test-frontend   # cd frontend && npm test
```

More: `make fmt-check` (gofmt, `go vet`, `tsc --noEmit`), `make coverage`
(Go coverage profile + frontend coverage), `make smoke` (builds and starts the
real backend, then runs 21 HTTP checks), and `cd backend && go test -race
./...`. Observed results and coverage: [docs/TESTING.md](docs/TESTING.md).

Observed coverage (2026-10-19): backend `internal/api` 94.0%,
`internal/calculator` 97.5%, `internal/config` 100.0% statements (85.4% for
`./...`, which includes the 0% `cmd/server` entry point); frontend 97.67%
statements / 94.52% branches. A committed snapshot is at
[docs/coverage-summary.txt](docs/coverage-summary.txt).

## Build

```bash
make build                  # Go build + frontend production bundle
make build-backend
make build-frontend         # type-check, then vite build → frontend/dist
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

Full contract, operation table, and every error code: [docs/API.md](docs/API.md).

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

- **Single endpoint with an operation identifier** instead of one route per
  operation: one validation path, trivially extensible.
- **Standard-library Go**: two routes do not justify a framework.
- **The backend is authoritative**; the client only checks that input is a
  number so users get fast feedback. It never computes a result.
- **Percentage is a ratio**: `percentage(a, b) = a / b * 100` ("a is what
  percent of b"); a zero denominator is an error.
- **Floating-point arithmetic, no backend rounding**; NaN and ±Infinity are
  rejected as inputs and as results.
- **Strict JSON**: unknown fields, trailing values, and bodies over 64 KiB are
  rejected, and `0` is distinguished from a missing operand.
- **One error envelope** for every failure, with stable codes.
- **Dev proxy instead of CORS.**
- **No database:** the API is stateless.
- **Unary operations hide the second operand** rather than disabling it.

Rationale and rejected alternatives: [docs/DECISIONS.md](docs/DECISIONS.md).

## Known limitations

- `0.1 + 0.2` returns and displays `0.30000000000000004`; binary floating-point
  artifacts are not hidden.
- Percentage is a ratio, not "20% of 50" (use `multiply` with `0.2`).
- Duplicate JSON keys are accepted by Go's decoder (last value wins).
- Results are formatted with `String(value)`; extreme magnitudes use
  exponential notation.
- No authentication, rate limiting, or persistence; none were requested.
- Docker support was deliberately skipped (optional in the assignment).
- The operation list is duplicated in Go and TypeScript; keeping them in sync
  is manual.

## Evaluating the application

1. `make test` — backend core/HTTP tests (47 core cases + 43 HTTP tests) and
   20 frontend tests.
2. `make smoke` — builds and starts the real backend and asserts 21 success and
   error paths over HTTP.
3. `make run-backend` and `make run-frontend`; open
   <http://localhost:5173>.
4. Try `10 + 5`, `√25`, `1 ÷ 0` (shows the backend error message), `abc` as an
   operand (client-side message), and the Reset button.
5. Run the curl examples above and compare with the documented responses.
6. Check the edge cases in [docs/API.md](docs/API.md): unknown fields, trailing
   JSON, oversized body, unknown route, wrong method.

## Documentation

- [Problem statement](docs/Problem.md) — the assignment.
- [Assignment prompt](docs/Prompt.md) — the governing spec.
- [Milestones](docs/MILESTONES.md) · [Progress](docs/PROGRESS.md) ·
  [Handoff](docs/HANDOFF.md)
- [Architecture](docs/ARCHITECTURE.md) · [API](docs/API.md) ·
  [Testing](docs/TESTING.md) · [Decisions](docs/DECISIONS.md) ·
  [AI prompts](docs/AI_PROMPTS.md) · [Coverage summary](docs/coverage-summary.txt)

## Publication status

The repository is **local-only**. No Git remote is configured. To publish:

```bash
git remote add origin <repository-url>
git push -u origin main
```
