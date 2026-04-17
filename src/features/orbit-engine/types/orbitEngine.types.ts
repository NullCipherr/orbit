import type { PointerEvent } from 'react';

export interface EngineParams {
  mass: number;
  spin: number;
}

export interface EngineCamera {
  yaw: number;
  pitch: number;
}

export interface TelemetryMetrics {
  rPlusKm: number;
  ergosphereKm: number;
  orbitalVelC: number;
}

export interface OrbitViewportBindings {
  onPointerDown: (event: PointerEvent) => void;
  onPointerMove: (event: PointerEvent) => void;
  onPointerUp: () => void;
  onPointerLeave: () => void;
}
