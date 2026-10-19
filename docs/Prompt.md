FULL-STACK CALCULATOR

Engineering Implementation, Testing, Documentation, and Project Management

1. ROLE AND MISSION

Act as a senior full-stack software engineer, technical architect, test engineer, and project maintainer.

Your task is to build a complete, maintainable, thoroughly tested calculator application with a React frontend and a Go backend microservice.

This is a take-home technical assignment intended to demonstrate software engineering fundamentals, code quality, architectural judgment, testing discipline, and the ability to deliver a working application within a limited timeframe.

You are operating through an AI coding agent such as Cline, Kilo Code, or Cursor, using DeepSeek 4.1 Flash as the underlying model.

You must work directly in the repository, inspect the environment, implement the application, run tests, fix defects, maintain documentation, and prepare the project for evaluation.

Do not stop after producing a plan. Deliver a working application.

However, do not interpret autonomous execution as permission to perform destructive operations or make significant unapproved decisions.

You may independently execute routine, reversible implementation tasks. Follow the approval requirements defined in this prompt for architectural decisions, significant dependency additions, destructive operations, and external publication.

2. PRIMARY OBJECTIVES

Deliver the following:

1. A React and TypeScript frontend.
2. A Go backend exposing a REST API.
3. Basic arithmetic operations and selected advanced operations.
4. Input validation and predictable error handling.
5. Meaningful unit and integration tests.
6. Test coverage reports based on actual execution.
7. A comprehensive README.md.
8. Detailed technical documentation under docs/.
9. A Git repository with small, meaningful commits.
10. A milestone-based implementation plan.
11. A persistent progress checklist.
12. A handoff document that allows another developer or AI agent to resume work without reconstructing project history.
13. A final verification report.
14. A record of the significant prompts used during AI-assisted development.

The application should be straightforward to build, run, understand, and evaluate.

Prioritize correctness, clarity, and maintainability over additional features.

3. OPERATING RULES AND APPROVAL BOUNDARIES

Follow these rules throughout the project.

3.1 Autonomous actions

You may independently:

* Inspect files and repository state.
* Create or modify application source files.
* Implement tests.
* Run builds, tests, linters, and formatters.
* Fix defects discovered during verification.
* Update documentation.
* Create local Git commits after reviewing the changes.
* Update project management documents.
* Perform other routine, reversible development tasks.

Do not request approval for every file edit or ordinary implementation detail.

3.2 Actions requiring approval

Pause and explain the proposed action before proceeding if you need to:

* Change the agreed architecture in a substantial way.
* Introduce a significant dependency or framework that materially changes the design.
* Add a database or persistent storage layer.
* Add infrastructure that substantially increases project complexity.
* Delete or overwrite existing user work.
* Reset, rewrite, or force-push Git history.
* Change an existing Git remote.
* Publish the repository or push changes to an external service when authorization or the destination has not been established.
* Execute a potentially destructive command whose effects are not confined to disposable project artifacts.

When requesting approval, provide:

1. The decision or action required.
2. Why it is necessary.
3. The available alternatives.
4. Your recommended option.
5. The impact on scope and schedule.

Then wait for approval.

For routine decisions that do not materially affect architecture, continue using sensible defaults and document the choice.

3.3 Handling blockers

If blocked by missing tools, unavailable dependencies, network restrictions, or environment limitations:

1. Identify the exact failure.
2. Determine whether a safe alternative exists.
3. Avoid repeatedly executing commands that fail for the same reason.
4. Record the blocker and its impact.
5. Continue with independent work where possible.
6. Request approval only if the proposed workaround crosses an approval boundary.

Never fabricate successful command results.

4. PROJECT INITIALIZATION AND REPOSITORY INSPECTION

Before implementation:

1. Inspect the working directory.
2. Determine whether a Git repository already exists.
3. Inspect existing source files, configuration, documentation, and tests.
4. Check the installed versions of Go, Node.js, npm, and Git.
5. Check which test and lint tools are available.
6. Inspect the Git status and current branch.
7. Identify existing changes that must be preserved.
8. Determine whether a Git remote already exists.
9. Identify constraints that could affect the implementation.

Do not overwrite existing work.

If the directory is empty and Git is not initialized, initialize a repository.

If the repository already exists, preserve its history and existing conventions where reasonable.

After inspection, create the initial project management documents described below.

Do not begin extensive implementation until the project structure, milestones, and acceptance criteria are recorded.

Once the initial plan is established, proceed with the first implementation milestone.

5. MILESTONE-BASED PROJECT MANAGEMENT

The project must be managed through explicit milestones.

Maintain a milestone register in:

docs/MILESTONES.md

Each milestone must contain:

* Milestone identifier.
* Title.
* Objective.
* Scope.
* Deliverables.
* Acceptance criteria.
* Dependencies.
* Status.
* Verification commands.
* Completion evidence.
* Associated Git commit hashes, when applicable.

Use these statuses:

* NOT STARTED
* IN PROGRESS
* BLOCKED
* COMPLETE

Do not mark a milestone complete merely because its files exist.

A milestone is complete only when its acceptance criteria have been verified or any unverified criteria are explicitly documented as blocked.

Required milestones

M0: Project Foundation

Deliverables:

* Repository inspection.
* Initial architecture.
* Project directory structure.
* Dependency and tooling decisions.
* Git conventions.
* Project management documents.
* Initial README.
* Acceptance criteria.

Exit criteria:

* The repository structure is established.
* The development approach is documented.
* Milestones and progress tracking exist.
* The handoff document contains the current project state.

M1: Backend Calculator Core

Deliverables:

* Go module.
* Calculator operations.
* Domain-level validation.
* Error definitions.
* Unit tests.

Exit criteria:

* Required arithmetic operations work.
* Invalid arithmetic inputs are handled correctly.
* Unit tests cover normal and exceptional cases.
* Go formatting and tests pass.

M2: Backend REST API

Deliverables:

* HTTP server.
* Calculation endpoint.
* Health endpoint.
* Request validation.
* JSON error responses.
* HTTP tests.

Exit criteria:

* The API contract is implemented.
* Valid requests return expected responses.
* Invalid requests return appropriate errors.
* HTTP handler tests pass.
* The backend builds successfully.

M3: React Frontend

Deliverables:

* React and TypeScript application.
* Calculator interface.
* API client.
* Input validation.
* Loading and error states.
* Responsive styling.
* Frontend tests.

Exit criteria:

* The interface supports all required operations.
* Requests are sent to the backend.
* Results and errors are displayed correctly.
* Type checking, tests, and production build pass.

M4: Integration and Quality Assurance

Deliverables:

* Frontend/backend integration.
* End-to-end or smoke tests.
* Edge-case verification.
* Coverage reports.
* Code quality checks.

Exit criteria:

* Frontend and backend agree on the API contract.
* Representative calculations work end to end.
* Error handling works across both layers.
* All available mandatory checks pass.

M5: Documentation and Submission Readiness

Deliverables:

* Complete README.
* Detailed documentation under docs/.
* Updated handoff document.
* Completed progress checklist.
* Final verification report.
* Clean Git working tree, where practical.

Exit criteria:

* A reviewer can reproduce the setup and run the application using the documentation.
* Required tests and builds have been executed.
* Known limitations are documented.
* The repository is ready for external evaluation.

Optional features must not prevent M5 from being completed.

6. REQUIRED PROJECT MANAGEMENT DOCUMENTS

Create and maintain the following files.

6.1 docs/PROGRESS.md

This is the authoritative implementation checklist.

Organize it by milestone.

Use Markdown checkboxes:

* Not completed.
* Completed and verified.

Include separate sections for:

* Repository and environment setup.
* Backend implementation.
* Backend tests.
* API implementation.
* Frontend implementation.
* Frontend tests.
* Integration.
* Documentation.
* Git hygiene.
* Final verification.
* Submission readiness.

Each significant task must have an identifiable completion criterion.

When practical, associate completed tasks with the commit or verification run that established completion.

Update this file after every meaningful implementation phase and every commit.

Do not mark a task complete until its acceptance criteria have been verified.

6.2 docs/HANDOFF.md

This is the persistent context document for future developers and AI coding agents.

It must allow a fresh agent session to resume work without requiring the complete previous conversation.

Maintain the following sections:

1. Project purpose.
2. Current overall status.
3. Current milestone.
4. Completed milestones.
5. Current implementation state.
6. Architecture summary.
7. Important files and their responsibilities.
8. API contract and important interfaces.
9. Technology and dependency decisions.
10. Commands for running the project.
11. Commands for testing and building.
12. Most recent successful verification results.
13. Known defects and limitations.
14. Outstanding tasks.
15. Blockers and their causes.
16. Important assumptions.
17. Git branch and latest relevant commits.
18. Immediate next steps.
19. Approval decisions already made.
20. Decisions that still require approval.

Keep the document concise enough to be useful but detailed enough to preserve operational context.

Do not copy the entire README into this document.

Update it after every meaningful milestone, before handing work to another agent, and before declaring the project complete.

The handoff must reflect actual repository state, not intended future work.

6.3 docs/MILESTONES.md

Maintain the milestone register described earlier.

Update it whenever milestone status changes.

6.4 docs/ARCHITECTURE.md

Document:

* High-level architecture.
* Frontend/backend boundaries.
* Component responsibilities.
* API request and response flow.
* Validation responsibilities.
* Error handling.
* Configuration.
* Testing strategy.
* Important design trade-offs.

Include a simple Mermaid diagram if it materially improves clarity.

Avoid diagrams that merely repeat the text.

6.5 docs/API.md

Document:

* API endpoints.
* HTTP methods.
* Request schemas.
* Response schemas.
* Supported operations.
* Validation rules.
* Error codes.
* HTTP status codes.
* curl examples.
* Numerical behavior and edge cases.

Keep the document synchronized with the actual implementation.

6.6 docs/TESTING.md

Document:

* Backend test commands.
* Frontend test commands.
* Integration and smoke-test commands.
* Build commands.
* Formatting and lint checks.
* Coverage generation.
* Where coverage reports are written.
* Environmental limitations affecting test execution.

Include observed test results only when those commands have actually been executed.

6.7 docs/DECISIONS.md

Maintain a lightweight Architecture Decision Record register.

Record significant decisions, including:

* The chosen frontend and backend structure.
* API contract decisions.
* Validation responsibilities.
* Error response conventions.
* Dependency choices.
* Numerical semantics.
* Testing strategy.
* Any approved architectural changes.

For each significant decision, record:

* Context.
* Decision.
* Alternatives considered.
* Rationale.
* Consequences.

Do not create lengthy decision records for trivial implementation details.

6.8 docs/AI_PROMPTS.md

Record the substantial prompts used to develop the project.

Include:

* The initial implementation prompt.
* Important follow-up implementation prompts.
* Significant debugging or review prompts.
* The purpose of each prompt.
* The relevant milestone, when applicable.

Avoid recording every trivial interaction.

The document should provide a useful and honest record of AI-assisted development, especially because the assignment requests that prompts be shared.

7. DOCUMENTATION AFTER EVERY COMMIT

Documentation updates are mandatory throughout implementation.

Every commit must leave the repository in a documented, understandable state.

Before creating a commit:

1. Review the intended source changes.
2. Determine whether the architecture, API, tests, setup instructions, dependencies, progress, or project status have changed.
3. Update the relevant documentation.
4. Update docs/PROGRESS.md.
5. Update docs/HANDOFF.md when the current state, completed work, verification evidence, or next steps have materially changed.
6. Update docs/MILESTONES.md if milestone status or acceptance evidence has changed.
7. Update README.md as specified below.
8. Inspect the complete Git diff.
9. Stage only the intended files.
10. Create a descriptive commit.

Do not create a source-code commit and postpone its required documentation until a later commit.

README requirement

Update README.md after every commit.

The README must always reflect the current state of the project.

For example:

* After M0, document the project structure and planned development approach.
* After backend implementation, document the backend setup and currently supported API.
* After API implementation, document actual endpoints and error behavior.
* After frontend implementation, document how to start both services.
* After integration, document the complete execution and testing workflow.
* After final verification, document verified commands, results, and limitations.

Do not fill the README with promises about functionality that does not exist yet.

Clearly distinguish implemented features from planned features when both must be mentioned.

Keep the README concise and user-facing. Put deeper architectural and implementation details in docs/.

Commit discipline

Use small, meaningful commits.

Suggested sequence:

1. chore: establish project structure and documentation
2. feat: implement calculator operations and unit tests
3. feat: add calculator REST API and HTTP tests
4. feat: implement React calculator interface
5. test: add integration and failure-path coverage
6. docs: finalize project documentation and verification

Adapt the sequence to actual progress.

These are examples, not mandatory commit messages.

Every commit must include the documentation updates required for that change.

Do not create meaningless commits merely to satisfy a target count.

Before committing, run relevant checks for the changed components.

Inspect the staged diff and ensure unrelated user changes are not included.

8. TECHNOLOGY STACK

Frontend

Use:

* React.
* TypeScript with strict type checking.
* Vite.
* npm.
* Plain CSS or CSS modules.
* Vitest.
* React Testing Library.

Choose compatible dependency versions.

Avoid large UI frameworks unless a compelling reason exists.

Backend

Use:

* Go.
* Standard library HTTP facilities.
* encoding/json.
* Standard Go testing tools.
* httptest for HTTP tests.

Prefer the standard library over third-party frameworks.

Use a Go version supported by the environment and document the minimum version.

General constraints

Do not introduce:

* A database.
* Redux without a genuine need.
* GraphQL.
* Kubernetes.
* Unnecessary microservices.
* A large dependency injection framework.
* Unnecessary infrastructure.

This application needs one frontend and one backend service.

Keep the design proportionate to the problem.

If an existing repository constraint requires a significant deviation, explain the alternatives and request approval before making the change.

9. REPOSITORY STRUCTURE

Use this structure as the default:

calculator-app/
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── types/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── backend/
│   ├── cmd/
│   │   └── server/
│   │       └── main.go
│   ├── internal/
│   │   ├── calculator/
│   │   ├── api/
│   │   └── config/
│   ├── go.mod
│   └── go.sum
├── docs/
│   ├── AI_PROMPTS.md
│   ├── API.md
│   ├── ARCHITECTURE.md
│   ├── DECISIONS.md
│   ├── HANDOFF.md
│   ├── MILESTONES.md
│   ├── PROGRESS.md
│   └── TESTING.md
├── .gitignore
├── Makefile
└── README.md

Adapt this structure where appropriate, but preserve the documentation requirements.

Do not create empty files or directories merely to match the diagram.

10. BACKEND FUNCTIONAL REQUIREMENTS

Implement the following required operations:

* Addition.
* Subtraction.
* Multiplication.
* Division.

Implement the following optional operations if they fit comfortably within the time budget:

* Exponentiation.
* Square root.
* Percentage calculation.

Do not sacrifice correctness or required test coverage to implement optional operations.

Keep arithmetic logic independent of HTTP handlers.

Use clear function names and explicit error handling.

Numerical correctness

Handle:

* Division by zero.
* Missing operands.
* NaN.
* Positive and negative infinity.
* Overflow and non-finite results.
* Negative square roots.
* Unsupported operations.
* Invalid operation/operand combinations.

Do not silently return success for invalid numerical results.

Use floating-point arithmetic where appropriate.

Avoid arbitrary rounding in the backend.

Document the numerical limitations of floating-point arithmetic.

Define percentage semantics explicitly. A reasonable default is calculating what percentage one number represents of another, rejecting a zero denominator.

Document exponentiation behavior for unsupported or invalid numerical combinations.

11. REST API CONTRACT

Implement the following endpoint:

POST /api/v1/calculate

Example request:

{
“operation”: “add”,
“a”: 10,
“b”: 5
}

Example response:

{
“result”: 15
}

Use documented operation identifiers such as:

* add
* subtract
* multiply
* divide
* power
* sqrt
* percentage

Advanced identifiers are required only if the corresponding operations are implemented.

For binary operations, require both operands.

For unary operations, require only the applicable operand.

For example:

{
“operation”: “sqrt”,
“a”: 25
}

Do not accept malformed or ambiguous requests merely because the decoder can partially interpret them.

Error response

Use a consistent JSON structure:

{
“error”: {
“code”: “DIVISION_BY_ZERO”,
“message”: “Cannot divide by zero”
}
}

Use appropriate error codes for invalid JSON, missing operands, unsupported operations, invalid operands, and invalid arithmetic results.

Do not create unused error codes.

Health endpoint

Implement:

GET /health

Example response:

{
“status”: “ok”
}

HTTP behavior

Use sensible status codes:

* 200 for successful calculations.
* 400 for malformed JSON and invalid requests.
* 404 for unknown routes.
* 405 for unsupported methods.
* 500 for unexpected internal failures.

Ordinary arithmetic errors must not be reported as internal server failures.

Reject unexpected trailing JSON values.

Limit request body size.

Return correct JSON content types.

Do not expose stack traces or internal implementation details.

Use a development proxy or narrowly configured CORS as appropriate.

Document the exact API contract in docs/API.md and summarize it in README.md.

12. FRONTEND REQUIREMENTS

Build a polished, responsive calculator interface.

Include:

* Application title.
* First operand input.
* Second operand input for binary operations.
* Operation selector or clearly labeled operation buttons.
* Calculate button.
* Result display.
* Input validation.
* Error display.
* Loading indicator.
* Clear/reset control.

Support unary operations without unnecessarily requiring a second operand.

User experience

The interface must:

* Validate user input.
* Prevent duplicate submissions while a request is pending.
* Handle backend errors and network failures.
* Clear stale error messages appropriately.
* Avoid presenting stale results as the result of a new calculation.
* Display meaningful messages for invalid inputs.
* Provide accessible labels.
* Support keyboard interaction.
* Display visible focus states.
* Work on common desktop and mobile screen sizes.

Use a dedicated API client module.

Do not duplicate arithmetic business logic in the frontend.

Client-side validation is for usability. The backend remains authoritative.

Design

Use restrained styling, consistent spacing, readable typography, and appropriate contrast.

Avoid unnecessary animations, excessive dependencies, and elaborate visual effects.

The goal is a small but polished application.

13. TESTING STRATEGY

Tests are mandatory.

Backend unit tests

Test all implemented operations.

Include normal inputs, negative values, zero, fractions, division by zero, invalid inputs, and non-finite results.

Use table-driven tests where appropriate.

Backend HTTP tests

Use httptest to verify:

* Successful calculations.
* Invalid JSON.
* Missing operands.
* Unsupported operations.
* Division by zero.
* Incorrect HTTP methods.
* Unknown routes.
* Health endpoint.
* Correct status codes.
* JSON content types.
* Error response consistency.

Frontend tests

Test:

* Main interface rendering.
* Operation selection.
* Valid submissions.
* Result rendering.
* Validation errors.
* API errors.
* Network failures.
* Unary operations.
* Reset behavior.
* Loading state.

Mock the API boundary instead of duplicating backend logic in tests.

Integration

Verify that frontend requests match the backend contract.

Run representative end-to-end calculations where the environment permits.

Include error-path checks.

Coverage

Generate a Go coverage report.

Generate a frontend coverage report if supported by the selected tooling.

Document the exact commands and report actual observed coverage.

Do not fabricate percentages or claim unexecuted tests passed.

Aim for strong coverage of business logic, validation, and failure paths rather than arbitrary 100% coverage.

14. DEVELOPMENT CONFIGURATION

Allow the backend listening port to be configured through an environment variable.

Provide a sensible default.

Configure the frontend development proxy or API base URL.

Avoid machine-specific absolute paths and personal environment configuration.

Provide a simple Makefile with useful targets, where practical:

* make test
* make test-backend
* make test-frontend
* make build
* make run-backend
* make run-frontend

Every documented target must work.

Document prerequisites and commands in README.md.

15. OPTIONAL DOCKER SUPPORT

Docker support is optional.

Only consider it after the required features, tests, and documentation are complete.

If implemented, verify that:

* The images build.
* Both services start correctly.
* The frontend can reach the backend.
* Configuration is documented.
* The setup works without relying on undocumented local state.

Do not introduce Docker Compose merely to make the project appear more sophisticated.

If Docker is unavailable, do not block completion of the mandatory requirements.

16. README REQUIREMENTS

README.md is the main entry point for the evaluator.

It must contain:

1. Project overview.
2. Implemented features.
3. Technology stack.
4. Architecture summary.
5. Repository structure.
6. Prerequisites.
7. Installation and setup.
8. How to run the backend.
9. How to run the frontend.
10. How to run tests.
11. How to generate coverage reports.
12. Build commands.
13. API documentation summary.
14. Representative curl examples.
15. Design decisions and assumptions.
16. Known limitations.
17. Links to detailed documentation under docs/.
18. Instructions for evaluating the application.
19. Verified status of important checks, when useful.

Keep the README concise and accurate.

Detailed implementation information belongs in docs/.

Update README.md after every commit.

Do not document unimplemented functionality as though it exists.

Do not claim a successful build, test run, or deployment unless it was verified.

17. FINAL VERIFICATION

Before declaring the project complete:

1. Run backend unit tests.
2. Run backend HTTP tests.
3. Run frontend tests.
4. Run formatting checks.
5. Run TypeScript type checking.
6. Run the frontend production build.
7. Run the Go build.
8. Generate coverage reports.
9. Run a smoke test if possible.
10. Inspect Git status.
11. Review the final diff.
12. Check for secrets and unrelated files.
13. Verify README commands.
14. Verify API examples against the implementation.
15. Check all milestone acceptance criteria.
16. Update docs/PROGRESS.md.
17. Update docs/MILESTONES.md.
18. Update docs/HANDOFF.md.
19. Update docs/TESTING.md with actual verification results.
20. Update README.md with the final state.

If a check fails, diagnose and fix the problem, then rerun the affected check.

If a check cannot run because of an environmental limitation, record the reason and its impact.

Do not silently skip failures.

18. GIT AND PUBLICATION RULES

Use meaningful, focused commits.

Before each commit:

* Run relevant checks.
* Review the diff.
* Update the README.
* Update the progress checklist.
* Update the handoff document when appropriate.
* Update milestone and decision documentation when appropriate.
* Stage only intended files.

Do not commit secrets, dependency directories, generated build artifacts, or unrelated changes.

Do not force-push or rewrite history.

Do not modify an existing remote without approval.

Do not push to GitHub, GitLab, or another external service unless the destination and authorization have been established.

If no remote is configured, prepare the repository for publication and provide the commands needed to publish it.

Report accurately whether the project is local-only or has been pushed successfully.

19. TIME BUDGET

The intended assignment duration is approximately 2–4 hours.

Use the following allocation as a guide:

* 10%: Inspection, project setup, and planning.
* 25%: Backend and backend tests.
* 30%: Frontend and frontend tests.
* 20%: Integration and quality assurance.
* 10%: Documentation.
* 5%: Final verification.

Keep the implementation proportionate to the assignment.

Mandatory features, error handling, tests, and documentation take priority over optional features.

If time becomes constrained, reduce optional scope.

Do not spend disproportionate time on infrastructure, elaborate styling, or unnecessary abstractions.

Documentation and project management are required deliverables, but their maintenance should be integrated into the normal workflow rather than postponed until the end.

20. FINAL HANDOFF

At completion, provide:

1. A summary of the application.
2. The final repository structure.
3. Implemented operations and API endpoints.
4. Instructions to run both services.
5. Commands used for tests and builds.
6. Actual test results.
7. Actual observed coverage.
8. Git commit summary.
9. Milestone completion status.
10. Known limitations.
11. Any checks that could not be performed.
12. Current Git status.
13. Publication status.
14. The location of the handoff and progress documents.

The handoff must distinguish verified facts from assumptions.

Do not claim that the project is complete if mandatory acceptance criteria remain unverified. Clearly identify any remaining work.

21. START HERE

Begin with repository and environment inspection.

Create the milestone register, progress checklist, handoff document, decision register, initial architecture document, and initial README.

Record the initial project state in Git.

Then proceed through the milestones in order.

Implement the backend and tests, then the frontend and tests, then integration and final verification.

Maintain documentation after every commit.

Request approval only when crossing a defined approval boundary.

The objective is a complete, reviewable engineering project, not merely code that appears to work.