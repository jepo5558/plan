# Data Schema

This document defines the JSON shape used by the local dashboard.

## Plan File

Each plan is stored as one JSON file.

Path:

```text
data/plans/{context}/{agent}/{plan-id}.json
```

## Plan Object

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
  "dueDate": null,
  "originalRequest": "local dashboard로 해서 진행하자.",
  "interpretedGoal": "Create a local-only dashboard for shared AI plan records.",
  "visibility": "private",
  "privacyNotes": "",
  "tags": ["dashboard", "ai-agent"],
  "tasks": [],
  "updates": [],
  "links": []
}
```

## Field Definitions

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | string | yes | Stable unique plan ID. |
| `title` | string | yes | Human-readable plan title. |
| `context` | string | yes | `personal` or `work`. |
| `agent` | string | yes | Agent identifier such as `codex` or `claude`. |
| `project` | string | yes | Project or workstream name. |
| `status` | string | yes | Plan status. |
| `priority` | string | yes | `high`, `medium`, or `low`. |
| `createdAt` | string | yes | ISO-8601 timestamp. |
| `updatedAt` | string | yes | ISO-8601 timestamp. |
| `dueDate` | string/null | no | Optional due date. |
| `originalRequest` | string | yes | User's original request or safe summary. |
| `interpretedGoal` | string | yes | Agent's interpretation of the goal. |
| `visibility` | string | yes | Usually `private`. |
| `privacyNotes` | string | no | Notes about masking or sensitivity. |
| `tags` | string[] | no | Search/filter labels. |
| `tasks` | Task[] | yes | Plan tasks. |
| `updates` | Update[] | yes | Timeline updates. |
| `links` | Link[] | no | Related local or remote links. |

## Task Object

```json
{
  "id": "task-1",
  "title": "Define shared data schema",
  "status": "todo",
  "notes": ""
}
```

Allowed `status` values:

- `todo`
- `doing`
- `blocked`
- `done`

## Update Object

```json
{
  "at": "2026-06-22T23:00:00+09:00",
  "by": "codex",
  "message": "Created initial plan record."
}
```

## Link Object

```json
{
  "label": "Repository",
  "url": "https://github.com/jepo5558/plan"
}
```

## Validation Rules

- `id` must match the file name without `.json`.
- `context` in the file must match the directory name.
- `agent` in the file must match the directory name.
- `createdAt` and `updatedAt` must be valid ISO-8601 strings.
- `tasks` and `updates` must always be arrays.

