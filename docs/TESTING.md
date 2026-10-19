# Testing

All commands and results below were executed; nothing is claimed as passed
without an observed run. The M6 section records the most recent frontend run.

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
| `make docker-build` | Build both container images |
| `make docker-up` | Build and start the stack on `:8081` (detached) |
| `make docker-down` | Stop the stack and remove containers/networks |

All targets exist and were executed on 2026-10-19; see "Observed results".

## Docker

| Task | Command |
| --- | --- |
| Build images | `docker compose build` (or `make docker-build`) |
| Start the stack | `docker compose up --build -d` (or `make docker-up`) |
| Status / health | `docker compose ps` |
| Logs | `docker compose logs -f` |
| Stop | `docker compose down` (or `make docker-down`) |
| API through nginx | `curl http://localhost:8081/api/v1/calculate ...` |

The frontend image is the only published port (`8081:80` by default,
`FRONTEND_PORT` overrides it); the backend is reachable only inside the compose
network as `backend:8080`. Health checks come from the images, so
`docker compose ps` shows `(healthy)` for both services.

## Test inventory and coverage metrics

Snapshot 2026-10-19, from `make test` / `make coverage`:
`cd backend && go test ./... -coverprofile=coverage.out` and
`cd frontend && npm run test:coverage -- --coverage.reporter=json-summary`.

### Test files and the coverage of what they test

| Test file | Subject under test | Cases | Coverage of the subject |
| --- | --- | --- | --- |
| `backend/internal/calculator/calculator_test.go` | `calculator.go` | 48 (47 table + 1 property) | 97.5% statements |
| `backend/internal/api/api_test.go` | `api.go` | 41 (36 table + 5 standalone) | 94.0% statements |
| `backend/internal/config/config_test.go` | `config.go` | 7 | 100% statements |
| `frontend/src/api/client.test.ts` | `src/api/client.ts` | 9 | 100% stmts / 100% branch / 100% funcs |
| `frontend/src/components/Calculator.test.tsx` | `Calculator.tsx` | 27 | 100% stmts / 100% branch / 100% funcs |
| `scripts/smoke.sh` (integration) | `cmd/server` + full stack | 21 checks | entry point: 0% unit, exercised end to end |

**Totals:** 11 Go test functions holding 96 cases, 36 frontend tests in 2 files
(97 `expect` assertions), plus 21 smoke checks — 132 unit/component cases and
the end-to-end set. Runtime: Go 0.44–0.46 s per package (~1.3 s total),
frontend ~2.5 s wall clock.

How the cases assert:

- Go core — successes compare with a `1e-9` tolerance (so `0.3 - 0.1` is checked
  as `0.2`), failures must return a `*calculator.Error` with the expected code, a
  non-empty message, and `Error() == Message`. `TestResultsAreAlwaysFinite`
  sweeps 6 operations × 7 operands × 7 operands (294 combinations) and fails if
  any non-error result is NaN or ±Inf.
- Go API — each success asserts status, `Content-Type`, and that the decoded body
  has exactly one field (`result`) with the expected value; each error asserts
  status, code, and (for 405) the `Allow` header.
- Frontend — behavior is asserted through the rendered keypad and the mocked API
  client (`aria-pressed`/`aria-expanded`, display text, disabled keys), not
  through component internals.

### Go — `calculator_test.go` (47 table cases + 1 property test)

| Group | Cases | What they pin down |
| --- | --- | --- |
| add | 5 | positives, mixed signs, zero, fractions, overflow → `INVALID_RESULT` |
| subtract | 4 | plain, negative result, negative operand, float artifact (`0.3 - 0.1`) |
| multiply | 5 | basics, by zero, two negatives, fractions, overflow |
| divide | 5 | non-integer result, zero numerator, negatives, `/ 0` and `/ -0` → `DIVISION_BY_ZERO` |
| percentage | 4 | ratio semantics (`25/100` → 25), fraction, zero numerator, zero denominator → `DIVISION_BY_ZERO` |
| power | 8 | integer/fractional/negative exponents, `0^0` → 1, `(-8)^0.5` → `INVALID_RESULT`, `0^-1` → `INVALID_RESULT`, overflow, negative base with integer exponent |
| sqrt | 5 | perfect square, zero, fraction, negative → `INVALID_OPERAND`, operand `b` rejected |
| missing operand | 4 | absent `b` for add/divide/power/percentage → `MISSING_OPERAND` |
| unsupported operation | 3 | unknown name, empty name, `ADD` (case sensitive) |
| non-finite operands | 4 | `NaN` in `a` and in `b`, `+Inf`, `-Inf` → `INVALID_OPERAND` |
| `TestResultsAreAlwaysFinite` | 1 | property check: every row above either errors or returns a finite value |

### Go — `api_test.go` (36 table cases + 5 standalone)

| Group | Cases | Examples → expectation |
| --- | --- | --- |
| `TestCalculateSuccess` | 10 | `add 10 5` → 200 `{"result":15}`; same for subtract, negative add, multiply, divide, zero numerator, power, sqrt, sqrt 0, percentage |
| `TestCalculateErrors` — domain | 13 | `divide 1/0` → 400 `DIVISION_BY_ZERO`; `sqrt -1` → `INVALID_OPERAND`; missing/null/absent operands → `MISSING_OPERAND`; `modulo` and `ADD` → `UNSUPPORTED_OPERATION`; overflow → `INVALID_RESULT` |
| `TestCalculateErrors` — decoding | 8 | malformed JSON, empty body, trailing value, two objects, unknown field, wrong operand type, array body, `1e400` → 400 `INVALID_JSON` |
| `TestCalculateErrors` — transport | 5 | `GET`/`PUT` on calculate and `POST` on health → 405 with `Allow`; unknown `/api/v1/...` and `/` → 404 `NOT_FOUND` |
| `TestCalculateSuccessBodyIsExact` | 1 | 200 body is exactly `{"result":15}`, no extra fields |
| `TestCalculateBodyTooLarge` | 1 | body over 64 KiB → 413 `REQUEST_TOO_LARGE` |
| `TestHealth` | 1 | `/health` → 200 `{"status":"ok"}` |
| `TestPanicRecoveryReturnsInternalError` | 1 | injected panic → 500 `INTERNAL_ERROR`, no detail leak |
| `TestZeroAndNegativeZeroEncoding` | 1 | `0` and `-0` results encode as JSON numbers, not strings |

### Go — `config_test.go` (7 cases)

`Port()`: unset → default, `9000`, and the fallbacks `abc`, `0`, `-1`, `70000`.
`Addr()`: returns `:1234` for `PORT=1234`.

### Frontend — `client.test.ts` (9 tests)

Posts the operation and operands; omits `b` for unary operations; maps the
backend error envelope to `ApiError`; `UNKNOWN_ERROR` when a response has no
envelope; `INVALID_RESPONSE` for a 200 that is not an object, is `null`, has no
numeric `result`, or has a non-finite `result`; network failure when `fetch`
rejects.

### Frontend — `Calculator.test.tsx` (27 tests)

| Describe block | Tests | Focus |
| --- | --- | --- |
| `Calculator keypad` | 4 | basic keypad renders, scientific row starts collapsed, expands on the mode button, collapses again |
| `Calculator entry` | 5 | builds numbers from digits, accepts one decimal point, starts fresh after a result, toggles sign, backspaces and clears with `C` |
| `Calculator calculations` | 9 | `=` posts to the API, pending operator is shown, chaining evaluates the pending operation first, a repeated operator is replaced, `%`, `√`, `x²` → `power 2`, `1/x` → `divide 1 x`, `xʸ` from the scientific row |
| `Calculator failures` | 9 | backend error shown with the expression cleared, network failure, fallback message, error cleared by digits/`.`/`±`/`⌫`/scientific keys, `=` with nothing pending, failures from a chained operator and from a scientific key, keypad disabled while a request is in flight |

### Coverage detail — frontend, per file

`npm run test:coverage` prints only files below 100%, so the table below uses the
`json-summary` reporter:

| File | % Stmts | % Branch | % Funcs | % Lines | Uncovered |
| --- | --- | --- | --- | --- | --- |
| All files | 99.31 (146/147) | 100 (99/99) | 95.65 (22/23) | 99.31 (146/147) | |
| `src/api/client.ts` | 100 (31/31) | 100 (25/25) | 100 (5/5) | 100 (31/31) | — |
| `src/components/Calculator.tsx` | 100 (115/115) | 100 (74/74) | 100 (17/17) | 100 (115/115) | — |
| `src/App.tsx` | 0 (0/1) | 100 (0/0) | 0 (0/1) | 0 (0/1) | line 4 |

Excluded by `vite.config.ts`: `src/main.tsx`, `src/test/**`, `**/*.test.*`.
`src/types/calculator.ts` is type-only and contributes no statements.

### Coverage detail — Go statements never executed

Go reports statement coverage only (no branch or function percentages):

| Package | Statements | Note |
| --- | --- | --- |
| `internal/calculator` | 97.5% (39/40) | one unreachable `return` |
| `internal/api` | 94.0% (63/67) | two defensive branches |
| `internal/config` | 100% (9/9) | |
| `cmd/server` | 0.0% (0/14) | covered by the smoke test instead |
| total | 85.4% | |

| Location | Stmts | Why it is not executed |
| --- | --- | --- |
| `cmd/server/main.go` (whole file) | 14 | Thin entry point: signal handling, timeouts, graceful shutdown; asserted end to end by `make smoke` |
| `internal/api/api.go:97-99` | 3 | Defensive 500 for a domain error that is *not* a `*calculator.Error`; unreachable while the core returns only typed errors |
| `internal/api/api.go:128` | 1 | The `io.EOF` arm of the empty-body check; the guard is kept for portability across Go versions, but the current decoder routes an empty body through the generic decode-error path |
| `internal/calculator/calculator.go:125` | 1 | Final `return` after the exhaustive `switch` over the operation constants |

### Reproducing the numbers

```bash
make test                                    # 96 Go cases + 36 frontend tests
make coverage                                # Go profile/summary + frontend coverage
cd backend && go tool cover -func=coverage.out
cd frontend && npm run test:coverage -- --coverage.reporter=json-summary
                                             # writes coverage/coverage-summary.json
make smoke                                   # 21 end-to-end checks
```

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

### M6 — keypad GUI revision (2026-10-19)

The M6 revision replaced the form UI with a keypad and rewrote the frontend
tests, so the M3 test list and coverage numbers above are historical; the
following run supersedes them.

```text
$ cd frontend && npm run typecheck       # clean
$ cd frontend && npm test
Test Files  2 passed (2)
     Tests  36 passed (36)
$ cd frontend && npm run build
dist/assets/index-*.css   3.73 kB │ gzip:  1.37 kB
dist/assets/index-*.js  225.28 kB │ gzip: 70.66 kB
✓ built in 220ms

$ cd frontend && npm run test:coverage
All files        | 99.31 |      100 |   95.65 |   99.31 |
 src             |     0 |      100 |       0 |       0 |  (App.tsx)
Statements 99.31% (146/147) | Branches 100% (99/99) | Functions 95.65% (22/23) | Lines 99.31% (146/147)
```

Component tests now cover: keypad rendering, digit/decimal/sign/backspace/clear
entry, binary operations through the API, operator chaining without precedence,
operator replacement, the `%` key, scientific keys (`√`, `x²`, `xʸ`, `1/x`),
Basic/Scientific toggling (including the collapsed-row `aria-hidden` and inert
state), backend error display, network and unexpected failures, error recovery
on the next key press, and the disabled-keypad behavior while a request is in
flight.

Client tests add coverage for a non-object 200 body, a `null` 200 body, and a
non-finite `result` (`1e309`), all mapped to `INVALID_RESPONSE`.

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
$ make test           # Go: ok for 3 packages; frontend: 2 files, 20 tests passed (36 after M6)
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
| frontend total (M3 run) | 97.67% statements, 94.52% branches, 94.11% functions, 97.64% lines |
| frontend total (M6 run) | 99.31% statements, 100% branches, 95.65% functions, 99.31% lines |

The Vitest `text` reporter hides files at 100% coverage, which is why
`src/api/client.ts` does not appear in the console table; it is present in
`frontend/coverage/index.html` at 100%.

### M7 — Docker stack (2026-10-19)

```text
$ make docker-build
 Image calculator-backend:local  Built
 Image calculator-frontend:local Built

$ make docker-up && docker compose ps
SERVICE    STATUS                  PORTS
backend    Up (healthy)            8080/tcp
frontend   Up (healthy)            0.0.0.0:8081->80/tcp, [::]:8081->80/tcp

$ curl http://localhost:8081/health
{"status":"ok"}
$ curl -X POST http://localhost:8081/api/v1/calculate -d '{"operation":"add","a":10,"b":5}'
{"result":15}
$ curl -X POST ... '{"operation":"sqrt","a":25}'        # {"result":5}
$ curl -X POST ... '{"operation":"divide","a":1,"b":0}'  # 400 {"error":{"code":"DIVISION_BY_ZERO",...}}
$ curl -o /dev/null -w '%{http_code} %{content_type}' http://localhost:8081/
200 text/html
$ curl ... /assets/index-*.js                             # 200 application/javascript, 225281 bytes
$ curl ... /some/unknown/route                            # 200 (SPA fallback)
$ docker compose exec -T backend id
uid=10001(app) gid=10001(app) groups=10001(app)
```

Image sizes: `calculator-backend:local` 22.3 MB, `calculator-frontend:local`
102 MB. `docker history` on the frontend image shows the runtime layers are the
nginx base (51.6 MB), `nginx.conf` (20.5 kB), and the built bundle (262 kB), so no
`node_modules` leaks into the runtime image.

After the Docker work, the local (non-Docker) checks were re-run unchanged:
`make test` (Go ok, 36 frontend tests) and `make smoke` (21 checks, 0 failed).

## Final verification pass

Executed on 2026-10-19 after all documentation and code changes (frontend
numbers are from the M6 GUI revision):

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
$ cd frontend && npm test                       # 2 files, 36 tests passed
$ make fmt-check                                # OK
$ make test                                     # OK
$ make build                                    # OK (dist 225.28 kB js, gzip 70.66 kB)
$ make smoke                                    # 21 checks, 0 failed
$ make coverage                                 # Go total 85.4%; frontend 99.31% statements
```

A committed text snapshot of the coverage output is at
[coverage-summary.txt](coverage-summary.txt). Regenerate it with `make
coverage` and, if desired, copy the output; HTML reports stay local at
`backend/coverage.html` and `frontend/coverage/index.html`.

Uncovered areas are deliberate: the unreachable final return in
`calculator.binary`, the defensive non-`*calculator.Error` 500 branch in
`handleCalculate`, the `main` entry point (smoke-tested), and `App.tsx`
(rendered only by `main.tsx`, so its component body is never asserted).

## Environment limitations (current)

- Docker packaging is provided (M7) and verified; the compose stack is the only
  deployment path documented (no registry push, no orchestration).
- No browser-based end-to-end runner is installed; UI behavior is covered by
  jsdom-based React Testing Library tests, and the HTTP integration is covered
  by the smoke script (M4). The M6 reveal animation is CSS-only and was not
  verified in a real browser in this environment (no Playwright browser build
  installed); the tests assert the state that drives it (`aria-expanded`,
  `aria-hidden`, and the reveal class), and the reviewer is expected to eyeball
  the transition at <http://localhost:5173>.
- `backend/cmd/server` is not unit tested; the smoke test covers it.
