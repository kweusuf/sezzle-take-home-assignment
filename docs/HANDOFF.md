# Handoff

Persistent context for the next developer or AI agent. Reflects the repository
as it actually is.

## 1. Project purpose

Take-home assignment: a full-stack calculator with a React + TypeScript
frontend and a Go REST backend, delivered with tests, coverage, and engineering
documentation. See [Problem.md](Problem.md) and [Prompt.md](Prompt.md).

## 2. Current overall status

M3 complete: backend REST API and React frontend are both implemented, tested,
and verified against each other through the Vite dev proxy. Remaining work is
M4 (smoke test, recorded coverage) and M5 (final verification and docs).
Git repository is local-only with no remote.

## 3. Current milestone

M4: Integration and Quality Assurance (`NOT STARTED`).

## 4. Completed milestones

- M0: Project Foundation — structure, docs, initial README, initial commit.
- M1: Backend Calculator Core — 47 table-driven cases + invariant test, 97.5%.
- M2: Backend REST API — strict decoding, error envelope, `httptest` suite,
  live curl verification, 94.0% (`api`) / 100% (`config`) coverage.
- M3: React Frontend — typed client, calculator UI, 20 tests, 97.67% statement
  coverage, production build, proxy verified against the live backend.

## 5. Current implementation state

| Area | State |
| --- | --- |
| Repository | Initialized on `main`, no remote. |
| `backend/` | Complete for M1/M2: `cmd/server`, `internal/api`, `internal/calculator`, `internal/config`, tests. |
| `frontend/` | Complete for M3: Vite + React + TS app, typed client, calculator UI, 20 tests, `package-lock.json` committed. |
| `docs/` | Problem.md, Prompt.md, and the eight required project documents present and current. |
| `Makefile` | All documented targets except `smoke` exist. |
| `scripts/` | Not created (M4). |

## 6. Architecture summary

Single-page frontend calls `POST /api/v1/calculate` and `GET /health` on a Go
`net/http` service; arithmetic lives in an HTTP-independent calculator package.
Vite proxies `/api` to the backend in development. Details and diagram:
[ARCHITECTURE.md](ARCHITECTURE.md).

## 7. Important files and responsibilities

| Path | Responsibility |
| --- | --- |
| `README.md` | Evaluator entry point; updated every commit. |
| `backend/cmd/server/main.go` | Entry point: config, timeouts, graceful shutdown. |
| `backend/internal/api/api.go` | Router, strict decoding, error envelope, panic recovery. |
| `backend/internal/calculator/calculator.go` | Arithmetic core: operations, typed `Error{Code,Message}`, arity and numeric rules. |
| `backend/internal/config/config.go` | `PORT` handling with `DefaultPort = 8080`. |
| `frontend/src/api/client.ts` | Typed client for `POST /api/v1/calculate`; throws `ApiError` with backend or client error codes. |
| `frontend/src/components/Calculator.tsx` | Calculator UI: operation select, operands, validation, loading/error/result, reset. |
| `frontend/src/types/calculator.ts` | `Operation` union and operation metadata (label, unary flag). |
| `frontend/vite.config.ts` | React plugin, `/api` dev proxy to `:8080`, Vitest jsdom + coverage config. |
| `docs/MILESTONES.md` | Milestone register with acceptance criteria and evidence. |
| `docs/PROGRESS.md` | Authoritative checklist. |
| `docs/API.md` | API contract. |
| `docs/TESTING.md` | Test/build commands and observed results. |
| `docs/DECISIONS.md` | ADR register. |
| `docs/AI_PROMPTS.md` | Record of significant AI prompts. |
| `.gitignore` | Excludes node_modules, dist, coverage, env files. |

## 8. API contract and important interfaces

Implemented and documented in [API.md](API.md):
`POST /api/v1/calculate` with `{operation, a, b?}` → `{result}` or
`{error:{code,message}}`; `GET /health` → `{status:"ok"}`. Codes are stable and
tested; messages are not contractual. The frontend client,
`frontend/src/api/client.ts`, exposes `ApiError { code, status, message }` and
adds three client-only codes: `NETWORK_ERROR` (fetch rejected),
`INVALID_RESPONSE` (2xx without a numeric `result`), and `UNKNOWN_ERROR`
(error response without the standard envelope).

## 9. Technology and dependency decisions

Frontend: React, TypeScript strict, Vite, Vitest, React Testing Library,
user-event, jsdom, coverage-v8. Backend: Go standard library only. No database,
no state management library, no Docker. Rationale: [DECISIONS.md](DECISIONS.md).

## 10. Commands for running the project

```bash
make run-backend    # Go service on :8080 (PORT overrides, e.g. PORT=9000 make run-backend)
make run-frontend   # Vite dev server on :5173, proxies /api to :8080
```

Run both in separate terminals; open `http://localhost:5173`.

## 11. Commands for testing and building

```bash
make test             # backend + frontend tests
make test-backend     # cd backend && go test ./...
make test-frontend    # cd frontend && npm test
make build            # go build + frontend production build
make coverage         # Go profile/summary + frontend coverage report
make fmt-check        # gofmt + go vet + tsc --noEmit
cd backend && go test -race ./...
```

`make smoke` arrives with M4.

## 12. Most recent successful verification results

M2 (backend API) — executed on 2026-10-19:

```text
$ cd backend && gofmt -l . && go vet ./...      # no output
$ cd backend && go test ./... -cover
ok  calculator-app/backend/internal/api         0.416s  coverage: 94.0% of statements
ok  calculator-app/backend/internal/calculator  cached  coverage: 97.5% of statements
ok  calculator-app/backend/internal/config      cached  coverage: 100.0% of statements
$ cd backend && go build ./...                  # ok
```

Live server check (`PORT=8099 ./calserver`, curl):

```text
GET  /health                     -> 200 {"status":"ok"}
POST /api/v1/calculate add       -> 200 {"result":15}
POST /api/v1/calculate sqrt      -> 200 {"result":5}
POST /api/v1/calculate divide1/0 -> 400 {"error":{"code":"DIVISION_BY_ZERO",...}}
GET  /api/v1/calculate           -> 405 {"error":{"code":"METHOD_NOT_ALLOWED",...}}
GET  /nope                       -> 404 {"error":{"code":"NOT_FOUND",...}}
```

`cmd/server` is 0.0% covered by unit tests; it is exercised by the M4 smoke
test instead.

### M3 — frontend (executed 2026-10-19)

```text
$ cd frontend && npm run typecheck    # clean
$ cd frontend && npm test
Test Files  2 passed (2)
     Tests  20 passed (20)
$ cd frontend && npm run build
dist/assets/index-*.css  2.23 kB │ gzip: 0.88 kB
dist/assets/index-*.js 224.26 kB │ gzip: 70.31 kB
✓ built in 297ms
$ cd frontend && npm run test:coverage
Statements 97.67% (84/86) | Branches 94.52% (69/73) | Functions 94.11% (16/17) | Lines 97.64% (83/85)
```

Dev-proxy integration (backend on `:8080`, Vite on `:5173`):

```text
GET  http://localhost:5173/                     -> 200 text/html
POST http://localhost:5173/api/v1/calculate     -> 200 {"result":12.5}   (percentage 25, 200)
POST http://localhost:5173/api/v1/calculate     -> 400 {"error":{"code":"INVALID_OPERAND",...}}  (sqrt -1)
```

## 13. Known defects and limitations

- No smoke script yet (M4); `make smoke` does not exist.
- Percentage semantics are a ratio (`a/b*100`), not "percent of".
- Only floating-point arithmetic; binary artifacts (e.g. `0.1+0.2`) are
  returned and displayed as-is.
- Duplicate JSON keys cannot be detected with `encoding/json` (documented
  limitation, not a defect).
- Result formatting is `String(value)`; very large or very small magnitudes are
  shown in exponential notation.

## 14. Outstanding tasks

M4 and M5. See [PROGRESS.md](PROGRESS.md) for the per-task checklist.

## 15. Blockers and their causes

None.

## 16. Important assumptions

- Node 20+/Go 1.22+ are the documented minimums; the local environment has Go
  1.27.2, Node 26.12.0, npm 11.20.0, TypeScript 7.0.2, Vite 8.3.4, Vitest
  5.0.5, React 19.3.1.
- Reviewers run `make` targets from the repository root.
- Single-origin deployment, so CORS is omitted (development uses the Vite
  proxy).
- `frontend/src/types/calculator.ts` is the single source of operation
  identifiers on the client; it mirrors the Go constants in
  `backend/internal/calculator/calculator.go`. Keeping them in sync is manual
  and covered by the smoke test.

## 17. Git branch and latest relevant commits

Branch `main`, no remote. History:

- `chore: establish project structure and documentation` (M0)
- `feat: implement calculator operations and unit tests` (M1)
- `feat: add calculator REST API and HTTP tests` (M2)
- `feat: implement React calculator interface` (M3)

## 18. Immediate next steps

1. Add `scripts/smoke.sh` (start backend on a free port, assert success and
   error paths) and a `smoke` Make target.
2. Run the full verification set (`make test`, `make build`, `make fmt-check`,
   `make smoke`, `make coverage`) and record the real output in
   `docs/TESTING.md`.
3. Update README/docs, review the diff, and commit M4; then finalize M5.

## 19. Approval decisions already made

- Go standard library only; no router framework (still true after M2).
- No database, no Docker in the first pass.
- Single `POST /api/v1/calculate` endpoint with an operation identifier.
- Percentage defined as `a / b * 100`; zero denominator is an error.
- Body limit 64 KiB; unknown fields and trailing JSON rejected.
- Recover middleware turns panics into `500 INTERNAL_ERROR` with no details.

## 20. Decisions that still require approval

- Any change to the M0 architecture (e.g. adding a framework or a database).
- Adding Docker or other infrastructure beyond the documented scope.
- Configuring a Git remote or publishing the repository.
