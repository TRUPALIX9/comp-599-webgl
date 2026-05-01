/**
 * AIPlane — Simple autonomous opponent for 1v1 arena combat.
 * Behaviour: pursues player, strafe-dodges bullets, fires when in range.
 * Uses a finite state machine: CHASE → AIM → FIRE → EVADE → RESET.
 */
import { TransformNode, Vector3 } from "../../core/Babylon";
import { GameConfig } from "../../config/GameConfig";
import type { PlayerPlane } from "../player/PlayerPlane";

export type AIState = "chase" | "aim" | "fire" | "evade";

/** How close AI needs to be before entering AIM state (units). */
const AIM_RANGE        = 90;
/** How close before AI fires (units). */
const FIRE_RANGE       = 60;
/** Cooldown between AI shots (seconds). */
const SHOOT_COOLDOWN   = 1.4;
/** How long AI evades after taking damage (seconds). */
const EVADE_DURATION   = 1.8;
/** AI movement speed (units/second). */
const AI_SPEED         = 22;
/** How aggressively AI turns (radians/second). */
const AI_TURN_RATE     = 1.4;

export class AIPlane {
  readonly node: TransformNode;
  health    = GameConfig.player.maxHealth;
  alive     = true;

  private state: AIState = "chase";
  private shootTimer   = 0;
  private evadeTimer   = 0;
  private evadeDir     = 1;    // strafe direction: +1 or -1
  private velocity     = Vector3.Zero();

  constructor(node: TransformNode) {
    this.node = node;
    this.node.position.set(80, 12, 80); // starting position in arena
  }

  get position(): Vector3 { return this.node.position; }

  /** Called each frame by GameWorld. Returns a fire-request if the AI wants to shoot. */
  update(dt: number, player: PlayerPlane, onFire: (pos: Vector3, dir: Vector3) => void): void {
    if (!this.alive) return;
    this.shootTimer  = Math.max(0, this.shootTimer  - dt);
    this.evadeTimer  = Math.max(0, this.evadeTimer  - dt);

    const toPlayer = player.position.subtract(this.node.position);
    const dist     = toPlayer.length();
    const dirNorm  = dist > 0.01 ? toPlayer.normalize() : Vector3.Forward();

    this.updateState(dist);

    switch (this.state) {
      case "chase": this.doChase(dt, dirNorm);       break;
      case "aim":   this.doAim(dt, dirNorm);         break;
      case "fire":  this.doFire(dt, dirNorm, player.position, onFire); break;
      case "evade": this.doEvade(dt, dirNorm);       break;
    }

    this.applyVelocity(dt);
    this.clampToArena();
  }

  /** Apply damage. Triggers evade state. Returns true if newly killed. */
  damage(amount: number): boolean {
    if (!this.alive) return false;
    this.health -= amount;
    this.evadeTimer = EVADE_DURATION;
    this.evadeDir   = Math.random() < 0.5 ? 1 : -1;
    this.state      = "evade";
    if (this.health <= 0) {
      this.alive = false;
      return true;
    }
    return false;
  }

  // ── State machine ──────────────────────────────────────────────────────
  private updateState(dist: number): void {
    if (this.evadeTimer > 0) { this.state = "evade"; return; }
    if (dist > AIM_RANGE)   { this.state = "chase"; return; }
    if (dist > FIRE_RANGE)  { this.state = "aim";   return; }
    this.state = "fire";
  }

  // ── Behaviours ─────────────────────────────────────────────────────────
  private doChase(dt: number, dir: Vector3): void {
    this.steer(dt, dir, 1.0);
    this.velocity = dir.scale(AI_SPEED);
  }

  private doAim(dt: number, dir: Vector3): void {
    this.steer(dt, dir, 0.8);
    this.velocity = dir.scale(AI_SPEED * 0.6);
  }

  private doFire(dt: number, dir: Vector3, playerPos: Vector3, onFire: (pos: Vector3, dir: Vector3) => void): void {
    this.steer(dt, dir, 0.5);
    this.velocity = dir.scale(AI_SPEED * 0.3);

    if (this.shootTimer <= 0) {
      this.shootTimer = SHOOT_COOLDOWN;
      // Lead the target slightly for more challenge
      const lead = playerPos.add(dir.scale(8));
      const fireDir = lead.subtract(this.node.position).normalize();
      onFire(this.node.position.clone(), fireDir);
    }
  }

  private doEvade(dt: number, dir: Vector3): void {
    // Strafe perpendicular to player
    const perp = new Vector3(-dir.z, 0, dir.x).normalize();
    const evadeVec = perp.scale(this.evadeDir * AI_SPEED * 0.9);
    // Also retreat slightly
    const retreat = dir.scale(-AI_SPEED * 0.4);
    this.velocity = evadeVec.add(retreat);
  }

  /** Smooth rotation toward movement direction. */
  private steer(dt: number, targetDir: Vector3, weight: number): void {
    const yaw   = Math.atan2(targetDir.x, targetDir.z);
    const curY  = this.node.rotation.y;
    let   diff  = yaw - curY;
    // Wrap angle
    while (diff >  Math.PI) diff -= 2 * Math.PI;
    while (diff < -Math.PI) diff += 2 * Math.PI;
    this.node.rotation.y += diff * Math.min(1, AI_TURN_RATE * weight * dt);
  }

  private applyVelocity(dt: number): void {
    this.node.position.addInPlace(this.velocity.scale(dt));
    // Keep AI at flight altitude range
    this.node.position.y = Math.max(8, Math.min(40, this.node.position.y));
  }

  private clampToArena(): void {
    const HALF = 130;
    this.node.position.x = Math.max(-HALF, Math.min(HALF, this.node.position.x));
    this.node.position.z = Math.max(-HALF, Math.min(HALF, this.node.position.z));
  }
}
