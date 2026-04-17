import { Orbit, Rotate3D } from 'lucide-react';
import { PARAM_LIMITS } from '../constants/orbitEngine.constants';
import type { EngineParams } from '../types/orbitEngine.types';
import { OrbitRangeControl } from './OrbitRangeControl';

interface OrbitControlPanelProps {
  params: EngineParams;
  onParamChange: (key: keyof EngineParams, value: number) => void;
}

export function OrbitControlPanel({ params, onParamChange }: OrbitControlPanelProps) {
  return (
    <aside className="z-10 flex flex-col gap-[25px] border-l border-white/10 bg-[#11131c]/70 p-[30px] backdrop-blur-[20px]">
      <div className="flex flex-col gap-[15px]">
        <h3 className="mb-2 flex justify-between font-sans text-[11px] uppercase tracking-[0.1em] text-[#9c87bc]">
          Orbital Parameters <span>System</span>
        </h3>

        <div className="flex flex-col gap-2.5">
          <OrbitRangeControl
            label="Singularity Mass"
            icon={Orbit}
            min={PARAM_LIMITS.mass.min}
            max={PARAM_LIMITS.mass.max}
            step={PARAM_LIMITS.mass.step}
            value={params.mass}
            unit="M☉"
            onChange={(value) => onParamChange('mass', value)}
          />

          <OrbitRangeControl
            label="Kerr Spin (a)"
            icon={Rotate3D}
            min={PARAM_LIMITS.spin.min}
            max={PARAM_LIMITS.spin.max}
            step={PARAM_LIMITS.spin.step}
            value={params.spin}
            unit="c"
            onChange={(value) => onParamChange('spin', value)}
          />

          <div className="mt-6 rounded-lg border border-dashed border-[#668aff]/30 p-4 text-[11px] leading-relaxed text-[#9c87bc]">
            <strong>INTERACTION:</strong>
            <br />
            Click and drag the viewport to orbit the singularity. Adaptive sampling is active to maintain framerate
            during movement.
          </div>
        </div>
      </div>
    </aside>
  );
}
