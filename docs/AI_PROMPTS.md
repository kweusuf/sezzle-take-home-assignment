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

## P3 — Planned follow-up prompts (to be filled in as work proceeds)

| Prompt | Milestone | Purpose |
| --- | --- | --- |
| Backend core instruction | M1 | Implement calculator operations, typed errors, unit tests. |
| API instruction | M2 | Implement HTTP layer, strict decoding, HTTP tests. |
| Frontend instruction | M3 | Implement calculator UI, API client, tests. |
| Integration/verification instruction | M4–M5 | Smoke test, coverage, final verification and docs. |

Each follow-up row will be replaced with the actual prompt text, purpose, and
outcome when that work happens.
