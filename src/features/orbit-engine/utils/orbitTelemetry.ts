import { SCHWARZSCHILD_RADIUS_KM } from '../constants/orbitEngine.constants';
import type { EngineParams, TelemetryMetrics } from '../types/orbitEngine.types';

export function calculateTelemetry(params: EngineParams): TelemetryMetrics {
  const m = params.mass;
  const a = params.spin * m;

  const rPlus = m + Math.sqrt(Math.max(0, m * m - a * a));
  const ergosphere = 2 * m;
  const omegaH = params.spin === 0 ? 0 : a / (2 * m * rPlus);

  return {
    rPlusKm: rPlus * SCHWARZSCHILD_RADIUS_KM,
    ergosphereKm: ergosphere * SCHWARZSCHILD_RADIUS_KM,
    orbitalVelC: omegaH * rPlus,
  };
}

export function formatTelemetryValue(value: number): string {
  const abs = Math.abs(value);
  if (abs === 0) return '0.000';
  if (abs >= 1000 || abs <= 0.001) return value.toExponential(3);
  return value.toFixed(3);
}
