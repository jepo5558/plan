# Implementation Roadmap

This roadmap should be followed step by step.

## Phase 1: Planning Documents

Status: `done`

Create Markdown documents that define:

- Project purpose.
- User scenario.
- Agent protocol.
- Data schema.
- Implementation roadmap.

Deliverables:

- `README.md`
- `docs/PROJECT_PLAN.md`
- `docs/AGENT_PROTOCOL.md`
- `docs/DATA_SCHEMA.md`
- `docs/ROADMAP.md`

## Phase 2: Data Foundation

Status: `done`

Create the initial data folder and sample plan files.

Deliverables:

- `data/plans/personal/codex/`
- `data/plans/work/claude/`
- At least one sample personal Codex plan.
- At least one sample work Claude plan with masked content.

Acceptance Criteria:

- Sample files follow `docs/DATA_SCHEMA.md`.
- File paths follow `docs/AGENT_PROTOCOL.md`.
- Work sample does not include sensitive content.

## Phase 3: Local Dashboard Skeleton

Status: `done`

Create a local dashboard app.

Implemented stack:

- Plain HTML
- Plain CSS
- Plain JavaScript
- Local HTTP server

Actual deliverables:

- `dashboard/index.html`
- `dashboard/style.css`
- `dashboard/app.js`
- `data/plans-index.json`

Acceptance Criteria:

- Dashboard runs locally.
- Dashboard can load sample JSON data.
- No authentication or public deployment is required.

## Phase 4: Dashboard Views

Status: `done`

Build the first useful UI.

Views:

- Overview
- Plan list
- Plan detail

Filters:

- Context
- Agent
- Project
- Status
- Priority

Acceptance Criteria:

- User can see all plans in one view.
- User can filter personal/work plans.
- User can distinguish Codex and Claude records.
- User can inspect original request and interpreted goal.

## Phase 5: Agent Operating Guide

Status: `done`

Create a short prompt/template that the user can paste into Codex or Claude.

Deliverables:

- `docs/AGENT_PROMPT_TEMPLATE.md`

Acceptance Criteria:

- Template tells agents where to write files.
- Template includes privacy rules.
- Template includes JSON schema expectations.

## Phase 6: Validation

Status: `done`

Add basic validation for plan JSON files.

Deliverables:

- Validation script or dashboard-side validation.
- Error display for malformed files.

Actual deliverables:

- `scripts/validate-plans.js`

Acceptance Criteria:

- Invalid status values are detected.
- Missing required fields are detected.
- Context/agent path mismatches are detected.

## Phase 7: Repository Sync Workflow

Status: `done`

Document the Git workflow for multiple agents.

Deliverables:

- `docs/GIT_SYNC_WORKFLOW.md`

Acceptance Criteria:

- Codex and Claude can follow the same sync workflow.
- Merge conflict risk is documented.
- Private/work data rules remain explicit.

## Phase 8: Dashboard Hardening

Status: `next`

Improve dashboard robustness and day-to-day usability.

Potential deliverables:

- Display validation-like errors in the dashboard.
- Add search by title, request, project, and tag.
- Add due date and overdue indicators.
- Add a manual refresh button.
- Add a compact table view for many plans.
- Add language selection for Korean and English.

Acceptance Criteria:

- Dashboard remains useful as the number of plan files grows.
- Invalid or missing plan files are visible to the user.
- Filters and search make work/personal context easy to separate.
- UI labels can be viewed in Korean or English.
