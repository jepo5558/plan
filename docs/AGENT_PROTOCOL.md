# Agent Protocol

This document defines how AI agents should write plan records into this
repository.

All agents must follow this protocol so the local dashboard can read their
records consistently.

## Supported Agents

Use one of these agent identifiers:

- `codex`
- `claude`

If another agent is added later, use a lowercase stable identifier such as
`gemini`, `cursor`, or `copilot`.

## Supported Contexts

Use one of these context values:

- `personal`
- `work`

## File Location

Create one JSON file per plan.

```text
data/plans/{context}/{agent}/{plan-id}.json
```

Examples:

```text
data/plans/personal/codex/2026-06-22-local-dashboard.json
data/plans/work/claude/2026-06-22-release-checklist.json
```

## File Creation Rules

- Create a new file for each new plan.
- Do not overwrite another agent's file.
- Do not store all plans in one shared `plans.json` file.
- Use lowercase kebab-case for `plan-id`.
- Prefix plan IDs with the date when practical.
- Update an existing plan file only when continuing the same plan.

## Required Fields

Each plan JSON file must include:

- `id`
- `title`
- `context`
- `agent`
- `project`
- `status`
- `priority`
- `createdAt`
- `updatedAt`
- `originalRequest`
- `interpretedGoal`
- `tasks`
- `updates`
- `visibility`

## Status Values

Plan status must be one of:

- `planned`
- `active`
- `blocked`
- `review`
- `done`
- `archived`

Task status must be one of:

- `todo`
- `doing`
- `blocked`
- `done`

## Priority Values

Priority must be one of:

- `high`
- `medium`
- `low`

## Original Request Rule

`originalRequest` should preserve what the user said as closely as practical.

If the original message contains sensitive company information, summarize it
and add a note in `privacyNotes`.

## Work Data Rule

For work context:

- Set `context` to `work`.
- Set `visibility` to `private`.
- Mask sensitive details when needed.
- Never include credentials, secrets, tokens, or private customer data.

## Example User Instruction

```text
Record this in the plan dashboard.
context: personal
agent: codex
project: plan-dashboard
goal: Build a local dashboard for viewing AI-agent plans.
priority: high
```

## Example Agent Output File

```json
{
  "id": "2026-06-22-local-dashboard",
  "title": "Build local AI plan dashboard",
  "context": "personal",
  "agent": "codex",
  "project": "plan-dashboard",
  "status": "planned",
  "priority": "high",
  "createdAt": "2026-06-22T23:00:00+09:00",
  "updatedAt": "2026-06-22T23:00:00+09:00",
  "originalRequest": "local dashboard로 해서 진행하자.",
  "interpretedGoal": "Create a local-only dashboard that reads shared AI plan records from a private GitHub repository.",
  "visibility": "private",
  "tasks": [
    {
      "id": "task-1",
      "title": "Define shared data schema",
      "status": "todo"
    }
  ],
  "updates": [
    {
      "at": "2026-06-22T23:00:00+09:00",
      "by": "codex",
      "message": "Created initial plan record."
    }
  ]
}
```

