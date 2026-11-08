export interface Room {
  id: string;
  name: string;
  building: string;
  capacity: number;
  blocked: boolean;
  equipment: string[];
}

export interface Booking {
  id: string;
  roomId: string;
  start: number; // minutes after midnight
  end: number; // minutes after midnight (exclusive)
  bookedBy: string;
}

export interface ConflictInfo {
  id: string;
  bookedBy: string;
  start: number;
  end: number;
}

export type Availability =
  | { status: 'available' }
  | {
      status: 'unavailable';
      code: string;
      reason: string;
      roomName?: string;
      conflicts?: ConflictInfo[];
    };
