---
name: babylon-or-rendering-feature
description: Add or modify Babylon.js scene, camera, lighting, materials, procedural meshes, effects, or environment objects for Paper Plane Assault.
---

# Babylon Or Rendering Feature

## Invoke When

Use this skill for visual work: environment props, camera changes, materials, lighting, mesh factories, projectile visuals, pickups, shadows, or WebGL performance changes.

## Workflow

1. Inspect `src/scene/GameScene.ts`, `src/scene/Materials.ts`, `src/scene/MeshFactory.ts`, `src/scene/EnvironmentBuilder.ts`, and any affected entity.
2. Decide whether the change belongs in scene construction, a mesh factory, an entity, or an effect system.
3. Reuse existing materials where possible; clone materials only for per-effect alpha or color mutation.
4. Keep geometry low-poly and silhouettes readable.
5. Add collision volumes for new obstacles via `CollisionBody` in `EnvironmentBuilder`.
6. Keep camera tuning in `GameConfig.camera` and camera behavior in `FollowCameraController`.
7. Run `npm run build`.
8. For scene/camera changes, launch locally and check that the canvas is nonblank and the camera frames the player.

## Constraints

- Do not put gameplay tuning inside mesh builders.
- Do not mutate shared materials for temporary fade effects.
- Avoid heavy post-processing or high-poly assets without profiling.
- Keep first-screen rendering clear on laptop-sized viewports.
- Do not add remote asset dependencies for local play.

## Expected Outputs

- Rendering code in `src/scene` or `src/systems/effects`.
- Collision bodies for any solid gameplay object.
- Config updates for camera or effect limits when needed.
- README notes if visuals or asset pipeline change.

## Validation Checklist

- Babylon scene renders without console errors.
- Player, enemies, projectiles, pickups, and obstacles remain visible.
- Camera remains stable during boost, turns, and collisions.
- Obstacle visuals align closely enough with collision bodies.
- Draw calls and effect counts stay laptop-friendly.

## Repo Conventions

- Mesh names should use prefixes such as `player.`, `enemy.`, `obstacle.`, `projectile.`, `pickup.`, and `vfx.`.
- Entity mesh factories return `TransformNode` roots.
- Use procedural placeholders until an explicit asset-loader path exists.
