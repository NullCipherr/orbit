import type { EngineCamera, EngineParams } from '../types/orbitEngine.types';

export const DEFAULT_ENGINE_PARAMS: EngineParams = {
  mass: 1.0,
  spin: 0.85,
};

export const DEFAULT_CAMERA: EngineCamera = {
  yaw: 0,
  pitch: 0.3,
};

export const PARAM_LIMITS = {
  mass: { min: 0.1, max: 3.0, step: 0.01 },
  spin: { min: -1.0, max: 1.0, step: 0.01 },
};

export const INTERACTION_QUALITY = {
  dragging: 0.0,
  resting: 1.0,
  settleDelayMs: 150,
};

export const CAMERA_SENSITIVITY = 0.005;
export const CAMERA_PITCH_LIMIT = Math.PI / 2 - 0.1;
export const SCHWARZSCHILD_RADIUS_KM = 1.476;
