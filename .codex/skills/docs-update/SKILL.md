---
name: docs-update
description: Keep Paper Plane Assault README, AGENTS.md, and project-specific Codex skills accurate after architecture, gameplay, controls, or workflow changes.
---

# Docs Update

## Invoke When

Use this skill whenever setup, controls, architecture, folder layout, validation workflow, game features, performance rules, or agent workflow changes.

## Workflow

1. Inspect the changed code and identify player-facing, developer-facing, and agent-facing impacts.
2. Update `README.md` for setup, controls, features, architecture, assets, and roadmap.
3. Update `AGENTS.md` for durable coding, testing, performance, and subagent rules.
4. Update relevant `.codex/skills/*/SKILL.md` files when repeatable workflows change.
5. Keep docs concise, practical, and repo-specific.
6. Run `npm run build` when docs are paired with code changes.

## Constraints

- Do not write generic docs that could apply to any WebGL app.
- Do not document features that are not implemented unless clearly listed as roadmap.
- Do not let controls in docs drift from `InputBindings.ts`.
- Do not remove validation instructions.

## Expected Outputs

- Updated README and/or AGENTS.md.
- Updated skill docs when workflows change.
- Clear mention of any known limitations.

## Validation Checklist

- Run instructions match `package.json`.
- Controls match `src/config/InputBindings.ts`.
- Architecture notes match current folders.
- Adding enemies, weapons, and maps is explained.
- Performance expectations remain laptop-oriented.

## Repo Conventions

- Use Markdown.
- Prefer short sections and checklists.
- Keep file paths accurate and rooted in this project.
