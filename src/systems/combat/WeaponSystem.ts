import { Scene, Vector3 } from "../../core/Babylon";
import { GameConfig } from "../../config/GameConfig";
import { createPaperDotMesh, createPencilMissileMesh } from "../../scene/MeshFactory";
import type { GameMaterials } from "../../scene/Materials";
import type { Enemy } from "../../entities/enemies/Enemy";
import { PencilMissile } from "../../entities/projectiles/PencilMissile";
import { Projectile } from "../../entities/projectiles/Projectile";
import type { PlayerPlane } from "../../entities/player/PlayerPlane";
import type { InputState } from "../input/InputManager";
import { signedRandom } from "../../utils/MathUtils";

export class WeaponSystem {
  private paperTimer = 0;

  constructor(private readonly scene: Scene, private readonly materials: GameMaterials) {}

  update(dt: number): void {
    this.paperTimer = Math.max(0, this.paperTimer - dt);
  }

  fireFromInput(
    input: InputState,
    player: PlayerPlane,
    getNearestEnemy: (position: Vector3, range: number) => Enemy | undefined,
    addProjectile: (projectile: Projectile) => void,
    addMissile: (missile: PencilMissile) => void,
    play: (cue: "shoot" | "missile") => void
  ): void {
    if (input.firePrimary && this.paperTimer <= 0 && player.canFirePaperDot()) {
      this.paperTimer = GameConfig.weapons.paperDot.fireInterval;
      player.addPaperHeat();
      const dir = player.forward.add(new Vector3(
        signedRandom(GameConfig.weapons.paperDot.spreadRadians),
        signedRandom(GameConfig.weapons.paperDot.spreadRadians),
        signedRandom(GameConfig.weapons.paperDot.spreadRadians)
      )).normalize();
      const node = createPaperDotMesh(this.scene, this.materials);
      const start = player.position.add(dir.scale(2.4)).add(new Vector3(0, -0.12, 0));
      node.position.copyFrom(start);
      addProjectile(new Projectile(
        node,
        GameConfig.weapons.paperDot.radius,
        "player",
        GameConfig.weapons.paperDot.damage,
        GameConfig.weapons.paperDot.lifeSeconds,
        dir.scale(GameConfig.weapons.paperDot.speed)
      ));
      play("shoot");
    }

    if ((input.fireMissileLeftPressed || input.fireMissileRightPressed) && player.canFireMissile()) {
      const side = input.fireMissileLeftPressed ? -1 : 1;
      player.spendMissile();
      const target = getNearestEnemy(player.position, GameConfig.weapons.missile.lockRange);
      const dir = target ? target.position.subtract(player.position).normalize() : player.forward;
      const node = createPencilMissileMesh(this.scene, this.materials);
      const start = player.position
        .add(player.forward.scale(1.9))
        .add(new Vector3(Math.cos(player.yaw) * side * 1.2, -0.28, -Math.sin(player.yaw) * side * 1.2));
      addMissile(new PencilMissile(node, start, dir, target));
      play("missile");
    }
  }
}
