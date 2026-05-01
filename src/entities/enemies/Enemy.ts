import { TransformNode, Vector3 } from "../../core/Babylon";
import { GameConfig } from "../../config/GameConfig";
import { setNodeForward } from "../../scene/MeshFactory";
import type { EnemyKind, WorldContext } from "../../types/GameTypes";
import { GameEntity } from "../GameEntity";

const kindConfig = GameConfig.enemies;

export class Enemy extends GameEntity {
  health: number;
  private fireTimer: number;
  private driftSeed = Math.random() * Math.PI * 2;

  constructor(
    node: TransformNode,
    readonly kind: EnemyKind,
    position: Vector3
  ) {
    const cfg = kindConfig[kind];
    super(node, cfg.radius);
    this.health = cfg.health;
    this.fireTimer = cfg.fireInterval * (0.45 + Math.random() * 0.5);
    this.position.copyFrom(position);
  }

  get scoreValue(): number {
    return kindConfig[this.kind].score;
  }

  update(dt: number, context: WorldContext): void {
    const cfg = kindConfig[this.kind];
    const toPlayer = context.player.position.subtract(this.position);
    const dist = Math.max(0.001, toPlayer.length());
    const dir = toPlayer.scale(1 / dist);
    const lateral = new Vector3(
      Math.sin(performance.now() * 0.0015 + this.driftSeed),
      Math.cos(performance.now() * 0.0012 + this.driftSeed) * 0.32,
      this.kind === "dart" ? -0.4 : 0.06
    );
    const desired = dir.scale(cfg.speed).add(lateral.scale(this.kind === "boss" ? 3.5 : 5));
    this.position.addInPlace(desired.scale(dt));
    setNodeForward(this.node, dir);

    this.fireTimer -= dt;
    if (this.fireTimer <= 0 && dist < 95 && context.player.health > 0) {
      this.fireTimer = cfg.fireInterval * (0.78 + Math.random() * 0.34);
      context.spawnEnemyProjectile(this.position.add(dir.scale(1.5)), dir);
      context.audio.play("shoot");
    }

    if (this.position.z < context.player.position.z - 42) {
      this.alive = false;
    }
  }

  damage(amount: number, context: WorldContext): void {
    this.health -= amount;
    context.effects.burst(this.position, "enemy", this.kind === "boss" ? 2.2 : 1);
    context.audio.play("hit");
    if (this.health <= 0) {
      this.alive = false;
      context.onEnemyDestroyed(this);
    }
  }
}
