import { Scalar, TransformNode, Vector3 } from "../../core/Babylon";
import { GameConfig } from "../../config/GameConfig";
import type { InputState } from "../../systems/input/InputManager";
import { approach, degToRad, directionFromYawPitch } from "../../utils/MathUtils";

export class PlayerPlane {
  health: number = GameConfig.player.maxHealth;
  boost: number = 100;
  paperHeat: number = 0;
  missileAmmo: number = GameConfig.weapons.missile.ammo;
  missileCooldown: number = 0;
  speed: number = GameConfig.player.cruiseSpeed;
  yaw: number = 0;
  pitch: number = 0;
  roll: number = 0;
  boosting = false;
  invulnerability: number = 0;
  collisionCooldown: number = 0;
  private boostRegenDelay = 0;

  constructor(readonly node: TransformNode) {
    this.reset();
  }

  get position(): Vector3 {
    return this.node.position;
  }

  get forward(): Vector3 {
    return directionFromYawPitch(this.yaw, this.pitch);
  }

  reset(): void {
    this.health = GameConfig.player.maxHealth;
    this.boost = 100;
    this.paperHeat = 0;
    this.missileAmmo = GameConfig.weapons.missile.ammo;
    this.missileCooldown = 0;
    this.speed = GameConfig.player.cruiseSpeed;
    this.yaw = 0;
    this.pitch = 0;
    this.roll = 0;
    this.boosting = false;
    this.invulnerability = 0;
    this.collisionCooldown = 0;
    this.boostRegenDelay = 0;
    this.node.position.set(GameConfig.player.spawn.x, GameConfig.player.spawn.y, GameConfig.player.spawn.z);
    this.syncVisuals();
  }

  update(dt: number, input: InputState): void {
    const cfg = GameConfig.player;
    const speed01 = (this.speed - cfg.minSpeed) / (cfg.maxSpeed - cfg.minSpeed);
    const turnRate = Scalar.Lerp(cfg.turnRateLowSpeed, cfg.turnRateHighSpeed, speed01);
    this.yaw += degToRad(turnRate) * input.turnAxis * dt;
    this.pitch = Scalar.Clamp(
      this.pitch + degToRad(cfg.pitchRate) * -input.pitchAxis * dt,
      -degToRad(cfg.pitchClampDeg),
      degToRad(cfg.pitchClampDeg)
    );

    const targetSpeed = input.accelerate
      ? cfg.maxSpeed
      : input.decelerate
        ? cfg.minSpeed
        : cfg.cruiseSpeed;
    this.speed = approach(this.speed, targetSpeed, (input.decelerate ? cfg.deceleration : cfg.acceleration) * dt);

    this.boosting = input.boost && this.boost > 1;
    if (this.boosting) {
      this.speed = approach(this.speed, cfg.boostSpeed, cfg.acceleration * 2.4 * dt);
      this.boost = Math.max(0, this.boost - cfg.boostDrainPerSecond * dt);
      this.boostRegenDelay = cfg.boostRegenDelay;
    } else {
      this.boostRegenDelay = Math.max(0, this.boostRegenDelay - dt);
      if (this.boostRegenDelay <= 0) {
        this.boost = Math.min(100, this.boost + cfg.boostRegenPerSecond * dt);
      }
    }

    this.paperHeat = Math.max(0, this.paperHeat - GameConfig.weapons.paperDot.heatCooldownPerSecond * dt);
    this.missileCooldown = Math.max(0, this.missileCooldown - dt);
    this.invulnerability = Math.max(0, this.invulnerability - dt);
    this.collisionCooldown = Math.max(0, this.collisionCooldown - dt);

    this.position.addInPlace(this.forward.scale(this.speed * dt));
    this.applyBounds();
    this.roll = Scalar.Lerp(this.roll, -input.turnAxis * degToRad(cfg.rollVisualMaxDeg), 1 - Math.exp(-7 * dt));
    this.syncVisuals();
  }

  canFirePaperDot(): boolean {
    return this.paperHeat < GameConfig.weapons.paperDot.maxHeat - GameConfig.weapons.paperDot.heatPerShot;
  }

  addPaperHeat(): void {
    this.paperHeat = Math.min(GameConfig.weapons.paperDot.maxHeat, this.paperHeat + GameConfig.weapons.paperDot.heatPerShot);
  }

  canFireMissile(): boolean {
    return this.missileAmmo > 0 && this.missileCooldown <= 0;
  }

  spendMissile(): void {
    this.missileAmmo = Math.max(0, this.missileAmmo - 1);
    this.missileCooldown = GameConfig.weapons.missile.cooldown;
  }

  heal(amount: number): void {
    this.health = Math.min(GameConfig.player.maxHealth, this.health + amount);
  }

  restoreBoost(amount: number): void {
    this.boost = Math.min(100, this.boost + amount);
  }

  addMissiles(amount: number): void {
    this.missileAmmo = Math.min(9, this.missileAmmo + amount);
  }

  damage(amount: number): boolean {
    if (this.invulnerability > 0) {
      return false;
    }
    this.health = Math.max(0, this.health - amount);
    this.invulnerability = GameConfig.player.invulnerabilitySeconds;
    return true;
  }

  damageFromCollision(amount: number): boolean {
    if (this.collisionCooldown > 0) {
      return false;
    }
    this.collisionCooldown = GameConfig.player.collisionCooldownSeconds;
    return this.damage(amount);
  }

  private applyBounds(): void {
    const bounds = GameConfig.world;
    this.position.x = Scalar.Clamp(this.position.x, -bounds.boundsX, bounds.boundsX);
    this.position.y = Scalar.Clamp(this.position.y, bounds.minY, bounds.maxY);
  }

  private syncVisuals(): void {
    this.node.rotation.set(this.pitch, this.yaw, this.roll);
  }
}
