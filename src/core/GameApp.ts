import { Engine } from "./Babylon";
import type { GameState } from "./GameState";
import { createGameScene } from "../scene/GameScene";
import { createGameMaterials } from "../scene/Materials";
import { GameWorld } from "../game/GameWorld";
import { AudioSystem } from "../systems/audio/AudioSystem";
import { InputManager } from "../systems/input/InputManager";
import { UIController } from "../systems/ui/UIController";

export class GameApp {
  private readonly engine: Engine;
  private readonly input: InputManager;
  private readonly audio = new AudioSystem();
  private readonly ui: UIController;
  private readonly world: GameWorld;
  private state: GameState = "menu";
  private lastStateBeforePause: GameState = "playing";

  constructor(private readonly canvas: HTMLCanvasElement, uiRoot: HTMLDivElement) {
    this.engine = new Engine(canvas, true, {
      preserveDrawingBuffer: false,
      stencil: false,
      antialias: true,
      adaptToDeviceRatio: false
    });
    this.engine.setHardwareScalingLevel(Math.max(1, Math.min(window.devicePixelRatio || 1, 1.35)));

    const { scene, camera, shadowGenerator } = createGameScene(this.engine, canvas);
    const materials = createGameMaterials(scene);
    this.input = new InputManager(canvas);
    this.ui = new UIController(uiRoot, {
      onStart: () => void this.startGame(),
      onResume: () => this.resume(),
      onRestart: () => void this.restart(),
      onSelectCampus: () => this.selectMode("exploration"),
      onSelectGame: () => this.selectMode("combat"),
      onBackToMenu: () => this.setState("menu")
    });

    this.world = new GameWorld(scene, camera, shadowGenerator, materials, this.audio, {
      onGameOver: () => this.end("gameOver"),
      onVictory: () => this.end("victory"),
      onToast: (message) => this.ui.showToast(message),
      onPlayerDamaged: () => this.ui.flashDamage()
    });

    window.addEventListener("resize", this.resize);
  }

  start(): void {
    this.engine.runRenderLoop(() => {
      const dt = Math.min(0.04, this.engine.getDeltaTime() / 1000);
      const input = this.input.read();
      this.handleGlobalInput(input);

      if (this.state === "playing") {
        this.world.update(dt, input);
        this.ui.update(this.world.snapshot());
      }

      this.engine.scenes[0]?.render();
    });
  }

  dispose(): void {
    window.removeEventListener("resize", this.resize);
    this.input.dispose();
    this.world.dispose();
    this.engine.dispose();
  }

  private selectMode(mode: "exploration" | "combat"): void {
    this.audio.play("ui");
    this.world.setMode(mode);
    this.setState("title");
  }

  private async startGame(): Promise<void> {
    await this.audio.resume();
    this.audio.play("ui");
    this.world.reset();
    this.setState("playing");
  }

  private async restart(): Promise<void> {
    await this.audio.resume();
    this.audio.play("ui");
    this.world.reset();
    this.setState("playing");
  }

  private pause(): void {
    if (this.state !== "playing") return;
    this.lastStateBeforePause = this.state;
    this.audio.play("ui");
    this.setState("paused");
  }

  private resume(): void {
    if (this.state !== "paused") return;
    this.audio.play("ui");
    this.setState(this.lastStateBeforePause);
  }

  private end(state: "victory" | "gameOver"): void {
    if (this.state !== "playing") return;
    this.audio.play(state === "victory" ? "pickup" : "damage");
    this.setState(state);
  }

  private setState(state: GameState): void {
    this.state = state;
    this.ui.setState(state, this.world.snapshot());
  }

  private handleGlobalInput(input: ReturnType<InputManager["read"]>): void {
    if (input.pausePressed) {
      if (this.state === "playing") {
        this.pause();
      } else if (this.state === "paused") {
        this.resume();
      }
    }
    if (input.restartPressed && this.state !== "playing") {
      void this.restart();
    }
  }

  private readonly resize = (): void => {
    this.engine.resize();
  };
}
