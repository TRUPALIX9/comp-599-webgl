import { Mesh, MeshBuilder, Scene, StandardMaterial, Vector3 } from "../../core/Babylon";
import { GameConfig } from "../../config/GameConfig";
import type { GameMaterials } from "../../scene/Materials";

interface TimedEffect {
  mesh: Mesh;
  age: number;
  life: number;
  baseScale: number;
}

export class VisualEffectsSystem {
  private readonly effects: TimedEffect[] = [];

  constructor(private readonly scene: Scene, private readonly materials: GameMaterials) {}

  update(dt: number): void {
    for (let i = this.effects.length - 1; i >= 0; i -= 1) {
      const effect = this.effects[i];
      effect.age += dt;
      const t = effect.age / effect.life;
      effect.mesh.scaling.setAll(effect.baseScale * (1 + t * 1.8));
      const material = effect.mesh.material;
      if (material instanceof StandardMaterial) {
        material.alpha = Math.max(0, 1 - t);
      }
      if (effect.age >= effect.life) {
        effect.mesh.dispose();
        this.effects.splice(i, 1);
      }
    }
  }

  burst(position: Vector3, color: "paper" | "enemy" | "missile" | "pickup" = "paper", size = 1): void {
    if (this.effects.length > GameConfig.performance.maxEffects) {
      this.effects.shift()?.mesh.dispose();
    }
    const mesh = MeshBuilder.CreateSphere("vfx.burst", { diameter: 0.8, segments: 8 }, this.scene);
    mesh.position.copyFrom(position);
    mesh.material = this.effectMaterial(color === "enemy"
      ? this.materials.enemyInk
      : color === "missile"
        ? this.materials.pencilYellow
        : color === "pickup"
          ? this.materials.pickupScore
          : this.materials.paperDot);
    this.effects.push({ mesh, age: 0, life: 0.28, baseScale: size });
  }

  trail(position: Vector3, size = 0.3): void {
    const mesh = MeshBuilder.CreateSphere("vfx.trail", { diameter: 0.35, segments: 6 }, this.scene);
    mesh.position.copyFrom(position);
    mesh.material = this.effectMaterial(this.materials.trail);
    this.effects.push({ mesh, age: 0, life: 0.2, baseScale: size });
  }

  private effectMaterial(source: StandardMaterial): StandardMaterial {
    const material = source.clone(`${source.name}.vfx`);
    material.alpha = source.alpha;
    return material;
  }

  dispose(): void {
    for (const effect of this.effects) {
      effect.mesh.dispose();
    }
    this.effects.length = 0;
  }
}
