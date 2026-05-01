export const InputBindings = {
  accelerate: ["KeyW"],
  decelerate: ["KeyS"],
  turnLeft: ["KeyA", "ArrowLeft"],
  turnRight: ["KeyD", "ArrowRight"],
  pitchUp: ["ArrowUp"],
  pitchDown: ["ArrowDown"],
  firePrimary: ["Space"],
  boost: ["ShiftLeft", "ShiftRight"],
  fireMissileLeft: ["KeyQ"],
  fireMissileRight: ["KeyE"],
  pause: ["Escape"],
  restart: ["KeyR"]
} as const;
