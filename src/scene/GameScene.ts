import {
  Color3,
  DirectionalLight,
  Engine,
  FreeCamera,
  HemisphericLight,
  Scene,
  ShadowGenerator,
  Vector3
} from "../core/Babylon";

export interface GameSceneBundle {
  scene: Scene;
  camera: FreeCamera;
  shadowGenerator: ShadowGenerator;
}

export function createGameScene(engine: Engine, canvas: HTMLCanvasElement): GameSceneBundle {
  const scene = new Scene(engine);
  scene.clearColor.set(0.68, 0.78, 0.86, 1);
  scene.fogMode = Scene.FOGMODE_LINEAR;
  scene.fogStart = 150;
  scene.fogEnd = 820;
  scene.fogColor = new Color3(0.68, 0.78, 0.86);

  const camera = new FreeCamera("camera.follow", new Vector3(0, 28, -16), scene);
  camera.minZ = 0.1;
  camera.maxZ = 1200;
  camera.fov = (68 * Math.PI) / 180;
  camera.attachControl(canvas, false);
  camera.inputs.clear();

  const hemi = new HemisphericLight("light.classroom.hemi", new Vector3(0.2, 1, 0.35), scene);
  hemi.intensity = 0.82;
  hemi.groundColor = new Color3(0.48, 0.40, 0.33);

  const sun = new DirectionalLight("light.window.sun", new Vector3(-0.45, -0.9, 0.2), scene);
  sun.position = new Vector3(50, 90, -60);
  sun.intensity = 0.72;
  const shadowGenerator = new ShadowGenerator(1024, sun);
  shadowGenerator.useBlurExponentialShadowMap = true;
  shadowGenerator.blurKernel = 18;

  return { scene, camera, shadowGenerator };
}
