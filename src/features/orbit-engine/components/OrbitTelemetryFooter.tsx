import type { TelemetryMetrics } from '../types/orbitEngine.types';
import { formatTelemetryValue } from '../utils/orbitTelemetry';

interface OrbitTelemetryFooterProps {
  telemetry: TelemetryMetrics;
}

export function OrbitTelemetryFooter({ telemetry }: OrbitTelemetryFooterProps) {
  return (
    <footer className="col-span-2 z-10 grid grid-cols-4 items-center border-t border-[#668aff]/20 bg-[#11131c]/95 px-10 py-5">
      <div className="flex flex-col gap-[5px]">
        <span className="text-[10px] uppercase text-[#9c87bc] opacity-60">Event Horizon (r+)</span>
        <div className="font-mono text-[1.2rem] font-medium">
          {formatTelemetryValue(telemetry.rPlusKm)} <span className="ml-1 text-[0.7rem] opacity-50">km</span>
        </div>
      </div>
      <div className="flex flex-col gap-[5px]">
        <span className="text-[10px] uppercase text-[#9c87bc] opacity-60">Ergosphere (Eq)</span>
        <div className="font-mono text-[1.2rem] font-medium">
          {formatTelemetryValue(telemetry.ergosphereKm)} <span className="ml-1 text-[0.7rem] opacity-50">km</span>
        </div>
      </div>
      <div className="flex flex-col gap-[5px]">
        <span className="text-[10px] uppercase text-[#9c87bc] opacity-60">Horizon Ang. Velocity</span>
        <div className="font-mono text-[1.2rem] font-medium">
          {formatTelemetryValue(telemetry.orbitalVelC)} <span className="ml-1 text-[0.7rem] opacity-50">c</span>
        </div>
      </div>
      <div className="flex flex-col gap-[5px]">
        <span className="text-[10px] uppercase text-[#9c87bc] opacity-60">Simulation T-Step</span>
        <div className="font-mono text-[1.2rem] font-medium">
          Adaptive <span className="ml-1 text-[0.7rem] opacity-50">dt</span>
        </div>
      </div>
    </footer>
  );
}
