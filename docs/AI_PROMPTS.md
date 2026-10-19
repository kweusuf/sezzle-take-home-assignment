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

There were no user prompts during M1–M5: the agent executed them directly from
P1. The self-issued work instructions were, in order:

| Milestone | Work instruction given to the agent | Outcome |
| --- | --- | --- |
| M1 | Create the Go module and `internal/calculator`: pure operations, typed errors, operand/arity validation, table-driven tests; run `gofmt`, `go vet`, `go test`. | 47 cases + invariant test, 97.5% coverage. |
| M2 | Add `internal/config`, `cmd/server`, and `internal/api`: strict JSON decoding, error envelope, status codes, body limit, panic recovery; write `httptest` cases and check the live server with curl. | 43 HTTP tests, 94.0% coverage, curl-verified, graceful shutdown. |
| M3 | Scaffold Vite + React + TS; implement the typed API client and calculator UI (validation, loading, errors, unary handling, reset, responsive CSS); add Vitest + RTL tests; run typecheck/tests/build. | 20 tests, 97.67% statement coverage, proxy verified against the backend. |
| M4 | Add `scripts/smoke.sh` + `make smoke`; run the full check set; record real coverage and results. | see PROGRESS.md / TESTING.md. |
| M5 | Final verification, README/docs refresh, clean working tree. | see HANDOFF.md. |

These table rows record intent, not prompts the user wrote; the prompts the
user should share for the assignment are P1, P2, P4, and P5.

## P4 — Classic calculator GUI (M6)

- **Prompt (user):** "this looks very basic, i want a classic calculator GUI
  where there are buttons for every operation and a basic and scientific mode
  and a button click expands the basic mode into scientific mode with a slick
  animation."
- **Purpose:** Replace the form UI with a keypad, add Basic and Scientific modes,
  and animate the expansion.
- **Decisions taken while executing (no follow-up round trip):** scientific keys
  are limited to operations the backend already implements (`√`, `x²`, `xʸ`,
  `1/x`), so the API contract is untouched; operators chain with immediate
  execution (no precedence); the `%` key remains the backend ratio operation
  rather than "percent of the previous operand"; the reveal is a CSS
  `grid-template-rows: 0fr → 1fr` transition, removed under
  `prefers-reduced-motion`.
- **Result:** Keypad UI with an animated scientific row, 36 frontend tests,
  99.31% statement / 100% branch coverage, ADR-011 and ADR-012 recorded, all
  docs updated, smoke test still 21/21.
- **Not done, and why:** trigonometry, logarithms, and parentheses would require
  new backend operations; the request was scoped to a GUI change, so the API was
  left alone. Offered as a follow-up.

## P5 — Dockerize the stack (M7)

- **Prompt (user):** "can we dockerize this?"
- **Purpose:** Package both services so the whole application runs from one
  command instead of two local dev servers.
- **Decisions taken while executing:** nginx serves the built SPA and proxies
  `/api/` and `/health`, so the containerized shape keeps the single-origin
  property the Vite dev proxy provides (still no CORS); only the frontend port
  is published, leaving the API inside the compose network; health checks live
  in the images so `docker compose ps` reports real readiness and the frontend
  waits for the backend; the API is built as a static binary and runs
  unprivileged; no build-time API URL, so one bundle works locally and in the
  container.
- **Result:** both images build (backend 22.3 MB, frontend 102 MB) and both
  containers report healthy; through `:8081` the SPA, static assets, proxied API
  (including `DIVISION_BY_ZERO`), `/health`, and deep-link fallback were
  verified with curl; Make targets `docker-build`, `docker-up`, and `docker-down`
  added; ADR-013 recorded and ADR-010 marked superseded; local checks re-run
  unchanged.
- **Reversal note:** M0–M5 deliberately skipped Docker (ADR-010) because
  required work came first. This prompt reverses that decision rather than
  contradicting it silently.

## Prompt hygiene notes

- P1 (the assignment prompt) was treated as the specification; no scope was
  added beyond it (Docker deliberately skipped).
- Verification prompts always required *executing* the command and quoting the
  real output rather than assuming success.
