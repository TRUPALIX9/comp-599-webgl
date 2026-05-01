import { Mesh, MeshBuilder, Scene, ShadowGenerator, TransformNode, Vector3 } from "../core/Babylon";
import { GameConfig } from "../config/GameConfig";
import type { CollisionBody } from "../types/GameTypes";
import type { GameMaterials } from "./Materials";

export interface EnvironmentBuildResult {
  obstacleBodies: CollisionBody[];
  roots: TransformNode[];
}

export class CampusBuilder {
  private readonly bodies: CollisionBody[] = [];
  private readonly roots: TransformNode[] = [];

  constructor(
    private readonly scene: Scene,
    private readonly materials: GameMaterials,
    private readonly shadowGenerator: ShadowGenerator
  ) {}

  build(): EnvironmentBuildResult {
    this.createGround();
    this.createMapObjects();
    return { obstacleBodies: this.bodies, roots: this.roots };
  }

  private createGround(): void {
    // The University Mall (Main Path)
    const mall = MeshBuilder.CreateBox("campus.mall", {
      width: 40,
      height: 1,
      depth: GameConfig.world.finishZ + 200
    }, this.scene);
    mall.position.set(0, -0.5, GameConfig.world.finishZ / 2);
    mall.material = this.materials.mallAsphalt;
    mall.receiveShadows = true;
    mall.freezeWorldMatrix();

    // North Quad Grass
    const northQuad = MeshBuilder.CreateBox("campus.quad.north", {
      width: 200,
      height: 0.8,
      depth: 200
    }, this.scene);
    northQuad.position.set(0, -0.6, 50);
    northQuad.material = this.materials.campusGrass;
    northQuad.receiveShadows = true;
    northQuad.freezeWorldMatrix();

    // South Quad Grass
    const southQuad = MeshBuilder.CreateBox("campus.quad.south", {
      width: 200,
      height: 0.8,
      depth: 400
    }, this.scene);
    southQuad.position.set(0, -0.6, 550);
    southQuad.material = this.materials.campusGrass;
    southQuad.receiveShadows = true;
    southQuad.freezeWorldMatrix();
  }

  private createMapObjects(): void {
    // --- NORTH ENTRANCE AREA (Z: 0 - 150) ---
    this.building("north.hall.left", new Vector3(-35, 10, 40), 24, 20, 40);
    this.building("north.hall.right", new Vector3(35, 10, 40), 24, 20, 40);
    
    // Academic Plaza
    this.building("manzanita.hall", new Vector3(-30, 8, 120), 20, 16, 40);
    this.building("placer.hall", new Vector3(30, 8, 140), 20, 16, 30);

    // --- UNIVERSITY MALL CENTRAL (Z: 150 - 450) ---
    // University Mall flanked by academic clusters
    this.building("bell.tower.east", new Vector3(35, 8, 220), 25, 16, 60);
    this.building("bell.tower.west", new Vector3(-35, 8, 250), 25, 16, 50);

    // THE HEART: Campus Green & The Bell Tower
    this.greenSpace("campus.green", new Vector3(0, 0.2, 360), 60, 120);
    this.bellTower("main.bell.tower", new Vector3(48, 0, 360));
    
    // Ojai Hall near the tower
    this.building("ojai.hall", new Vector3(35, 8, 420), 20, 16, 40);

    // --- SOUTH CAMPUS (Z: 450 - 720) ---
    // Broome Library (Large iconic hybrid building)
    this.library("broome.library", new Vector3(-50, 12, 550));
    
    // Trees in the quads
    for (let i = 0; i < 6; i++) {
      this.tree(`tree.north.${i}`, new Vector3(-80 + i * 30, 0, 40 + (i % 2) * 20));
      this.tree(`tree.south.${i}`, new Vector3(80 - i * 30, 0, 500 + (i % 2) * 40));
    }
    
    // Science and Lab buildings
    this.building("science.hall", new Vector3(40, 10, 530), 25, 20, 50);
    this.building("aliso.hall", new Vector3(40, 10, 620), 25, 20, 40);

    // Finish Gate at the southern end
    this.archway("south.finish.gate", new Vector3(0, 0, 710));
  }

  private building(id: string, position: Vector3, width: number, height: number, depth: number): void {
    const root = new TransformNode(id, this.scene);
    root.position.copyFrom(position);
    this.roots.push(root);

    // Main Body (Stucco)
    const body = MeshBuilder.CreateBox(`${id}.body`, { width, height, depth }, this.scene);
    body.material = this.materials.stuccoBeige;
    body.parent = root;
    this.register(body);

    // Sloped Roof (Terra Cotta)
    // Using a cylinder with 3 sides as a triangular prism for the roof
    const roof = MeshBuilder.CreateCylinder(`${id}.roof`, {
      height: depth + 2,
      diameter: width + 2,
      tessellation: 3
    }, this.scene);
    roof.rotation.x = Math.PI / 2;
    roof.rotation.y = Math.PI / 2;
    roof.position.y = height * 0.5 + 2;
    roof.scaling.y = 0.5; // Flatten the triangle
    roof.material = this.materials.roofTerraCotta;
    roof.parent = root;
    this.register(roof);

    // Add arches/colonnades visual effect (simple boxes for now)
    for (let i = -1; i <= 1; i += 2) {
      const col = MeshBuilder.CreateBox(`${id}.column.${i}`, { width: 2, height: height * 0.6, depth: 4 }, this.scene);
      col.position.set(i * (width * 0.5 - 1), -height * 0.2, depth * 0.5 + 1);
      col.material = this.materials.stuccoBeige;
      col.parent = root;
      this.register(col);
    }

    this.addBody(id, position, Math.max(width, depth) * 0.6);
  }

  private bellTower(id: string, position: Vector3): void {
    const root = new TransformNode(id, this.scene);
    root.position.copyFrom(position);
    this.roots.push(root);

    // Tower Base
    const base = MeshBuilder.CreateBox(`${id}.base`, { width: 12, height: 60, depth: 12 }, this.scene);
    base.position.y = 30;
    base.material = this.materials.towerWhite;
    base.parent = root;
    this.register(base);

    // Observation Level
    const top = MeshBuilder.CreateBox(`${id}.top`, { width: 10, height: 12, depth: 10 }, this.scene);
    top.position.y = 66;
    top.material = this.materials.towerWhite;
    top.parent = root;
    this.register(top);

    // Tower Roof
    const roof = MeshBuilder.CreateCylinder(`${id}.roof`, { height: 8, diameterTop: 0, diameterBottom: 14, tessellation: 4 }, this.scene);
    roof.position.y = 76;
    roof.material = this.materials.roofTerraCotta;
    roof.parent = root;
    this.register(roof);

    this.addBody(id, position.add(new Vector3(0, 40, 0)), 10, "solid");
  }

  private library(id: string, position: Vector3): void {
    const root = new TransformNode(id, this.scene);
    root.position.copyFrom(position);
    this.roots.push(root);

    // Main central block (Modern glass section)
    const glass = MeshBuilder.CreateBox(`${id}.glass`, { width: 30, height: 32, depth: 60 }, this.scene);
    glass.material = this.materials.mug;
    glass.parent = root;
    this.register(glass);

    // Mission-style wings
    for (let i = -1; i <= 1; i += 2) {
      const wing = MeshBuilder.CreateBox(`${id}.wing.${i}`, { width: 20, height: 24, depth: 80 }, this.scene);
      wing.position.x = i * 25;
      wing.material = this.materials.stuccoBeige;
      wing.parent = root;
      this.register(wing);

      const roof = MeshBuilder.CreateCylinder(`${id}.roof.${i}`, { height: 82, diameter: 22, tessellation: 3 }, this.scene);
      roof.rotation.x = Math.PI / 2;
      roof.rotation.y = Math.PI / 2;
      roof.position.x = i * 25;
      roof.position.y = 14;
      roof.scaling.y = 0.4;
      roof.material = this.materials.roofTerraCotta;
      roof.parent = root;
      this.register(roof);
    }

    this.addBody(id, position, 45);
  }

  private tree(id: string, position: Vector3): void {
    const root = new TransformNode(id, this.scene);
    root.position.copyFrom(position);
    this.roots.push(root);

    const trunk = MeshBuilder.CreateCylinder(`${id}.trunk`, { height: 6, diameter: 1.2 }, this.scene);
    trunk.position.y = 3;
    trunk.material = this.materials.cardboard;
    trunk.parent = root;
    this.register(trunk);

    const foliage = MeshBuilder.CreateSphere(`${id}.foliage`, { diameter: 8, segments: 8 }, this.scene);
    foliage.position.y = 8;
    foliage.material = this.materials.bookGreen;
    foliage.parent = root;
    this.register(foliage);

    this.addBody(id, position, 4, "solid", 5);
  }

  private greenSpace(id: string, position: Vector3, width: number, depth: number): void {
    const green = MeshBuilder.CreateBox(id, { width, height: 1.2, depth }, this.scene);
    green.position.copyFrom(position);
    green.material = this.materials.campusGrass;
    this.register(green, false);
  }

  private archway(id: string, position: Vector3): void {
    const root = new TransformNode(id, this.scene);
    root.position.copyFrom(position);
    this.roots.push(root);

    const left = MeshBuilder.CreateBox(`${id}.left`, { width: 6, height: 40, depth: 6 }, this.scene);
    left.position.set(-20, 20, 0);
    left.material = this.materials.towerWhite;
    left.parent = root;
    this.register(left);

    const right = MeshBuilder.CreateBox(`${id}.right`, { width: 6, height: 40, depth: 6 }, this.scene);
    right.position.set(20, 20, 0);
    right.material = this.materials.towerWhite;
    right.parent = root;
    this.register(right);

    const top = MeshBuilder.CreateBox(`${id}.top`, { width: 46, height: 6, depth: 6 }, this.scene);
    top.position.set(0, 40, 0);
    top.material = this.materials.towerWhite;
    top.parent = root;
    this.register(top);

    this.addBody(`${id}.left`, position.add(new Vector3(-20, 20, 0)), 8);
    this.addBody(`${id}.right`, position.add(new Vector3(20, 20, 0)), 8);
    this.addBody(`${id}.top`, position.add(new Vector3(0, 40, 0)), 8);
  }

  private addBody(id: string, position: Vector3, radius: number, kind: CollisionBody["kind"] = "solid", damage?: number): void {
    this.bodies.push({ id, position, radius, kind, damage });
  }

  private register(mesh: Mesh, castShadow = true): void {
    if (castShadow) {
      this.shadowGenerator.addShadowCaster(mesh);
    }
    mesh.freezeWorldMatrix();
  }
}
