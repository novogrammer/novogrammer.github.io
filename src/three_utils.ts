import * as THREE from "three";

export function calcCameraZ(height: number, fovDeg: number): number {
  const cameraZ = (height / 2) / Math.tan((fovDeg / 2) * THREE.MathUtils.DEG2RAD);
  return cameraZ;
}