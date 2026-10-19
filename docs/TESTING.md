# Testing

Status: commands are planned at M0. Observed results will be added after each
verification run. Nothing in this file is claimed as passed until it has run.

## Prerequisites

- Go 1.22+ (`go version`)
- Node.js 20+ and npm (`node --version`, `npm --version`)
- `curl` for the smoke test
- `make` (optional; raw commands are listed too)

## Backend

| Task | Command |
| --- | --- |
| Unit + HTTP tests | `cd backend && go test ./...` |
| Verbose | `cd backend && go test -v ./...` |
| Race detector | `cd backend && go test -race ./...` |
| Coverage profile | `cd backend && go test ./... -coverprofile=coverage.out` |
| Coverage summary | `cd backend && go tool cover -func=coverage.out` |
| Coverage HTML | `cd backend && go tool cover -html=coverage.out -o coverage.html` |
| Format check | `cd backend && test -z "$(gofmt -l .)"` |
| Vet | `cd backend && go vet ./...` |
| Build | `cd backend && go build ./...` |

Coverage artifacts: `backend/coverage.out`, `backend/coverage.html` (ignored by
Git).

## Frontend

| Task | Command |
| --- | --- |
| Install | `cd frontend && npm ci` |
| Tests | `cd frontend && npm test` |
| Watch mode | `cd frontend && npm run test:watch` |
| Coverage | `cd frontend && npm run test:coverage` |
| Type check | `cd frontend && npm run typecheck` |
| Production build | `cd frontend && npm run build` |
| Dev server (proxies `/api` to `:8080`) | `cd frontend && npm run dev` |

TypeScript strict mode (`npm run typecheck`) is the frontend static check; no
additional linter is installed.

Coverage artifacts: `frontend/coverage/` (ignored by Git).

## Aggregated Make targets

| Target | Runs |
| --- | --- |
| `make test` | Backend tests + frontend tests |
| `make test-backend` | `go test ./...` |
| `make test-frontend` | `npm test` |
| `make build` | Go build + frontend production build |
| `make run-backend` | Backend on `:8080` (override with `PORT`) |
| `make run-frontend` | Vite dev server on `:5173` |
| `make coverage` | Go coverage profile/summary + frontend coverage |
| `make fmt-check` | `gofmt` check + TypeScript type check |
| `make smoke` | Real backend + curl success/error checks |

All targets exist and were executed on 2026-10-19; see "Observed results".

## Observed results

### M1 — backend core (2026-10-19)

```text
$ cd backend && gofmt -l .        # no output
$ cd backend && go vet ./...      # no output
$ cd backend && go test ./... -cover
ok  calculator-app/backend/internal/calculator  0.444s  coverage: 97.5% of statements
```

Only uncovered statement: the unreachable final return in `binary`.

### M2 — backend API (2026-10-19)

```text
$ cd backend && gofmt -l . && go vet ./...      # no output
$ cd backend && go test ./... -cover
ok  calculator-app/backend/internal/api         0.416s  coverage: 94.0% of statements
ok  calculator-app/backend/internal/calculator  cached  coverage: 97.5% of statements
ok  calculator-app/backend/internal/config      cached  coverage: 100.0% of statements
$ cd backend && go build ./...                  # ok
```

Live curl check against `PORT=8099`:

```text
GET  /health                     -> 200 {"status":"ok"}
POST /api/v1/calculate add       -> 200 {"result":15}
POST /api/v1/calculate sqrt      -> 200 {"result":5}
POST /api/v1/calculate divide1/0 -> 400 {"error":{"code":"DIVISION_BY_ZERO","message":"cannot divide by zero"}}
GET  /api/v1/calculate           -> 405 {"error":{"code":"METHOD_NOT_ALLOWED","message":"use POST for this endpoint"}}
GET  /nope                       -> 404 {"error":{"code":"NOT_FOUND","message":"unknown route"}}
```

`backend/cmd/server` shows 0.0% statement coverage: it is a thin entry point and
is exercised by the smoke test rather than unit tests.

### M3 — frontend (2026-10-19)

```text
$ cd frontend && npm run typecheck       # clean
$ cd frontend && npm test
Test Files  2 passed (2)
     Tests  20 passed (20)
$ cd frontend && npm run build
dist/assets/index-*.css   2.23 kB │ gzip:  0.88 kB
dist/assets/index-*.js  224.26 kB │ gzip: 70.31 kB
✓ built in 297ms

$ cd frontend && npm run test:coverage
All files        | 97.67 | 94.52 | 94.11 | 97.64 |
 src/components | 98.11 | 93.87 |   100 | 98.11 |   (Calculator.tsx)
 src/types      |   100 |    50 |   100 |   100 |   (calculator.ts)
Statements 97.67% (84/86) | Branches 94.52% (69/73) | Functions 94.11% (16/17) | Lines 97.64% (83/85)
```

Coverage artifacts: `frontend/coverage/` (`text` and `html` reporters).

Dev-proxy integration check (backend on `:8080`, Vite dev server on `:5173`):

```text
GET  http://localhost:5173/                  -> 200 text/html
POST http://localhost:5173/api/v1/calculate  -> 200 {"result":12.5}   (percentage, 25, 200)
POST http://localhost:5173/api/v1/calculate  -> 400 {"error":{"code":"INVALID_OPERAND",...}}  (sqrt, -1)
```

## Integration / smoke

```bash
./scripts/smoke.sh            # or: make smoke
```

The script builds the backend, starts it on `SMOKE_PORT` (default `8099`),
waits for `/health`, then asserts 21 success and error paths over HTTP
(operations, division by zero, negative square root, arity errors, unsupported
operation, malformed/unknown-field/trailing JSON, wrong method, unknown route).
It exits non-zero on the first mismatch and always kills the server it started.

### M4 — integration and full check set (2026-10-19)

```text
$ make fmt-check      # gofmt clean, go vet clean, tsc --noEmit clean
$ make test           # Go: ok for 3 packages; frontend: 2 files, 20 tests passed
$ make build          # go build ok; vite build → dist 224.26 kB js (gzip 70.31 kB)
$ make coverage       # Go total 85.4% statements; frontend 97.67% statements
$ make smoke
Building backend...
Smoke testing http://127.0.0.1:8099
21 checks, 0 failed
```

Observed coverage:

| Scope | Coverage |
| --- | --- |
| `internal/api` | 94.0% statements |
| `internal/calculator` | 97.5% statements |
| `internal/config` | 100.0% statements |
| `cmd/server` | 0.0% statements (thin entry point; covered by the smoke test) |
| Go total (`go test ./...`) | 85.4% statements |
| frontend total | 97.67% statements, 94.52% branches, 94.11% functions, 97.64% lines |

The Vitest `text` reporter hides files at 100% coverage, which is why
`src/api/client.ts` does not appear in the console table; it is present in
`frontend/coverage/index.html` at 100%.

## Final verification pass

Executed on 2026-10-19 after all documentation and code changes:

```text
$ cd backend && gofmt -l .                  # no output
$ cd backend && go vet ./...                # no output
$ cd backend && go test -count=1 ./... -cover
ok  internal/api         0.457s  coverage: 94.0% of statements
ok  internal/calculator  0.450s  coverage: 97.5% of statements
ok  internal/config      0.448s  coverage: 100.0% of statements
?   cmd/server           [no test files]
$ cd backend && go test -count=1 -race ./...    # all ok
$ cd frontend && npm run typecheck              # clean
$ cd frontend && npm test                       # 2 files, 20 tests passed
$ make fmt-check                                # OK
$ make test                                     # OK
$ make build                                    # OK (dist 224.26 kB js, gzip 70.31 kB)
$ make smoke                                    # 21 checks, 0 failed
$ make coverage                                 # Go total 85.4%; frontend 97.67%
```

A committed text snapshot of the coverage output is at
[coverage-summary.txt](coverage-summary.txt). Regenerate it with `make
coverage` and, if desired, copy the output; HTML reports stay local at
`backend/coverage.html` and `frontend/coverage/index.html`.

Uncovered areas are deliberate: the unreachable final return in
`calculator.binary`, the defensive non-`*calculator.Error` 500 branch in
`handleCalculate`, the `main` entry point (smoke-tested), `App.tsx` (rendered
only by `main.tsx`), and the fallback branch in `operationOption`.

## Environment limitations (current)

- Docker is installed but Docker support is optional and is not planned for the
  first pass.
- No browser-based end-to-end runner is installed; UI behavior is covered by
  jsdom-based React Testing Library tests, and the HTTP integration is covered
  by the smoke script (M4).
- `backend/cmd/server` is not unit tested; the smoke test covers it.
