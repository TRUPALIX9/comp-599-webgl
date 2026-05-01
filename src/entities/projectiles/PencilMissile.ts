import { TransformNode, Vector3 } from "../../core/Babylon";
import { GameConfig } from "../../config/GameConfig";
import { setNodeForward } from "../../scene/MeshFactory";
import type { Enemy } from "../enemies/Enemy";
import { Projectile } from "./Projectile";
import type { WorldContext } from "../../types/GameTypes";

export class PencilMissile extends Projectile {
  constructor(node: TransformNode, position: Vector3, direction: Vector3, readonly target?: Enemy) {
    super(
      node,
      GameConfig.weapons.missile.radius,
      "player",
      GameConfig.weapons.missile.damage,
      GameConfig.weapons.missile.lifeSeconds,
      direction.normalizeToNew().scale(GameConfig.weapons.missile.speed)
    );
    this.position.copyFrom(position);
  }

  override update(dt: number, context: WorldContext): void {
    const target = this.target?.alive ? this.target : context.getNearestEnemy(this.position, GameConfig.weapons.missile.lockRange);
    if (target) {
      const desired = target.position.subtract(this.position).normalize().scale(GameConfig.weapons.missile.speed);
      const turn = Math.min(1, GameConfig.weapons.missile.turnRate * dt);
      this.velocity = Vector3.Lerp(this.velocity, desired, turn).normalize().scale(GameConfig.weapons.missile.speed);
    }
    context.effects.trail(this.position, 0.35);
    super.update(dt, context);
    setNodeForward(this.node, this.velocity.normalizeToNew());
  }
}
