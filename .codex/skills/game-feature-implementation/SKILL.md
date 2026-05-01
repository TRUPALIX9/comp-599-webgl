---
name: game-feature-implementation
description: Implement a new Paper Plane Assault gameplay feature safely across TypeScript systems, entities, config, UI, and validation.
---

# Game Feature Implementation

## Invoke When

Use this skill when adding a gameplay feature such as pickups, scoring rules, new player abilities, enemy attacks, mission objectives, level events, or progression changes.

## Workflow

1. Read `README.md`, `AGENTS.md`, and the relevant files under `src/config`, `src/game`, `src/entities`, and `src/systems`.
2. Identify the smallest vertical slice that can be playable and testable.
3. Add tunable values to `src/config/GameConfig.ts` before hard-coding behavior.
4. Add or update typed contracts in `src/types/GameTypes.ts` when data crosses modules.
5. Implement entity-local state in `src/entities/*` and orchestration in `src/game/GameWorld.ts`.
6. Add visuals through `src/scene/*` or effects through `VisualEffectsSystem`.
7. Add UI display only through `UIController` and snapshots from `GameWorld`.
8. Run `npm run typecheck` and `npm run build`.
9. Launch `npm run dev` for runtime-sensitive work and verify the core loop manually.

## Constraints

- Keep the game playable throughout the change.
- Do not create one-off global state outside `GameApp` or `GameWorld`.
- Keep frame-update code allocation-light.
- Preserve laptop controls unless the user explicitly asks for a control redesign.
- Prefer simple, readable behavior over complex systems that are not yet needed.

## Expected Outputs

- Updated TypeScript modules in the appropriate folder.
- Config entries for all gameplay tuning.
- UI/docs updates if the feature changes player-facing behavior.
- Validation notes covering build and runtime checks.

## Validation Checklist

- Title screen starts the game.
- Pause and restart still work.
- Player can move, shoot, take damage, and die.
- Enemies can be damaged or avoided.
- No TypeScript or build errors.
- No obvious browser console errors.

## Repo Conventions

- Use Babylon `Vector3` and `TransformNode` for spatial gameplay entities.
- Keep damage resolution centralized in `GameWorld.handleCollisions` where possible.
- Use cue names in `AudioSystem` rather than directly creating sounds in features.
- Keep new balance values near related config groups.
