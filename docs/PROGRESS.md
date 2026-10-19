# Progress Checklist

Authoritative implementation checklist, grouped by milestone. A task is checked
only after its completion criterion has been verified.

## M0: Repository and environment setup

- [x] Inspect working directory and confirm no Git repository exists.
- [x] Record tool versions (Go 1.27.2, Node 26.12.0, npm 11.20.0, Git 2.56.0).
- [x] Initialize Git repository on `main`; no remote configured.
- [x] Create `.gitignore` covering dependencies, build output, coverage, env files.
- [x] Create milestone register, progress, handoff, architecture, API, testing,
      decisions, and AI prompt documents.
- [x] Create initial README describing planned scope.
- [x] Commit foundation documentation.

## M1: Backend implementation and tests

- [x] Create Go module (`go 1.22`) and package layout.
- [x] Implement add, subtract, multiply, divide.
- [x] Implement power, sqrt, percentage.
- [x] Implement typed errors and operand/arity validation.
- [x] Reject non-finite inputs and results; reject negative sqrt.
- [x] Table-driven unit tests: normal, negative, zero, fractions, edge cases.
- [x] `gofmt -l` clean; `go vet` clean; `go test ./internal/calculator` passes
      (`ok`, 0.44s, statement coverage 97.5%).

## M2: API implementation and tests

- [x] Implement `POST /api/v1/calculate` with strict JSON decoding.
- [x] Implement `GET /health`.
- [x] Consistent JSON error envelope and status codes.
- [x] Reject trailing JSON, unknown fields, oversized bodies; limit 64 KiB.
- [x] 404 unknown routes and 405 wrong methods as JSON (with `Allow` header).
- [x] Panic recovery returns a 500 without internal details.
- [x] Port configurable via `PORT` (default 8080); graceful shutdown.
- [x] `httptest` suite covers success, malformed input, and failure paths
      (10 success cases, 26 error cases, body-limit, health, panic recovery).
- [x] `go build ./...` passes; server started and checked with curl
      (`PORT=8099`): `/health` 200, `add` 200 `{"result":15}`, `sqrt` 200,
      divide-by-zero 400, GET on calculate 405, unknown route 404.

## M3: Frontend implementation and tests

- [x] Scaffold Vite React TypeScript app with npm scripts.
- [x] Typed API client (`src/api/client.ts`) with `ApiError`.
- [x] Calculator UI: title, operand inputs, operation selector, submit, reset.
- [x] Unary sqrt hides operand B.
- [x] Client-side validation messages; backend remains authoritative.
- [x] Loading state prevents duplicate submissions.
- [x] Result and error display with `aria-live`/`role="alert"`.
- [x] Stale result/error cleared on input/operation change.
- [x] Responsive CSS, visible focus states, keyboard submit (form + Enter).
- [x] Vitest + RTL tests: 5 client tests (request shape, error mapping,
      network failure, invalid response) and 14 component tests (rendering,
      operations, unary, validation, API error, network error, unexpected
      error, loading/duplicate submit, stale result, stale error, reset).
- [x] `npm run typecheck`, `npm test` (20 passed), `npm run build` pass;
      frontend coverage 97.67% statements / 94.52% branches.

## M4: Integration

- [x] Frontend request shape matches backend contract (single typed client;
      `operation`, `a`, optional `b`).
- [x] `scripts/smoke.sh` starts a real backend and checks 21 success/error
      paths; `make smoke` passes.
- [x] Vite dev proxy routes `/api` to backend (verified with curl in M3).
- [x] `make test`, `make build`, `make fmt-check`, `make smoke` pass.
- [x] Go coverage profile generated (`backend/coverage.out`); frontend coverage
      generated (`frontend/coverage/`).
- [x] Actual coverage recorded in `docs/TESTING.md`.

## M5: Documentation

- [x] README complete: setup, run, test, coverage, API, decisions, limitations.
- [x] `docs/API.md` matches implementation exactly (curl examples verified).
- [x] `docs/ARCHITECTURE.md` reflects final structure and trade-offs.
- [x] `docs/DECISIONS.md` contains significant ADRs.
- [x] `docs/TESTING.md` contains executed commands and observed results.
- [x] `docs/AI_PROMPTS.md` records substantial prompts and purpose.
- [x] `docs/HANDOFF.md` reflects actual current state.
- [x] `docs/MILESTONES.md` statuses and evidence updated.
- [x] Committed coverage summary at `docs/coverage-summary.txt`.

## M6: Classic calculator GUI (user request)

- [x] Replace the operation selector and operand inputs with a keypad
      (digits, `.`, `±`, `⌫`, `C`, `÷ × − +`, `%`, `=`).
- [x] Add Basic/Scientific mode toggle with a mode button.
- [x] Animate the scientific row open and closed
      (`grid-template-rows: 0fr → 1fr`, 340 ms); drop the transition under
      `prefers-reduced-motion`; mark the collapsed row `aria-hidden` + `inert`.
- [x] Map scientific keys onto existing operations: `√` (sqrt), `x²` (power,
      exponent 2), `xʸ` (power), `1/x` (divide).
- [x] Immediate execution: an operator press evaluates the pending operation
      before chaining, so `2 + 3 × 4 =` → 20.
- [x] Keep arithmetic in the backend only; digit/sign/backspace are string edits.
- [x] Disable all keys while a request is in flight; clear errors on the next
      key press.
- [x] Rewrite component tests for keypad entry, chaining, scientific keys, error
      recovery, and the mode toggle (36 frontend tests total).
- [x] Tighten the client: a 200 response must carry a finite `result`.
- [x] `make fmt-check`, `make test`, `make build`, `make coverage`, `make smoke`
      all pass; frontend coverage 99.31% statements / 100% branches.
- [x] Record ADR-011 (keypad + immediate execution) and ADR-012 (scientific mode
      scope and animation) in `docs/DECISIONS.md`.
- [x] Update README, ARCHITECTURE, TESTING, MILESTONES, HANDOFF, AI_PROMPTS.

## M7: Docker packaging (user request)

- [x] `backend/Dockerfile`: multi-stage, static binary (`CGO_ENABLED=0`,
      `-trimpath -ldflags='-s -w'`), non-root user, `wget` health check.
- [x] `frontend/Dockerfile`: `node:26-alpine` build (`npm ci`,
      `npm run build`), static output copied into `nginx:alpine`.
- [x] `frontend/nginx.conf`: SPA `try_files` fallback, `/api/` and `/health`
      proxied to `backend:8080`, Docker DNS re-resolution.
- [x] `docker-compose.yml`: frontend published on `8081:80` (or
      `$FRONTEND_PORT`), backend internal, `depends_on: service_healthy`.
- [x] `.dockerignore` for both build contexts (`node_modules`, `dist`,
      coverage, binaries).
- [x] Makefile targets `docker-build`, `docker-up`, `docker-down`.
- [x] Verified: both images build, both containers healthy, SPA + proxied API +
      `/health` + asset + deep-link requests all answer correctly from `:8081`.
- [x] Verified the non-Docker workflow still passes (`make test`, `make smoke`).
- [x] Record ADR-013 and mark ADR-010 superseded.
- [x] Update README (Docker section), TESTING, MILESTONES, HANDOFF, AI_PROMPTS.

## Git hygiene

- [x] Small, focused commits per milestone (seven commits: M0–M5 plus the M6 GUI
      revision).
- [x] Each commit includes its documentation updates.
- [x] Diff reviewed before commit; no secrets or generated artifacts staged
      (`node_modules/`, `dist/`, coverage HTML/out, binaries are ignored).
- [x] No remote configured; publication commands documented in README.

## Final verification and submission readiness

- [x] Backend tests and HTTP tests pass (`go test -count=1 ./...`, also with
      `-race`).
- [x] Frontend tests, typecheck, and build pass (36 tests after the M6 GUI
      revision).
- [x] Formatting/vet checks pass (`gofmt -l` empty, `go vet`, `tsc --noEmit`).
- [x] Coverage reports generated (`make coverage`; summary committed at
      `docs/coverage-summary.txt`).
- [x] Smoke test passes (21 checks, 0 failed, run twice).
- [x] Git working tree clean.
- [x] README commands verified (`fmt-check`, `test`, `build`, `coverage`,
      `smoke`, `run-backend`, `run-frontend`).
- [x] Known limitations recorded in README and HANDOFF.
- [x] Local-only publication status stated accurately.
