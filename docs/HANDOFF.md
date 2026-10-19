# Handoff

Persistent context for the next developer or AI agent. Reflects the repository
as it actually is.

## 1. Project purpose

Take-home assignment: a full-stack calculator with a React + TypeScript
frontend and a Go REST backend, delivered with tests, coverage, and engineering
documentation. See [Problem.md](Problem.md) and [Prompt.md](Prompt.md).

## 2. Current overall status

M0 complete. Application code does not exist yet. Toolchain inspected and
recorded; design and project-management documents written; Git repository
initialized locally with no remote.

## 3. Current milestone

M1: Backend Calculator Core (`NOT STARTED`).

## 4. Completed milestones

- M0: Project Foundation — structure, docs, initial README, initial commit.

## 5. Current implementation state

| Area | State |
| --- | --- |
| Repository | Initialized on `main`, no remote, no commits before M0's commit. |
| `backend/` | Not created. |
| `frontend/` | Not created. |
| `docs/` | Problem.md, Prompt.md, and the eight required project documents present. |
| `Makefile`, `scripts/` | Not created. |

## 6. Architecture summary

Single-page frontend calls `POST /api/v1/calculate` and `GET /health` on a Go
`net/http` service; arithmetic lives in an HTTP-independent calculator package.
Vite proxies `/api` to the backend in development. Details and diagram:
[ARCHITECTURE.md](ARCHITECTURE.md).

## 7. Important files and responsibilities

| Path | Responsibility |
| --- | --- |
| `README.md` | Evaluator entry point; updated every commit. |
| `docs/MILESTONES.md` | Milestone register with acceptance criteria and evidence. |
| `docs/PROGRESS.md` | Authoritative checklist. |
| `docs/API.md` | API contract. |
| `docs/TESTING.md` | Test/build commands and observed results. |
| `docs/DECISIONS.md` | ADR register. |
| `docs/AI_PROMPTS.md` | Record of significant AI prompts. |
| `.gitignore` | Excludes node_modules, dist, coverage, env files. |

## 8. API contract and important interfaces

Planned and documented in [API.md](API.md):
`POST /api/v1/calculate` with `{operation, a, b?}` → `{result}` or
`{error:{code,message}}`; `GET /health` → `{status:"ok"}`. Frontend interface is
a single typed client, `src/api/client.ts`, returning the numeric result or
throwing `ApiError`.

## 9. Technology and dependency decisions

Frontend: React, TypeScript strict, Vite, Vitest, React Testing Library,
user-event, jsdom, coverage-v8. Backend: Go standard library only. No database,
no state management library, no Docker. Rationale: [DECISIONS.md](DECISIONS.md).

## 10. Commands for running the project

To be implemented in M2/M3:

```bash
make run-backend    # Go service on :8080 (PORT overrides)
make run-frontend   # Vite dev server on :5173, proxies /api
```

## 11. Commands for testing and building

```bash
make test           # backend + frontend tests
make test-backend   # cd backend && go test ./...
make test-frontend  # cd frontend && npm test
make build          # go build + frontend production build
make coverage       # coverage reports for both layers
make fmt-check      # gofmt check + tsc
make smoke          # curl smoke test against a real backend
```

## 12. Most recent successful verification results

M0 only: `git init` succeeded; `git status` clean after the foundation commit.
No build, test, or coverage command has been run yet because no code exists.

## 13. Known defects and limitations

- No implementation yet; every functional requirement is pending.
- Duplicate JSON keys cannot be detected with `encoding/json` (documented
  limitation, not a defect).

## 14. Outstanding tasks

All of M1–M5. See [PROGRESS.md](PROGRESS.md) for the per-task checklist.

## 15. Blockers and their causes

None.

## 16. Important assumptions

- Node 20+/Go 1.22+ are the documented minimums; the local environment has Go
  1.27.2, Node 26.12.0, npm 11.20.0.
- Reviewers run `make` targets from the repository root.
- Single-origin deployment, so CORS is omitted.

## 17. Git branch and latest relevant commits

Branch `main`, no remote. Latest: `chore: establish project structure and
documentation` (M0).

## 18. Immediate next steps

1. Create the Go module and `internal/calculator` package with typed errors.
2. Write table-driven unit tests for all operations and edge cases.
3. Run `gofmt`, `go vet`, `go test ./...`; then commit M1.

## 19. Approval decisions already made

- Go standard library only; no router framework.
- No database, no Docker in the first pass.
- Single `POST /api/v1/calculate` endpoint with an operation identifier.
- Percentage defined as `a / b * 100`; zero denominator is an error.

## 20. Decisions that still require approval

- Any change to the M0 architecture (e.g. adding a framework or a database).
- Adding Docker or other infrastructure beyond the documented scope.
- Configuring a Git remote or publishing the repository.
