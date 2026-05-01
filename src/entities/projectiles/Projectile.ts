import { TransformNode, Vector3 } from "../../core/Babylon";
import { GameEntity } from "../GameEntity";
import type { ProjectileOwner, WorldContext } from "../../types/GameTypes";
import { setNodeForward } from "../../scene/MeshFactory";

export class Projectile extends GameEntity {
  age = 0;

  constructor(
    node: TransformNode,
    radius: number,
    readonly owner: ProjectileOwner,
    readonly damage: number,
    readonly lifeSeconds: number,
    public velocity: Vector3
  ) {
    super(node, radius);
    setNodeForward(node, velocity.normalizeToNew());
  }

  update(dt: number, _context: WorldContext): void {
    this.age += dt;
    this.position.addInPlace(this.velocity.scale(dt));
    if (this.velocity.lengthSquared() > 0.001) {
      setNodeForward(this.node, this.velocity.normalizeToNew());
    }
    if (this.age >= this.lifeSeconds) {
      this.alive = false;
    }
  }
}
