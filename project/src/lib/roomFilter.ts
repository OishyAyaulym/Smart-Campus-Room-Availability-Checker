import type { Room } from './types';

export interface RoomFilter {
  minCapacity: number;
  equipment: string[];
}

export function roomMatchesFilter(room: Room, filter: RoomFilter): boolean {
  return (
    room.capacity >= filter.minCapacity &&
    filter.equipment.every((item) => room.equipment.includes(item))
  );
}

export function filterRooms(rooms: Room[], filter: RoomFilter): Room[] {
  return rooms.filter((room) => roomMatchesFilter(room, filter));
}

export function isRoomAvailable(room: Room, filter: RoomFilter): boolean {
  return !room.blocked && roomMatchesFilter(room, filter);
}

export function listEquipment(rooms: Room[]): string[] {
  return [...new Set(rooms.flatMap((room) => room.equipment))].sort((a, b) => a.localeCompare(b));
}
