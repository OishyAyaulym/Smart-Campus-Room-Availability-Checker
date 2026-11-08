export function Stepper({
  label,
  icon,
  value,
  onChange,
  min,
  max,
  step = 1,
}: {
  label: string;
  icon: React.ReactNode;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step?: number;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-700">
        <span className="text-slate-400">{icon}</span>
        {label}
      </span>
      <div className="flex items-stretch overflow-hidden rounded-xl border border-slate-300 bg-white focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-100">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - step))}
          className="px-3 text-lg font-semibold text-slate-500 transition hover:bg-slate-100 active:bg-slate-200"
          aria-label={`Decrease ${label}`}
        >
          −
        </button>
        <input
          type="number"
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={(e) => {
            const v = e.target.value === '' ? min : Number(e.target.value);
            if (Number.isFinite(v)) onChange(Math.min(max, Math.max(min, Math.round(v))));
          }}
          className="w-full min-w-0 border-x border-slate-200 bg-transparent px-3 py-2.5 text-center text-base font-semibold text-slate-800 outline-none"
        />
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + step))}
          className="px-3 text-lg font-semibold text-slate-500 transition hover:bg-slate-100 active:bg-slate-200"
          aria-label={`Increase ${label}`}
        >
          +
        </button>
      </div>
    </label>
  );
}
