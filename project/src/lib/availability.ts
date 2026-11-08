import type { Availability, Booking, Room } from './types';
import { DAY_MINUTES, MAX_DURATION_MINUTES } from './bookingRules.ts';

export function minutesToLabel(min: number): string {
  const m = ((min % DAY_MINUTES) + DAY_MINUTES) % DAY_MINUTES;
  const h = Math.floor(m / 60);
  const mm = m % 60;
  const period = h < 12 ? 'AM' : 'PM';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${mm.toString().padStart(2, '0')} ${period}`;
}

export function overlaps(aStart: number, aEnd: number, bStart: number, bEnd: number): boolean {
  // Touching endpoints do not overlap.
  return aStart < bEnd && bStart < aEnd;
}

export interface CheckRequest {
  roomId: string;
  start: number;
  duration: number; // minutes
  now: number;
}

export function checkAvailability(
  req: CheckRequest,
  rooms: Room[],
  bookings: Booking[]
): Availability {
  const { roomId, start, duration, now } = req;
  const end = start + duration;

  // AC1: integer minutes 0..1440, start strictly greater than now.
  if (!Number.isInteger(start) || !Number.isInteger(duration) || !Number.isInteger(now)) {
    return { status: 'unavailable', code: 'E_TIME_NOT_INTEGER', reason: 'Time values must be whole minutes.' };
  }
  if (start < 0 || start > DAY_MINUTES) {
    return { status: 'unavailable', code: 'E_START_RANGE', reason: `Start time must be between 0 and ${DAY_MINUTES} minutes after midnight.` };
  }
  if (duration <= 0) {
    return { status: 'unavailable', code: 'E_DURATION_POSITIVE', reason: 'Booking duration must be greater than 0 minutes.' };
  }
  if (end > DAY_MINUTES) {
    return { status: 'unavailable', code: 'E_END_RANGE', reason: `Booking would end after midnight (${end} > ${DAY_MINUTES}).` };
  }
  if (start <= now) {
    return {
      status: 'unavailable',
      code: 'E_START_PAST',
      reason: `Start time (${minutesToLabel(start)}) must be later than the current time (${minutesToLabel(now)}).`,
    };
  }

  // AC2: max duration 120 minutes (120 permitted).
  if (duration > MAX_DURATION_MINUTES) {
    return { status: 'unavailable', code: 'E_DURATION_TOO_LONG', reason: `Duration of ${duration} min exceeds the ${MAX_DURATION_MINUTES}-minute maximum.` };
  }

  const room = rooms.find((r) => r.id === roomId);
  if (!room) {
    return { status: 'unavailable', code: 'E_ROOM_UNKNOWN', reason: 'Selected room could not be found.' };
  }

  // AC3: blocked room.
  if (room.blocked) {
    return {
      status: 'unavailable',
      code: 'E_ROOM_BLOCKED',
      roomName: room.name,
      reason: `${room.name} is marked as blocked and cannot be booked. Choose another room.`,
    };
  }

  // AC4: overlap with existing bookings (touching endpoints allowed).
  const conflicts = bookings
    .filter((b) => b.roomId === roomId && overlaps(start, end, b.start, b.end))
    .map((b) => ({ id: b.id, bookedBy: b.bookedBy, start: b.start, end: b.end }));

  if (conflicts.length > 0) {
    const names = conflicts.map((c) => `"${c.bookedBy}"`).join(', ');
    return {
      status: 'unavailable',
      code: 'E_OVERLAP',
      roomName: room.name,
      conflicts,
      reason: `Overlaps ${conflicts.length === 1 ? 'an existing booking' : `${conflicts.length} existing bookings`}: ${names}.`,
    };
  }

  return { status: 'available' };
}
