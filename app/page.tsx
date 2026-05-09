"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type ModuleKey = "menu" | "highway" | "bunker" | "pipeline" | "city" | "situation";

type Metrics = {
  fps: number;
  primary: string;
  secondary: string;
  tertiary: string;
  status: string;
};

type RendererOptions = {
  canvas: HTMLCanvasElement;
  miniMap: HTMLCanvasElement | null;
  module: ModuleKey;
  pipelineMode: "gpu" | "cpu";
  load: number;
  layerCount: number;
  setMetrics: (metrics: Metrics) => void;
};

type Cleanup = () => void;

const modules: Array<{
  key: Exclude<ModuleKey, "menu">;
  label: string;
  kicker: string;
  title: string;
  source: string;
}> = [
  {
    key: "highway",
    label: "Highway Sim",
    kicker: "Entities / Collision",
    title: "Vehicles become live scene entities.",
    source: "Final demo"
  },
  {
    key: "bunker",
    label: "Bunker Sim",
    kicker: "Raycast / Spawn",
    title: "A bunker scene tests WebGL interaction.",
    source: "Second demo"
  },
  {
    key: "pipeline",
    label: "Pipeline",
    kicker: "CPU / GPU",
    title: "CPU prepares. GPU draws.",
    source: "Opening explanation"
  },
  {
    key: "city",
    label: "City Roaming",
    kicker: "Culling / Prefetch",
    title: "Large scenes need scheduling.",
    source: "Miao, Song, and Zhu"
  },
  {
    key: "situation",
    label: "Situation Display",
    kicker: "2D / 3D Linkage",
    title: "WebGL can be an operational surface.",
    source: "Yang"
  }
];

const menuModule = {
  key: "menu" as const,
  label: "Demo Menu",
  kicker: "Choose Demo",
  title: "Choose a WebGL simulation.",
  source: "Main screen"
};

const primaryDemos = modules.filter((item) => item.key === "highway" || item.key === "bunker");

const initialMetrics: Metrics = {
  fps: 0,
  primary: "0",
  secondary: "0",
  tertiary: "0",
  status: "Initializing WebGL"
};

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const miniMapRef = useRef<HTMLCanvasElement | null>(null);
  const [active, setActive] = useState<ModuleKey>("menu");
  const [pipelineMode, setPipelineMode] = useState<"gpu" | "cpu">("gpu");
  const [load, setLoad] = useState(16000);
  const [layerCount, setLayerCount] = useState(5);
  const [metrics, setMetrics] = useState<Metrics>(initialMetrics);

  const activeModule = useMemo(() => active === "menu" ? menuModule : modules.find((item) => item.key === active) ?? modules[0], [active]);
  const metricLabels = getMetricLabels(active);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setMetrics(initialMetrics);
    return createRenderer({
      canvas,
      miniMap: miniMapRef.current,
      module: active,
      pipelineMode,
      load,
      layerCount,
      setMetrics
    });
  }, [active, pipelineMode, load, layerCount]);

  return (
    <main className="shell">
      <section className="stage" aria-label="WebGL visualization stage">
        <canvas ref={canvasRef} aria-label={`${activeModule.label} WebGL canvas`} />
        {active !== "menu" ? (
          <div className="stageHud" aria-live="polite">
            <Metric label="FPS" value={metrics.fps.toString()} />
            <Metric label={metricLabels.primary} value={metrics.primary} />
            <Metric label={metricLabels.secondary} value={metrics.secondary} />
            <Metric label={metricLabels.tertiary} value={metrics.tertiary} />
          </div>
        ) : null}
        {active === "menu" ? <DemoChooser setActive={setActive} /> : null}
        {active === "situation" ? <canvas ref={miniMapRef} className="miniMap" aria-label="Linked 2D situation map" /> : null}
      </section>

      <aside className="controlPanel">
        <header>
          <div className="eyebrow">COMP 599 WebGL Showcase</div>
          <h1>{activeModule.title}</h1>
          <p>{activeModule.kicker} · {activeModule.source}</p>
        </header>

        {active === "menu" ? (
          <nav className="moduleTabs" aria-label="Demo choices">
            {primaryDemos.map((item) => (
              <button
                key={item.key}
                type="button"
                aria-pressed="false"
                onClick={() => setActive(item.key)}
              >
                <span>{item.kicker}</span>
                {item.label}
              </button>
            ))}
          </nav>
        ) : (
          <nav className="moduleTabs" aria-label="WebGL modules">
            <button type="button" aria-pressed="false" onClick={() => setActive("menu")}>
              <span>Choose Demo</span>
              Main Screen
            </button>
            {primaryDemos.map((item) => (
              <button
                key={item.key}
                type="button"
                aria-pressed={active === item.key}
                onClick={() => setActive(item.key)}
              >
                <span>{item.kicker}</span>
                {item.label}
              </button>
            ))}
          </nav>
        )}

        {active === "pipeline" ? (
          <section className="toolBlock">
            <div className="buttonPair" role="group" aria-label="Pipeline mode">
              <button type="button" aria-pressed={pipelineMode === "cpu"} onClick={() => setPipelineMode("cpu")}>CPU Update</button>
              <button type="button" aria-pressed={pipelineMode === "gpu"} onClick={() => setPipelineMode("gpu")}>GPU Shader</button>
            </div>
            <label className="rangeControl">
              <span>Particle Load <strong>{load.toLocaleString()}</strong></span>
              <input
                type="range"
                min="4000"
                max="32000"
                step="4000"
                value={load}
                onChange={(event) => setLoad(Number(event.target.value))}
              />
            </label>
          </section>
        ) : null}

        {active === "highway" ? (
          <section className="toolBlock">
            <div className="buttonPair" role="group" aria-label="Lane controls">
              <button type="button" onClick={() => signalHighwayLane(-1)}>Left Lane</button>
              <button type="button" onClick={() => signalHighwayLane(1)}>Right Lane</button>
            </div>
          </section>
        ) : null}

        {active === "bunker" ? (
          <section className="toolBlock">
            <div className="buttonPair" role="group" aria-label="Bunker controls">
              <button type="button" onClick={() => signalBunkerReset()}>Reset Run</button>
              <button type="button" onClick={() => signalBunkerPulse()}>Pulse Shot</button>
            </div>
          </section>
        ) : null}

        {active === "situation" ? (
          <section className="toolBlock">
            <label className="rangeControl">
              <span>Active Layers <strong>{layerCount}</strong></span>
              <input
                type="range"
                min="1"
                max="5"
                step="1"
                value={layerCount}
                onChange={(event) => setLayerCount(Number(event.target.value))}
              />
            </label>
          </section>
        ) : null}

        <section className="statusBlock">
          <span>Current Readout</span>
          <strong>{metrics.status}</strong>
        </section>

        <section className="sourceBlock">
          <span>{active === "menu" ? "Recommended Use" : "Source Arc"}</span>
          <ol>
            {active === "menu" ? (
              <>
                <li>Use Highway Sim for the strongest academic fit.</li>
                <li>Use Bunker Sim if you want a more interactive game-style demo.</li>
                <li>Keep both short: one minute to show controls, two minutes to explain WebGL logic.</li>
              </>
            ) : (
              <>
                <li>Campus WebGL shows browser access and interaction.</li>
                <li>Geographic WebGL shows scale, culling, and prefetching.</li>
                <li>Situation display shows WebGL inside a larger platform.</li>
                <li>Highway and bunker demos join rendering, movement, collision, and interaction.</li>
              </>
            )}
          </ol>
        </section>
      </aside>
    </main>
  );
}

function DemoChooser({ setActive }: { setActive: (key: ModuleKey) => void }) {
  return (
    <div className="demoChooser" aria-label="Choose a WebGL simulation">
      <button type="button" className="demoCard highwayCard" onClick={() => setActive("highway")}>
        <div className="previewRoad">
          <span />
          <span />
          <span />
        </div>
        <strong>Highway Obstacle Simulation</strong>
        <small>Academic fit: dynamic vehicles, lane logic, collision checks.</small>
      </button>
      <button type="button" className="demoCard bunkerCard" onClick={() => setActive("bunker")}>
        <div className="previewBunker">
          <span />
          <span />
          <span />
        </div>
        <strong>Bunker Entity Simulation</strong>
        <small>Game-style fit: spawning entities, picking, health, score.</small>
      </button>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function createRenderer(options: RendererOptions): Cleanup {
  if (options.module === "menu") return createMenuRenderer(options);
  if (options.module === "highway") return createHighwayRenderer(options);
  if (options.module === "bunker") return createBunkerRenderer(options);
  if (options.module === "pipeline") return createPipelineRenderer(options);
  if (options.module === "city") return createCityRenderer(options);
  return createSituationRenderer(options);
}

function getMetricLabels(module: ModuleKey) {
  if (module === "menu") return { primary: "Demo", secondary: "Mode", tertiary: "Ready" };
  if (module === "highway") return { primary: "Speed", secondary: "Lane", tertiary: "Score" };
  if (module === "bunker") return { primary: "Health", secondary: "Hits", tertiary: "Entities" };
  if (module === "pipeline") return { primary: "Vertices", secondary: "JS Update", tertiary: "Draw Calls" };
  if (module === "city") return { primary: "Visible", secondary: "Culled", tertiary: "Queued" };
  return { primary: "Entities", secondary: "Packets", tertiary: "Layers" };
}

function signalHighwayLane(direction: number) {
  window.dispatchEvent(new CustomEvent<number>("webgl-highway-lane", { detail: direction }));
}

function signalBunkerReset() {
  window.dispatchEvent(new Event("webgl-bunker-reset"));
}

function signalBunkerPulse() {
  window.dispatchEvent(new Event("webgl-bunker-pulse"));
}

type BunkerEntity = {
  doorway: number;
  x: number;
  z: number;
  speed: number;
  radius: number;
  hitPulse: number;
  respawnDelay: number;
};

const bunkerSpec = {
  player: [0, 0, -13] as Vec3,
  roomWidth: 34,
  roomDepth: 46,
  entityRadius: 0.85,
  entityHeight: 2.15,
  doorways: [
    [-13, 0, 24],
    [-6, 0, 26],
    [0, 0, 27],
    [7, 0, 26],
    [14, 0, 24]
  ] as Vec3[]
};

function createMenuRenderer({ canvas, setMetrics }: RendererOptions): Cleanup {
  const gl = canvas.getContext("webgl", { antialias: true, alpha: false });
  if (!gl) {
    setMetrics({ ...initialMetrics, status: "WebGL is unavailable in this browser" });
    return () => undefined;
  }

  const program = createProgram(gl, `
    attribute vec2 aPosition;
    attribute float aPhase;
    uniform float uTime;
    varying float vGlow;
    void main() {
      float drift = sin(uTime * 0.5 + aPhase) * 0.02;
      vec2 p = aPosition + vec2(drift, cos(uTime * 0.4 + aPhase) * 0.018);
      vGlow = 0.45 + 0.55 * sin(uTime + aPhase);
      gl_Position = vec4(p, 0.0, 1.0);
      gl_PointSize = 3.0 + vGlow * 2.5;
    }
  `, `
    precision mediump float;
    varying float vGlow;
    void main() {
      vec2 p = gl_PointCoord - vec2(0.5);
      if (length(p) > 0.5) discard;
      vec3 color = mix(vec3(0.15, 0.5, 0.42), vec3(0.8, 0.55, 0.22), vGlow);
      gl_FragColor = vec4(color, 0.72);
    }
  `);

  const count = 720;
  const points = new Float32Array(count * 3);
  for (let i = 0; i < count; i += 1) {
    const angle = i * 2.399963;
    const radius = Math.sqrt(i / count) * 0.9;
    points[i * 3] = Math.cos(angle) * radius;
    points[i * 3 + 1] = Math.sin(angle) * radius * 0.72;
    points[i * 3 + 2] = angle;
  }
  const buffer = fillBuffer(gl, points, gl.STATIC_DRAW);
  const posLocation = gl.getAttribLocation(program, "aPosition");
  const phaseLocation = gl.getAttribLocation(program, "aPhase");
  const timeLocation = gl.getUniformLocation(program, "uTime");

  let animation = 0;
  let lastMetricsAt = 0;
  const frame = (now: number) => {
    resizeCanvasToDisplay(canvas, gl);
    gl.clearColor(0.07, 0.12, 0.1, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.enableVertexAttribArray(posLocation);
    gl.vertexAttribPointer(posLocation, 2, gl.FLOAT, false, 12, 0);
    gl.enableVertexAttribArray(phaseLocation);
    gl.vertexAttribPointer(phaseLocation, 1, gl.FLOAT, false, 12, 8);
    gl.uniform1f(timeLocation, now * 0.001);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.drawArrays(gl.POINTS, 0, count);
    if (now - lastMetricsAt > 600) {
      setMetrics({
        fps: 60,
        primary: "2",
        secondary: "Ready",
        tertiary: "Choose",
        status: "Choose Highway for the academic demo or Bunker for the interactive entity demo."
      });
      lastMetricsAt = now;
    }
    animation = requestAnimationFrame(frame);
  };

  animation = requestAnimationFrame(frame);
  return () => cancelAnimationFrame(animation);
}

function createBunkerRenderer({ canvas, setMetrics }: RendererOptions): Cleanup {
  const gl = canvas.getContext("webgl", { antialias: true, alpha: false, powerPreference: "high-performance" });
  if (!gl) {
    setMetrics({ ...initialMetrics, status: "WebGL is unavailable in this browser" });
    return () => undefined;
  }

  const program = createProgram(gl, `
    attribute vec3 aPosition;
    attribute vec3 aColor;
    uniform mat4 uMvp;
    varying vec3 vColor;
    void main() {
      vColor = aColor;
      gl_Position = uMvp * vec4(aPosition, 1.0);
    }
  `, `
    precision mediump float;
    varying vec3 vColor;
    void main() {
      gl_FragColor = vec4(vColor, 1.0);
    }
  `);

  const roomMesh = new Float32Array(createBoxVertices([0.43, 0.45, 0.39], [0.55, 0.56, 0.48]));
  const floorMesh = new Float32Array(createBoxVertices([0.16, 0.19, 0.17], [0.23, 0.27, 0.23]));
  const doorwayMesh = new Float32Array(createBoxVertices([0.04, 0.07, 0.07], [0.08, 0.14, 0.13]));
  const entityMesh = new Float32Array(createBoxVertices([0.32, 0.58, 0.42], [0.45, 0.72, 0.54]));
  const entityHeadMesh = new Float32Array(createBoxVertices([0.38, 0.64, 0.47], [0.48, 0.76, 0.58]));
  const blasterMesh = new Float32Array(createBoxVertices([0.24, 0.72, 0.86], [0.68, 0.95, 1]));
  const roomBuffer = fillBuffer(gl, roomMesh, gl.STATIC_DRAW);
  const floorBuffer = fillBuffer(gl, floorMesh, gl.STATIC_DRAW);
  const doorwayBuffer = fillBuffer(gl, doorwayMesh, gl.STATIC_DRAW);
  const entityBuffer = fillBuffer(gl, entityMesh, gl.STATIC_DRAW);
  const entityHeadBuffer = fillBuffer(gl, entityHeadMesh, gl.STATIC_DRAW);
  const blasterBuffer = fillBuffer(gl, blasterMesh, gl.STATIC_DRAW);

  const positionLocation = gl.getAttribLocation(program, "aPosition");
  const colorLocation = gl.getAttribLocation(program, "aColor");
  const mvpLocation = gl.getUniformLocation(program, "uMvp");
  const entities: BunkerEntity[] = Array.from({ length: 7 }, (_, i) => createBunkerEntity(i, i * 0.9));

  let animation = 0;
  let last = performance.now();
  let frames = 0;
  let elapsed = 0;
  let health = 100;
  let hits = 0;
  let lastShotAt = -1000;
  let lastShotPosition: Vec3 = [0, 1.3, 6];
  let projectedTargets: Array<{ entity: BunkerEntity; x: number; y: number; depth: number }> = [];

  const resetRun = () => {
    health = 100;
    hits = 0;
    entities.forEach((entity, i) => Object.assign(entity, createBunkerEntity(i, i * 0.8)));
  };

  const drawMesh = (buffer: WebGLBuffer, count: number, mvp: Float32Array) => {
    bindInterleaved(gl, buffer, positionLocation, colorLocation);
    gl.uniformMatrix4fv(mvpLocation, false, mvp);
    gl.drawArrays(gl.TRIANGLES, 0, count);
  };

  const drawBox = (buffer: WebGLBuffer, pv: Float32Array, x: number, y: number, z: number, w: number, h: number, d: number, rotation = 0) => {
    drawMesh(buffer, 36, multiplyMat4(pv, modelMatrixRotY(x, y, z, w, h, d, rotation)));
  };

  const fireAt = (clipX = 0, clipY = 0) => {
    let selectedEntity: BunkerEntity | null = null;
    let selectedDistance = Number.POSITIVE_INFINITY;
    const threshold = clipX === 0 && clipY === 0 ? 1.25 : 0.13;
    for (const target of projectedTargets) {
      if (target.depth <= 0 || target.entity.respawnDelay > 0 || target.entity.hitPulse > 0) continue;
      const distance = Math.hypot(target.x - clipX, target.y - clipY);
      if (distance < threshold && distance < selectedDistance) {
        selectedEntity = target.entity;
        selectedDistance = distance;
      }
    }
    lastShotAt = performance.now();
    if (selectedEntity) {
      selectedEntity.hitPulse = 1;
      selectedEntity.respawnDelay = 0.55;
      lastShotPosition = [selectedEntity.x, 1.2, selectedEntity.z];
      hits += 1;
    } else {
      lastShotPosition = [clipX * 10, 1.4 + clipY * 3, 5];
    }
  };

  const onPointerDown = (event: PointerEvent) => {
    const rect = canvas.getBoundingClientRect();
    const clipX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const clipY = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
    fireAt(clipX, clipY);
  };

  const onPulse = () => fireAt(0, 0);
  const onReset = () => resetRun();
  canvas.addEventListener("pointerdown", onPointerDown);
  window.addEventListener("webgl-bunker-pulse", onPulse);
  window.addEventListener("webgl-bunker-reset", onReset);

  const frame = (now: number) => {
    resizeCanvasToDisplay(canvas, gl);
    const dt = Math.min(0.05, (now - last) / 1000 || 0.016);
    last = now;

    const projection = perspective(Math.PI / 3.1, canvas.width / Math.max(1, canvas.height), 0.1, 220);
    const view = lookAt([0, 4.2, -21], [0, 1.6, 8], [0, 1, 0]);
    const pv = multiplyMat4(projection, view);
    projectedTargets = [];

    entities.forEach((entity, i) => {
      if (entity.respawnDelay > 0) {
        entity.respawnDelay -= dt;
        if (entity.respawnDelay <= 0) Object.assign(entity, createBunkerEntity(i, now * 0.0004 + i));
        return;
      }
      if (entity.hitPulse > 0) {
        entity.hitPulse -= dt * 2.6;
        if (entity.hitPulse <= 0) entity.respawnDelay = 0.35;
        return;
      }
      const dx = bunkerSpec.player[0] - entity.x;
      const dz = bunkerSpec.player[2] - entity.z;
      const dist = Math.hypot(dx, dz) || 1;
      entity.x += (dx / dist) * entity.speed * dt;
      entity.z += (dz / dist) * entity.speed * dt;
      if (dist < 1.45) {
        health = Math.max(0, health - 12);
        entity.respawnDelay = 0.2;
      }
    });

    gl.clearColor(0.055, 0.075, 0.08, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    gl.disable(gl.CULL_FACE);
    gl.useProgram(program);

    drawBox(floorBuffer, pv, 0, -0.12, 5, bunkerSpec.roomWidth, 0.22, bunkerSpec.roomDepth);
    drawBox(roomBuffer, pv, 0, 3.1, 28, bunkerSpec.roomWidth, 6.2, 0.7);
    drawBox(roomBuffer, pv, -17.2, 3.1, 5, 0.7, 6.2, bunkerSpec.roomDepth);
    drawBox(roomBuffer, pv, 17.2, 3.1, 5, 0.7, 6.2, bunkerSpec.roomDepth);
    drawBox(roomBuffer, pv, 0, 6.35, 5, bunkerSpec.roomWidth, 0.28, bunkerSpec.roomDepth);
    bunkerSpec.doorways.forEach(([x, , z], i) => {
      drawBox(doorwayBuffer, pv, x, 1.55, z + 0.2, 3.1, 3.1, 0.5, i === 0 ? -0.14 : i === 4 ? 0.14 : 0);
    });

    entities.forEach((entity) => {
      if (entity.respawnDelay > 0) return;
      const dissolve = Math.max(0, entity.hitPulse);
      const scale = 1 - dissolve * 0.55;
      drawBox(entityBuffer, pv, entity.x, bunkerSpec.entityHeight * 0.42 * scale, entity.z, 1.08 * scale, 1.55 * scale, 0.82 * scale);
      drawBox(entityHeadBuffer, pv, entity.x, 1.78 * scale, entity.z - 0.04, 0.78 * scale, 0.68 * scale, 0.72 * scale);
      const projected = projectPoint([entity.x, 1.3, entity.z], pv);
      if (projected) projectedTargets.push({ entity, x: projected[0], y: projected[1], depth: projected[2] });
    });

    if (now - lastShotAt < 160) {
      drawBox(blasterBuffer, pv, lastShotPosition[0], lastShotPosition[1], lastShotPosition[2], 0.38, 0.38, 0.38);
    }

    frames += 1;
    elapsed += dt * 1000;
    if (elapsed >= 400) {
      const activeEntities = entities.filter((entity) => entity.respawnDelay <= 0).length;
      setMetrics({
        fps: Math.round(1000 / (elapsed / frames)),
        primary: `${health}%`,
        secondary: hits.toString(),
        tertiary: activeEntities.toString(),
        status: health <= 0
          ? "Run ended; reset to restart the entity simulation."
          : "Spawned entities move toward the player; click picking uses projected ray targets."
      });
      frames = 0;
      elapsed = 0;
    }

    animation = requestAnimationFrame(frame);
  };

  animation = requestAnimationFrame(frame);
  return () => {
    canvas.removeEventListener("pointerdown", onPointerDown);
    window.removeEventListener("webgl-bunker-pulse", onPulse);
    window.removeEventListener("webgl-bunker-reset", onReset);
    cancelAnimationFrame(animation);
  };
}

function createBunkerEntity(index: number, seedOffset: number): BunkerEntity {
  const doorway = index % bunkerSpec.doorways.length;
  const origin = bunkerSpec.doorways[doorway];
  const spread = (hash(index + seedOffset, doorway + 3) - 0.5) * 2.4;
  return {
    doorway,
    x: origin[0] + spread,
    z: origin[2] + hash(index + 4, seedOffset + 7) * 2,
    speed: 1.25 + hash(index + 8, seedOffset + 9) * 0.85,
    radius: bunkerSpec.entityRadius,
    hitPulse: 0,
    respawnDelay: index < 4 ? 0 : index * 0.16
  };
}

type HighwayBuilding = {
  x: number;
  z: number;
  w: number;
  h: number;
  d: number;
  rotation: number;
};

type HighwayObstacle = {
  lane: number;
  offset: number;
  kind: "sedan" | "truck" | "bus";
  speedFactor: number;
};

const highwaySpec = {
  laneWidth: 3.7,
  laneCount: 3,
  shoulderWidth: 1.6,
  roadStart: -88,
  roadEnd: 260,
  playerZ: -28,
  playerCar: { width: 1.9, height: 1.45, length: 4.6 },
  sedan: { width: 1.9, height: 1.45, length: 4.6 },
  truck: { width: 2.35, height: 2.75, length: 6.8 },
  bus: { width: 2.55, height: 3.1, length: 9.2 }
};

function createHighwayRenderer({ canvas, setMetrics }: RendererOptions): Cleanup {
  const gl = canvas.getContext("webgl", { antialias: true, alpha: false, powerPreference: "high-performance" });
  if (!gl) {
    setMetrics({ ...initialMetrics, status: "WebGL is unavailable in this browser" });
    return () => undefined;
  }

  const program = createProgram(gl, `
    attribute vec3 aPosition;
    attribute vec3 aColor;
    uniform mat4 uMvp;
    varying vec3 vColor;
    void main() {
      vColor = aColor;
      gl_Position = uMvp * vec4(aPosition, 1.0);
    }
  `, `
    precision mediump float;
    varying vec3 vColor;
    void main() {
      gl_FragColor = vec4(vColor, 1.0);
    }
  `);

  const surface = new Float32Array(createHighwaySurfaceVertices());
  const surfaceBuffer = fillBuffer(gl, surface, gl.STATIC_DRAW);
  const buildingMesh = new Float32Array(createBoxVertices([0.9, 0.86, 0.75], [0.76, 0.32, 0.24]));
  const buildingBuffer = fillBuffer(gl, buildingMesh, gl.STATIC_DRAW);
  const playerMesh = new Float32Array(createBoxVertices([0.15, 0.54, 0.44], [0.22, 0.7, 0.58]));
  const playerBuffer = fillBuffer(gl, playerMesh, gl.STATIC_DRAW);
  const sedanMesh = new Float32Array(createBoxVertices([0.72, 0.22, 0.18], [0.9, 0.36, 0.3]));
  const sedanBuffer = fillBuffer(gl, sedanMesh, gl.STATIC_DRAW);
  const truckMesh = new Float32Array(createBoxVertices([0.82, 0.59, 0.22], [0.96, 0.76, 0.35]));
  const truckBuffer = fillBuffer(gl, truckMesh, gl.STATIC_DRAW);
  const busMesh = new Float32Array(createBoxVertices([0.2, 0.44, 0.7], [0.32, 0.58, 0.86]));
  const busBuffer = fillBuffer(gl, busMesh, gl.STATIC_DRAW);
  const glassMesh = new Float32Array(createBoxVertices([0.1, 0.18, 0.2], [0.22, 0.34, 0.38]));
  const glassBuffer = fillBuffer(gl, glassMesh, gl.STATIC_DRAW);

  const positionLocation = gl.getAttribLocation(program, "aPosition");
  const colorLocation = gl.getAttribLocation(program, "aColor");
  const mvpLocation = gl.getUniformLocation(program, "uMvp");
  const buildings = createHighwayBuildings();
  const obstacles = createHighwayObstacles();
  const laneAreaWidth = highwaySpec.laneWidth * highwaySpec.laneCount;
  const roadWidth = laneAreaWidth + highwaySpec.shoulderWidth * 2;
  const roadSpan = highwaySpec.roadEnd - highwaySpec.roadStart;

  let animation = 0;
  let last = performance.now();
  let frames = 0;
  let elapsed = 0;
  let distance = 0;
  let speed = 18;
  let score = 0;
  let targetLane = 1;
  let playerX = laneCenter(targetLane);
  let lastCollisionAt = -1000;

  const drawMesh = (buffer: WebGLBuffer, count: number, mvp: Float32Array) => {
    bindInterleaved(gl, buffer, positionLocation, colorLocation);
    gl.uniformMatrix4fv(mvpLocation, false, mvp);
    gl.drawArrays(gl.TRIANGLES, 0, count);
  };

  const drawBox = (buffer: WebGLBuffer, count: number, pv: Float32Array, x: number, y: number, z: number, w: number, h: number, d: number, rotation = 0) => {
    drawMesh(buffer, count, multiplyMat4(pv, modelMatrixRotY(x, y, z, w, h, d, rotation)));
  };

  const drawCar = (buffer: WebGLBuffer, pv: Float32Array, x: number, z: number, dim: { width: number; height: number; length: number }) => {
    drawBox(buffer, 36, pv, x, dim.height * 0.38, z, dim.width, dim.height * 0.76, dim.length);
    drawBox(glassBuffer, 36, pv, x, dim.height * 0.86, z - dim.length * 0.12, dim.width * 0.64, dim.height * 0.48, dim.length * 0.38);
  };

  const changeLane = (direction: number) => {
    targetLane = clampNumber(targetLane + direction, 0, highwaySpec.laneCount - 1);
  };

  const onKeyDown = (event: KeyboardEvent) => {
    const key = event.key.toLowerCase();
    if (key === "arrowleft" || key === "a") {
      event.preventDefault();
      changeLane(-1);
    }
    if (key === "arrowright" || key === "d") {
      event.preventDefault();
      changeLane(1);
    }
  };

  const onLaneEvent = (event: Event) => {
    changeLane(Math.sign((event as CustomEvent<number>).detail));
  };

  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("webgl-highway-lane", onLaneEvent);

  const frame = (now: number) => {
    resizeCanvasToDisplay(canvas, gl);
    const dt = Math.min(0.05, (now - last) / 1000 || 0.016);
    last = now;
    speed = Math.min(34, speed + dt * 0.42);
    distance += speed * dt;
    score = Math.floor(distance);
    playerX += (laneCenter(targetLane) - playerX) * Math.min(1, dt * 8.5);

    const eye: Vec3 = [playerX * 0.35, 9.5, -48];
    const center: Vec3 = [playerX * 0.18, 2.4, 48];
    const projection = perspective(Math.PI / 3.15, canvas.width / Math.max(1, canvas.height), 0.1, 520);
    const view = lookAt(eye, center, [0, 1, 0]);
    const pv = multiplyMat4(projection, view);

    gl.clearColor(0.08, 0.12, 0.11, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    gl.disable(gl.CULL_FACE);
    gl.useProgram(program);

    drawMesh(surfaceBuffer, surface.length / 6, pv);
    buildings.forEach((building) => {
      drawBox(buildingBuffer, 36, pv, building.x, building.h / 2, building.z, building.w, building.h, building.d, building.rotation);
    });

    let collision = false;
    let nearby = 0;
    let drawnObstacles = 0;
    obstacles.forEach((obstacle) => {
      const z = highwaySpec.roadEnd - ((distance * obstacle.speedFactor + obstacle.offset) % roadSpan);
      const x = laneCenter(obstacle.lane);
      const dim = getHighwayObstacleDimensions(obstacle.kind);
      const buffer = obstacle.kind === "bus" ? busBuffer : obstacle.kind === "truck" ? truckBuffer : sedanBuffer;
      if (z > highwaySpec.roadStart - 10 && z < highwaySpec.roadEnd + 12) {
        drawCar(buffer, pv, x, z, dim);
        drawnObstacles += 1;
      }
      if (Math.abs(z - highwaySpec.playerZ) < 28) nearby += 1;
      if (intersectsXZ(playerX, highwaySpec.playerZ, highwaySpec.playerCar.width, highwaySpec.playerCar.length, x, z, dim.width, dim.length)) {
        collision = true;
        lastCollisionAt = now;
      }
    });

    drawCar(playerBuffer, pv, playerX, highwaySpec.playerZ, highwaySpec.playerCar);

    frames += 1;
    elapsed += dt * 1000;
    if (elapsed >= 400) {
      const collisionVisible = now - lastCollisionAt < 900;
      setMetrics({
        fps: Math.round(1000 / (elapsed / frames)),
        primary: `${Math.round(speed)} m/s`,
        secondary: `${targetLane + 1}/${highwaySpec.laneCount}`,
        tertiary: score.toString(),
        status: collision || collisionVisible
          ? "Collision check triggered by overlapping vehicle bounds."
          : `${drawnObstacles} moving vehicles, ${nearby} nearby; buildings face both sides of a ${roadWidth.toFixed(1)}m road.`
      });
      frames = 0;
      elapsed = 0;
    }

    animation = requestAnimationFrame(frame);
  };

  animation = requestAnimationFrame(frame);
  return () => {
    window.removeEventListener("keydown", onKeyDown);
    window.removeEventListener("webgl-highway-lane", onLaneEvent);
    cancelAnimationFrame(animation);
  };
}

function createPipelineRenderer({ canvas, pipelineMode, load, setMetrics }: RendererOptions): Cleanup {
  const gl = canvas.getContext("webgl", { antialias: true, alpha: false, powerPreference: "high-performance" });
  if (!gl) {
    setMetrics({ ...initialMetrics, status: "WebGL is unavailable in this browser" });
    return () => undefined;
  }

  const program = createProgram(gl, `
    attribute vec2 aBase;
    attribute vec2 aCpu;
    attribute float aLane;
    uniform float uTime;
    uniform float uGpuMode;
    uniform float uPointSize;
    varying float vHeat;

    vec2 gpuPosition(vec2 base, float lane) {
      float wave = sin(base.x * 9.0 + uTime * 1.65 + lane * 0.7);
      float cross = cos(base.y * 7.0 - uTime * 1.2 + lane * 0.4);
      float orbit = sin(uTime * 0.45 + lane) * 0.018;
      return base + vec2(cross, wave) * 0.055 + vec2(orbit * base.y, -orbit * base.x);
    }

    void main() {
      vec2 gpu = gpuPosition(aBase, aLane);
      vec2 pos = mix(aCpu, gpu, uGpuMode);
      vHeat = 0.55 + 0.45 * sin(uTime * 2.0 + aLane + aBase.x * 6.0);
      gl_Position = vec4(pos, 0.0, 1.0);
      gl_PointSize = uPointSize + vHeat * 1.8;
    }
  `, `
    precision mediump float;
    varying float vHeat;
    void main() {
      vec2 p = gl_PointCoord - vec2(0.5);
      float d = length(p);
      if (d > 0.5) discard;
      vec3 cool = vec3(0.18, 0.56, 0.44);
      vec3 warm = vec3(0.78, 0.42, 0.30);
      vec3 color = mix(cool, warm, vHeat);
      gl_FragColor = vec4(color, smoothstep(0.5, 0.16, d));
    }
  `);

  const base = new Float32Array(load * 2);
  const cpu = new Float32Array(load * 2);
  const lanes = new Float32Array(load);
  let written = 0;
  let attempt = 0;
  while (written < load) {
    const row = Math.floor(attempt / 240);
    const col = attempt % 240;
    const x = -0.94 + col * (1.88 / 239);
    const y = -0.78 + row * (1.56 / 170);
    attempt += 1;
    const isQuad = Math.abs(x) < 0.22 && Math.abs(y) < 0.18;
    const isWalk = Math.abs(x) < 0.045 || Math.abs(y - 0.38) < 0.045 || Math.abs(y + 0.38) < 0.045;
    if ((x * x * 0.72 + y * y > 0.94 || isQuad || isWalk) && attempt < load * 10) continue;
    const i = written * 2;
    base[i] = x + (Math.random() - 0.5) * 0.005;
    base[i + 1] = y + (Math.random() - 0.5) * 0.005;
    cpu[i] = base[i];
    cpu[i + 1] = base[i + 1];
    lanes[written] = (written % 13) / 13;
    written += 1;
  }

  const baseBuffer = fillBuffer(gl, base, gl.STATIC_DRAW);
  const cpuBuffer = fillBuffer(gl, cpu, gl.DYNAMIC_DRAW);
  const laneBuffer = fillBuffer(gl, lanes, gl.STATIC_DRAW);
  const locations = {
    base: gl.getAttribLocation(program, "aBase"),
    cpu: gl.getAttribLocation(program, "aCpu"),
    lane: gl.getAttribLocation(program, "aLane"),
    time: gl.getUniformLocation(program, "uTime"),
    gpuMode: gl.getUniformLocation(program, "uGpuMode"),
    pointSize: gl.getUniformLocation(program, "uPointSize")
  };

  let animation = 0;
  let last = performance.now();
  let frames = 0;
  let elapsed = 0;

  const updateCpu = (time: number) => {
    const t = time * 0.001;
    for (let i = 0; i < load; i += 1) {
      const p = i * 2;
      const x = base[p];
      const y = base[p + 1];
      const lane = lanes[i];
      const wave = Math.sin(x * 9 + t * 1.65 + lane * 0.7);
      const cross = Math.cos(y * 7 - t * 1.2 + lane * 0.4);
      const orbit = Math.sin(t * 0.45 + lane) * 0.018;
      cpu[p] = x + cross * 0.055 + orbit * y;
      cpu[p + 1] = y + wave * 0.055 - orbit * x;
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, cpuBuffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, cpu);
  };

  const frame = (now: number) => {
    const frameStart = performance.now();
    resizeCanvasToDisplay(canvas, gl);
    if (pipelineMode === "cpu") updateCpu(now);
    const jsCost = performance.now() - frameStart;

    gl.clearColor(0.09, 0.13, 0.12, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(program);
    bindAttribute(gl, baseBuffer, locations.base, 2);
    bindAttribute(gl, cpuBuffer, locations.cpu, 2);
    bindAttribute(gl, laneBuffer, locations.lane, 1);
    gl.uniform1f(locations.time, now * 0.001);
    gl.uniform1f(locations.gpuMode, pipelineMode === "gpu" ? 1 : 0);
    gl.uniform1f(locations.pointSize, Math.max(2.1, Math.min(canvas.width, canvas.height) / 360));
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.drawArrays(gl.POINTS, 0, load);

    frames += 1;
    elapsed += now - last;
    last = now;
    if (elapsed >= 400) {
      setMetrics({
        fps: Math.round(1000 / (elapsed / frames)),
        primary: load.toLocaleString(),
        secondary: `${jsCost.toFixed(1)}ms`,
        tertiary: "1",
        status: pipelineMode === "gpu"
          ? "JavaScript sends buffers; the vertex shader animates points in parallel."
          : "JavaScript recalculates vertices before WebGL draws the frame."
      });
      frames = 0;
      elapsed = 0;
    }

    animation = requestAnimationFrame(frame);
  };

  animation = requestAnimationFrame(frame);
  return () => cancelAnimationFrame(animation);
}

function createCityRenderer({ canvas, setMetrics }: RendererOptions): Cleanup {
  const gl = canvas.getContext("webgl", { antialias: true, alpha: false });
  if (!gl) {
    setMetrics({ ...initialMetrics, status: "WebGL is unavailable in this browser" });
    return () => undefined;
  }

  const program = createProgram(gl, `
    attribute vec3 aPosition;
    attribute vec3 aColor;
    uniform mat4 uMvp;
    varying vec3 vColor;
    void main() {
      vColor = aColor;
      gl_Position = uMvp * vec4(aPosition, 1.0);
    }
  `, `
    precision mediump float;
    varying vec3 vColor;
    void main() {
      gl_FragColor = vec4(vColor, 1.0);
    }
  `);

  const cube = new Float32Array(createCubeVertices());
  const cubeBuffer = fillBuffer(gl, cube, gl.STATIC_DRAW);
  const buildings = createBuildings();
  let animation = 0;
  let last = performance.now();
  let frames = 0;
  let elapsed = 0;

  const frame = (now: number) => {
    resizeCanvasToDisplay(canvas, gl);
    const t = now * 0.00018;
    const camX = Math.sin(t) * 240;
    const camZ = Math.cos(t) * 240;
    const eye: Vec3 = [camX, 115 + Math.sin(t * 1.3) * 18, camZ];
    const center: Vec3 = [Math.sin(t + 1.2) * 40, 18, Math.cos(t + 0.8) * 40];
    const forward = normalize([center[0] - eye[0], center[1] - eye[1], center[2] - eye[2]]);
    const projection = perspective(Math.PI / 3, canvas.width / Math.max(1, canvas.height), 0.1, 1200);
    const view = lookAt(eye, center, [0, 1, 0]);
    const pv = multiplyMat4(projection, view);

    gl.clearColor(0.1, 0.14, 0.13, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.useProgram(program);
    bindInterleaved(gl, cubeBuffer, gl.getAttribLocation(program, "aPosition"), gl.getAttribLocation(program, "aColor"));

    let visible = 0;
    let culled = 0;
    for (const b of buildings) {
      const toBuilding = [b.x - eye[0], b.y - eye[1], b.z - eye[2]] as Vec3;
      const distance = length(toBuilding);
      const dot = dot3(normalize(toBuilding), forward);
      if (distance > 390 || dot < 0.34) {
        culled += 1;
        continue;
      }
      visible += 1;
      const model = modelMatrix(b.x, b.y, b.z, b.w, b.h, b.d);
      gl.uniformMatrix4fv(gl.getUniformLocation(program, "uMvp"), false, multiplyMat4(pv, model));
      gl.drawArrays(gl.TRIANGLES, 0, cube.length / 6);
    }

    frames += 1;
    elapsed += now - last;
    last = now;
    if (elapsed >= 400) {
      setMetrics({
        fps: Math.round(1000 / (elapsed / frames)),
        primary: visible.toString(),
        secondary: culled.toString(),
        tertiary: Math.max(4, Math.round(visible / 18)).toString(),
        status: "View-frustum filtering keeps the visible working set smaller than the full city."
      });
      frames = 0;
      elapsed = 0;
    }
    animation = requestAnimationFrame(frame);
  };

  animation = requestAnimationFrame(frame);
  return () => cancelAnimationFrame(animation);
}

function createSituationRenderer({ canvas, miniMap, layerCount, setMetrics }: RendererOptions): Cleanup {
  const gl = canvas.getContext("webgl", { antialias: true, alpha: false });
  if (!gl) {
    setMetrics({ ...initialMetrics, status: "WebGL is unavailable in this browser" });
    return () => undefined;
  }

  const terrainProgram = createProgram(gl, `
    attribute vec3 aPosition;
    attribute vec3 aColor;
    uniform mat4 uMvp;
    varying vec3 vColor;
    void main() {
      vColor = aColor;
      gl_Position = uMvp * vec4(aPosition, 1.0);
    }
  `, `
    precision mediump float;
    varying vec3 vColor;
    void main() {
      gl_FragColor = vec4(vColor, 1.0);
    }
  `);

  const pointProgram = createProgram(gl, `
    attribute vec3 aPosition;
    attribute vec3 aColor;
    uniform mat4 uMvp;
    uniform float uSize;
    varying vec3 vColor;
    void main() {
      vColor = aColor;
      gl_Position = uMvp * vec4(aPosition, 1.0);
      gl_PointSize = uSize;
    }
  `, `
    precision mediump float;
    varying vec3 vColor;
    void main() {
      vec2 p = gl_PointCoord - vec2(0.5);
      if (length(p) > 0.5) discard;
      gl_FragColor = vec4(vColor, 1.0);
    }
  `);

  const terrain = new Float32Array(createTerrainVertices());
  const terrainBuffer = fillBuffer(gl, terrain, gl.STATIC_DRAW);
  const pointBuffer = gl.createBuffer();
  if (!pointBuffer) throw new Error("Unable to create point buffer");
  const entities = Array.from({ length: 12 }, (_, i) => ({
    id: `E${String(i + 1).padStart(2, "0")}`,
    phase: i * 0.61,
    radius: 34 + (i % 4) * 13,
    type: i % 4
  }));

  let animation = 0;
  let last = performance.now();
  let frames = 0;
  let elapsed = 0;

  const frame = (now: number) => {
    resizeCanvasToDisplay(canvas, gl);
    const time = now * 0.001;
    const orbit = time * 0.13;
    const eye: Vec3 = [Math.sin(orbit) * 178, 128, Math.cos(orbit) * 178];
    const projection = perspective(Math.PI / 3.2, canvas.width / Math.max(1, canvas.height), 0.1, 620);
    const view = lookAt(eye, [0, 0, 0], [0, 1, 0]);
    const pv = multiplyMat4(projection, view);

    gl.clearColor(0.09, 0.12, 0.14, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);

    if (layerCount >= 1) {
      gl.useProgram(terrainProgram);
      bindInterleaved(gl, terrainBuffer, gl.getAttribLocation(terrainProgram, "aPosition"), gl.getAttribLocation(terrainProgram, "aColor"));
      gl.uniformMatrix4fv(gl.getUniformLocation(terrainProgram, "uMvp"), false, pv);
      gl.drawArrays(gl.TRIANGLES, 0, terrain.length / 6);
    }

    const points: number[] = [];
    const positions = entities.map((entity, i) => {
      const p = entityPosition(entity.phase, entity.radius, time);
      const color = entity.type === 0 ? [0.18, 0.56, 0.42] : entity.type === 1 ? [0.24, 0.47, 0.68] : entity.type === 2 ? [0.78, 0.58, 0.27] : [0.76, 0.3, 0.28];
      points.push(p[0], p[1], p[2], color[0], color[1], color[2]);
      return { id: entity.id, p, color };
    });

    gl.bindBuffer(gl.ARRAY_BUFFER, pointBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(points), gl.DYNAMIC_DRAW);
    gl.useProgram(pointProgram);
    bindInterleaved(gl, pointBuffer, gl.getAttribLocation(pointProgram, "aPosition"), gl.getAttribLocation(pointProgram, "aColor"));
    gl.uniformMatrix4fv(gl.getUniformLocation(pointProgram, "uMvp"), false, pv);
    gl.uniform1f(gl.getUniformLocation(pointProgram, "uSize"), Math.min(22, Math.max(10, canvas.width / 72)));
    gl.drawArrays(gl.POINTS, 0, points.length / 6);

    drawMiniMap(miniMap, positions, layerCount);

    frames += 1;
    elapsed += now - last;
    last = now;
    if (elapsed >= 400) {
      setMetrics({
        fps: Math.round(1000 / (elapsed / frames)),
        primary: entities.length.toString(),
        secondary: String(Math.round(92 + Math.sin(time) * 14 + layerCount * 7)),
        tertiary: layerCount.toString(),
        status: "The 3D view, 2D map, layers, and replay clock are driven from the same simulated state."
      });
      frames = 0;
      elapsed = 0;
    }

    animation = requestAnimationFrame(frame);
  };

  animation = requestAnimationFrame(frame);
  return () => cancelAnimationFrame(animation);
}

function drawMiniMap(canvas: HTMLCanvasElement | null, entities: Array<{ id: string; p: Vec3; color: number[] }>, layerCount: number) {
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const width = Math.floor(canvas.clientWidth * dpr);
  const height = Math.floor(canvas.clientHeight * dpr);
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#101815";
  ctx.fillRect(0, 0, width, height);
  ctx.strokeStyle = "rgba(248,245,238,0.16)";
  ctx.lineWidth = 1;
  for (let i = 1; i < 4; i += 1) {
    ctx.beginPath();
    ctx.moveTo((width / 4) * i, 0);
    ctx.lineTo((width / 4) * i, height);
    ctx.moveTo(0, (height / 4) * i);
    ctx.lineTo(width, (height / 4) * i);
    ctx.stroke();
  }
  if (layerCount >= 2) {
    ctx.strokeStyle = "rgba(47,143,111,0.38)";
    [0.28, 0.42, 0.58].forEach((r) => {
      ctx.beginPath();
      ctx.arc(width * 0.5, height * 0.5, Math.min(width, height) * r, 0, Math.PI * 2);
      ctx.stroke();
    });
  }
  entities.forEach(({ id, p, color }) => {
    const x = ((p[0] + 90) / 180) * width;
    const y = ((p[2] + 90) / 180) * height;
    ctx.fillStyle = `rgb(${Math.round(color[0] * 255)}, ${Math.round(color[1] * 255)}, ${Math.round(color[2] * 255)})`;
    ctx.beginPath();
    ctx.arc(x, y, 4 * dpr, 0, Math.PI * 2);
    ctx.fill();
    if (layerCount >= 5) {
      ctx.fillStyle = "#fffdf8";
      ctx.font = `${9 * dpr}px Avenir Next, sans-serif`;
      ctx.fillText(id, x + 7 * dpr, y - 6 * dpr);
    }
  });
}

type Vec3 = [number, number, number];

function createProgram(gl: WebGLRenderingContext, vertexSource: string, fragmentSource: string): WebGLProgram {
  const program = gl.createProgram();
  if (!program) throw new Error("Unable to create WebGL program");
  gl.attachShader(program, compileShader(gl, gl.VERTEX_SHADER, vertexSource));
  gl.attachShader(program, compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource));
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(program) ?? "Unable to link WebGL program");
  }
  return program;
}

function compileShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader {
  const shader = gl.createShader(type);
  if (!shader) throw new Error("Unable to create WebGL shader");
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(shader) ?? "Unable to compile WebGL shader");
  }
  return shader;
}

function fillBuffer(gl: WebGLRenderingContext, data: Float32Array, usage: number): WebGLBuffer {
  const buffer = gl.createBuffer();
  if (!buffer) throw new Error("Unable to create WebGL buffer");
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, data, usage);
  return buffer;
}

function bindAttribute(gl: WebGLRenderingContext, buffer: WebGLBuffer, location: number, size: number) {
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.enableVertexAttribArray(location);
  gl.vertexAttribPointer(location, size, gl.FLOAT, false, 0, 0);
}

function bindInterleaved(gl: WebGLRenderingContext, buffer: WebGLBuffer, positionLocation: number, colorLocation: number) {
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 24, 0);
  gl.enableVertexAttribArray(colorLocation);
  gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 24, 12);
}

function resizeCanvasToDisplay(canvas: HTMLCanvasElement, gl: WebGLRenderingContext) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const width = Math.max(1, Math.floor(canvas.clientWidth * dpr));
  const height = Math.max(1, Math.floor(canvas.clientHeight * dpr));
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }
  gl.viewport(0, 0, canvas.width, canvas.height);
}

function createCubeVertices(): number[] {
  const faces = [
    [[-0.5, -0.5, 0.5], [0.5, -0.5, 0.5], [0.5, 0.5, 0.5], [-0.5, 0.5, 0.5], [0.76, 0.43, 0.32]],
    [[0.5, -0.5, -0.5], [-0.5, -0.5, -0.5], [-0.5, 0.5, -0.5], [0.5, 0.5, -0.5], [0.23, 0.48, 0.42]],
    [[-0.5, 0.5, 0.5], [0.5, 0.5, 0.5], [0.5, 0.5, -0.5], [-0.5, 0.5, -0.5], [0.93, 0.82, 0.58]],
    [[-0.5, -0.5, -0.5], [0.5, -0.5, -0.5], [0.5, -0.5, 0.5], [-0.5, -0.5, 0.5], [0.13, 0.2, 0.18]],
    [[0.5, -0.5, 0.5], [0.5, -0.5, -0.5], [0.5, 0.5, -0.5], [0.5, 0.5, 0.5], [0.24, 0.44, 0.62]],
    [[-0.5, -0.5, -0.5], [-0.5, -0.5, 0.5], [-0.5, 0.5, 0.5], [-0.5, 0.5, -0.5], [0.2, 0.55, 0.41]]
  ] as Array<[number[], number[], number[], number[], number[]]>;
  const out: number[] = [];
  faces.forEach(([a, b, c, d, color]) => {
    [a, b, c, a, c, d].forEach((p) => out.push(p[0], p[1], p[2], color[0], color[1], color[2]));
  });
  return out;
}

function createBoxVertices(color: Vec3, topColor = shadeColor(color, 1.12)): number[] {
  const faces = [
    { corners: [[-0.5, -0.5, 0.5], [0.5, -0.5, 0.5], [0.5, 0.5, 0.5], [-0.5, 0.5, 0.5]], color: shadeColor(color, 1.04) },
    { corners: [[0.5, -0.5, -0.5], [-0.5, -0.5, -0.5], [-0.5, 0.5, -0.5], [0.5, 0.5, -0.5]], color: shadeColor(color, 0.78) },
    { corners: [[-0.5, 0.5, 0.5], [0.5, 0.5, 0.5], [0.5, 0.5, -0.5], [-0.5, 0.5, -0.5]], color: topColor },
    { corners: [[-0.5, -0.5, -0.5], [0.5, -0.5, -0.5], [0.5, -0.5, 0.5], [-0.5, -0.5, 0.5]], color: shadeColor(color, 0.5) },
    { corners: [[0.5, -0.5, 0.5], [0.5, -0.5, -0.5], [0.5, 0.5, -0.5], [0.5, 0.5, 0.5]], color: shadeColor(color, 0.9) },
    { corners: [[-0.5, -0.5, -0.5], [-0.5, -0.5, 0.5], [-0.5, 0.5, 0.5], [-0.5, 0.5, -0.5]], color: shadeColor(color, 0.84) }
  ] as Array<{ corners: Vec3[]; color: Vec3 }>;
  const out: number[] = [];
  faces.forEach(({ corners, color: faceColor }) => {
    [corners[0], corners[1], corners[2], corners[0], corners[2], corners[3]].forEach((p) => {
      out.push(p[0], p[1], p[2], faceColor[0], faceColor[1], faceColor[2]);
    });
  });
  return out;
}

function shadeColor(color: Vec3, factor: number): Vec3 {
  return [
    Math.min(1, color[0] * factor),
    Math.min(1, color[1] * factor),
    Math.min(1, color[2] * factor)
  ];
}

function createHighwaySurfaceVertices(): number[] {
  const out: number[] = [];
  const laneAreaWidth = highwaySpec.laneWidth * highwaySpec.laneCount;
  const laneHalf = laneAreaWidth / 2;
  const roadHalf = laneHalf + highwaySpec.shoulderWidth;
  pushQuadXZ(out, -82, highwaySpec.roadStart, 82, highwaySpec.roadEnd, -0.08, [0.1, 0.18, 0.14]);
  pushQuadXZ(out, -roadHalf, highwaySpec.roadStart, roadHalf, highwaySpec.roadEnd, 0, [0.12, 0.12, 0.11]);
  pushQuadXZ(out, -laneHalf, highwaySpec.roadStart, laneHalf, highwaySpec.roadEnd, 0.01, [0.065, 0.07, 0.07]);
  pushQuadXZ(out, -roadHalf, highwaySpec.roadStart, -laneHalf, highwaySpec.roadEnd, 0.02, [0.15, 0.14, 0.12]);
  pushQuadXZ(out, laneHalf, highwaySpec.roadStart, roadHalf, highwaySpec.roadEnd, 0.02, [0.15, 0.14, 0.12]);
  [-laneHalf, laneHalf].forEach((x) => {
    pushQuadXZ(out, x - 0.08, highwaySpec.roadStart, x + 0.08, highwaySpec.roadEnd, 0.035, [0.9, 0.82, 0.5]);
  });
  [-highwaySpec.laneWidth / 2, highwaySpec.laneWidth / 2].forEach((x) => {
    for (let z = highwaySpec.roadStart + 6; z < highwaySpec.roadEnd; z += 13) {
      pushQuadXZ(out, x - 0.06, z, x + 0.06, z + 6.2, 0.04, [0.95, 0.88, 0.58]);
    }
  });
  for (let z = highwaySpec.roadStart + 8; z < highwaySpec.roadEnd; z += 24) {
    pushQuadXZ(out, -72, z, -68, z + 10, 0, [0.14, 0.28, 0.2]);
    pushQuadXZ(out, 68, z + 8, 72, z + 18, 0, [0.14, 0.28, 0.2]);
  }
  return out;
}

function pushQuadXZ(out: number[], x1: number, z1: number, x2: number, z2: number, y: number, color: Vec3) {
  const vertices: Vec3[] = [
    [x1, y, z1],
    [x2, y, z1],
    [x2, y, z2],
    [x1, y, z1],
    [x2, y, z2],
    [x1, y, z2]
  ];
  vertices.forEach((p) => out.push(p[0], p[1], p[2], color[0], color[1], color[2]));
}

function createHighwayBuildings(): HighwayBuilding[] {
  const buildings: HighwayBuilding[] = [];
  const laneAreaWidth = highwaySpec.laneWidth * highwaySpec.laneCount;
  const roadHalf = laneAreaWidth / 2 + highwaySpec.shoulderWidth;
  for (let i = 0; i < 19; i += 1) {
    [-1, 1].forEach((side) => {
      const seed = i * 7 + side * 19;
      const w = 7 + hash(seed, 2) * 9;
      const d = 14 + hash(seed, 4) * 22;
      const h = 8 + Math.pow(hash(seed, 6), 1.45) * 34;
      const rotation = hash(seed, 8) > 0.76 ? Math.PI / 2 : 0;
      const xFootprint = rotation === 0 ? w : d;
      const setback = 11 + hash(seed, 10) * 7;
      buildings.push({
        x: side * (roadHalf + setback + xFootprint / 2),
        z: highwaySpec.roadStart + 18 + i * 18 + (hash(seed, 12) - 0.5) * 7,
        w,
        h,
        d,
        rotation
      });
    });
  }
  return buildings;
}

function createHighwayObstacles(): HighwayObstacle[] {
  const lanes = [0, 2, 1, 0, 2, 1, 2, 0, 0, 2, 0, 1];
  return lanes.map((lane, i) => ({
    lane,
    offset: 18 + i * 31 + hash(i, 17) * 12,
    kind: i % 6 === 2 ? "truck" : i % 7 === 4 ? "bus" : "sedan",
    speedFactor: 0.72 + hash(i, 23) * 0.42
  }));
}

function laneCenter(lane: number) {
  return (lane - 1) * highwaySpec.laneWidth;
}

function getHighwayObstacleDimensions(kind: HighwayObstacle["kind"]) {
  if (kind === "bus") return highwaySpec.bus;
  if (kind === "truck") return highwaySpec.truck;
  return highwaySpec.sedan;
}

function intersectsXZ(ax: number, az: number, aw: number, al: number, bx: number, bz: number, bw: number, bl: number) {
  return Math.abs(ax - bx) < (aw + bw) * 0.45 && Math.abs(az - bz) < (al + bl) * 0.45;
}

function clampNumber(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function createBuildings() {
  const buildings: Array<{ x: number; y: number; z: number; w: number; h: number; d: number }> = [];
  for (let gx = -18; gx <= 18; gx += 1) {
    for (let gz = -18; gz <= 18; gz += 1) {
      const r = hash(gx, gz);
      if (r < 0.2) continue;
      const x = gx * 15 + (hash(gx + 8, gz) - 0.5) * 6;
      const z = gz * 15 + (hash(gx, gz + 11) - 0.5) * 6;
      const h = 8 + Math.pow(hash(gx + 4, gz + 6), 2.0) * 75;
      buildings.push({
        x,
        z,
        y: h / 2 - 18,
        w: 5 + hash(gx + 2, gz + 3) * 8,
        h,
        d: 5 + hash(gx + 5, gz + 7) * 8
      });
    }
  }
  return buildings;
}

function createTerrainVertices(): number[] {
  const out: number[] = [];
  const size = 104;
  const step = 8;
  for (let x = -size; x < size; x += step) {
    for (let z = -size; z < size; z += step) {
      pushTerrainVertex(out, x, z);
      pushTerrainVertex(out, x + step, z);
      pushTerrainVertex(out, x + step, z + step);
      pushTerrainVertex(out, x, z);
      pushTerrainVertex(out, x + step, z + step);
      pushTerrainVertex(out, x, z + step);
    }
  }
  return out;
}

function pushTerrainVertex(out: number[], x: number, z: number) {
  const y = Math.sin(x * 0.06) * 5 + Math.cos(z * 0.045) * 4 + Math.sin((x + z) * 0.025) * 3;
  const green = 0.48 + y * 0.018;
  const ridge = Math.max(0, y) * 0.018;
  out.push(x, y - 8, z, 0.22 + ridge, Math.max(0.38, green), 0.3 + ridge);
}

function entityPosition(phase: number, radius: number, time: number): Vec3 {
  const a = time * (0.28 + (phase % 0.2)) + phase;
  return [
    Math.cos(a) * radius + Math.sin(time * 0.11 + phase) * 8,
    9 + Math.sin(a * 1.7) * 3,
    Math.sin(a * 0.8) * radius * 0.72
  ];
}

function hash(x: number, z: number) {
  return fract(Math.sin(x * 127.1 + z * 311.7) * 43758.5453123);
}

function fract(v: number) {
  return v - Math.floor(v);
}

function perspective(fov: number, aspect: number, near: number, far: number): Float32Array {
  const f = 1 / Math.tan(fov / 2);
  const nf = 1 / (near - far);
  return new Float32Array([
    f / aspect, 0, 0, 0,
    0, f, 0, 0,
    0, 0, (far + near) * nf, -1,
    0, 0, (2 * far * near) * nf, 0
  ]);
}

function lookAt(eye: Vec3, center: Vec3, up: Vec3): Float32Array {
  const z = normalize([eye[0] - center[0], eye[1] - center[1], eye[2] - center[2]]);
  const x = normalize(cross(up, z));
  const y = cross(z, x);
  return new Float32Array([
    x[0], y[0], z[0], 0,
    x[1], y[1], z[1], 0,
    x[2], y[2], z[2], 0,
    -dot3(x, eye), -dot3(y, eye), -dot3(z, eye), 1
  ]);
}

function modelMatrix(x: number, y: number, z: number, sx: number, sy: number, sz: number): Float32Array {
  return new Float32Array([
    sx, 0, 0, 0,
    0, sy, 0, 0,
    0, 0, sz, 0,
    x, y, z, 1
  ]);
}

function modelMatrixRotY(x: number, y: number, z: number, sx: number, sy: number, sz: number, rotation: number): Float32Array {
  const c = Math.cos(rotation);
  const s = Math.sin(rotation);
  return new Float32Array([
    c * sx, 0, -s * sx, 0,
    0, sy, 0, 0,
    s * sz, 0, c * sz, 0,
    x, y, z, 1
  ]);
}

function projectPoint(point: Vec3, matrix: Float32Array): Vec3 | null {
  const x = point[0];
  const y = point[1];
  const z = point[2];
  const clipX = matrix[0] * x + matrix[4] * y + matrix[8] * z + matrix[12];
  const clipY = matrix[1] * x + matrix[5] * y + matrix[9] * z + matrix[13];
  const clipZ = matrix[2] * x + matrix[6] * y + matrix[10] * z + matrix[14];
  const clipW = matrix[3] * x + matrix[7] * y + matrix[11] * z + matrix[15];
  if (clipW <= 0.001) return null;
  return [clipX / clipW, clipY / clipW, clipZ / clipW];
}

function multiplyMat4(a: Float32Array, b: Float32Array): Float32Array {
  const out = new Float32Array(16);
  for (let row = 0; row < 4; row += 1) {
    for (let col = 0; col < 4; col += 1) {
      out[col * 4 + row] =
        a[0 * 4 + row] * b[col * 4 + 0] +
        a[1 * 4 + row] * b[col * 4 + 1] +
        a[2 * 4 + row] * b[col * 4 + 2] +
        a[3 * 4 + row] * b[col * 4 + 3];
    }
  }
  return out;
}

function normalize(v: Vec3): Vec3 {
  const len = length(v) || 1;
  return [v[0] / len, v[1] / len, v[2] / len];
}

function length(v: Vec3): number {
  return Math.hypot(v[0], v[1], v[2]);
}

function dot3(a: Vec3, b: Vec3): number {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

function cross(a: Vec3, b: Vec3): Vec3 {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0]
  ];
}
