# Decisions

Lightweight ADR register. Significant decisions only.

## ADR-001: Two top-level services, standard-library Go backend

- **Context:** Assignment requires React frontend and a Go REST microservice.
- **Decision:** `frontend/` (Vite + React + TS) and `backend/` (Go module,
  `net/http`, `encoding/json`). No framework, database, or extra services.
- **Alternatives:** Gin/Chi/Echo; a single Go binary serving static assets.
- **Rationale:** The routing surface is two routes; the standard library is
  sufficient and keeps dependencies at zero. Separate directories mirror the
  required deliverables and the dev proxy.
- **Consequences:** Manual method checks in handlers to return JSON 405s.
  Production serving of the SPA is left to the deployment environment; the
  README documents the dev workflow.

## ADR-002: `POST /api/v1/calculate` with an operation identifier

- **Context:** One endpoint or one endpoint per operation.
- **Decision:** Single endpoint, body `{operation, a, b?}`.
- **Alternatives:** `/api/v1/add`, `/api/v1/subtract`, ...
- **Rationale:** Fewer routes, one validation path, easy to extend; matches the
  assignment's suggested contract.
- **Consequences:** Operation validation moves into the request/domain layer.

## ADR-003: Strict JSON decoding and pointer operands

- **Context:** Go's decoder silently accepts unknown fields, ignores trailing
  JSON, and cannot distinguish `0` from a missing number.
- **Decision:** `DisallowUnknownFields`, decode a second value to reject
  trailing data, `http.MaxBytesReader` at 64 KiB, operands decoded as
  `*float64` so absence/`null` is detected.
- **Alternatives:** Custom unmarshalling; schema validation library.
- **Rationale:** Explicit and dependency-free; prevents ambiguous requests.
- **Consequences:** Duplicate JSON keys are still accepted (Go behavior:
  last value wins). Documented limitation.

## ADR-004: One error envelope; domain errors are 400

- **Context:** Consistent machine-readable errors are required.
- **Decision:** `{"error":{"code","message"}}` for every failure. Invalid
  arithmetic and input are `400`; infrastructure failures are `404`, `405`,
  `413`, `500`.
- **Alternatives:** RFC 7807 problem details; plain text errors.
- **Rationale:** Simple, uniform, easy for the SPA to map to messages.
- **Consequences:** Small fixed code list; no unused codes.

## ADR-005: Floating-point semantics, no backend rounding

- **Context:** Calculators must decide precision and result validation.
- **Decision:** `float64`; reject NaN/±Infinity inputs and results; no rounding.
- **Alternatives:** `math/big.Rat`, decimal library, fixed decimal places.
- **Rationale:** Idiomatic and adequate; the assignment permits floating point.
- **Consequences:** Classic binary float artifacts (e.g. `0.1+0.2`) are
  returned as-is and documented as a limitation.

## ADR-006: Percentage as a ratio

- **Context:** "Percentage" is ambiguous.
- **Decision:** `percentage(a, b) = a / b * 100` ("a is what percent of b"),
  with zero `b` rejected as `DIVISION_BY_ZERO`.
- **Alternatives:** `a * b / 100` (percent-of); both operations.
- **Rationale:** Matches the assignment's suggested default and is unambiguous.
- **Consequences:** Users wanting "20% of 50" use `multiply` with `0.2`.

## ADR-007: Backend validates; frontend validates only for usability

- **Context:** Duplicate validation risks divergence.
- **Decision:** The SPA checks empty/non-numeric input and form shape; the Go
  service owns all arithmetic and domain rules.
- **Alternatives:** Trust the client; replicate rules in the SPA.
- **Rationale:** Backend is authoritative; the client stays thin and cannot
  become a second calculator.
- **Consequences:** Some invalid-but-well-formed values only fail server-side;
  the UI displays the returned message.

## ADR-008: Vite proxy instead of CORS

- **Context:** Development runs on two ports.
- **Decision:** Proxy `/api` from Vite to `localhost:8080`; no CORS middleware.
- **Alternatives:** Permissive CORS; configurable allowlist.
- **Rationale:** Same-origin requests in development; no CORS surface to get
  wrong.
- **Consequences:** A split-origin production deployment would need CORS or a
  reverse proxy; documented.

## ADR-009: Vitest + React Testing Library, mock the API module

- **Context:** Frontend behavior must be tested without a live backend.
- **Decision:** Vitest + RTL + jsdom + user-event; mock `src/api/client`.
- **Alternatives:** Playwright/Cypress E2E; testing arithmetic through fetch.
- **Rationale:** Fast, deterministic, and avoids duplicating backend arithmetic
  in tests. Real HTTP behavior is covered by Go tests and the smoke script.
- **Consequences:** No browser-level test; visual/responsive behavior is
  reviewed manually.

## ADR-010: No Docker in the first pass

- **Context:** Docker support is optional.
- **Decision:** Skip Dockerfiles/Compose; document local workflow and Makefile.
- **Alternatives:** Multi-stage Docker build with Compose.
- **Rationale:** Required work, tests, and documentation take priority; Docker
  adds build surface without demonstrating core engineering.
- **Consequences:** Deployment is out of scope; publication commands are in the
  README.
