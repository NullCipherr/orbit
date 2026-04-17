import { OrbitControlPanel } from './components/OrbitControlPanel';
import { OrbitEngineHeader } from './components/OrbitEngineHeader';
import { OrbitTelemetryFooter } from './components/OrbitTelemetryFooter';
import { OrbitViewport } from './components/OrbitViewport';
import { useOrbitEngineController } from './hooks/useOrbitEngineController';
import { calculateTelemetry } from './utils/orbitTelemetry';

export default function OrbitEngine() {
  const { containerRef, params, updateParam, viewportBindings } = useOrbitEngineController();
  const telemetry = calculateTelemetry(params);

  return (
    <div className="grid h-screen w-full grid-cols-[1fr_340px] grid-rows-[80px_1fr_120px] overflow-hidden bg-[#11131c] font-sans text-[#e0e6ed]">
      <OrbitEngineHeader />
      <OrbitViewport containerRef={containerRef} bindings={viewportBindings} />
      <OrbitControlPanel params={params} onParamChange={updateParam} />
      <OrbitTelemetryFooter telemetry={telemetry} />
    </div>
  );
}
