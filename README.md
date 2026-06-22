# Local AI Plan Dashboard

This repository is the shared planning workspace for multiple AI agents.

The goal is to let different agents, such as personal Codex and work Claude,
write plan records into the same private GitHub repository, then view those
records through a local-only dashboard.

## Core Direction

- The GitHub repository should be private.
- The dashboard runs locally on the user's machine.
- No public GitHub Pages deployment is required for private data.
- Agents write structured JSON files under `data/plans/`.
- Human-readable coordination rules are stored in Markdown under `docs/`.

## Primary Agents

- `codex`: personal/home agent.
- `claude`: work/company agent.

## Initial Documents

- [Project Plan](docs/PROJECT_PLAN.md)
- [Agent Protocol](docs/AGENT_PROTOCOL.md)
- [Data Schema](docs/DATA_SCHEMA.md)
- [Implementation Roadmap](docs/ROADMAP.md)

## Run The Local Dashboard

Recommended:

```powershell
node scripts/serve-dashboard.js
```

Then open:

```text
http://127.0.0.1:5173/dashboard/
```

Alternative with Python:

```powershell
python -m http.server 5173
```

Then open:

```text
http://127.0.0.1:5173/dashboard/
```

The dashboard reads `data/plans-index.json`, then loads the plan files listed
there.

## Validate Plan Data

Run:

```powershell
node scripts/validate-plans.js
```

The validator checks required fields, status values, JSON parsing, and whether
`context`, `agent`, and `id` match the file path.
