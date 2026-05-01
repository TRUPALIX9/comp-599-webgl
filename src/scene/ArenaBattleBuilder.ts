/**
 * ArenaBattleBuilder — Square arena environment for 1v1 plane vs AI.
 * Contains walls, floor, and richly detailed obstacle props:
 * book, bag, table, desk lamp, pipe, water bottle.
 * All objects are composed of multiple primitives to look convincing at game scale.
 */
import { MeshBuilder, Scene, ShadowGenerator, TransformNode, Vector3 } from "../core/Babylon";
import type { CollisionBody } from "../types/GameTypes";
import type { GameMaterials } from "./Materials";

export interface ArenaBuildResult {
  obstacleBodies: CollisionBody[];
  roots: TransformNode[];
}

/** Half-size of the square arena (units). Full arena = 2 × HALF_SIZE. */
const HALF = 140;

export class ArenaBattleBuilder {
  private readonly bodies: CollisionBody[] = [];
  private readonly roots:  TransformNode[]  = [];

  constructor(
    private readonly scene: Scene,
    private readonly mats:  GameMaterials,
    private readonly shadowGen: ShadowGenerator
  ) {}

  build(): ArenaBuildResult {
    this.createFloor();
    this.createWalls();
    this.placeObstacles();
    return { obstacleBodies: this.bodies, roots: this.roots };
  }

  // ── Floor ─────────────────────────────────────────────────────────────
  private createFloor(): void {
    const floor = MeshBuilder.CreateBox("arena.floor", {
      width: HALF * 2, height: 1, depth: HALF * 2,
    }, this.scene);
    floor.position.set(0, -0.5, 0);
    floor.material = this.mats.mallAsphalt;
    floor.receiveShadows = true;
    floor.freezeWorldMatrix();
  }

  // ── Walls (invisible collision boundary + visible low rim) ─────────────
  private createWalls(): void {
    const wallH = 8;
    const configs = [
      { x: 0,      z: HALF,  w: HALF * 2, d: 4 },  // north
      { x: 0,      z: -HALF, w: HALF * 2, d: 4 },  // south
      { x: HALF,   z: 0,     w: 4, d: HALF * 2 },  // east
      { x: -HALF,  z: 0,     w: 4, d: HALF * 2 },  // west
    ];
    configs.forEach(({ x, z, w, d }, i) => {
      const wall = MeshBuilder.CreateBox(`arena.wall.${i}`, { width: w, height: wallH, depth: d }, this.scene);
      wall.position.set(x, wallH / 2, z);
      wall.material = this.mats.stuccoBeige;
      wall.receiveShadows = true;
      wall.freezeWorldMatrix();
      this.bodies.push({ id: `wall.${i}`, position: new Vector3(x, wallH / 2, z), radius: Math.max(w, d) / 2, kind: "solid", damage: 8 });
    });
  }

  // ── Obstacle placement grid ────────────────────────────────────────────
  private placeObstacles(): void {
    // Positions deliberately spread around the arena interior
    // to create a fun 1v1 navigation challenge
    this.book("obs.book.1",     new Vector3(-60,  0,  50));
    this.book("obs.book.2",     new Vector3( 80,  0, -30));
    this.book("obs.book.3",     new Vector3(-20,  0, -70));

    this.bag("obs.bag.1",       new Vector3( 30,  0,  80));
    this.bag("obs.bag.2",       new Vector3(-90,  0, -50));

    this.table("obs.table.1",   new Vector3(-50,  0, -20));
    this.table("obs.table.2",   new Vector3( 70,  0,  60));

    this.deskLamp("obs.lamp.1", new Vector3(  0,  0,  30));
    this.deskLamp("obs.lamp.2", new Vector3(-80,  0,  80));

    this.pipe("obs.pipe.1",     new Vector3( 50,  0, -60));
    this.pipe("obs.pipe.2",     new Vector3(-30,  0,  100));

    this.waterBottle("obs.bottle.1", new Vector3( 90,  0, -80));
    this.waterBottle("obs.bottle.2", new Vector3(-60,  0,  110));
    this.waterBottle("obs.bottle.3", new Vector3( 20,  0, -100));
  }

  // ══════════════════════════════════════════════════════════════════════
  // DETAILED OBSTACLE BUILDERS
  // ══════════════════════════════════════════════════════════════════════

  /**
   * Book — thick spine, cover pages, slight tilt for character.
   * Built from: main cover box + inner pages box + spine strip.
   */
  private book(id: string, pos: Vector3, scaleY = 1): void {
    const root = this.root(id, pos);

    // Cover (thick outer)
    const cover = MeshBuilder.CreateBox(`${id}.cover`, { width: 10, height: 14, depth: 1.6 }, this.scene);
    cover.rotation.z = 0.12;
    cover.material = this.mats.bookGreen;
    cover.parent = root;
    this.cast(cover);

    // Pages (inner, slightly thinner, lighter)
    const pages = MeshBuilder.CreateBox(`${id}.pages`, { width: 9.2, height: 13.2, depth: 1.1 }, this.scene);
    pages.position.z = -0.18;
    pages.material = this.mats.paper;
    pages.parent = root;
    this.cast(pages);

    // Spine
    const spine = MeshBuilder.CreateBox(`${id}.spine`, { width: 1.2, height: 14, depth: 1.65 }, this.scene);
    spine.position.x = -4.6;
    spine.material = this.mats.graphite;
    spine.parent = root;
    this.cast(spine);

    // Horizontal bookmark ribbon
    const ribbon = MeshBuilder.CreateBox(`${id}.ribbon`, { width: 0.4, height: 18, depth: 0.3 }, this.scene);
    ribbon.position.set(2, -0.5, -0.9);
    ribbon.material = this.mats.eraser;
    ribbon.parent = root;

    this.bodies.push({ id, position: pos.add(new Vector3(0, 7, 0)), radius: 9, kind: "solid", damage: 6 });
  }

  /**
   * School bag (backpack) — rounded body, top handle, two side pockets, shoulder straps.
   */
  private bag(id: string, pos: Vector3): void {
    const root = this.root(id, pos);

    // Main body
    const body = MeshBuilder.CreateBox(`${id}.body`, { width: 14, height: 18, depth: 8 }, this.scene);
    body.position.y = 9;
    body.material = this.mats.mallAsphalt;
    body.parent = root;
    this.cast(body);

    // Rounded top flap
    const flap = MeshBuilder.CreateCylinder(`${id}.flap`, { height: 8, diameter: 14, tessellation: 16 }, this.scene);
    flap.rotation.z = Math.PI / 2;
    flap.position.set(0, 18, 0);
    flap.material = this.mats.mallAsphalt;
    flap.parent = root;
    this.cast(flap);

    // Top carry handle
    const handle = MeshBuilder.CreateTorus(`${id}.handle`, { diameter: 5, thickness: 0.7, tessellation: 12 }, this.scene);
    handle.position.set(0, 22, 0);
    handle.rotation.x = Math.PI / 2;
    handle.material = this.mats.graphite;
    handle.parent = root;

    // Front pocket (smaller flat box)
    const pocket = MeshBuilder.CreateBox(`${id}.pocket`, { width: 10, height: 9, depth: 2.5 }, this.scene);
    pocket.position.set(0, 7, 5.2);
    pocket.material = this.mats.mallAsphalt;
    pocket.parent = root;
    this.cast(pocket);

    // Side pockets (two small boxes)
    for (let s = -1; s <= 1; s += 2) {
      const sp = MeshBuilder.CreateBox(`${id}.sidepocket.${s}`, { width: 2.5, height: 8, depth: 5 }, this.scene);
      sp.position.set(s * 8.2, 7, 0);
      sp.material = this.mats.mallAsphalt;
      sp.parent = root;
      this.cast(sp);
    }

    // Shoulder strap decorations (two thin cylinders)
    for (let s = -1; s <= 1; s += 2) {
      const strap = MeshBuilder.CreateBox(`${id}.strap.${s}`, { width: 1.5, height: 14, depth: 0.8 }, this.scene);
      strap.position.set(s * 4, 9, -4.5);
      strap.material = this.mats.graphite;
      strap.parent = root;
    }

    this.bodies.push({ id, position: pos.add(new Vector3(0, 11, 0)), radius: 11, kind: "solid", damage: 6 });
  }

  /**
   * Desk/table — four detailed legs with cross-braces, a thick surface.
   */
  private table(id: string, pos: Vector3): void {
    const root = this.root(id, pos);
    const W = 30, D = 18, H = 16, legR = 1.2;

    // Table top surface
    const top = MeshBuilder.CreateBox(`${id}.top`, { width: W, height: 1.4, depth: D }, this.scene);
    top.position.y = H + 0.7;
    top.material = this.mats.cardboard;
    top.parent = root;
    this.cast(top);

    // Under-surface apron boards
    for (const [dx, dz, w, d] of [
      [0, D / 2 - 1, W - 4, 1.2],
      [0, -D / 2 + 1, W - 4, 1.2],
      [W / 2 - 1, 0, 1.2, D - 4],
      [-W / 2 + 1, 0, 1.2, D - 4],
    ] as [number, number, number, number][]) {
      const apron = MeshBuilder.CreateBox(`${id}.apron.${dx}.${dz}`, { width: w, height: 2, depth: d }, this.scene);
      apron.position.set(dx, H - 0.5, dz);
      apron.material = this.mats.cardboard;
      apron.parent = root;
    }

    // Four legs
    const legPositions: [number, number][] = [
      [ W / 2 - legR, D / 2 - legR],
      [-W / 2 + legR, D / 2 - legR],
      [ W / 2 - legR, -D / 2 + legR],
      [-W / 2 + legR, -D / 2 + legR],
    ];
    legPositions.forEach(([lx, lz], i) => {
      const leg = MeshBuilder.CreateCylinder(`${id}.leg.${i}`, {
        height: H, diameter: legR * 2, tessellation: 8,
      }, this.scene);
      leg.position.set(lx, H / 2, lz);
      leg.material = this.mats.cardboard;
      leg.parent = root;
      this.cast(leg);
    });

    this.bodies.push({ id, position: pos.add(new Vector3(0, 10, 0)), radius: 18, kind: "solid", damage: 8 });
  }

  /**
   * Desk lamp — weighted base, articulated arm (two segments), lampshade cone.
   */
  private deskLamp(id: string, pos: Vector3): void {
    const root = this.root(id, pos);

    // Heavy circular base
    const base = MeshBuilder.CreateCylinder(`${id}.base`, { height: 1.4, diameter: 7, tessellation: 16 }, this.scene);
    base.position.y = 0.7;
    base.material = this.mats.graphite;
    base.parent = root;
    this.cast(base);

    // Vertical neck post
    const neck = MeshBuilder.CreateCylinder(`${id}.neck`, { height: 10, diameter: 0.9, tessellation: 8 }, this.scene);
    neck.position.y = 6.4;
    neck.material = this.mats.graphite;
    neck.parent = root;
    this.cast(neck);

    // First arm segment (angled)
    const arm1 = MeshBuilder.CreateBox(`${id}.arm1`, { width: 0.8, height: 10, depth: 0.8 }, this.scene);
    arm1.position.set(2, 13, 0);
    arm1.rotation.z = 0.4;
    arm1.material = this.mats.graphite;
    arm1.parent = root;
    this.cast(arm1);

    // Second arm segment
    const arm2 = MeshBuilder.CreateBox(`${id}.arm2`, { width: 0.8, height: 9, depth: 0.8 }, this.scene);
    arm2.position.set(5.5, 18, 0);
    arm2.rotation.z = -0.5;
    arm2.material = this.mats.graphite;
    arm2.parent = root;
    this.cast(arm2);

    // Lampshade (cone/cylinder)
    const shade = MeshBuilder.CreateCylinder(`${id}.shade`, {
      height: 4, diameterTop: 5, diameterBottom: 2, tessellation: 12,
    }, this.scene);
    shade.position.set(8.5, 24, 0);
    shade.rotation.z = Math.PI / 2 + 0.2;
    shade.material = this.mats.pencilYellow;
    shade.parent = root;
    this.cast(shade);

    // Bulb glow sphere
    const bulb = MeshBuilder.CreateSphere(`${id}.bulb`, { diameter: 1.6, segments: 6 }, this.scene);
    bulb.position.set(8.5, 24, 0);
    bulb.material = this.mats.pickupScore;
    bulb.parent = root;

    this.bodies.push({ id, position: pos.add(new Vector3(4, 12, 0)), radius: 10, kind: "solid", damage: 7 });
  }

  /**
   * Pipe — long industrial cylinder with threaded-joint rings at each end and center.
   */
  private pipe(id: string, pos: Vector3): void {
    const root = this.root(id, pos);
    const pipeLen = 36;

    // Main shaft
    const shaft = MeshBuilder.CreateCylinder(`${id}.shaft`, {
      height: pipeLen, diameter: 3.2, tessellation: 12,
    }, this.scene);
    shaft.rotation.z = Math.PI / 2;
    shaft.position.set(0, 5, 0);
    shaft.material = this.mats.metal;
    shaft.parent = root;
    this.cast(shaft);

    // Joint rings (threaded collar look)
    for (const xOff of [-pipeLen / 2 + 2, 0, pipeLen / 2 - 2]) {
      const ring = MeshBuilder.CreateCylinder(`${id}.ring.${xOff}`, {
        height: 2.5, diameter: 4, tessellation: 12,
      }, this.scene);
      ring.rotation.z = Math.PI / 2;
      ring.position.set(xOff, 5, 0);
      ring.material = this.mats.graphite;
      ring.parent = root;
      this.cast(ring);
    }

    // Wall brackets (two supports)
    for (const xOff of [-10, 10]) {
      const bracket = MeshBuilder.CreateBox(`${id}.bracket.${xOff}`, { width: 1.5, height: 5, depth: 3 }, this.scene);
      bracket.position.set(xOff, 2.5, 0);
      bracket.material = this.mats.graphite;
      bracket.parent = root;
    }

    this.bodies.push({ id, position: pos.add(new Vector3(0, 5, 0)), radius: 20, kind: "solid", damage: 10 });
  }

  /**
   * Water bottle — rounded cylindrical body, narrowing neck, removable cap.
   */
  private waterBottle(id: string, pos: Vector3): void {
    const root = this.root(id, pos);

    // Bottom cap / base
    const base = MeshBuilder.CreateCylinder(`${id}.base`, { height: 1, diameter: 7, tessellation: 16 }, this.scene);
    base.position.y = 0.5;
    base.material = this.mats.graphite;
    base.parent = root;

    // Main body (rounded cylinder)
    const body = MeshBuilder.CreateCylinder(`${id}.body`, { height: 16, diameter: 6.8, tessellation: 16 }, this.scene);
    body.position.y = 9;
    body.material = this.mats.mug;
    body.parent = root;
    this.cast(body);

    // Indented waist grip ring
    const grip = MeshBuilder.CreateCylinder(`${id}.grip`, { height: 3, diameter: 6, tessellation: 16 }, this.scene);
    grip.position.y = 7;
    grip.material = this.mats.mug;
    grip.parent = root;

    // Shoulder taper
    const shoulder = MeshBuilder.CreateCylinder(`${id}.shoulder`, {
      height: 3, diameterBottom: 6.8, diameterTop: 3.5, tessellation: 16,
    }, this.scene);
    shoulder.position.y = 18.5;
    shoulder.material = this.mats.mug;
    shoulder.parent = root;
    this.cast(shoulder);

    // Neck
    const neck = MeshBuilder.CreateCylinder(`${id}.neck`, { height: 3, diameter: 3.4, tessellation: 16 }, this.scene);
    neck.position.y = 21.5;
    neck.material = this.mats.mug;
    neck.parent = root;

    // Cap
    const cap = MeshBuilder.CreateCylinder(`${id}.cap`, { height: 2, diameter: 4, tessellation: 16 }, this.scene);
    cap.position.y = 24;
    cap.material = this.mats.pickupHealth;
    cap.parent = root;
    this.cast(cap);

    // Label band
    const label = MeshBuilder.CreateCylinder(`${id}.label`, { height: 5, diameter: 7.0, tessellation: 16 }, this.scene);
    label.position.y = 10;
    label.material = this.mats.paper;
    label.parent = root;

    this.bodies.push({ id, position: pos.add(new Vector3(0, 12, 0)), radius: 5, kind: "solid", damage: 4 });
  }

  // ── Helpers ───────────────────────────────────────────────────────────
  private root(id: string, pos: Vector3): TransformNode {
    const r = new TransformNode(id, this.scene);
    r.position.copyFrom(pos);
    this.roots.push(r);
    return r;
  }

  private cast(mesh: any): void {
    this.shadowGen.addShadowCaster(mesh);
    mesh.freezeWorldMatrix();
  }
}
