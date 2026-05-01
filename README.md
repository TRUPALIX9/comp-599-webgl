# COMP-599 WebGL Seminar — CSUCI Campus & Paper Plane Assault

A browser-native WebGL project for COMP-599 Seminar. Built with **TypeScript + Vite + Babylon.js**, it merges two interactive experiences into one unified launcher:

1. **Paper Plane Assault** — arcade combat flight game set over the CSUCI campus
2. **Explore Campus** — peaceful bird's-eye exploration of the CSUCI master plan in 3D
3. **Predictive City Roaming Lab** — WebGL rendering pipeline showcase (frustum culling, tile cache)
4. **2D/3D Situation Display Lab** — live data-driven operational display with terrain and entity tracks

---

## Quick Start

```bash
npm install
npm run dev
```

Open `http://127.0.0.1:5173` (or the URL printed by Vite). You will land on the **main selection screen** — pick any of the four experiences.

Build for production:

```bash
npm run build
```

Type-check only:

```bash
npm run typecheck
```

---

## Project Structure

```
WEBGL/
├── src/                     Game TypeScript source
│   ├── config/              Tunable gameplay values (GameConfig.ts) and input bindings
│   ├── core/                App bootstrap (GameApp.ts) and game state enum
│   ├── entities/            Player, enemies, projectiles, pickups
│   ├── game/                GameWorld orchestration and encounter loop
│   ├── scene/               Babylon scene, materials, mesh factories, CampusBuilder
│   ├── systems/             Input, combat, camera, collision, audio, UI, effects
│   ├── types/               Shared gameplay types (GameTypes.ts)
│   └── utils/               Math helpers
├── docs/                    Seminar paper (.docx) and WebGL capability showcase (.pptx)
├── references/              4 research PDFs (MPIP master plan + WebGL papers)
│   ├── MPIP_11x17 Final_071220_reduced.pdf
│   ├── 3D_ITS_campus_on_the_web_A_WebGL_implementation.pdf
│   ├── 3D_geographic_scenes_visualization_based_on_WebGL.pdf
│   └── Design_of_a_2D_and_3D_Situation_Display_Platform_Based_on_WebGL_and_Modern_Web_Technology_Stack.pdf
├── webgl-showcase/          Standalone HTML showcase labs (city-roaming, situation-display)
├── dist/                    Production build output (generated)
├── index.html               Vite entry point
├── package.json
├── vite.config.ts
├── tsconfig.json
├── AGENTS.md                AI agent workflow rules
└── README.md
```

---

## Controls (Paper Plane Assault & Campus Explore)

| Key | Action |
|---|---|
| `W` / `S` | Accelerate / Decelerate |
| `A` / `D` | Turn left / right |
| `Mouse` / `↑↓` | Pitch aim |
| `Space` | Fire paper-dot gun |
| `Shift` | Boost |
| `Q` or `E` | Launch pencil missile |
| `Esc` | Pause / Resume |
| `R` | Restart |

---

## Game Modes

### 🏛️ Explore Campus
Peaceful flight over a 3D model of the CSUCI campus, derived from the MPIP Master Plan PDF. No enemies, no damage. Fly through the University Mall, past the Bell Tower, over the Campus Green, and around Broome Library.

### ✈️ Paper Plane Assault
Full combat experience. Fight through 6 waves of paper enemies (Foldling, Dart, Glider, Boss Kite) using paper-dot rapid fire and homing pencil missiles. Reach the south campus finish gate to win.

### 🏙️ City Roaming Lab *(webgl-showcase)*
Navigate a generated city while the renderer reports visible buildings, culled geometry, tile cache state, and predicted prefetch targets.

### 📡 Situation Display Lab *(webgl-showcase)*
A simulated data stream drives a WebGL terrain view, synchronized 2D map, entity tracks, layer controls, and replay timeline.

---

## Campus Architecture (from MPIP PDF)

The 3D campus environment is derived from the California State University Channel Islands **Master Plan Implementation Program (MPIP)**:

- **Style**: Spanish California Mission Revival
- **Colors**: Beige/cream stucco walls, terra cotta red clay tile roofs
- **Key Landmarks**: Bell Tower (center), Broome Library (south), University Mall (spine)
- **Flight Path**: North Entrance → University Mall → Campus Green → Bell Tower → Broome Library → South Finish Gate

---

## Architecture

`GameApp` owns the Babylon engine, input, audio, UI, and routing state machine (`menu → title → playing → paused/victory/gameOver`). `GameWorld` orchestrates the active scene: player, weapons, wave spawning, enemies, projectiles, pickups, collision, effects, and camera — in explicit update order.

Two modes are supported via `GameWorld.setMode()`:
- **`combat`**: enemies spawn, damage is enabled, victory condition is active
- **`exploration`**: no wave spawning, player is invincible, free-fly

---

## Adding Content

**New enemy**: Extend `EnemyKind` in `GameTypes.ts` → add config in `GameConfig.enemies` → add mesh in `createEnemyMesh` → add to `wavePlan` in `GameWorld`.

**New weapon**: Add config in `GameConfig.weapons` → create projectile entity → wire through `WeaponSystem` → handle damage in `GameWorld.handleCollisions`.

**New campus building**: Add a helper in `CampusBuilder.ts` → place it in `createMapObjects()` → register matching `CollisionBody` spheres.

---

## Performance

Tuned for laptop browsers: low-poly meshes, capped projectile/effect counts (80/60/90), spherical collision, limited lights. Avoid per-frame allocations in hot loops.

---

## Research References

| Paper | Key Topic |
|---|---|
| MPIP Master Plan | CSUCI campus layout, architecture, and design standards |
| 3D ITS Campus on the Web | Browser WebGL campus models, camera modes, usability |
| 3D Geographic Scenes | glTF, frustum culling, prefetching — 36fps benchmark |
| 2D/3D Situation Display | SOA, WebGL2, Cesium, real-time data linkage |
