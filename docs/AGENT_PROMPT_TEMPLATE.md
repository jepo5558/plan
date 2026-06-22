# Agent Prompt Template

Use this template when asking Codex, Claude, or another AI agent to record work
in this repository.

## Short Template

```text
Record this work in the local AI plan dashboard repository.

Repository rules:
- Read docs/AGENT_PROTOCOL.md first.
- Follow docs/DATA_SCHEMA.md.
- Create or update one JSON file under data/plans/{context}/{agent}/.
- Update data/plans-index.json when adding a new plan file.
- Do not write sensitive company data.
- For work context, use visibility: private and mask confidential details.
- If the user says "local plan에 저장해줘", use data/local-plans/ and
  data/local-plans-index.json instead. Do not push that local-only record.

Plan metadata:
- context:
- agent:
- project:
- priority:
- status:

Request:
```

## Codex Personal Example

```text
Record this work in the local AI plan dashboard repository.

Repository rules:
- Read docs/AGENT_PROTOCOL.md first.
- Follow docs/DATA_SCHEMA.md.
- Create or update one JSON file under data/plans/{context}/{agent}/.
- Update data/plans-index.json when adding a new plan file.

Plan metadata:
- context: personal
- agent: codex
- project: plan-dashboard
- priority: high
- status: active

Request:
Build the next phase of the local dashboard and keep the Markdown roadmap
updated so other agents can continue from it.
```

## Claude Work Example

```text
Record this work in the local AI plan dashboard repository.

Repository rules:
- Read docs/AGENT_PROTOCOL.md first.
- Follow docs/DATA_SCHEMA.md.
- Create or update one JSON file under data/plans/{context}/{agent}/.
- Update data/plans-index.json when adding a new plan file.
- This is work context. Do not include customer names, credentials, tokens,
  internal URLs, proprietary details, or raw confidential text.
- Summarize sensitive details and explain masking in privacyNotes.

Plan metadata:
- context: work
- agent: claude
- project: work-project-name-or-safe-alias
- priority: medium
- status: planned

Request:
Summarize the work item here using safe language.
```

## Update Existing Plan Template

```text
Update an existing plan in the local AI plan dashboard repository.

Repository rules:
- Read docs/AGENT_PROTOCOL.md first.
- Follow docs/DATA_SCHEMA.md.
- Update only the matching plan file.
- Do not overwrite unrelated agent files.
- Append a new item to updates.
- Update task statuses as needed.
- Update updatedAt.

Target plan id:

Update request:
```
