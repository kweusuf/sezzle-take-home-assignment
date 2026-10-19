# Milestone Register

Status values: `NOT STARTED`, `IN PROGRESS`, `BLOCKED`, `COMPLETE`.

A milestone is complete only when its acceptance criteria have been verified.

## M0: Project Foundation

- **Objective:** Establish repository, architecture, tooling decisions, and
  project management documents before implementation.
- **Scope:** Repo inspection, directory layout, docs, initial README, Git
  initialization, quality conventions.
- **Deliverables:** `.gitignore`, `README.md`, `docs/MILESTONES.md`,
  `docs/PROGRESS.md`, `docs/HANDOFF.md`, `docs/ARCHITECTURE.md`,
  `docs/API.md`, `docs/TESTING.md`, `docs/DECISIONS.md`, `docs/AI_PROMPTS.md`.
- **Acceptance criteria:**
  - Environment versions and repo state recorded.
  - Architecture and API contract documented as planned.
  - Milestones, progress checklist, and handoff document exist.
  - Initial commit created.
- **Dependencies:** None.
- **Status:** COMPLETE
- **Verification commands:** `git status`, `git log --oneline`.
- **Completion evidence:** Initial commit `chore: establish project structure
  and documentation`; inspection recorded in HANDOFF.md.
- **Commits:** see commit history (`chore: establish project structure and
  documentation`).

## M1: Backend Calculator Core

- **Objective:** Implement pure arithmetic operations with validation and unit
  tests, independent of HTTP.
- **Scope:** Go module, `internal/calculator`, typed operation/error model,
  unit tests.
- **Deliverables:** `backend/go.mod`, calculator package, unit tests.
- **Acceptance criteria:**
  - add, subtract, multiply, divide, power, sqrt, percentage implemented.
  - Division by zero, missing operands, non-finite inputs/results,
    unsupported operations, negative sqrt, and invalid arity rejected.
  - `gofmt` clean; `go test ./...` passes.
- **Dependencies:** M0.
- **Status:** COMPLETE
- **Verification commands:** `cd backend && gofmt -l . && go vet ./... && go test ./... -cover`
- **Completion evidence:** `go test ./...` → `ok calculator-app/backend/internal/calculator 0.444s
  coverage: 97.5% of statements`; `gofmt -l .` and `go vet ./...` produced no
  output. 47 table-driven cases plus a finite-result invariant test.
- **Commits:** `feat: implement calculator operations and unit tests`.

## M2: Backend REST API

- **Objective:** Expose the calculator over HTTP with the documented contract
  and JSON errors.
- **Scope:** Router, `POST /api/v1/calculate`, `GET /health`, strict JSON
  decoding, body limit, panic recovery, HTTP tests, `Makefile` backend targets.
- **Deliverables:** `cmd/server/main.go`, `internal/api`, `internal/config`,
  HTTP tests, server config via `PORT`.
- **Acceptance criteria:**
  - Contract in `docs/API.md` implemented exactly.
  - Correct status codes: 200/400/404/405/413/500.
  - Strict decoding (unknown fields, trailing JSON) and body limit enforced.
  - `httptest` suite passes; `go build ./...` passes.
- **Dependencies:** M1.
- **Status:** COMPLETE
- **Verification commands:** `cd backend && gofmt -l . && go vet ./... && go test ./... -cover && go build ./...`
- **Completion evidence:** `go test ./...` → `internal/api 94.0%`,
  `internal/calculator 97.5%`, `internal/config 100.0%` of statements; `go vet`
  and `gofmt -l` clean; live server on `PORT=8099` returned
  `{"result":15}` for `add`, `{"error":{"code":"DIVISION_BY_ZERO",...}}` with
  400 for divide-by-zero, 405 with `Allow: POST` for GET on the calculate
  endpoint, 404 for unknown routes, and logged graceful shutdown on SIGTERM.
- **Commits:** `feat: add calculator REST API and HTTP tests`.

## M3: React Frontend

- **Objective:** Build a responsive, accessible calculator UI that consumes the
  backend API through a dedicated API client.
- **Scope:** Vite + React + TS scaffold, calculator component, client-side
  validation, loading/error/result states, reset, responsive CSS, tests.
- **Deliverables:** `frontend/` application, API client, component tests,
  `Makefile` frontend targets.
- **Acceptance criteria:**
  - All operations available; unary sqrt does not require operand B.
  - Valid submissions render backend results; API and network errors render.
  - Duplicate submissions prevented; stale results cleared.
  - `tsc --noEmit`, Vitest suite, and production build pass.
- **Dependencies:** M2 (contract).
- **Status:** COMPLETE
- **Verification commands:** `cd frontend && npm run typecheck && npm test && npm run build`
- **Completion evidence:** `tsc --noEmit` clean; Vitest `2 passed (2)` files,
  `Tests 20 passed (20)`; production build succeeded (`dist/assets/index-*.js`
  224.26 kB, gzip 70.31 kB); coverage 97.67% statements / 94.52% branches;
  dev-server check: `GET http://localhost:5173/` → 200 text/html, proxied
  `POST /api/v1/calculate {"operation":"percentage","a":25,"b":200}` → 200
  `{"result":12.5}`, and negative sqrt through the proxy → 400
  `INVALID_OPERAND`.
- **Commits:** `feat: implement React calculator interface`.

## M4: Integration and Quality Assurance

- **Objective:** Verify frontend/backend contract and error paths end to end.
- **Scope:** Smoke script against a real backend, contract-aligned types,
  coverage reports, lint/format checks.
- **Deliverables:** `scripts/smoke.sh`, `make smoke`, coverage artifacts,
  observed results in `docs/TESTING.md`.
- **Acceptance criteria:**
  - Smoke test passes for representative success and error paths.
  - Go and frontend coverage generated and percentages recorded.
  - `make test`, `make build`, `make fmt-check` pass.
- **Dependencies:** M1–M3.
- **Status:** COMPLETE
- **Verification commands:** `make fmt-check`, `make test`, `make build`, `make coverage`, `make smoke`
- **Completion evidence:** all five targets succeeded on 2026-10-19.
  `scripts/smoke.sh` ran 21 checks against a real server on `:8099`, 0 failed
  (success and error paths, documented in TESTING.md). Go coverage: `api`
  94.0%, `calculator` 97.5%, `config` 100.0%, total 85.4% (includes the 0%
  `cmd/server` entry point). Frontend coverage: 97.67% statements / 94.52%
  branches. Frontend/backend contract verified through the Vite dev proxy in M3
  and through the smoke script in M4.
- **Commits:** `test: add integration smoke test and record coverage`.

## M5: Documentation and Submission Readiness

- **Objective:** Finalize documentation, verification report, and repository.
- **Scope:** README, docs set, progress/handoff updates, final verification,
  clean working tree.
- **Deliverables:** Complete README and docs; final verification results.
- **Acceptance criteria:**
  - A reviewer can set up and run both services from the README.
  - All documented commands were executed successfully or limitations recorded.
  - Known limitations documented; Git tree clean; no secrets/artifacts tracked.
- **Dependencies:** M4.
- **Status:** COMPLETE
- **Verification commands:** the full final set in `docs/TESTING.md`
  ("Final verification pass").
- **Completion evidence:** `gofmt -l` empty, `go vet ./...`, `tsc --noEmit`,
  `go test -count=1 ./...` and `-race`, 20 frontend tests, production build,
  `make smoke` 21/21, coverage recorded in `docs/coverage-summary.txt` and
  TESTING.md. Known limitations documented in README and HANDOFF. Working tree
  clean after the final commit.
- **Commits:** `docs: finalize project documentation and verification`.

## M6: Classic Calculator GUI (user-requested revision)

- **Objective:** Replace the form UI with a classic calculator interface: a key
  for every operation, basic and scientific modes, and an animated expansion
  from basic to scientific.
- **Scope:** Rewrite `Calculator.tsx` around an immediate-execution state
  machine, add the keypad/mode-toggle markup and animations to `index.css`,
  reduce `types/calculator.ts` to the operation union, tighten the API client's
  response check, rewrite the component tests, and update the docs.
- **Deliverables:** Keypad UI with Basic/Scientific modes, `1/x` / `x²` / `xʸ` /
  `√` keys, animated reveal, updated tests, ADR-011 and ADR-012.
- **Acceptance criteria:**
  - Every supported operation is reachable from a key.
  - Scientific keys appear only in scientific mode and expand with the toggle.
  - Arithmetic still happens only in the backend.
  - Requests cannot be duplicated while one is in flight.
  - Typecheck, tests, build, and the existing smoke test still pass.
- **Dependencies:** M3 (UI), M2 (contract).
- **Status:** COMPLETE
- **Verification commands:** `make fmt-check`, `make test`, `make build`,
  `make coverage`, `make smoke`
- **Completion evidence:** `tsc --noEmit` clean; Vitest 2 files, 36 tests passed;
  production build ok (225.28 kB js, 70.66 kB gzip); frontend coverage 99.31%
  statements / 100% branches (was 97.67% / 94.52%); `make smoke` 21 checks,
  0 failed; Go coverage unchanged (85.4% total). Verified on 2026-10-19:
  `2 + 3 × 4 =` gives 20 with one `add` and one `multiply` request, `√25` gives
  5, `x²` on 7 gives 49, `1/x` on 4 gives 0.25, and `1 ÷ 0` shows the backend
  `DIVISION_BY_ZERO` message.
- **Commits:** `feat: replace calculator form with keypad GUI`.

## M7: Docker Packaging (user-requested)

- **Objective:** Run the whole stack with Docker: two images plus Compose, with
  the SPA and API behind one origin.
- **Scope:** `backend/Dockerfile`, `frontend/Dockerfile`, `frontend/nginx.conf`,
  `docker-compose.yml`, `.dockerignore` files, Makefile targets, docs.
- **Deliverables:** Multi-stage images (static Go binary; Vite build served by
  nginx), nginx reverse proxy for `/api/` and `/health`, Compose service wiring
  with health checks.
- **Acceptance criteria:**
  - `docker compose up --build` starts both services and both report healthy,
    with the frontend waiting for the backend.
  - The browser entry point serves the SPA and proxies the API.
  - The API is not published on the host; the frontend is.
  - Deep links return the SPA (`try_files` fallback).
  - The local, non-Docker workflow still passes (`make test`, `make smoke`).
- **Dependencies:** M2 (API), M3/M6 (frontend build), decision ADR-013.
- **Status:** COMPLETE
- **Verification commands:** `make docker-build`, `make docker-up`,
  `docker compose ps`, `curl` against `:8081`, `curl` against the images'
  health endpoints, `make docker-down`.
- **Completion evidence:** both images built (`calculator-backend:local` 22.3 MB,
  `calculator-frontend:local` 102 MB) and both containers reported
  `Up (healthy)`; through nginx on `:8081`: `/health` → `{"status":"ok"}`,
  `add 10 5` → `{"result":15}`, `sqrt 25` → `{"result":5}`, `divide 1/0` → `400
  DIVISION_BY_ZERO`, `/` → 200 text/html, `/assets/index-*.js` → 200
  application/javascript (225 281 bytes), `/some/unknown/route` → 200 (SPA
  fallback); the backend container runs as `uid=10001(app)` and publishes no host
  port. Local checks re-run after the change: `make test` pass, `make smoke`
  21/21.
- **Commits:** `chore: add Docker packaging for the full stack`.

## Optional (not tracked as required milestones)

- Dockerfile / Compose for full-stack deployment. Only if required work is done
  and verified.
