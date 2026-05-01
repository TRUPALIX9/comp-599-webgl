import { TransformNode, Vector3 } from "../../core/Babylon";
import { GameConfig } from "../../config/GameConfig";
import type { PickupKind, WorldContext } from "../../types/GameTypes";
import { GameEntity } from "../GameEntity";

export class Pickup extends GameEntity {
  constructor(node: TransformNode, readonly kind: PickupKind, position: Vector3) {
    super(node, GameConfig.pickups.collectRadius);
    this.position.copyFrom(position);
  }

  update(dt: number, context: WorldContext): void {
    this.node.rotation.y += dt * 2.4;
    this.node.rotation.x += dt * 0.8;
    const toPlayer = context.player.position.subtract(this.position);
    const distance = toPlayer.length();
    if (distance < GameConfig.pickups.magnetRadius) {
      this.position.addInPlace(toPlayer.normalize().scale(dt * 18));
    }
  }

  apply(context: WorldContext): string {
    if (this.kind === "health") {
      context.player.heal(GameConfig.pickups.healthAmount);
      return `Tape patch +${GameConfig.pickups.healthAmount} HP`;
    }
    if (this.kind === "boost") {
      context.player.restoreBoost(GameConfig.pickups.boostAmount);
      return "Rubber band boost restored";
    }
    if (this.kind === "missile") {
      context.player.addMissiles(GameConfig.pickups.missileAmount);
      return `Pencil bundle +${GameConfig.pickups.missileAmount}`;
    }
    context.addScore(GameConfig.pickups.scoreAmount);
    return `Star sticker +${GameConfig.pickups.scoreAmount}`;
  }
}
