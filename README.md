# Calculator App

A small full-stack calculator: a React + TypeScript single-page frontend and a
Go REST API.

> Status: **M1 complete** — the Go calculator core is implemented and tested.
> There is no HTTP server or frontend yet, so the application cannot be run
> end to end. See [docs/MILESTONES.md](docs/MILESTONES.md) and
> [docs/PROGRESS.md](docs/PROGRESS.md) for live status.

## Implemented so far

- Go calculator core (`backend/internal/calculator`): add, subtract, multiply,
  divide, power, sqrt, percentage with typed errors for division by zero,
  missing operands, unsupported operations, non-finite operands/results, and
  negative square roots.
- Unit tests: 47 table-driven cases plus a finite-result invariant test
  (97.5% statement coverage).

## Planned features

- REST API: `POST /api/v1/calculate`, `GET /health`.
- Responsive calculator UI with loading, error, and reset states.
- HTTP, frontend, and smoke tests plus coverage reports.

## Technology stack

| Layer    | Technology                                      |
| -------- | ----------------------------------------------- |
| Frontend | React, TypeScript (strict), Vite, Vitest, RTL    |
| Backend  | Go (standard library `net/http`, `encoding/json`) |
| Tooling  | npm, Make, Git                                   |

## Repository structure

```text
.
├── backend/
│   ├── internal/calculator/   # arithmetic core + unit tests
│   └── go.mod
├── frontend/                  # React SPA (planned)
├── docs/                      # Project management and technical docs
├── Makefile                   # Common tasks (planned)
└── README.md
```

## Prerequisites

- Go 1.22 or newer
- Node.js 20 or newer (npm included)
- Make (optional, but used by the documented commands)

## Setup and run

The backend is currently a library without an HTTP server, and the frontend
does not exist yet, so there is nothing to run. Runnable commands are added to
this README as each milestone completes. The core can be exercised with:

```bash
cd backend && go test ./...
```

## Documentation

- [Problem statement](docs/Problem.md)
- [Assignment prompt](docs/Prompt.md)
- [Milestones](docs/MILESTONES.md)
- [Progress checklist](docs/PROGRESS.md)
- [Handoff](docs/HANDOFF.md)
- [Architecture](docs/ARCHITECTURE.md)
- [API contract](docs/API.md)
- [Testing](docs/TESTING.md)
- [Decisions](docs/DECISIONS.md)
- [AI prompts](docs/AI_PROMPTS.md)

## Publication status

The repository is local-only. No Git remote is configured.
