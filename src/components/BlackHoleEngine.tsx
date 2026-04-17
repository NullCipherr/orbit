import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Settings2, Activity, Rotate3D, Orbit } from 'lucide-react';

interface EngineParams {
  mass: number;
  spin: number;
}

export default function BlackHoleEngine() {
  const containerRef = useRef<HTMLDivElement>(null);

  // React State for UI
  const [params, setParams] = useState<EngineParams>({
    mass: 1.0,
    spin: 0.85,
  });

  // Ref-based rendering: Keep track of latest params without triggering useEffect
  const paramsRef = useRef(params);
  const workerRef = useRef<Worker | null>(null);

  // Mouse interaction state
  const isDragging = useRef(false);
  const previousMouse = useRef({ x: 0, y: 0 });
  const camera = useRef({ yaw: 0, pitch: 0.3 });
  const moveTimeout = useRef<NodeJS.Timeout | null>(null);

  const setQuality = (q: number) => {
    workerRef.current?.postMessage({ type: 'UPDATE_QUALITY', payload: q });
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    isDragging.current = true;
    previousMouse.current = { x: e.clientX, y: e.clientY };
    setQuality(0.0);
    if (containerRef.current) containerRef.current.style.cursor = 'grabbing';
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    
    const deltaX = e.clientX - previousMouse.current.x;
    const deltaY = e.clientY - previousMouse.current.y;
    
    camera.current.yaw -= deltaX * 0.005;
    camera.current.pitch += deltaY * 0.005;
    camera.current.pitch = Math.max(-Math.PI/2 + 0.1, Math.min(Math.PI/2 - 0.1, camera.current.pitch));
    
    previousMouse.current = { x: e.clientX, y: e.clientY };
    
    workerRef.current?.postMessage({
      type: 'UPDATE_CAMERA',
      payload: camera.current
    });

    if (moveTimeout.current) clearTimeout(moveTimeout.current);
    moveTimeout.current = setTimeout(() => setQuality(1.0), 150);
  };

  const handlePointerUp = () => {
    isDragging.current = false;
    if (containerRef.current) containerRef.current.style.cursor = 'grab';
    if (moveTimeout.current) clearTimeout(moveTimeout.current);
    moveTimeout.current = setTimeout(() => setQuality(1.0), 150);
  };

  const handleParamChange = useCallback((key: keyof EngineParams, value: number) => {
    setParams((prev) => {
      const next = { ...prev, [key]: value };
      paramsRef.current = next;
      
      // Send imperative update to Web Worker (Non-blocking)
      if (workerRef.current) {
        workerRef.current.postMessage({
          type: 'UPDATE_PARAMS',
          payload: next
        });
      }
      return next;
    });
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;

    // Create canvas dynamically to avoid Strict Mode transferControlToOffscreen issues
    const canvas = document.createElement('canvas');
    canvas.className = "absolute inset-0 w-full h-full block";
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    containerRef.current.appendChild(canvas);

    const rect = containerRef.current.getBoundingClientRect();
    
    // Handle high DPI displays
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    // Initialize Web Worker for OffscreenCanvas
    const worker = new Worker(new URL('../workers/blackhole.worker.ts', import.meta.url), { type: 'module' });
    workerRef.current = worker;

    // Transfer control to OffscreenCanvas
    try {
      const offscreen = canvas.transferControlToOffscreen();
      worker.postMessage({
        type: 'INIT',
        payload: {
          canvas: offscreen,
          width: canvas.width,
          height: canvas.height
        }
      }, [offscreen]);
      
      // Send initial params
      worker.postMessage({
        type: 'UPDATE_PARAMS',
        payload: paramsRef.current
      });
      worker.postMessage({
        type: 'UPDATE_CAMERA',
        payload: camera.current
      });
    } catch (e) {
      console.error("OffscreenCanvas not supported or already transferred.", e);
    }

    // Handle Resize
    const handleResize = () => {
      if (!containerRef.current) return;
      const newRect = containerRef.current.getBoundingClientRect();
      worker.postMessage({
        type: 'RESIZE',
        payload: {
          width: newRect.width * dpr,
          height: newRect.height * dpr
        }
      });
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      worker.postMessage({ type: 'STOP' });
      worker.terminate();
      if (containerRef.current && canvas.parentNode === containerRef.current) {
        containerRef.current.removeChild(canvas);
      }
    };
  }, []);

  // Telemetry Calculations
  const m = params.mass;
  const a = params.spin * m;
  
  // Event Horizon (r+)
  const rPlus = m + Math.sqrt(Math.max(0, m * m - a * a));
  
  // Ergosphere (Equatorial)
  const ergosphere = 2 * m;
  
  const rPlusKm = rPlus * 1.476; 
  const ergosphereKm = ergosphere * 1.476;
  
  const omegaH = params.spin === 0 ? 0 : a / (2 * m * rPlus);
  const orbitalVelC = omegaH * rPlus;

  const formatValue = (val: number) => {
    const abs = Math.abs(val);
    if (abs === 0) return "0.000";
    if (abs >= 1000 || abs <= 0.001) return val.toExponential(3);
    return val.toFixed(3);
  };

  return (
    <div className="grid grid-cols-[1fr_340px] grid-rows-[80px_1fr_120px] w-full h-screen bg-[#11131c] text-[#e0e6ed] font-sans overflow-hidden">
      {/* HEADER */}
      <header className="col-span-2 flex items-center justify-between px-10 border-b border-[#668aff]/20 bg-gradient-to-r from-[#11131c]/90 to-transparent z-10">
        <div className="font-black tracking-[0.2em] uppercase text-[1.2rem] text-[#668aff] flex items-center gap-3">
          <Activity className="w-5 h-5" />
          EVENT HORIZON ENGINE
        </div>
        <div className="flex gap-5 items-center">
          <div className="font-mono text-[10px] bg-[#668aff]/10 px-2 py-1 rounded text-[#9c87bc]">
            Engine v1.0
          </div>
        </div>
      </header>

      {/* SIMULATION VIEWPORT */}
      <main 
        ref={containerRef} 
        className="relative flex items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_center,#1b1e2b_0%,#11131c_100%)] cursor-grab active:cursor-grabbing"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
      </main>

      {/* CONTROL SIDEBAR */}
      <aside className="bg-[#11131c]/70 backdrop-blur-[20px] border-l border-white/10 p-[30px] flex flex-col gap-[25px] z-10">
        <div className="flex flex-col gap-[15px]">
          <h3 className="font-sans text-[11px] uppercase tracking-[0.1em] text-[#9c87bc] flex justify-between mb-2">
            Orbital Parameters <span>System</span>
          </h3>
          
          <div className="flex flex-col gap-2.5">
            {/* Mass Control */}
            <div className="flex items-center gap-[15px]">
              <span className="text-[12px] opacity-80 w-[120px] flex items-center gap-2">
                <Orbit className="w-3.5 h-3.5 text-[#9c87bc]" /> Singularity Mass
              </span>
              <div className="flex-grow relative flex items-center">
                <input
                  type="range"
                  min="0.1"
                  max="3.0"
                  step="0.01"
                  value={params.mass}
                  onChange={(e) => handleParamChange('mass', parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
              <span className="font-mono text-[11px] w-[50px] text-right text-[#668aff]">
                {params.mass.toFixed(2)} M☉
              </span>
            </div>

            {/* Spin Control */}
            <div className="flex items-center gap-[15px]">
              <span className="text-[12px] opacity-80 w-[120px] flex items-center gap-2">
                <Rotate3D className="w-3.5 h-3.5 text-[#9c87bc]" /> Kerr Spin (a)
              </span>
              <div className="flex-grow relative flex items-center">
                <input
                  type="range"
                  min="-1.0"
                  max="1.0"
                  step="0.01"
                  value={params.spin}
                  onChange={(e) => handleParamChange('spin', parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
              <span className="font-mono text-[11px] w-[50px] text-right text-[#668aff]">
                {params.spin.toFixed(2)} c
              </span>
            </div>

            {/* Inclination Control -> Replaced with Mouse Control Note */}
            <div className="mt-6 p-4 border border-dashed border-[#668aff]/30 rounded-lg text-[11px] leading-relaxed text-[#9c87bc]">
              <strong>INTERACTION:</strong><br/>
              Click and drag the viewport to orbit the singularity. Adaptive sampling is active to maintain framerate during movement.
            </div>
          </div>
        </div>
      </aside>

      {/* BOTTOM TELEMETRY */}
      <footer className="col-span-2 bg-[#11131c]/95 border-t border-[#668aff]/20 grid grid-cols-4 px-10 py-5 items-center z-10">
        <div className="flex flex-col gap-[5px]">
          <span className="text-[10px] uppercase text-[#9c87bc] opacity-60">Event Horizon (r+)</span>
          <div className="font-mono text-[1.2rem] font-medium">{formatValue(rPlusKm)} <span className="text-[0.7rem] opacity-50 ml-1">km</span></div>
        </div>
        <div className="flex flex-col gap-[5px]">
          <span className="text-[10px] uppercase text-[#9c87bc] opacity-60">Ergosphere (Eq)</span>
          <div className="font-mono text-[1.2rem] font-medium">{formatValue(ergosphereKm)} <span className="text-[0.7rem] opacity-50 ml-1">km</span></div>
        </div>
        <div className="flex flex-col gap-[5px]">
          <span className="text-[10px] uppercase text-[#9c87bc] opacity-60">Horizon Ang. Velocity</span>
          <div className="font-mono text-[1.2rem] font-medium">{formatValue(orbitalVelC)} <span className="text-[0.7rem] opacity-50 ml-1">c</span></div>
        </div>
        <div className="flex flex-col gap-[5px]">
          <span className="text-[10px] uppercase text-[#9c87bc] opacity-60">Simulation T-Step</span>
          <div className="font-mono text-[1.2rem] font-medium">Adaptive <span className="text-[0.7rem] opacity-50 ml-1">dt</span></div>
        </div>
      </footer>
    </div>
  );
}
