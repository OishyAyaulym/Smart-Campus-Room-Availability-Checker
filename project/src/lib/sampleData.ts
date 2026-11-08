import type { Booking, Room } from './types';

export const ROOMS: Room[] = [
  {
    id: 'r1',
    name: 'Aurora Hall 101',
    building: 'North Wing',
    capacity: 30,
    blocked: false,
    equipment: ['Projector', 'Whiteboard', 'Microphone'],
  },
  {
    id: 'r2',
    name: 'Beacon Lab 220',
    building: 'East Wing',
    capacity: 24,
    blocked: false,
    equipment: ['Computers', 'Whiteboard', 'Smart Board'],
  },
  {
    id: 'r3',
    name: 'Cedar Seminar 305',
    building: 'South Wing',
    capacity: 12,
    blocked: true,
    equipment: ['Smart Board', 'Whiteboard'],
  },
  {
    id: 'r4',
    name: 'Dover Lecture 410',
    building: 'West Wing',
    capacity: 80,
    blocked: false,
    equipment: ['Projector', 'Microphone', 'Smart Board'],
  },
  {
    id: 'r5',
    name: 'Ellis Study 012',
    building: 'Central',
    capacity: 8,
    blocked: false,
    equipment: ['Whiteboard'],
  },
];

export const SAMPLE_BOOKINGS: Booking[] = [
  { id: 'b1', roomId: 'r1', start: 540, end: 600, bookedBy: 'Intro to Biology' },
  { id: 'b2', roomId: 'r1', start: 660, end: 720, bookedBy: 'Faculty Meeting' },
  { id: 'b3', roomId: 'r2', start: 600, end: 660, bookedBy: 'Robotics Lab' },
  { id: 'b4', roomId: 'r4', start: 720, end: 780, bookedBy: 'Open Lecture' },
  { id: 'b5', roomId: 'r4', start: 900, end: 960, bookedBy: 'Guest Seminar' },
  { id: 'b6', roomId: 'r5', start: 480, end: 540, bookedBy: 'Study Group' },
];

// Fixed "current time" for deterministic demo behavior.
export const NOW_MINUTES = 570; // 09:30
