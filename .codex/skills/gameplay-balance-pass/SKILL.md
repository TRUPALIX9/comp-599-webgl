---
name: gameplay-balance-pass
description: Tune Paper Plane Assault player, weapon, enemy, pickup, progression, and camera values without breaking the arcade flight feel.
---

# Gameplay Balance Pass

## Invoke When

Use this skill when changing values for speed, boost, weapon damage, fire rate, cooldowns, health, score rewards, enemy waves, pickups, camera feel, or obstacle damage.

## Workflow

1. Open `src/config/GameConfig.ts` and identify the smallest set of values to tune.
2. Check the affected implementation so the value meaning is clear.
3. Change config first; avoid editing formulas unless config cannot solve the problem.
4. Keep player movement readable at min speed, cruise speed, and boost speed.
5. Preserve the weapon roles: paper dots are frequent and light, pencil missiles are limited and powerful.
6. Preserve enemy readability: foldlings are basic, darts are faster, gliders are tougher, boss is a final pressure test.
7. Run `npm run build`.
8. Launch and play at least one start-to-wave interaction when possible.

## Constraints

- Do not bury balance constants in entity files.
- Do not make boost mandatory for basic traversal.
- Do not make the heat system punish normal short bursts too harshly.
- Keep boss and wave tuning beatable with default ammo and pickups.
- Keep camera comfortable; avoid extreme FOV or aggressive smoothing changes.

## Expected Outputs

- A focused diff in `GameConfig.ts`.
- Any necessary README control or feature updates.
- Notes on the before/after intent of the tuning.

## Validation Checklist

- Player can steer through early obstacles without constant collision damage.
- Paper-dot gun can destroy basic enemies in a satisfying time.
- Missile cooldown and ammo feel meaningful.
- Health, pickups, and enemy damage leave room for recovery.
- Victory remains reachable.

## Repo Conventions

- Use seconds for cooldowns and durations.
- Use world units per second for movement speeds.
- Use degrees in config names that include `Deg`; convert with helpers in code.
