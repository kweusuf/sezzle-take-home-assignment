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

## Integration / smoke

```bash
./scripts/smoke.sh
```

The script builds and starts the backend on an unused port, waits for
`/health`, exercises success and error paths, and fails on any mismatch. It
shuts the server down on exit.

## Environment limitations (current)

- Docker is installed but Docker support is optional and not planned for the
  first pass.
- No browser-based end-to-end runner is installed; UI behavior is covered by
  jsdom-based React Testing Library tests, and the HTTP integration is covered
  by the smoke script.
