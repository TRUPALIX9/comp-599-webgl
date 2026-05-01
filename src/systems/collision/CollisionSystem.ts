import { Vector3 } from "../../core/Babylon";
import type { CollisionBody } from "../../types/GameTypes";

export class CollisionSystem {
  static overlaps(a: Vector3, radiusA: number, b: Vector3, radiusB: number): boolean {
    return Vector3.DistanceSquared(a, b) <= (radiusA + radiusB) * (radiusA + radiusB);
  }

  static pushOut(position: Vector3, body: CollisionBody, radius: number): Vector3 {
    const delta = position.subtract(body.position);
    const distance = Math.max(0.001, delta.length());
    const overlap = radius + body.radius - distance;
    if (overlap <= 0) {
      return position;
    }
    return position.add(delta.normalize().scale(overlap + 0.08));
  }
}
