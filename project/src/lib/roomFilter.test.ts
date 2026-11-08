import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { ROOMS } from './sampleData.ts';
import { filterRooms, isRoomAvailable, listEquipment } from './roomFilter.ts';
import type { Room } from './types';

const rooms: Room[] = [
  { id: 'A', name: 'A', building: 'X', capacity: 10, blocked: false, equipment: ['Projector', 'Whiteboard'] },
  { id: 'B', name: 'B', building: 'X', capacity: 30, blocked: false, equipment: ['Projector'] },
  { id: 'C', name: 'C', building: 'X', capacity: 50, blocked: true, equipment: ['Projector', 'Whiteboard'] },
];

const noFilter = { minCapacity: 1, equipment: [] };

describe('room filtering', () => {
  it('keeps rooms whose capacity is at least the requested attendees', () => {
    const ids = filterRooms(rooms, { minCapacity: 20, equipment: [] }).map((r) => r.id);
    assert.deepEqual(ids, ['B', 'C']);
  });

  it('includes a room whose capacity equals the requested attendees', () => {
    const ids = filterRooms(rooms, { minCapacity: 10, equipment: [] }).map((r) => r.id);
    assert.deepEqual(ids, ['A', 'B', 'C']);
  });

  it('requires every selected equipment item, not any of them', () => {
    const ids = filterRooms(rooms, { minCapacity: 1, equipment: ['Projector', 'Whiteboard'] }).map((r) => r.id);
    assert.deepEqual(ids, ['A', 'C']);
  });

  it('returns no rooms when no room has all selected equipment', () => {
    assert.deepEqual(filterRooms(rooms, { minCapacity: 1, equipment: ['Smart Board'] }), []);
  });

  it('never marks a blocked room as available, even when it matches', () => {
    const blocked = rooms[2];
    assert.equal(isRoomAvailable(blocked, noFilter), false);
    assert.equal(rooms.filter((r) => isRoomAvailable(r, noFilter)).length, 2);
  });

  it('lists each equipment item once in alphabetical order', () => {
    assert.deepEqual(listEquipment(rooms), ['Projector', 'Whiteboard']);
  });

  it('gives every sample room an equipment list', () => {
    for (const room of ROOMS) assert.ok(Array.isArray(room.equipment), room.id);
  });
});
