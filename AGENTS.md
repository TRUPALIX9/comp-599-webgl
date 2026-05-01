# AGENTS.md

## Project Goal

Paper Plane Assault is a TypeScript, Vite, and Babylon.js browser game. Keep it playable first: a paper plane flies through a stylized classroom-desk world, dodges obstacles, fights enemies with paper-dot bullets and pencil missiles, and reaches a victory state.

## Architecture Expectations

- Keep the root Vite app buildable with `npm run build`.
- Keep gameplay code modular under `src/`.
- Use `src/config/GameConfig.ts` for tunable balance values.
- Use `src/config/InputBindings.ts` for key bindings.
- Keep Babylon scene construction in `src/scene/`.
- Keep reusable gameplay behavior in `src/systems/`.
- Keep entity-specific state and update logic in `src/entities/`.
- Keep global loop and state transitions in `src/core/GameApp.ts` and `src/game/GameWorld.ts`.
- Prefer explicit update order over hidden event chains.

## Coding Standards

- Use TypeScript types for shared contracts.
- Avoid giant files and hidden globals.
- Avoid magic numbers in gameplay code; add config values instead.
- Keep names concrete: `PlayerPlane`, `WeaponSystem`, `FollowCameraController`, `CollisionBody`.
- Use Babylon primitives and `TransformNode` roots consistently.
- Keep rendering references out of pure utility modules.
- Add comments only where logic is not obvious.

## Testing And Validation

Before handing work back:

- Run `npm run typecheck` for TypeScript-only changes when possible.
- Run `npm run build` before final delivery for any gameplay, rendering, UI, or config change.
- Launch with `npm run dev` and verify the app reaches the title screen after major visual or runtime changes.
- Check browser console for runtime errors when touching Babylon scene, assets, input, UI, or WebAudio.
- Confirm the playable loop still supports start, pause, restart, shoot, missile, enemy damage, player damage, and win/lose transitions.

## Adding Enemies

1. Extend `EnemyKind` in `src/types/GameTypes.ts`.
2. Add balance values in `GameConfig.enemies`.
3. Add a mesh branch in `createEnemyMesh`.
4. Extend `Enemy` behavior only as much as needed.
5. Add the enemy to wave data in `GameWorld`.
6. Validate health, damage, score reward, collisions, and projectile interactions.

## Adding Weapons

1. Add weapon tuning under `GameConfig.weapons`.
2. Add or reuse projectile classes under `src/entities/projectiles/`.
3. Spawn through `WeaponSystem`; do not spawn from UI or input directly.
4. Resolve damage and impacts in `GameWorld.handleCollisions`.
5. Add audio/effect cues through `AudioSystem` and `VisualEffectsSystem`.
6. Keep projectile counts capped for laptop performance.

## Adding Maps Or Obstacles

1. Build visual geometry in `EnvironmentBuilder` or a dedicated map builder.
2. Register matching `CollisionBody` objects.
3. Keep traversal readable with obvious gaps and silhouettes.
4. Prefer simple collision spheres unless a gameplay reason requires more.
5. Test at min speed, cruise speed, and boost speed.

## Naming Conventions

- Classes and types: `PascalCase`.
- Methods, variables, and files that export one main helper: `camelCase`.
- Config objects: grouped by gameplay domain.
- Mesh names: prefix by purpose, such as `player.`, `enemy.`, `obstacle.`, `pickup.`, `vfx.`.
- Avoid abbreviations unless they are standard in game code, such as `dt` for delta time.

## WebGL Performance Rules

- Keep geometry low-poly by default.
- Reuse materials and geometry where practical.
- Cap projectiles, enemies, and effects.
- Avoid expensive post-processing until the base loop is profiled.
- Do not allocate large objects inside hot loops without a reason.
- Keep UI DOM updates simple and bounded.
- Prefer stable camera smoothing over flashy camera shake.

## Planning Rules For Agents

- Inspect relevant files before coding.
- State the intended scope and validation path.
- Keep changes small enough to review.
- Do not break the playable build to pursue polish.
- If touching controls, combat, enemies, camera, or UI, validate the full loop after changes.

## When To Use Subagents

Use subagents for parallel work when tasks are independent, such as:

- Architecture review before broad refactors
- Rendering/environment design
- Gameplay tuning proposals
- Enemy AI design
- UI/HUD review
- QA checklists and bug reproduction
- Documentation passes

Do not delegate the immediate blocking task if the main agent needs its result before making progress.

## Documentation Expectations

- Update `README.md` when controls, setup, architecture, folders, or feature scope changes.
- Update this file when agent workflow or repository conventions change.
- Update `.codex/skills/*/SKILL.md` when repeatable workflows change.
- Keep docs practical and repo-specific.

## Do Not Break The Playable Build

- Do not leave TypeScript errors.
- Do not commit a blank canvas, missing title screen, or unstartable game.
- Do not remove title, pause, restart, health, score, enemies, or weapons without replacing them.
- Do not introduce network-only runtime requirements for local play.
- Do not hide failures; document known limits and validation gaps.
