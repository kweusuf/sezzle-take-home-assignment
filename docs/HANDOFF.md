# Handoff

Persistent context for the next developer or AI agent. Reflects the repository
as it actually is.

## 1. Project purpose

Take-home assignment: a full-stack calculator with a React + TypeScript
frontend and a Go REST backend, delivered with tests, coverage, and engineering
documentation. See [Problem.md](Problem.md) and [Prompt.md](Prompt.md).

## 2. Current overall status

M2 complete: the backend is a runnable REST service (calculator core + JSON
API) with unit and HTTP tests. The frontend does not exist yet. Git repository
is local-only with no remote.

## 3. Current milestone

M3: React Frontend (`NOT STARTED`).

## 4. Completed milestones

- M0: Project Foundation — structure, docs, initial README, initial commit.
- M1: Backend Calculator Core — 47 table-driven cases + invariant test, 97.5%.
- M2: Backend REST API — strict decoding, error envelope, `httptest` suite,
  live curl verification, 94.0% (`api`) / 100% (`config`) statement coverage.

## 5. Current implementation state

| Area | State |
| --- | --- |
| Repository | Initialized on `main`, no remote. |
| `backend/` | Complete for M1/M2: `cmd/server`, `internal/api`, `internal/calculator`, `internal/config`, tests. |
| `frontend/` | Not created. |
| `docs/` | Problem.md, Prompt.md, and the eight required project documents present and current. |
| `Makefile` | Backend targets only (`test-backend`, `build-backend`, `run-backend`, `coverage-backend`, `fmt-check`). |
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
tested; messages are not contractual. Frontend interface will be a single typed
client, `src/api/client.ts`, returning the numeric result or throwing
`ApiError` (M3).

## 9. Technology and dependency decisions

Frontend: React, TypeScript strict, Vite, Vitest, React Testing Library,
user-event, jsdom, coverage-v8. Backend: Go standard library only. No database,
no state management library, no Docker. Rationale: [DECISIONS.md](DECISIONS.md).

## 10. Commands for running the project

```bash
make run-backend    # Go service on :8080 (PORT overrides, e.g. PORT=9000 make run-backend)
```

Frontend commands arrive with M3.

## 11. Commands for testing and building

```bash
make test-backend   # cd backend && go test ./...
make build-backend  # cd backend && go build ./...
make coverage-backend
make fmt-check      # gofmt check + go vet
cd backend && go test -race ./...
```

`make test`, `make build`, `make smoke`, and frontend targets are added in
M3/M4.

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

## 13. Known defects and limitations

- No frontend yet (M3).
- Percentage semantics are a ratio (`a/b*100`), not "percent of".
- Only floating-point arithmetic; binary artifacts (e.g. `0.1+0.2`) are
  returned as-is.
- Duplicate JSON keys cannot be detected with `encoding/json` (documented
  limitation, not a defect).

## 14. Outstanding tasks

M3–M5. See [PROGRESS.md](PROGRESS.md) for the per-task checklist.

## 15. Blockers and their causes

None.

## 16. Important assumptions

- Node 20+/Go 1.22+ are the documented minimums; the local environment has Go
  1.27.2, Node 26.12.0, npm 11.20.0.
- Reviewers run `make` targets from the repository root.
- Single-origin deployment, so CORS is omitted.

## 17. Git branch and latest relevant commits

Branch `main`, no remote. History:

- `chore: establish project structure and documentation` (M0)
- `feat: implement calculator operations and unit tests` (M1)
- `feat: add calculator REST API and HTTP tests` (M2)

## 18. Immediate next steps

1. Scaffold `frontend/` with Vite + React + TypeScript (strict) and npm scripts
   (`dev`, `build`, `test`, `test:coverage`, `typecheck`, `preview`).
2. Implement the typed API client with `ApiError`, then the calculator UI
   (operation selector, operands, unary handling, loading/error/result/reset).
3. Add Vitest + RTL tests, run `npm run typecheck && npm test && npm run build`,
   add frontend Make targets, and commit M3.

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
