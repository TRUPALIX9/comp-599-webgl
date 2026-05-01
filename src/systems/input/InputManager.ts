import { InputBindings } from "../../config/InputBindings";

export interface InputState {
  accelerate: boolean;
  decelerate: boolean;
  turnAxis: number;
  pitchAxis: number;
  firePrimary: boolean;
  boost: boolean;
  fireMissileLeftPressed: boolean;
  fireMissileRightPressed: boolean;
  pausePressed: boolean;
  restartPressed: boolean;
  pointerX: number;
  pointerY: number;
}

type BindingName = keyof typeof InputBindings;

export class InputManager {
  private readonly heldCodes = new Set<string>();
  private readonly pressedCodes = new Set<string>();
  private pointerX = 0;
  private pointerY = 0;

  constructor(private readonly canvas: HTMLCanvasElement) {
    window.addEventListener("keydown", this.handleKeyDown);
    window.addEventListener("keyup", this.handleKeyUp);
    window.addEventListener("pointermove", this.handlePointerMove);
    canvas.tabIndex = 0;
  }

  dispose(): void {
    window.removeEventListener("keydown", this.handleKeyDown);
    window.removeEventListener("keyup", this.handleKeyUp);
    window.removeEventListener("pointermove", this.handlePointerMove);
  }

  read(): InputState {
    const turnKeyboard = this.axis("turnLeft", "turnRight");
    const pitchKeyboard = this.axis("pitchUp", "pitchDown");
    const mouseTurnAssist = Math.abs(turnKeyboard) > 0.05 ? 0 : this.pointerX * 0.35;
    const mousePitchAssist = this.pointerY * 0.65;

    const state: InputState = {
      accelerate: this.down("accelerate"),
      decelerate: this.down("decelerate"),
      turnAxis: Math.max(-1, Math.min(1, turnKeyboard + mouseTurnAssist)),
      pitchAxis: Math.max(-1, Math.min(1, pitchKeyboard + mousePitchAssist)),
      firePrimary: this.down("firePrimary"),
      boost: this.down("boost"),
      fireMissileLeftPressed: this.pressed("fireMissileLeft"),
      fireMissileRightPressed: this.pressed("fireMissileRight"),
      pausePressed: this.pressed("pause"),
      restartPressed: this.pressed("restart"),
      pointerX: this.pointerX,
      pointerY: this.pointerY
    };

    this.pressedCodes.clear();
    return state;
  }

  private down(binding: BindingName): boolean {
    return InputBindings[binding].some((code) => this.heldCodes.has(code));
  }

  private pressed(binding: BindingName): boolean {
    return InputBindings[binding].some((code) => this.pressedCodes.has(code));
  }

  private axis(negative: BindingName, positive: BindingName): number {
    return (this.down(positive) ? 1 : 0) - (this.down(negative) ? 1 : 0);
  }

  private readonly handleKeyDown = (event: KeyboardEvent): void => {
    if (!this.heldCodes.has(event.code)) {
      this.pressedCodes.add(event.code);
    }
    this.heldCodes.add(event.code);
    if (event.code === "Space" || event.code === "ShiftLeft" || event.code === "ShiftRight") {
      event.preventDefault();
    }
  };

  private readonly handleKeyUp = (event: KeyboardEvent): void => {
    this.heldCodes.delete(event.code);
  };

  private readonly handlePointerMove = (event: PointerEvent): void => {
    const rect = this.canvas.getBoundingClientRect();
    this.pointerX = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
    this.pointerY = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
  };
}
