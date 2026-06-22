# Project Plan: Local AI Plan Dashboard

## Purpose

Build a local dashboard that shows plans, tasks, updates, and original AI
requests created by multiple AI agents.

The dashboard is for personal viewing only. It should not expose private or
company-related data through a public website.

## User Scenario

The user works with multiple AI agents:

- At home, the user uses personal Codex.
- At work, the user uses Claude.

Both agents may receive work requests from the user. The user wants those
requests, AI interpretations, task breakdowns, statuses, and results to be
stored in one private GitHub repository.

The user can then pull the repository locally and open a dashboard to view:

- What was requested.
- Which agent handled it.
- Whether it is personal or work-related.
- Current status.
- Remaining tasks.
- Blockers.
- Completed results.

## Confirmed Direction

Use a private GitHub repository as the shared source of truth.

Use a local dashboard for viewing.

Do not use public GitHub Pages for private data.

## System Flow

```text
User -> Codex or Claude
     -> Agent writes JSON plan file into private repo
     -> User runs local dashboard
     -> Dashboard reads data/plans/**/*.json
     -> User views and filters all plans
```

## MVP Scope

The first version should support:

- Local dashboard.
- JSON file based data storage.
- Multiple agents.
- Personal/work context separation.
- Plan list view.
- Plan detail view.
- Filters by context, agent, project, status, and priority.
- Original request display.
- AI interpretation display.
- Task list display.
- Update log display.

## Non-Goals For MVP

- Public web hosting.
- User login.
- Database backend.
- Multi-user editing UI.
- Automatic sync without Git.
- Company system integration.

## Privacy Rules

Work-related content must be treated as private by default.

If a plan contains sensitive company information, agents should:

- Avoid customer names unless explicitly allowed.
- Avoid internal secrets, credentials, URLs, tokens, and proprietary code.
- Prefer summaries over raw confidential content.
- Use `visibility: "private"`.

