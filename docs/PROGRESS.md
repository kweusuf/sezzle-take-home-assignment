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

- [ ] README complete: setup, run, test, coverage, API, decisions, limitations.
- [ ] `docs/API.md` matches implementation exactly (curl examples verified).
- [ ] `docs/ARCHITECTURE.md` reflects final structure and trade-offs.
- [ ] `docs/DECISIONS.md` contains significant ADRs.
- [ ] `docs/TESTING.md` contains executed commands and observed results.
- [ ] `docs/AI_PROMPTS.md` records substantial prompts and purpose.
- [ ] `docs/HANDOFF.md` reflects actual current state.
- [ ] `docs/MILESTONES.md` statuses and evidence updated.

## Git hygiene

- [x] Small, focused commits per milestone (M0–M3 landed; M4/M5 in progress).
- [x] Each commit includes its documentation updates.
- [x] Diff reviewed before commit; no secrets or generated artifacts staged
      (`node_modules/`, `dist/`, coverage, and binaries are ignored).
- [x] No remote configured; publication commands documented in README.

## Final verification and submission readiness

- [ ] Backend tests and HTTP tests pass.
- [ ] Frontend tests, typecheck, and build pass.
- [ ] Formatting/vet checks pass.
- [ ] Coverage reports generated.
- [ ] Smoke test passes.
- [ ] Git working tree clean.
- [ ] README commands verified.
- [ ] Known limitations recorded.
- [ ] Local-only publication status stated accurately.
