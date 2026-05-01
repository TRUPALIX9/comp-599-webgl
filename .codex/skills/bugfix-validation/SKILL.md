---
name: bugfix-validation
description: Reproduce, fix, and verify Paper Plane Assault build, runtime, gameplay, input, WebGL, and browser issues.
---

# Bugfix Validation

## Invoke When

Use this skill for TypeScript errors, build failures, blank canvas, browser console errors, broken controls, bad collisions, stuck game states, audio failures, or gameplay regressions.

## Workflow

1. Reproduce the issue with the smallest command or manual path.
2. Read the error and inspect the nearest source files with `rg` and targeted file reads.
3. Fix the root cause with a scoped patch.
4. Run `npm run typecheck` for type fixes.
5. Run `npm run build` for build or runtime-sensitive fixes.
6. Launch `npm run dev` when the issue involves browser behavior, Babylon rendering, input, audio, or UI.
7. Verify the exact regression path and one nearby core loop path.

## Constraints

- Do not mask errors with broad `any` types unless there is no better boundary.
- Do not disable TypeScript checks to make the build pass.
- Do not delete gameplay systems to remove an error.
- Do not ignore a blank canvas or console stack trace.
- Do not revert unrelated user changes.

## Expected Outputs

- A minimal fix.
- A clear explanation of what failed and why.
- Validation commands and runtime checks.
- Any residual risk if full browser validation was not possible.

## Validation Checklist

- `npm run build` succeeds.
- App reaches title screen.
- Start button enters gameplay.
- Movement, primary fire, missile fire, pause, and restart respond.
- No repeated console error loop.
- Projectiles/enemies/pickups clean up when dead.

## Repo Conventions

- Keep fixes aligned with existing module boundaries.
- Prefer fixing contracts at the type/interface level when multiple modules disagree.
- Keep collision and damage behavior debuggable in `GameWorld`.
