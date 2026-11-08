import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { checkAvailability } from './lib/availability.ts';
import type { Booking, Room } from './lib/types';

const rooms: Room[] = [
  { id: 'R101', name: 'Room 101', building: 'Test Wing', capacity: 10, blocked: false, equipment: [] },
  { id: 'R202', name: 'Room 202', building: 'Test Wing', capacity: 10, blocked: true, equipment: [] },
];

const existingBookings: Booking[] = [
  { id: 'B1', roomId: 'R101', start: 600, end: 660, bookedBy: 'Student A' },
];

describe('Smart Campus Booking Tests', () => {
  it('allows bookings that only touch at endpoints (AC4)', () => {
    const result = checkAvailability({ roomId: 'R101', start: 660, duration: 60, now: 540 }, rooms, existingBookings);
    assert.equal(result.status, 'available');
  });

  it('rejects overlapping bookings and lists the conflict (AC4)', () => {
    const result = checkAvailability({ roomId: 'R101', start: 630, duration: 60, now: 540 }, rooms, existingBookings);
    assert.equal(result.status, 'unavailable');
    assert.equal(result.status === 'unavailable' && result.code, 'E_OVERLAP');
    assert.deepEqual(result.status === 'unavailable' && result.conflicts?.map((c) => c.id), ['B1']);
  });

  it('rejects a start time that is not later than the current time (AC1)', () => {
    const result = checkAvailability({ roomId: 'R101', start: 540, duration: 60, now: 540 }, rooms, []);
    assert.equal(result.status === 'unavailable' && result.code, 'E_START_PAST');
  });

  it('rejects non-integer minute values (AC1)', () => {
    const result = checkAvailability({ roomId: 'R101', start: 600.5, duration: 60, now: 540 }, rooms, []);
    assert.equal(result.status === 'unavailable' && result.code, 'E_TIME_NOT_INTEGER');
  });

  it('rejects a start time beyond 1440 minutes (AC1)', () => {
    const result = checkAvailability({ roomId: 'R101', start: 1441, duration: 60, now: 540 }, rooms, []);
    assert.equal(result.status === 'unavailable' && result.code, 'E_START_RANGE');
  });

  it('rejects a booking that ends after midnight (AC1)', () => {
    const result = checkAvailability({ roomId: 'R101', start: 1380, duration: 120, now: 540 }, rooms, []);
    assert.equal(result.status === 'unavailable' && result.code, 'E_END_RANGE');
  });

  it('permits a 120-minute booking (AC2)', () => {
    const result = checkAvailability({ roomId: 'R101', start: 720, duration: 120, now: 540 }, rooms, []);
    assert.equal(result.status, 'available');
  });

  it('rejects durations over 120 minutes (AC2)', () => {
    const result = checkAvailability({ roomId: 'R101', start: 720, duration: 121, now: 540 }, rooms, []);
    assert.equal(result.status === 'unavailable' && result.code, 'E_DURATION_TOO_LONG');
  });

  it('rejects a blocked room regardless of time (AC3)', () => {
    const result = checkAvailability({ roomId: 'R202', start: 720, duration: 60, now: 540 }, rooms, []);
    assert.equal(result.status === 'unavailable' && result.code, 'E_ROOM_BLOCKED');
  });

  it('does not mutate the original bookings array (AC5)', () => {
    const bookings: Booking[] = [{ id: 'B1', roomId: 'R101', start: 540, end: 600, bookedBy: 'Student A' }];
    const originalCopy = JSON.parse(JSON.stringify(bookings));
    checkAvailability({ roomId: 'R101', start: 700, duration: 60, now: 540 }, rooms, bookings);
    assert.deepEqual(bookings, originalCopy);
  });
});
