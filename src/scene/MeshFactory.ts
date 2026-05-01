import {
  Mesh,
  MeshBuilder,
  Scene,
  TransformNode,
  Vector3,
  VertexData
} from "../core/Babylon";
import type { EnemyKind, PickupKind } from "../types/GameTypes";
import type { GameMaterials } from "./Materials";

// ─── PLAYER PAPER PLANE ─────────────────────────────────────────────────────
// Super-detailed paper plane: main body, left/right wings with fold crease,
// rear tail fins, and a graphite nose tip.
export function createPaperPlaneMesh(scene: Scene, materials: GameMaterials): TransformNode {
  const root = new TransformNode("player.paperPlane.root", scene);

  // Main fuselage (custom vertex shape)
  const body = new Mesh("player.paperPlane.body", scene);
  const positions = [
    0, 0, 1.9,       // 0 nose tip
    -1.8, 0, -0.6,   // 1 left wing tip
    0, 0.18, -0.1,   // 2 spine ridge center-front
    1.8, 0, -0.6,    // 3 right wing tip
    0, -0.22, -1.2,  // 4 belly rear
    -0.42, 0.08, -0.5, // 5 left crease inner
    0.42, 0.08, -0.5,  // 6 right crease inner
    -0.9, 0, -1.0,   // 7 left tail
    0.9, 0, -1.0,    // 8 right tail
    0, 0.14, -1.3,   // 9 spine ridge rear
  ];
  const indices = [
    0, 1, 2,  0, 2, 3,  // upper face
    0, 5, 1,  0, 3, 6,  // under-wing diagonals
    1, 4, 2,  2, 4, 3,  // belly faces
    5, 4, 1,  3, 4, 6,  // belly side
    2, 5, 6,            // spine ridge
    1, 7, 4,  3, 4, 8,  // tail reach
    7, 9, 4,  4, 9, 8,  // tail lower
    2, 9, 5,  2, 6, 9,  // tail upper
  ];
  const normals: number[] = [];
  VertexData.ComputeNormals(positions, indices, normals);
  const vd = new VertexData();
  vd.positions = positions;
  vd.indices = indices;
  vd.normals = normals;
  vd.applyToMesh(body);
  body.material = materials.paper;
  body.parent = root;

  // Left wing fold crease (thin sliver giving depth)
  const leftCrease = MeshBuilder.CreateBox("player.paperPlane.crease.left", { width: 0.04, height: 0.4, depth: 1.2 }, scene);
  leftCrease.position.set(-0.55, 0.08, -0.45);
  leftCrease.rotation.z = 0.22;
  leftCrease.material = materials.paperDamaged;
  leftCrease.parent = root;

  // Right wing fold crease
  const rightCrease = MeshBuilder.CreateBox("player.paperPlane.crease.right", { width: 0.04, height: 0.4, depth: 1.2 }, scene);
  rightCrease.position.set(0.55, 0.08, -0.45);
  rightCrease.rotation.z = -0.22;
  rightCrease.material = materials.paperDamaged;
  rightCrease.parent = root;

  // Left tail fin
  const leftFin = MeshBuilder.CreateCylinder("player.paperPlane.fin.left", {
    height: 0.7, diameterTop: 0, diameterBottom: 0.5, tessellation: 3
  }, scene);
  leftFin.position.set(-0.45, 0.28, -1.1);
  leftFin.rotation.z = 0.28;
  leftFin.rotation.x = Math.PI / 2;
  leftFin.material = materials.paper;
  leftFin.parent = root;

  // Right tail fin
  const rightFin = MeshBuilder.CreateCylinder("player.paperPlane.fin.right", {
    height: 0.7, diameterTop: 0, diameterBottom: 0.5, tessellation: 3
  }, scene);
  rightFin.position.set(0.45, 0.28, -1.1);
  rightFin.rotation.z = -0.28;
  rightFin.rotation.x = Math.PI / 2;
  rightFin.material = materials.paper;
  rightFin.parent = root;

  // Graphite nose tip
  const nose = MeshBuilder.CreateCylinder("player.paperPlane.nose", {
    height: 0.18, diameter: 0.14, tessellation: 10
  }, scene);
  nose.rotation.x = Math.PI / 2;
  nose.position.z = 1.95;
  nose.material = materials.graphite;
  nose.parent = root;

  return root;
}

// ─── ENEMY MESHES ────────────────────────────────────────────────────────────
// Each enemy type is distinct: foldling (simple tri), dart (sleek needle),
// glider (wide swept wing + fuselage), boss (massive multi-wing bomber).
export function createEnemyMesh(scene: Scene, materials: GameMaterials, kind: EnemyKind): TransformNode {
  const root = new TransformNode(`enemy.${kind}.root`, scene);
  const mat = kind === "boss" ? materials.boss
    : kind === "glider" ? materials.glider
    : kind === "dart" ? materials.dart
    : materials.foldling;

  if (kind === "foldling") {
    // Simple crumpled triangle shape
    const body = MeshBuilder.CreateBox("enemy.foldling.body", { width: 2.0, height: 0.3, depth: 1.6 }, scene);
    body.material = mat; body.parent = root;
    const wing = MeshBuilder.CreateBox("enemy.foldling.wing", { width: 2.8, height: 0.1, depth: 0.5 }, scene);
    wing.position.z = -0.18; wing.material = mat; wing.parent = root;
    const nose = MeshBuilder.CreateCylinder("enemy.foldling.nose", { height: 0.5, diameterTop: 0, diameterBottom: 0.4, tessellation: 6 }, scene);
    nose.rotation.x = Math.PI / 2; nose.position.z = 0.95; nose.material = materials.graphite; nose.parent = root;

  } else if (kind === "dart") {
    // Long needle-like form with swept back wings
    const fuselage = MeshBuilder.CreateCylinder("enemy.dart.fuselage", { height: 2.8, diameter: 0.38, tessellation: 8 }, scene);
    fuselage.rotation.x = Math.PI / 2; fuselage.material = mat; fuselage.parent = root;
    const nose = MeshBuilder.CreateCylinder("enemy.dart.nose", { height: 0.6, diameterTop: 0, diameterBottom: 0.38, tessellation: 8 }, scene);
    nose.rotation.x = Math.PI / 2; nose.position.z = 1.7; nose.material = materials.graphite; nose.parent = root;
    // Swept wings
    for (let s = -1; s <= 1; s += 2) {
      const wing = MeshBuilder.CreateBox(`enemy.dart.wing.${s}`, { width: 0.1, height: 1.4, depth: 1.0 }, scene);
      wing.position.set(s * 0.8, 0, -0.2); wing.rotation.z = s * 0.45;
      wing.material = mat; wing.parent = root;
    }
    // Tail fins
    for (let s = -1; s <= 1; s += 2) {
      const fin = MeshBuilder.CreateBox(`enemy.dart.fin.${s}`, { width: 0.08, height: 0.6, depth: 0.5 }, scene);
      fin.position.set(s * 0.2, 0.3, -1.1); fin.material = mat; fin.parent = root;
    }

  } else if (kind === "glider") {
    // Wide swept glider — big body, long slender wings
    const body = MeshBuilder.CreateBox("enemy.glider.body", { width: 1.2, height: 0.45, depth: 2.2 }, scene);
    body.material = mat; body.parent = root;
    const nose = MeshBuilder.CreateCylinder("enemy.glider.nose", { height: 0.7, diameterTop: 0, diameterBottom: 0.55, tessellation: 10 }, scene);
    nose.rotation.x = Math.PI / 2; nose.position.z = 1.45; nose.material = materials.graphite; nose.parent = root;
    // Long swept wings
    for (let s = -1; s <= 1; s += 2) {
      const wing = MeshBuilder.CreateBox(`enemy.glider.wing.${s}`, { width: 0.12, height: 3.6, depth: 1.1 }, scene);
      wing.position.set(s * 1.8, 0, -0.1); wing.rotation.z = s * 0.18;
      wing.material = mat; wing.parent = root;
    }
    // Canard (front mini-wing)
    const canard = MeshBuilder.CreateBox("enemy.glider.canard", { width: 0.08, height: 1.4, depth: 0.4 }, scene);
    canard.position.z = 0.9; canard.material = mat; canard.parent = root;
    // Dual tail booms
    for (let s = -1; s <= 1; s += 2) {
      const boom = MeshBuilder.CreateBox(`enemy.glider.boom.${s}`, { width: 0.2, height: 0.2, depth: 1.6 }, scene);
      boom.position.set(s * 0.6, 0, -1.2); boom.material = mat; boom.parent = root;
      const tail = MeshBuilder.CreateBox(`enemy.glider.tail.${s}`, { width: 0.08, height: 0.8, depth: 0.35 }, scene);
      tail.position.set(s * 0.6, 0.4, -1.9); tail.material = mat; tail.parent = root;
    }

  } else if (kind === "boss") {
    // Massive multi-wing kite bomber
    const body = MeshBuilder.CreateBox("enemy.boss.body", { width: 2.0, height: 0.65, depth: 3.4 }, scene);
    body.material = mat; body.parent = root;
    const nose = MeshBuilder.CreateCylinder("enemy.boss.nose", { height: 1.1, diameterTop: 0, diameterBottom: 0.9, tessellation: 10 }, scene);
    nose.rotation.x = Math.PI / 2; nose.position.z = 2.25; nose.material = materials.graphite; nose.parent = root;
    // Three-tier wing system
    const wingSpans = [5.8, 4.0, 2.8];
    const wingZ = [0, 0.4, 0.9];
    for (let i = 0; i < 3; i++) {
      const wing = MeshBuilder.CreateBox(`enemy.boss.wing.${i}`, { width: 0.16, height: wingSpans[i], depth: 0.9 }, scene);
      wing.position.z = wingZ[i] - 0.5; wing.material = mat; wing.parent = root;
    }
    // Engine pods (4x cylinders)
    for (let s = -1; s <= 1; s += 2) {
      for (let i = 0; i < 2; i++) {
        const pod = MeshBuilder.CreateCylinder(`enemy.boss.engine.${s}.${i}`, { height: 1.1, diameter: 0.45, tessellation: 10 }, scene);
        pod.rotation.x = Math.PI / 2; pod.position.set(s * (i === 0 ? 1.6 : 3.0), -0.3, 0.2);
        pod.material = materials.graphite; pod.parent = root;
      }
    }
    // Tail stabilizers
    for (let s = -1; s <= 1; s += 2) {
      const stab = MeshBuilder.CreateBox(`enemy.boss.stab.${s}`, { width: 0.1, height: 1.8, depth: 0.7 }, scene);
      stab.position.set(s * 0.6, 0.4, -1.6); stab.material = mat; stab.parent = root;
    }
  }

  return root;
}

// ─── PROJECTILES ─────────────────────────────────────────────────────────────

// Paper dot: small crumpled sphere with emissive sheen
export function createPaperDotMesh(scene: Scene, materials: GameMaterials): TransformNode {
  const root = new TransformNode("projectile.paperDot.root", scene);
  const dot = MeshBuilder.CreateSphere("projectile.paperDot.mesh", { diameter: 0.44, segments: 6 }, scene);
  dot.material = materials.paperDot;
  dot.parent = root;
  return root;
}

// Enemy ink blob: flattened teardrop
export function createEnemyInkMesh(scene: Scene, materials: GameMaterials): TransformNode {
  const root = new TransformNode("projectile.enemyInk.root", scene);
  const blob = MeshBuilder.CreateSphere("projectile.enemyInk.mesh", { diameter: 0.62, segments: 6 }, scene);
  blob.scaling.set(1, 0.7, 1.3);
  blob.material = materials.enemyInk;
  blob.parent = root;
  return root;
}

// Pencil missile: super-detailed — hex shaft, metallic band, wood tip, eraser cap, two fins
export function createPencilMissileMesh(scene: Scene, materials: GameMaterials): TransformNode {
  const root = new TransformNode("projectile.pencilMissile.root", scene);

  // Yellow hexagonal shaft
  const shaft = MeshBuilder.CreateCylinder("projectile.pencilMissile.shaft", {
    height: 1.7, diameter: 0.22, tessellation: 6
  }, scene);
  shaft.rotation.x = Math.PI / 2;
  shaft.material = materials.pencilYellow;
  shaft.parent = root;

  // Wooden cone tip
  const wood = MeshBuilder.CreateCylinder("projectile.pencilMissile.wood", {
    height: 0.3, diameterTop: 0, diameterBottom: 0.22, tessellation: 6
  }, scene);
  wood.rotation.x = Math.PI / 2;
  wood.position.z = 1.0;
  wood.material = materials.cardboard;
  wood.parent = root;

  // Graphite tip
  const tip = MeshBuilder.CreateCylinder("projectile.pencilMissile.tip", {
    height: 0.2, diameterTop: 0, diameterBottom: 0.1, tessellation: 6
  }, scene);
  tip.rotation.x = Math.PI / 2;
  tip.position.z = 1.22;
  tip.material = materials.graphite;
  tip.parent = root;

  // Metal ferrule band
  const band = MeshBuilder.CreateCylinder("projectile.pencilMissile.band", {
    height: 0.1, diameter: 0.26, tessellation: 8
  }, scene);
  band.rotation.x = Math.PI / 2;
  band.position.z = -0.78;
  band.material = materials.metal;
  band.parent = root;

  // Eraser cap
  const eraser = MeshBuilder.CreateCylinder("projectile.pencilMissile.eraser", {
    height: 0.24, diameter: 0.22, tessellation: 8
  }, scene);
  eraser.rotation.x = Math.PI / 2;
  eraser.position.z = -0.97;
  eraser.material = materials.eraser;
  eraser.parent = root;

  // Two guide fins
  for (let s = -1; s <= 1; s += 2) {
    const fin = MeshBuilder.CreateBox(`projectile.pencilMissile.fin.${s}`, {
      width: 0.04, height: 0.4, depth: 0.5
    }, scene);
    fin.position.set(0, s * 0.2, -0.55);
    fin.material = materials.pencilYellow;
    fin.parent = root;
  }

  return root;
}

// ─── PICKUPS ─────────────────────────────────────────────────────────────────
// Each pickup is visually distinct: health = cross, boost = diamond, missile = star, score = coin.
export function createPickupMesh(scene: Scene, materials: GameMaterials, kind: PickupKind): TransformNode {
  const root = new TransformNode(`pickup.${kind}.root`, scene);
  const mat = kind === "health" ? materials.pickupHealth
    : kind === "boost" ? materials.pickupBoost
    : kind === "missile" ? materials.pickupMissile
    : materials.pickupScore;

  if (kind === "health") {
    // Plus / cross shape from two boxes
    const h = MeshBuilder.CreateBox("pickup.health.h", { width: 1.8, height: 0.4, depth: 0.4 }, scene);
    h.material = mat; h.parent = root;
    const v = MeshBuilder.CreateBox("pickup.health.v", { width: 0.4, height: 0.4, depth: 1.8 }, scene);
    v.material = mat; v.parent = root;
  } else if (kind === "boost") {
    // Diamond octahedron
    const gem = MeshBuilder.CreatePolyhedron("pickup.boost.gem", { type: 1, size: 0.9 }, scene);
    gem.material = mat; gem.parent = root;
  } else if (kind === "missile") {
    // Mini pencil missile silhouette
    const body = MeshBuilder.CreateCylinder("pickup.missile.body", { height: 1.4, diameter: 0.35, tessellation: 6 }, scene);
    body.rotation.x = Math.PI / 2; body.material = mat; body.parent = root;
    const tip = MeshBuilder.CreateCylinder("pickup.missile.tip", { height: 0.3, diameterTop: 0, diameterBottom: 0.35, tessellation: 6 }, scene);
    tip.rotation.x = Math.PI / 2; tip.position.z = 0.85; tip.material = materials.graphite; tip.parent = root;
  } else {
    // Score: spinning coin (flat cylinder)
    const coin = MeshBuilder.CreateCylinder("pickup.score.coin", { height: 0.22, diameter: 1.2, tessellation: 18 }, scene);
    coin.rotation.x = Math.PI / 2;
    coin.material = mat; coin.parent = root;
  }

  return root;
}

// ─── UTILITY ─────────────────────────────────────────────────────────────────
export function setNodeForward(node: TransformNode, direction: Vector3): void {
  const yaw = Math.atan2(direction.x, direction.z);
  const flatLength = Math.hypot(direction.x, direction.z);
  const pitch = Math.atan2(direction.y, flatLength);
  node.rotation = new Vector3(pitch, yaw, 0);
}
