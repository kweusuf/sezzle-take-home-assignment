# AI Prompts

Honest record of the substantial prompts used to build this project. Trivial
interactions are omitted.

## P1 — Initial implementation prompt (M0–M5)

- **Source:** `docs/Prompt.md`, provided with the assignment.
- **Purpose:** Define the role (senior full-stack engineer), required
  deliverables (React + TS frontend, Go REST backend, tests, coverage, README,
  `docs/` set, milestone plan, progress checklist, handoff, verification
  report, prompt record), operating rules and approval boundaries, milestone
  definitions, technology constraints, testing strategy, and Git discipline.
- **Notes:** This prompt is the governing spec for the whole project; the
  milestone, decision, and progress documents are derived from it.

## P2 — Kickoff instruction (M0)

- **Prompt (user):** "check the documents for the problem statement as well as
  the prompt and start working on it make sure that you follow the instructions
  in the prompt properly"
- **Purpose:** Start execution: inspect environment, create the project
  management documents, and begin milestone work.
- **Result:** Repository inspected (empty except `docs/`; no Git repo; Go
  1.27.2, Node 26.12.0, npm 11.20.0, Git 2.56.0), Git initialized on `main`,
  `.gitignore`, README, and the eight required documents created.

## P3 — Milestone execution (M1–M5)

There were no further user prompts after P2: the agent executed M1–M5 directly
from P1. The self-issued work instructions were, in order:

| Milestone | Work instruction given to the agent | Outcome |
| --- | --- | --- |
| M1 | Create the Go module and `internal/calculator`: pure operations, typed errors, operand/arity validation, table-driven tests; run `gofmt`, `go vet`, `go test`. | 47 cases + invariant test, 97.5% coverage. |
| M2 | Add `internal/config`, `cmd/server`, and `internal/api`: strict JSON decoding, error envelope, status codes, body limit, panic recovery; write `httptest` cases and check the live server with curl. | 43 HTTP tests, 94.0% coverage, curl-verified, graceful shutdown. |
| M3 | Scaffold Vite + React + TS; implement the typed API client and calculator UI (validation, loading, errors, unary handling, reset, responsive CSS); add Vitest + RTL tests; run typecheck/tests/build. | 20 tests, 97.67% statement coverage, proxy verified against the backend. |
| M4 | Add `scripts/smoke.sh` + `make smoke`; run the full check set; record real coverage and results. | see PROGRESS.md / TESTING.md. |
| M5 | Final verification, README/docs refresh, clean working tree. | see HANDOFF.md. |

These table rows record intent, not prompts the user wrote; the prompts the
user should share for the assignment are P1 and P2.

## Prompt hygiene notes

- P1 (the assignment prompt) was treated as the specification; no scope was
  added beyond it (Docker deliberately skipped).
- Verification prompts always required *executing* the command and quoting the
  real output rather than assuming success.
