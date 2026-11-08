import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  CalendarCheck,
  CalendarX,
  CheckCircle2,
  Clock,
  DoorClosed,
  DoorOpen,
  Info,
  MapPin,
  ShieldCheck,
  Timer,
  Users,
  XCircle,
} from 'lucide-react';
import { ROOMS, SAMPLE_BOOKINGS, NOW_MINUTES } from '@/lib/sampleData';
import { checkAvailability, minutesToLabel } from '@/lib/availability';
import { DAY_MINUTES, MAX_DURATION_MINUTES } from '@/lib/bookingRules';
import {
  filterRooms,
  isRoomAvailable,
  listEquipment,
  type RoomFilter,
} from '@/lib/roomFilter';
import type { Availability, Booking, ConflictInfo } from '@/lib/types';
import { RoomFilters } from '@/components/RoomFilters';
import { Stepper } from '@/components/Stepper';

function RoomCard({
  id,
  selected,
  onSelect,
}: {
  id: string;
  selected: boolean;
  onSelect: (id: string) => void;
}) {
  const room = ROOMS.find((r) => r.id === id)!;
  return (
    <button
      type="button"
      onClick={() => onSelect(room.id)}
      disabled={room.blocked}
      className={[
        'group relative flex w-full flex-col gap-2 rounded-2xl border p-4 text-left transition',
        room.blocked
          ? 'cursor-not-allowed border-slate-200 bg-slate-50 opacity-70'
          : selected
            ? 'border-sky-500 bg-sky-50 ring-2 ring-sky-200'
            : 'border-slate-200 bg-white hover:border-sky-300 hover:shadow-sm',
      ].join(' ')}
      aria-pressed={selected}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span
            className={[
              'flex h-9 w-9 items-center justify-center rounded-lg',
              room.blocked
                ? 'bg-rose-100 text-rose-500'
                : selected
                  ? 'bg-sky-500 text-white'
                  : 'bg-slate-100 text-slate-500 group-hover:bg-sky-100 group-hover:text-sky-600',
            ].join(' ')}
          >
            {room.blocked ? <DoorClosed size={18} /> : <DoorOpen size={18} />}
          </span>
          <div>
            <p className="text-sm font-semibold leading-tight text-slate-800">{room.name}</p>
            <p className="flex items-center gap-1 text-xs text-slate-500">
              <MapPin size={12} /> {room.building}
            </p>
          </div>
        </div>
        {room.blocked && (
          <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-rose-600">
            Blocked
          </span>
        )}
      </div>
      <div className="flex items-center gap-3 text-xs text-slate-500">
        <span className="flex items-center gap-1">
          <Users size={12} /> {room.capacity} seats
        </span>
      </div>
    </button>
  );
}

function BookingChip({ b, conflict = false }: { b: Booking; conflict?: boolean }) {
  return (
    <div
      className={[
        'flex flex-col gap-0.5 rounded-lg border px-3 py-2 text-sm sm:flex-row sm:items-center sm:justify-between',
        conflict
          ? 'border-rose-300 bg-rose-50'
          : 'border-slate-200 bg-white',
      ].join(' ')}
    >
      <span className="font-medium text-slate-700">{b.bookedBy}</span>
      <span className="flex items-center gap-1 font-mono text-xs text-slate-500">
        <Clock size={12} />
        {minutesToLabel(b.start)} – {minutesToLabel(b.end)}
      </span>
    </div>
  );
}

function ConflictList({ conflicts }: { conflicts: ConflictInfo[] }) {
  if (conflicts.length === 0) return null;
  return (
    <div className="mt-3 flex flex-col gap-1.5">
      <p className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-rose-500">
        <AlertTriangle size={12} /> Conflicting bookings
      </p>
      {conflicts.map((c) => (
        <BookingChip
          key={c.id}
          b={{ id: c.id, roomId: '', bookedBy: c.bookedBy, start: c.start, end: c.end }}
          conflict
        />
      ))}
    </div>
  );
}

function ResultBanner({ result }: { result: Availability | null }) {
  if (!result) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-5 text-center text-sm text-slate-400">
        Select a room, enter a start time and duration, then check availability.
      </div>
    );
  }
  if (result.status === 'available') {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-600" />
          <div>
            <p className="text-base font-semibold text-emerald-800">Available</p>
            <p className="text-sm text-emerald-700">
              The room is free for the requested time slot. Intervals that only touch at an endpoint
              are not considered conflicts.
            </p>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5">
      <div className="flex items-start gap-3">
        <XCircle className="mt-0.5 shrink-0 text-rose-600" />
        <div className="min-w-0 flex-1">
          <p className="text-base font-semibold text-rose-800">Unavailable</p>
          <p className="text-sm text-rose-700">{result.reason}</p>
          <p className="mt-1 font-mono text-[11px] uppercase tracking-wide text-rose-400">
            {result.code}
          </p>
          {result.conflicts && result.conflicts.length > 0 && (
            <ConflictList conflicts={result.conflicts} />
          )}
        </div>
      </div>
    </div>
  );
}

const RULES: { ac: string; icon: React.ReactNode; text: string }[] = [
  {
    ac: 'AC1',
    icon: <Clock size={14} />,
    text: `Times are integer minutes after midnight (0–${DAY_MINUTES}). Start must be strictly later than the current time.`,
  },
  {
    ac: 'AC2',
    icon: <Timer size={14} />,
    text: `Booking duration must not exceed ${MAX_DURATION_MINUTES} minutes. A ${MAX_DURATION_MINUTES}-minute booking is permitted.`,
  },
  {
    ac: 'AC3',
    icon: <DoorClosed size={14} />,
    text: 'Rooms marked as blocked are always rejected, regardless of time.',
  },
  {
    ac: 'AC4',
    icon: <AlertTriangle size={14} />,
    text: 'Requests overlapping any existing booking are rejected. Intervals touching at an endpoint (e.g. 600–660 and 660–720) do not overlap and are allowed.',
  },
  {
    ac: 'AC5',
    icon: <CheckCircle2 size={14} />,
    text: 'Result is an unambiguous Available or Unavailable verdict. Existing bookings are never modified.',
  },
  {
    ac: 'AC6',
    icon: <Info size={14} />,
    text: 'Clear, specific validation feedback with a responsive layout on both mobile and desktop.',
  },
];

function App() {
  const bookings = useMemo(() => SAMPLE_BOOKINGS, []);
  const [roomId, setRoomId] = useState<string>(ROOMS[0].id);
  const [start, setStart] = useState<number>(NOW_MINUTES + 90); // 11:00
  const [duration, setDuration] = useState<number>(60);
  const [result, setResult] = useState<Availability | null>(null);
  const [minCapacity, setMinCapacity] = useState<number>(1);
  const [requiredEquipment, setRequiredEquipment] = useState<string[]>([]);

  const roomFilter: RoomFilter = { minCapacity, equipment: requiredEquipment };
  const filteredRooms = filterRooms(ROOMS, roomFilter);
  const availableCount = filteredRooms.filter((r) => isRoomAvailable(r, roomFilter)).length;
  const equipmentOptions = listEquipment(ROOMS);
  const maxCapacity = Math.max(...ROOMS.map((r) => r.capacity));
  const selectedMatches = filteredRooms.some((r) => r.id === roomId);

  const applyFilter = (next: RoomFilter) => {
    setMinCapacity(next.minCapacity);
    setRequiredEquipment(next.equipment);
    const matches = filterRooms(ROOMS, next);
    if (matches.length > 0 && !matches.some((r) => r.id === roomId)) {
      setRoomId((matches.find((r) => !r.blocked) ?? matches[0]).id);
    }
  };

  const handleToggleEquipment = (item: string) => {
    applyFilter({
      minCapacity,
      equipment: requiredEquipment.includes(item)
        ? requiredEquipment.filter((e) => e !== item)
        : [...requiredEquipment, item],
    });
  };

  const selectedRoom = ROOMS.find((r) => r.id === roomId)!;
  const roomBookings = bookings.filter((b) => b.roomId === roomId);

  const handleCheck = () => {
    const r = checkAvailability({ roomId, start, duration, now: NOW_MINUTES }, ROOMS, bookings);
    // AC5: do not mutate existing booking data — we only read from `bookings`.
    setResult(r);
  };

  const handleReset = () => {
    setResult(null);
  };

  const end = start + duration;
  const isValidRange = start >= 0 && start <= DAY_MINUTES && duration > 0 && end <= DAY_MINUTES;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 via-slate-50 to-white text-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-600 text-white shadow-sm sm:h-10 sm:w-10">
              <CalendarCheck size={18} />
            </span>
            <div className="min-w-0">
              <h1 className="truncate text-sm font-semibold leading-tight text-slate-900 sm:text-lg">
                Smart Campus Room Availability
              </h1>
              <p className="hidden text-xs text-slate-500 sm:block">
                Check a room before you book it
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1.5 text-[11px] font-medium text-slate-600 sm:px-3 sm:text-xs">
            <Clock size={13} />
            <span className="hidden sm:inline">Current time:</span>
            <span className="font-semibold">{minutesToLabel(NOW_MINUTES)}</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-10">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
          {/* Left: form */}
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
              1. Choose a room
            </h2>
            <RoomFilters
              minCapacity={minCapacity}
              maxCapacity={maxCapacity}
              onMinCapacityChange={(v) => applyFilter({ minCapacity: v, equipment: requiredEquipment })}
              equipmentOptions={equipmentOptions}
              selectedEquipment={requiredEquipment}
              onToggleEquipment={handleToggleEquipment}
              onClear={() => applyFilter({ minCapacity: 1, equipment: [] })}
              matchCount={filteredRooms.length}
              availableCount={availableCount}
            />
            {filteredRooms.length === 0 ? (
              <div className="mt-3 flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 py-8 text-center">
                <DoorClosed className="text-slate-300" />
                <p className="text-sm text-slate-500">No rooms match these filters.</p>
              </div>
            ) : (
              <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
                {filteredRooms.map((r) => (
                  <RoomCard key={r.id} id={r.id} selected={r.id === roomId} onSelect={setRoomId} />
                ))}
              </div>
            )}

            <h2 className="mt-6 text-sm font-semibold uppercase tracking-wide text-slate-400">
              2. Set a time
            </h2>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <Stepper
                label="Start time (min after midnight)"
                icon={<Clock size={14} />}
                value={start}
                onChange={setStart}
                min={0}
                max={DAY_MINUTES}
                step={5}
              />
              <Stepper
                label={`Duration (minutes, max ${MAX_DURATION_MINUTES})`}
                icon={<Timer size={14} />}
                value={duration}
                onChange={setDuration}
                min={1}
                max={MAX_DURATION_MINUTES}
                step={5}
              />
            </div>

            <div className="mt-4 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
              <div className="flex flex-col gap-1.5 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                <span>
                  Start:{' '}
                  <span className="font-semibold text-slate-800">{minutesToLabel(start)}</span>
                </span>
                <span>
                  End: <span className="font-semibold text-slate-800">{minutesToLabel(end)}</span>
                </span>
                <span>
                  Duration:{' '}
                  <span className="font-semibold text-slate-800">{duration} min</span>
                </span>
              </div>
              {!isValidRange && (
                <p className="mt-2 text-xs font-medium text-rose-500">
                  {`Time values must be whole minutes 0–${DAY_MINUTES} and the booking must end by midnight.`}
                </p>
              )}
            </div>

            <div className="mt-5 flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={handleCheck}
                disabled={selectedRoom.blocked || !selectedMatches}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-sky-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700 active:bg-sky-800 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                <CalendarCheck size={16} />
                Check availability
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                Clear
              </button>
            </div>
          </section>

          {/* Right: result + bookings */}
          <section className="flex flex-col gap-6">
            <div>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
                Result
              </h2>
              <ResultBanner result={result} />
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
                  Existing bookings
                </h2>
                <span className="text-xs font-medium text-slate-500">{selectedRoom.name}</span>
              </div>
              {roomBookings.length === 0 ? (
                <div className="mt-4 flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-200 py-8 text-center">
                  <CalendarX className="text-slate-300" />
                  <p className="text-sm text-slate-400">No existing bookings for this room.</p>
                </div>
              ) : (
                <div className="mt-4 flex flex-col gap-2">
                  {roomBookings.map((b) => (
                    <BookingChip key={b.id} b={b} />
                  ))}
                </div>
              )}
              {selectedRoom.blocked && (
                <p className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-xs font-medium text-rose-600">
                  This room is blocked and cannot be booked.
                </p>
              )}
            </div>
          </section>
        </div>

        {/* Rules summary */}
        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:mt-10 sm:p-7">
          <div className="flex items-center gap-2">
            <ShieldCheck className="text-sky-600" size={18} />
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Validation rules (AC1–AC6)
            </h2>
          </div>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {RULES.map((r) => (
              <li
                key={r.ac}
                className="flex gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5"
              >
                <span className="flex h-7 w-12 shrink-0 items-center justify-center rounded-md bg-sky-100 text-[11px] font-bold tracking-wide text-sky-700">
                  {r.ac}
                </span>
                <div className="min-w-0">
                  <p className="flex items-center gap-1 text-xs font-semibold text-slate-400">
                    {r.icon}
                    Rule
                  </p>
                  <p className="mt-0.5 text-sm leading-relaxed text-slate-700">{r.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <footer className="mt-8 text-center text-xs text-slate-400">
          Fictional sample data only. No bookings are actually stored or modified.
        </footer>
      </main>
    </div>
  );
}

export default App;
