import type { Scene, Vector3 } from "../core/Babylon";
import type { Enemy } from "../entities/enemies/Enemy";
import type { PlayerPlane } from "../entities/player/PlayerPlane";
import type { AudioSystem } from "../systems/audio/AudioSystem";
import type { VisualEffectsSystem } from "../systems/effects/VisualEffectsSystem";

export type ProjectileOwner = "player" | "enemy";

export type PickupKind = "health" | "boost" | "missile" | "score";

export type EnemyKind = "foldling" | "dart" | "glider" | "boss";

export interface CollisionBody {
  id: string;
  position: Vector3;
  radius: number;
  kind: "solid" | "hazard";
  damage?: number;
}

export interface PlayerSnapshot {
  health: number;
  maxHealth: number;
  boost: number;
  maxBoost: number;
  paperHeat: number;
  maxPaperHeat: number;
  missileAmmo: number;
  missileCooldown: number;
  maxMissileCooldown: number;
  score: number;
  waveLabel: string;
  progress01: number;
}

export interface WorldContext {
  scene: Scene;
  player: PlayerPlane;
  audio: AudioSystem;
  effects: VisualEffectsSystem;
  addScore(amount: number): void;
  getNearestEnemy(position: Vector3, range: number): Enemy | undefined;
  spawnEnemyProjectile(position: Vector3, direction: Vector3): void;
  onEnemyDestroyed(enemy: Enemy): void;
}
