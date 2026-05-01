import { FreeCamera, Scalar, Vector3 } from "../../core/Babylon";
import { GameConfig } from "../../config/GameConfig";
import type { PlayerPlane } from "../../entities/player/PlayerPlane";

export class FollowCameraController {
  constructor(private readonly camera: FreeCamera) {}

  update(dt: number, player: PlayerPlane): void {
    const forward = player.forward;
    const boost01 = player.boosting ? 1 : 0;
    const distance = Scalar.Lerp(GameConfig.camera.distance, GameConfig.camera.boostDistance, boost01);
    const desired = player.position
      .subtract(forward.scale(distance))
      .add(new Vector3(0, GameConfig.camera.height + boost01 * 1.4, 0));

    const amount = 1 - Math.exp(-GameConfig.camera.smoothing * dt);
    this.camera.position = Vector3.Lerp(this.camera.position, desired, amount);
    const target = player.position.add(forward.scale(GameConfig.camera.lookAhead));
    this.camera.setTarget(target);
    const fovTarget = (Scalar.Lerp(GameConfig.camera.fovDeg, GameConfig.camera.boostFovDeg, boost01) * Math.PI) / 180;
    this.camera.fov = Scalar.Lerp(this.camera.fov, fovTarget, amount);
  }
}
