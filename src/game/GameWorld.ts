import { FreeCamera, Scene, ShadowGenerator, Vector3 } from "../core/Babylon";
import { GameConfig } from "../config/GameConfig";
import { Enemy } from "../entities/enemies/Enemy";
import { PencilMissile } from "../entities/projectiles/PencilMissile";
import { Projectile } from "../entities/projectiles/Projectile";
import { Pickup } from "../entities/pickups/Pickup";
import { PlayerPlane } from "../entities/player/PlayerPlane";
import { createEnemyInkMesh, createEnemyMesh, createPaperPlaneMesh, createPickupMesh } from "../scene/MeshFactory";
import type { GameMaterials } from "../scene/Materials";
import { CampusBuilder } from "../scene/CampusBuilder";
import type { CollisionBody, EnemyKind, PickupKind, PlayerSnapshot, WorldContext } from "../types/GameTypes";
import { clamp01 } from "../utils/MathUtils";
import { AudioSystem } from "../systems/audio/AudioSystem";
import { FollowCameraController } from "../systems/camera/FollowCameraController";
import { CollisionSystem } from "../systems/collision/CollisionSystem";
import { WeaponSystem } from "../systems/combat/WeaponSystem";
import { VisualEffectsSystem } from "../systems/effects/VisualEffectsSystem";
import type { InputState } from "../systems/input/InputManager";

interface WorldCallbacks {
  onGameOver(): void;
  onVictory(): void;
  onToast(message: string): void;
  onPlayerDamaged(): void;
}

const wavePlan: EnemyKind[][] = [
  ["foldling", "foldling", "foldling", "foldling"],
  ["foldling", "foldling", "foldling", "dart", "dart"],
  ["dart", "dart", "dart", "glider"],
  ["foldling", "foldling", "dart", "dart", "dart", "glider"],
  ["glider", "glider", "dart", "dart", "dart", "dart"],
  ["boss"]
];

export type WorldMode = "exploration" | "combat";

export class GameWorld {
  private mode: WorldMode = "combat";
  readonly player: PlayerPlane;
  readonly effects: VisualEffectsSystem;
  private readonly cameraController: FollowCameraController;
  private readonly weaponSystem: WeaponSystem;
  private readonly obstacleBodies: CollisionBody[];
  private readonly enemies: Enemy[] = [];
  private readonly playerProjectiles: Projectile[] = [];
  private readonly missiles: PencilMissile[] = [];
  private readonly enemyProjectiles: Projectile[] = [];
  private readonly pickups: Pickup[] = [];
  private score = 0;
  private waveIndex = -1;
  private victoryTriggered = false;

  constructor(
    private readonly scene: Scene,
    private readonly camera: FreeCamera,
    private readonly shadowGenerator: ShadowGenerator,
    private readonly materials: GameMaterials,
    private readonly audio: AudioSystem,
    private readonly callbacks: WorldCallbacks
  ) {
    const environment = new CampusBuilder(scene, materials, shadowGenerator).build();
    this.obstacleBodies = environment.obstacleBodies;
    const playerNode = createPaperPlaneMesh(scene, materials);
    this.player = new PlayerPlane(playerNode);
    this.shadowGenerator.addShadowCaster(playerNode.getChildMeshes()[0]);
    this.effects = new VisualEffectsSystem(scene, materials);
    this.cameraController = new FollowCameraController(camera);
    this.weaponSystem = new WeaponSystem(scene, materials);
  }

  setMode(mode: WorldMode): void {
    this.mode = mode;
    if (mode === "exploration") {
      this.player.health = 9999;
    } else {
      this.player.health = GameConfig.player.maxHealth;
    }
  }

  reset(): void {
    this.clearDynamicEntities();
    this.player.reset();
    this.score = 0;
    this.waveIndex = -1;
    this.victoryTriggered = false;
    this.camera.position.set(0, 30, -20);
    this.callbacks.onToast("Launch!");
  }

  update(dt: number, input: InputState): void {
    this.player.update(dt, input);
    this.weaponSystem.update(dt);
    this.weaponSystem.fireFromInput(
      input,
      this.player,
      (position, range) => this.getNearestEnemy(position, range),
      (projectile) => this.playerProjectiles.push(projectile),
      (missile) => this.missiles.push(missile),
      (cue) => this.audio.play(cue)
    );

    if (this.mode === "combat") {
      this.spawnWaves();
    }
    const context = this.createContext();
    for (const enemy of this.enemies) enemy.update(dt, context);
    for (const projectile of this.playerProjectiles) projectile.update(dt, context);
    for (const missile of this.missiles) missile.update(dt, context);
    for (const projectile of this.enemyProjectiles) projectile.update(dt, context);
    for (const pickup of this.pickups) pickup.update(dt, context);

    this.handleCollisions(context);
    this.pruneDead();
    this.effects.update(dt);
    this.cameraController.update(dt, this.player);

    if (this.player.health <= 0) {
      this.callbacks.onGameOver();
    }
    if (!this.victoryTriggered && this.player.position.z >= GameConfig.world.finishZ && this.enemies.length === 0 && this.waveIndex >= wavePlan.length - 1) {
      this.victoryTriggered = true;
      this.callbacks.onVictory();
    }
  }

  snapshot(): PlayerSnapshot {
    return {
      health: this.player.health,
      maxHealth: GameConfig.player.maxHealth,
      boost: this.player.boost,
      maxBoost: 100,
      paperHeat: this.player.paperHeat,
      maxPaperHeat: GameConfig.weapons.paperDot.maxHeat,
      missileAmmo: this.player.missileAmmo,
      missileCooldown: this.player.missileCooldown,
      maxMissileCooldown: GameConfig.weapons.missile.cooldown,
      score: this.score,
      waveLabel: this.waveLabel,
      progress01: clamp01((this.player.position.z - GameConfig.world.startZ) / (GameConfig.world.finishZ - GameConfig.world.startZ))
    };
  }

  dispose(): void {
    this.clearDynamicEntities();
    this.player.node.dispose(false, true);
    this.effects.dispose();
  }

  private get waveLabel(): string {
    if (this.waveIndex < 0) return "runway approach";
    if (this.waveIndex >= wavePlan.length - 1) return this.enemies.length > 0 ? "boss kite" : "finish gate";
    return `wave ${this.waveIndex + 1} / ${wavePlan.length - 1}`;
  }

  private createContext(): WorldContext {
    return {
      scene: this.scene,
      player: this.player,
      audio: this.audio,
      effects: this.effects,
      addScore: (amount) => {
        this.score += amount;
      },
      getNearestEnemy: (position, range) => this.getNearestEnemy(position, range),
      spawnEnemyProjectile: (position, direction) => this.spawnEnemyProjectile(position, direction),
      onEnemyDestroyed: (enemy) => this.onEnemyDestroyed(enemy)
    };
  }

  private spawnWaves(): void {
    const nextIndex = this.waveIndex + 1;
    const triggerZ = GameConfig.progression.waveZ[nextIndex];
    if (triggerZ === undefined || this.player.position.z < triggerZ) {
      return;
    }
    this.waveIndex = nextIndex;
    const wave = wavePlan[nextIndex];
    wave.forEach((kind, index) => {
      const spread = kind === "boss" ? 0 : (index - (wave.length - 1) / 2) * 12;
      this.spawnEnemy(kind, new Vector3(
        spread + (Math.random() * 2 - 1) * 5,
        18 + (index % 3) * 7,
        this.player.position.z + 72 + index * 8
      ));
    });
    this.callbacks.onToast(kindLabel(nextIndex));
  }

  private spawnEnemy(kind: EnemyKind, position: Vector3): void {
    const node = createEnemyMesh(this.scene, this.materials, kind);
    const enemy = new Enemy(node, kind, position);
    for (const mesh of node.getChildMeshes()) {
      this.shadowGenerator.addShadowCaster(mesh);
    }
    this.enemies.push(enemy);
  }

  private spawnEnemyProjectile(position: Vector3, direction: Vector3): void {
    if (this.enemyProjectiles.length >= GameConfig.performance.maxEnemyProjectiles) {
      this.enemyProjectiles.shift()?.dispose();
    }
    const node = createEnemyInkMesh(this.scene, this.materials);
    node.position.copyFrom(position);
    this.enemyProjectiles.push(new Projectile(
      node,
      GameConfig.weapons.enemyInk.radius,
      "enemy",
      GameConfig.weapons.enemyInk.damage,
      GameConfig.weapons.enemyInk.lifeSeconds,
      direction.normalizeToNew().scale(GameConfig.weapons.enemyInk.speed)
    ));
  }

  private getNearestEnemy(position: Vector3, range: number): Enemy | undefined {
    let best: Enemy | undefined;
    let bestDistance = range * range;
    for (const enemy of this.enemies) {
      if (!enemy.alive) continue;
      const distance = Vector3.DistanceSquared(position, enemy.position);
      if (distance < bestDistance) {
        best = enemy;
        bestDistance = distance;
      }
    }
    return best;
  }

  private handleCollisions(context: WorldContext): void {
    for (const body of this.obstacleBodies) {
      if (!CollisionSystem.overlaps(this.player.position, GameConfig.player.radius, body.position, body.radius)) {
        continue;
      }
      this.player.node.position.copyFrom(CollisionSystem.pushOut(this.player.position, body, GameConfig.player.radius));
      this.player.speed *= 0.62;
      const damaged = this.player.damageFromCollision(this.mode === "exploration" ? 0 : (body.damage ?? GameConfig.world.obstacleDamage));
      if (damaged && this.mode === "combat") {
        this.audio.play("damage");
        this.callbacks.onPlayerDamaged();
      }
    }

    for (const enemy of this.enemies) {
      if (CollisionSystem.overlaps(this.player.position, GameConfig.player.radius, enemy.position, enemy.radius)) {
        const damaged = this.player.damageFromCollision(GameConfig.world.enemyCrashDamage);
        enemy.damage(999, context);
        if (damaged) {
          this.audio.play("damage");
          this.callbacks.onPlayerDamaged();
        }
      }
    }

    for (const projectile of [...this.playerProjectiles, ...this.missiles]) {
      if (!projectile.alive) continue;
      for (const body of this.obstacleBodies) {
        if (CollisionSystem.overlaps(projectile.position, projectile.radius, body.position, body.radius)) {
          projectile.alive = false;
          this.effects.burst(projectile.position, "paper", 0.8);
          break;
        }
      }
    }

    for (const projectile of this.playerProjectiles) {
      if (!projectile.alive) continue;
      for (const enemy of this.enemies) {
        if (!enemy.alive) continue;
        if (CollisionSystem.overlaps(projectile.position, projectile.radius, enemy.position, enemy.radius)) {
          projectile.alive = false;
          enemy.damage(projectile.damage, context);
          break;
        }
      }
    }

    for (const missile of this.missiles) {
      if (!missile.alive) continue;
      for (const enemy of this.enemies) {
        if (!enemy.alive) continue;
        if (CollisionSystem.overlaps(missile.position, missile.radius, enemy.position, enemy.radius)) {
          missile.alive = false;
          this.effects.burst(missile.position, "missile", 2.2);
          this.audio.play("explosion");
          for (const splashTarget of this.enemies) {
            if (!splashTarget.alive) continue;
            const distance = Vector3.Distance(missile.position, splashTarget.position);
            if (distance <= GameConfig.weapons.missile.splashRadius) {
              const damage = splashTarget === enemy ? missile.damage : GameConfig.weapons.missile.splashDamage;
              splashTarget.damage(damage, context);
            }
          }
          break;
        }
      }
    }

    for (const projectile of this.enemyProjectiles) {
      if (!projectile.alive) continue;
      if (CollisionSystem.overlaps(projectile.position, projectile.radius, this.player.position, GameConfig.player.radius)) {
        projectile.alive = false;
        const damaged = this.player.damage(projectile.damage);
        this.effects.burst(this.player.position, "enemy", 1.2);
        if (damaged) {
          this.audio.play("damage");
          this.callbacks.onPlayerDamaged();
        }
      }
    }

    for (const pickup of this.pickups) {
      if (!pickup.alive) continue;
      if (CollisionSystem.overlaps(pickup.position, pickup.radius, this.player.position, GameConfig.pickups.collectRadius)) {
        pickup.alive = false;
        const message = pickup.apply(context);
        this.effects.burst(pickup.position, "pickup", 1.4);
        this.audio.play("pickup");
        this.callbacks.onToast(message);
      }
    }
  }

  private onEnemyDestroyed(enemy: Enemy): void {
    this.score += enemy.scoreValue;
    this.effects.burst(enemy.position, enemy.kind === "boss" ? "missile" : "enemy", enemy.kind === "boss" ? 3 : 1.4);
    this.audio.play("explosion");
    if (enemy.kind === "boss") {
      this.spawnPickup("score", enemy.position.add(new Vector3(0, 5, 0)));
      return;
    }
    const roll = Math.random();
    if (this.player.health < 70 && roll < 0.32) {
      this.spawnPickup("health", enemy.position);
    } else if (roll < 0.48) {
      this.spawnPickup("boost", enemy.position);
    } else if (roll < 0.58) {
      this.spawnPickup("missile", enemy.position);
    } else if (roll < 0.66) {
      this.spawnPickup("score", enemy.position);
    }
  }

  private spawnPickup(kind: PickupKind, position: Vector3): void {
    const node = createPickupMesh(this.scene, this.materials, kind);
    this.pickups.push(new Pickup(node, kind, position.add(new Vector3(0, 1.4, 0))));
  }

  private pruneDead(): void {
    prune(this.enemies);
    prune(this.playerProjectiles);
    prune(this.missiles);
    prune(this.enemyProjectiles);
    prune(this.pickups);
  }

  private clearDynamicEntities(): void {
    for (const list of [this.enemies, this.playerProjectiles, this.missiles, this.enemyProjectiles, this.pickups]) {
      for (const entity of list) entity.dispose();
      list.length = 0;
    }
    this.effects.dispose();
  }
}

function prune<T extends { alive: boolean; dispose(): void }>(list: T[]): void {
  for (let i = list.length - 1; i >= 0; i -= 1) {
    if (!list[i].alive) {
      list[i].dispose();
      list.splice(i, 1);
    }
  }
}

function kindLabel(index: number): string {
  return index >= wavePlan.length - 1 ? "Mini-boss kite incoming" : `Wave ${index + 1} incoming`;
}
