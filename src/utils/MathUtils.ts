import { Scalar, Vector3 } from "../core/Babylon";

export function clamp01(value: number): number {
  return Scalar.Clamp(value, 0, 1);
}

export function degToRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

export function radToDeg(radians: number): number {
  return (radians * 180) / Math.PI;
}

export function approach(current: number, target: number, delta: number): number {
  if (current < target) {
    return Math.min(target, current + delta);
  }
  return Math.max(target, current - delta);
}

export function horizontalDistance(a: Vector3, b: Vector3): number {
  return Math.hypot(a.x - b.x, a.z - b.z);
}

export function directionFromYawPitch(yaw: number, pitch: number): Vector3 {
  const cp = Math.cos(pitch);
  return new Vector3(Math.sin(yaw) * cp, Math.sin(pitch), Math.cos(yaw) * cp).normalize();
}

export function signedRandom(amount: number): number {
  return (Math.random() * 2 - 1) * amount;
}

export function lerpAngle(current: number, target: number, amount: number): number {
  let delta = ((target - current + Math.PI) % (Math.PI * 2)) - Math.PI;
  if (delta < -Math.PI) {
    delta += Math.PI * 2;
  }
  return current + delta * amount;
}
