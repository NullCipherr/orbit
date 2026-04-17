import { Activity } from 'lucide-react';

export function OrbitEngineHeader() {
  return (
    <header className="col-span-2 z-10 flex items-center justify-between border-b border-[#668aff]/20 bg-gradient-to-r from-[#11131c]/90 to-transparent px-10">
      <div className="flex items-center gap-3 text-[1.2rem] font-black uppercase tracking-[0.2em] text-[#668aff]">
        <Activity className="h-5 w-5" />
        ORBIT
      </div>
      <div className="flex items-center gap-5">
        <div className="rounded bg-[#668aff]/10 px-2 py-1 font-mono text-[10px] text-[#9c87bc]">Engine v1.0</div>
      </div>
    </header>
  );
}
