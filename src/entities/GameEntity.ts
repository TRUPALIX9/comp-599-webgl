import { TransformNode, Vector3 } from "../core/Babylon";
import type { WorldContext } from "../types/GameTypes";

let nextEntityId = 0;

export abstract class GameEntity {
  readonly id = `entity-${nextEntityId++}`;
  alive = true;

  protected constructor(readonly node: TransformNode, readonly radius: number) {}

  get position(): Vector3 {
    return this.node.position;
  }

  abstract update(dt: number, context: WorldContext): void;

  dispose(): void {
    this.alive = false;
    this.node.dispose(false, true);
  }
}
