# Handoff

Persistent context for the next developer or AI agent. Reflects the repository
as it actually is.

## 1. Project purpose

Take-home assignment: a full-stack calculator with a React + TypeScript
frontend and a Go REST backend, delivered with tests, coverage, and engineering
documentation. See [Problem.md](Problem.md) and [Prompt.md](Prompt.md).

## 2. Current overall status

**All required milestones (M0–M5) are complete**, plus M6 (a user-requested GUI
revision that replaced the form with a classic keypad) and M7 (user-requested
Docker packaging). Backend, frontend, tests, coverage, smoke test, Docker stack,
and documentation are done and verified. The repository is ready for evaluation
and is published publicly on GitHub (`main` tracks `origin/main`).

## 3. Current milestone

None — project complete and published (pending only optional follow-ups).

## 4. Completed milestones

- M0: Project Foundation — structure, docs, initial README, initial commit.
- M1: Backend Calculator Core — 47 table-driven cases + invariant test, 97.5%.
- M2: Backend REST API — strict decoding, error envelope, `httptest` suite,
  live curl verification, 94.0% (`api`) / 100% (`config`) coverage.
- M3: React Frontend — typed client, calculator UI, 20 tests, 97.67% statement
  coverage, production build, proxy verified against the live backend.
- M4: Integration and QA — `scripts/smoke.sh` (21 checks, 0 failures), all Make
  targets green, coverage recorded.
- M5: Documentation and Submission Readiness — final verification, committed
  coverage summary, clean tree.
- M6: Classic Calculator GUI — keypad with a key per operation, Basic/Scientific
  modes with an animated reveal, immediate-execution chaining, 36 tests, 99.31%
  statement / 100% branch coverage.
- M7: Docker Packaging — multi-stage images (22.3 MB backend, 102 MB frontend),
  nginx serving the SPA and proxying `/api/` + `/health`, Compose stack where
  only the frontend is published (`8081:80`); both services verified healthy.

## 5. Current implementation state

| Area | State |
| --- | --- |
| Repository | Initialized on `main` and published to GitHub: public, `main` tracks `origin/main`. |
| `backend/` | Complete for M1/M2: `cmd/server`, `internal/api`, `internal/calculator`, `internal/config`, tests. |
| `frontend/` | Complete through M6: Vite + React + TS app, typed client, classic keypad UI with Basic/Scientific modes, 36 tests, `package-lock.json` committed. |
| `docs/` | Problem.md, Prompt.md, and the eight required project documents present and current. |
| `Makefile` | All documented targets exist and pass, including `docker-build` / `docker-up` / `docker-down`. |
| `scripts/smoke.sh` | End-to-end smoke test (21 checks) against a real backend. |
| `Docker` | `backend/Dockerfile`, `frontend/Dockerfile`, `frontend/nginx.conf`, `docker-compose.yml`; built and run, both services healthy. |

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
| `frontend/src/components/Calculator.tsx` | Classic keypad UI: key definitions, immediate-execution state machine, mode toggle, display, error/loading states. |
| `frontend/src/types/calculator.ts` | `Operation` union mirroring the Go operation constants (display metadata lives in the component). |
| `frontend/vite.config.ts` | React plugin, `/api` dev proxy to `:8080`, Vitest jsdom + coverage config. |
| `backend/Dockerfile` | Multi-stage: static Go binary on alpine, non-root (uid 10001), `/health` health check. |
| `frontend/Dockerfile` | Multi-stage: `npm ci` + `npm run build` on node, static bundle on nginx. |
| `frontend/nginx.conf` | Serves the SPA with a `try_files` fallback; proxies `/api/` and `/health` to `backend:8080` with Docker DNS re-resolution. |
| `docker-compose.yml` | Backend (internal) + frontend (published `8081:80`), frontend waits for backend health. |
| `docs/MILESTONES.md` | Milestone register with acceptance criteria and evidence. |
| `docs/PROGRESS.md` | Authoritative checklist. |
| `docs/API.md` | API contract. |
| `docs/TESTING.md` | Test/build commands, observed results, and the test inventory (cases per group, per-file and per-package coverage, uncovered statements and why). |
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
`INVALID_RESPONSE` (2xx without a finite numeric `result`), and `UNKNOWN_ERROR`
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

Containerized alternative (no Go/Node needed):

```bash
make docker-up      # docker compose up --build -d; app on http://localhost:8081
docker compose ps   # both services healthy
make docker-down
```

## 11. Commands for testing and building

```bash
make test             # backend + frontend tests
make test-backend     # cd backend && go test ./...
make test-frontend    # cd frontend && npm test
make build            # go build + frontend production build
make coverage         # Go profile/summary + frontend coverage report
make fmt-check        # gofmt + go vet + tsc --noEmit
make smoke            # builds and starts the backend, runs 21 HTTP checks
make docker-build     # build both images
make docker-up        # start the stack on :8081
make docker-down      # stop the stack
cd backend && go test -race ./...
```

## 12. Most recent successful verification results

Final verification pass (2026-10-19), all executed with a clean cache where it
matters; frontend numbers are from the M6 GUI revision:

```text
$ cd backend && gofmt -l . && go vet ./...          # no output
$ cd backend && go test -count=1 ./... -cover
ok  internal/api         0.457s  coverage: 94.0% of statements
ok  internal/calculator  0.450s  coverage: 97.5% of statements
ok  internal/config      0.448s  coverage: 100.0% of statements
?   cmd/server           [no test files]
$ cd backend && go test -count=1 -race ./...        # all ok
$ cd frontend && npm run typecheck                  # clean
$ cd frontend && npm test                           # 2 files, 36 tests passed
$ make fmt-check && make test && make build         # all OK
$ make smoke                                        # 21 checks, 0 failed
$ make coverage                                     # Go total 85.4%; frontend 99.31% statements
```

M7 Docker stack (2026-10-19):

```text
$ make docker-build                                 # calculator-backend:local 22.3 MB, calculator-frontend:local 102 MB
$ make docker-up && docker compose ps                # backend Up (healthy), frontend Up (healthy) 0.0.0.0:8081->80/tcp
$ curl http://localhost:8081/health                  # {"status":"ok"}
$ curl -X POST http://localhost:8081/api/v1/calculate -d '{"operation":"add","a":10,"b":5}'
{"result":15}
$ curl ... divide 1/0                                # 400 DIVISION_BY_ZERO
$ curl -o /dev/null -w '%{http_code}' http://localhost:8081/            # 200 text/html
$ curl ... /some/unknown/route                       # 200 (SPA fallback)
```

Details, per-package coverage, and the exact smoke cases:
[docs/TESTING.md](TESTING.md); generated artifact:
[docs/coverage-summary.txt](coverage-summary.txt).

### Earlier milestone evidence

M2 live server check (`PORT=8099`): `/health` 200, `add` 200 `{"result":15}`,
`sqrt` 200 `{"result":5}`, divide-by-zero 400, GET on calculate 405, unknown
route 404.

M3 dev proxy (backend `:8080`, Vite `:5173`): `GET /` 200 text/html,
percentage 25/200 → 200 `{"result":12.5}`, sqrt −1 → 400
`INVALID_OPERAND`.

`cmd/server` is 0.0% covered by unit tests; the smoke test exercises it.

## 13. Known defects and limitations

- Percentage semantics are a ratio (`a/b*100`), not "percent of". In the keypad
  the `%` key is that ratio operation, which differs from the percentage
  behaviour of some physical calculators.
- The keypad evaluates left to right with immediate execution: no operator
  precedence, no parentheses, and `=` does not repeat the last operation.
- Scientific mode (`√`, `x²`, `xʸ`, `1/x`) covers only the operations the backend
  implements; trig, log, and parentheses need new backend operations.
- The reveal animation is CSS-only and was not verified in a real browser here
  (no Playwright browser build installed); tests assert the state that drives it.
- Only floating-point arithmetic; binary artifacts (e.g. `0.1+0.2`) are
  returned and displayed as-is.
- Duplicate JSON keys cannot be detected with `encoding/json` (documented
  limitation, not a defect).
- Result formatting is `String(value)`; very large or very small magnitudes are
  shown in exponential notation.
- No authentication, rate limiting, or persistence (not requested).
- No Docker/Compose registry push or orchestration; the stack is built and run
  locally, and `nginx.conf` expects a Docker network for the `backend` DNS name.
- The frontend image is ~102 MB because it carries nginx; the backend image is
  22.3 MB.
- The `handleCalculate` 500 branch for a non-`*calculator.Error` domain failure
  is defensive and cannot be triggered through the public API.
- Operation identifiers are duplicated in Go and TypeScript; no automated
  contract test keeps them in sync (the smoke test would catch drift for the
  operations it exercises).

## 14. Outstanding tasks

None for the required scope. Optional ideas: a registry push / CI image build, a
browser-level E2E test (which would also verify the reveal animation), a
generated/shared operation contract, and backend operations for trig/log if a
scientific calculator is wanted.

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
  `backend/internal/calculator/calculator.go`, and the keypad maps UI keys onto
  those identifiers. Keeping them in sync is manual and covered by the smoke
  test.

## 17. Git branch and latest relevant commits

Branch `main`, published to <https://github.com/kweusuf/sezzle-take-home-assignment>
(public), tracking `origin/main`. History:

- `chore: establish project structure and documentation` (M0)
- `feat: implement calculator operations and unit tests` (M1)
- `feat: add calculator REST API and HTTP tests` (M2)
- `test: add integration smoke test and record coverage` (M4)
- `docs: finalize project documentation and verification` (M5)
- `feat: replace calculator form with keypad GUI` (M6)
- `chore: add Docker packaging for the full stack` (M7)

## 18. Immediate next steps

Nothing is required: the repository is published and up to date at
<https://github.com/kweusuf/sezzle-take-home-assignment>. Further pushes are
ordinary `git push origin main`.

Optional follow-ups are listed in section 14.

## 19. Approval decisions already made

- Go standard library only; no router framework (still true after M2).
- No database, no Docker in the first pass.
- Single `POST /api/v1/calculate` endpoint with an operation identifier.
- Percentage defined as `a / b * 100`; zero denominator is an error.
- Body limit 64 KiB; unknown fields and trailing JSON rejected.
- Recover middleware turns panics into `500 INTERNAL_ERROR` with no details.
- M6: classic keypad with immediate execution; scientific keys limited to
  existing backend operations; the reveal animation is CSS-only (ADR-011,
  ADR-012).
- M7: Docker packaging with nginx as the single entry point; the API is not
  published outside the compose network (ADR-013).

## 20. Decisions that still require approval

- Pushing container images to a registry or adding CI that builds them.
- Any change to the agreed architecture (e.g. adding a database, a framework, or
  the trig/log operations the scientific keys do not cover) beyond the
  documented scope.
