"use client";

import { Room } from "@/types/models";
import { getRoomStatusBadgeClass, getRoomStatusLabel } from "@/features/rooms/utils/roomStatus";

interface RoomStatusBadgeProps {
  room: Room;
}

export function RoomStatusBadge({ room }: RoomStatusBadgeProps) {
  return (
    <span
      className={`inline-flex px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getRoomStatusBadgeClass(room)}`}
    >
      {getRoomStatusLabel(room)}
    </span>
  );
}
