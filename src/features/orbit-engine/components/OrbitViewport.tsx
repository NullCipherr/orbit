import type { RefObject } from 'react';
import type { OrbitViewportBindings } from '../types/orbitEngine.types';

interface OrbitViewportProps {
  containerRef: RefObject<HTMLDivElement | null>;
  bindings: OrbitViewportBindings;
}

export function OrbitViewport({ containerRef, bindings }: OrbitViewportProps) {
  return (
    <main
      ref={containerRef}
      className="relative flex cursor-grab items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_center,#1b1e2b_0%,#11131c_100%)] active:cursor-grabbing"
      onPointerDown={bindings.onPointerDown}
      onPointerMove={bindings.onPointerMove}
      onPointerUp={bindings.onPointerUp}
      onPointerLeave={bindings.onPointerLeave}
    />
  );
}
