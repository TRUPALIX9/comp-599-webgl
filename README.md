# COMP 599 WebGL Seminar Showcase

This repository contains one integrated **Next.js WebGL showcase** for the COMP 599 research summary and presentation on browser-based 3D visualization.

## What Is Included

- `app/page.tsx` — the single interactive WebGL showcase page.
- `app/globals.css` — the full visual system for the showcase.
- `package.json` — Next.js project scripts and dependencies.
- `docs/` — the seminar paper DOCX and presentation PPTX.
- `references/` — the three source PDFs used by the paper and presentation.

## WebGL Modules

- **Highway Sim** is the final polished demo: a three-lane highway with buildings, moving vehicles, lane switching, and collision detection.
- **Bunker Sim** is a game-style entity demo: spawned entities move through a bunker scene, click picking acts like a raycast, and the UI tracks health, hits, and active entities.
- **Pipeline** explains the CPU/GPU split in WebGL. Use this as the short live demo after introducing what WebGL does.
- **City Roaming** demonstrates city-scale rendering ideas such as culling, visible working sets, and request queues.
- **Situation Display** demonstrates a 2D/3D operational display with layers, simulated live entities, a linked map, and replay-style state.

All modules are combined into one Next.js page. The first screen offers two primary demo choices: **Highway Obstacle Simulation** and **Bunker Entity Simulation**.

## Highway Demo Plan

The highway scene is intentionally scoped for a 3-minute presentation demo. It shows the most important WebGL ideas without turning into a full game.

- World scale: `1 WebGL unit = about 1 meter`.
- Highway orientation: the road runs forward on the `Z` axis; left/right movement uses the `X` axis.
- Lanes: `3` lanes, each `3.7m` wide.
- Road width: `14.3m`, including shoulders.
- Player car: `1.9m` wide, `1.45m` high, `4.6m` long.
- Sedan obstacles: `1.9m x 1.45m x 4.6m`.
- Truck obstacles: `2.35m x 2.75m x 6.8m`.
- Bus obstacles: `2.55m x 3.1m x 9.2m`.
- Buildings: placed on both sides of the highway, set back from the road edge by about `11m-18m`.
- Building orientation: most buildings are parallel to the highway; some rotate perpendicular to create city-block variation.
- Building height: about `8m-42m`, so the street feels urban but still readable.
- Collision logic: simple 2D bounding-box checks on `X/Z` position.
- Controls: use the left/right lane buttons, or keyboard `A/D` and arrow keys.

The current scene uses procedural WebGL boxes instead of GLB assets because no `.glb` files are present in the project. Real car or building GLB files can replace these boxes later while keeping the same size/orientation rules.

## Bunker Demo Plan

The bunker scene is the more game-like option. Keep the framing professional: it is an entity simulation for WebGL interaction, not a realistic combat game.

- Scene: fixed player camera inside a simple bunker room.
- Spawns: entities appear from `5` doorway positions.
- Movement: each entity moves toward the player position.
- Interaction: clicking the canvas performs a projected picking/raycast-style hit test.
- Feedback: hit entities dissolve/respawn; no gore or realistic weapon effects.
- Metrics: health, hits, active entities, and FPS.
- Controls: click the canvas to target entities, or use the side-panel pulse/reset buttons.

## Asset Wishlist

The project works without external models, but these files would make it look much better:

- `vehicle-sedan.glb`, `vehicle-truck.glb`, and `vehicle-bus.glb` for the highway demo.
- `building-lowrise.glb` and `building-midrise.glb` for city-side buildings.
- `bunker-room.glb` or modular wall/door pieces for the bunker.
- `entity-zombie-stylized.glb` or `entity-training-bot.glb` for the spawned characters.
- Optional simple animations: `walk`, `hit`, and `idle`.

Put models under `public/models/` with clean lowercase names. If models are repeated, keep one good copy and name variants with `-01`, `-02`, etc.

## Local Use

Install dependencies once:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Then open the local Next.js URL, usually `http://127.0.0.1:3000/`.

## Vercel Deployment

Deploy this repository as a normal Next.js project:

- Root Directory: repository root
- Framework Preset: `Next.js`
- Build Command: `npm run build`
- Output Directory: leave as the Next.js default

## Source Papers

1. A. Yuniarti, A. Atminanto, A. Mardasatria, R. R. Hariadi, and N. Suciati, "3D ITS Campus on the Web: A WebGL Implementation," 2015.
2. R. Miao, J. Song, and Y. Zhu, "3D Geographic Scenes Visualization Based on WebGL," 2017.
3. Y. Yang, "Design of a 2D and 3D Situation Display Platform Based on WebGL and Modern Web Technology Stack," 2024.
