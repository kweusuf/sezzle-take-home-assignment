# Calculator App

A small full-stack calculator: a React + TypeScript single-page frontend and a
Go REST API.

> Status: **M0 (project foundation)**. Backend and frontend implementation is
> planned but not yet present. See [docs/MILESTONES.md](docs/MILESTONES.md) and
> [docs/PROGRESS.md](docs/PROGRESS.md) for live status.

## Planned features

- Addition, subtraction, multiplication, division.
- Exponentiation, square root, percentage.
- Validated REST API with consistent JSON errors.
- Responsive calculator UI with loading, error, and reset states.
- Unit, HTTP, and frontend tests plus coverage reports.

## Technology stack

| Layer    | Technology                                      |
| -------- | ----------------------------------------------- |
| Frontend | React, TypeScript (strict), Vite, Vitest, RTL    |
| Backend  | Go (standard library `net/http`, `encoding/json`) |
| Tooling  | npm, Make, Git                                   |

## Repository structure

```text
.
├── backend/          # Go REST API (planned)
├── frontend/         # React SPA (planned)
├── docs/             # Project management and technical docs
├── Makefile          # Common tasks (planned)
└── README.md
```

## Prerequisites

- Go 1.22 or newer
- Node.js 20 or newer (npm included)
- Make (optional, but used by the documented commands)

## Setup and run

Implementation has not started yet, so there is nothing to run. Commands will
be added to this README as each milestone completes.

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
