import { Room } from "@/types/models";

export type RoomStatusFilter = "all" | "full" | "available" | "closed";

export type RoomDisplayStatus = "closed" | "full" | "available" | "empty";

export const getRoomOccupancy = (room: Room): number =>
  room.current_occupancy ?? room.occupancy ?? 0;

export const isRoomSelectable = (room: Room): boolean => {
  const occupied = getRoomOccupancy(room);
  return room.is_active && !room.is_full && occupied < room.capacity;
};

export const getRoomAvailableSpots = (room: Room): number => {
  if (typeof room.available_spots === "number") {
    return Math.max(0, room.available_spots);
  }
  return Math.max(0, room.capacity - getRoomOccupancy(room));
};

export const deriveRoomDisplayStatus = (room: Room): RoomDisplayStatus => {
  if (!room.is_active) return "closed";
  if (room.is_full) return "full";
  if (getRoomOccupancy(room) === 0) return "empty";
  if (getRoomAvailableSpots(room) > 0) return "available";
  return "full";
};

export const matchesRoomStatusFilter = (room: Room, filter: RoomStatusFilter): boolean => {
  if (filter === "all") return true;
  if (filter === "closed") return !room.is_active;
  if (filter === "full") return room.is_active && Boolean(room.is_full);
  if (filter === "available") {
    return room.is_active && !room.is_full && getRoomAvailableSpots(room) > 0;
  }
  return true;
};

export const getRoomStatusLabel = (room: Room): string => {
  const status = deriveRoomDisplayStatus(room);
  if (status === "closed") return "Clausurado";
  if (status === "full") return "Lleno";
  if (status === "empty") return "Vacío";
  const spots = getRoomAvailableSpots(room);
  return spots === 1 ? "1 Disponible" : `${spots} Disponibles`;
};

export const getRoomStatusBadgeClass = (room: Room): string => {
  const status = deriveRoomDisplayStatus(room);
  if (status === "closed") {
    return "bg-[var(--color-surface-container-high)] text-[var(--color-on-surface-variant)]";
  }
  if (status === "full") {
    return "bg-green-50 text-green-600";
  }
  if (status === "empty") {
    return "bg-[var(--color-primary-selected)] text-[var(--color-primary)]";
  }
  return "bg-[var(--color-primary-selected)] text-[var(--color-primary)]";
};
