# Git Sync Workflow

This workflow is for multiple AI agents writing to the same private repository.

The goal is to reduce merge conflicts and keep plan data valid.

## Before Editing

Always pull the latest repository state before making changes.

```powershell
git pull
```

Then read:

- `docs/AGENT_PROTOCOL.md`
- `docs/DATA_SCHEMA.md`
- `docs/ROADMAP.md`

## Adding A New Plan

1. Create one new JSON file under:

```text
data/plans/{context}/{agent}/{plan-id}.json
```

2. Add the new file path to:

```text
data/plans-index.json
```

3. Run validation:

```powershell
node scripts/validate-plans.js
```

4. Commit the new plan file and updated index together.

```powershell
git add data/plans data/plans-index.json
git commit -m "Add plan: short plan title"
```

## Updating An Existing Plan

1. Find the existing plan file by `id`.
2. Update only that plan file.
3. Append a new `updates` item.
4. Change task statuses as needed.
5. Update `updatedAt`.
6. Run validation.

```powershell
node scripts/validate-plans.js
```

7. Commit the updated file.

```powershell
git add data/plans
git commit -m "Update plan: short plan title"
```

## Conflict Avoidance

Agents should avoid editing the same JSON file at the same time.

Recommended rules:

- Codex usually writes under `data/plans/personal/codex/`.
- Claude usually writes under `data/plans/work/claude/`.
- Each plan gets its own JSON file.
- Do not store all plans in one shared file.
- Keep `data/plans-index.json` alphabetized or grouped by context if it grows.

## If A Conflict Happens

Resolve conflicts conservatively:

- Keep both plan records if they are different plans.
- Do not delete another agent's updates.
- Preserve valid JSON.
- Run `node scripts/validate-plans.js` after resolving.

## Privacy Checklist

Before committing work records:

- No credentials.
- No tokens.
- No private URLs.
- No customer-identifying data unless explicitly allowed.
- No raw confidential company text.
- Use `visibility: "private"` for work records.
- Add `privacyNotes` when masking was applied.

## Recommended Commit Messages

```text
Add plan: local dashboard
Update plan: local dashboard
Add masked work plan
Fix plan validation errors
Update agent protocol
```

