import type { LucideIcon } from 'lucide-react';

interface OrbitRangeControlProps {
  label: string;
  icon: LucideIcon;
  min: number;
  max: number;
  step: number;
  value: number;
  unit: string;
  accentColorClassName?: string;
  onChange: (value: number) => void;
}

export function OrbitRangeControl({
  label,
  icon: Icon,
  min,
  max,
  step,
  value,
  unit,
  accentColorClassName = 'text-[#9c87bc]',
  onChange,
}: OrbitRangeControlProps) {
  return (
    <div className="flex items-center gap-[15px]">
      <span className="flex w-[120px] items-center gap-2 text-[12px] opacity-80">
        <Icon className={`h-3.5 w-3.5 ${accentColorClassName}`} /> {label}
      </span>
      <div className="relative flex flex-grow items-center">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(event) => onChange(parseFloat(event.target.value))}
          className="w-full"
        />
      </div>
      <span className="w-[50px] text-right font-mono text-[11px] text-[#668aff]">
        {value.toFixed(2)} {unit}
      </span>
    </div>
  );
}
