import { Check, Users } from 'lucide-react';
import { Stepper } from '@/components/Stepper';

export function RoomFilters({
  minCapacity,
  maxCapacity,
  onMinCapacityChange,
  equipmentOptions,
  selectedEquipment,
  onToggleEquipment,
  onClear,
  matchCount,
  availableCount,
}: {
  minCapacity: number;
  maxCapacity: number;
  onMinCapacityChange: (v: number) => void;
  equipmentOptions: string[];
  selectedEquipment: string[];
  onToggleEquipment: (item: string) => void;
  onClear: () => void;
  matchCount: number;
  availableCount: number;
}) {
  const isFiltered = minCapacity > 1 || selectedEquipment.length > 0;

  return (
    <div className="mt-3 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
      <Stepper
        label="Attendees (minimum capacity)"
        icon={<Users size={14} />}
        value={minCapacity}
        onChange={onMinCapacityChange}
        min={1}
        max={maxCapacity}
      />

      <fieldset className="min-w-0">
        <legend className="mb-2 text-sm font-medium text-slate-700">Required equipment</legend>
        <div className="flex flex-wrap gap-2">
          {equipmentOptions.map((item) => {
            const active = selectedEquipment.includes(item);
            return (
              <button
                key={item}
                type="button"
                onClick={() => onToggleEquipment(item)}
                aria-pressed={active}
                className={[
                  'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition',
                  active
                    ? 'border-sky-500 bg-sky-600 text-white shadow-sm'
                    : 'border-slate-300 bg-white text-slate-600 hover:border-sky-300 hover:text-sky-700',
                ].join(' ')}
              >
                {active && <Check size={12} />}
                {item}
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="flex flex-col gap-2 border-t border-slate-200 pt-3 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
        <span>
          <span className="font-semibold text-slate-800">{availableCount}</span> available of{' '}
          {matchCount} matching room{matchCount === 1 ? '' : 's'}
        </span>
        {isFiltered && (
          <button
            type="button"
            onClick={onClear}
            className="self-start font-semibold text-sky-700 underline-offset-2 transition hover:underline sm:self-auto"
          >
            Reset filters
          </button>
        )}
      </div>
    </div>
  );
}
