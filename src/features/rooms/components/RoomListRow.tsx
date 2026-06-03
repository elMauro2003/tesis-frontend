"use client";

import { Room, RoomAssignment } from "@/types/models";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RoomOccupantsStack } from "@/features/rooms/components/RoomOccupantsStack";
import { RoomStatusBadge } from "@/features/rooms/components/RoomStatusBadge";
import { deriveRoomDisplayStatus } from "@/features/rooms/utils/roomStatus";

const rowActionClass =
  "h-9 w-9 cursor-pointer text-[var(--color-outline)] hover:text-[var(--color-primary)]";

interface RoomListRowProps {
  room: Room;
  title: string;
  subtitle: string;
  assignments: RoomAssignment[];
  onView: (room: Room) => void;
  onEdit: (room: Room) => void;
  onPermute: (room: Room) => void;
  onRevoke: (room: Room) => void;
  onAssignStudent: (room: Room) => void;
  onClose: (room: Room) => void;
  onDelete: (room: Room) => void;
}

export function RoomListRow({
  room,
  title,
  subtitle,
  assignments,
  onView,
  onEdit,
  onPermute,
  onRevoke,
  onAssignStudent,
  onClose,
  onDelete,
}: RoomListRowProps) {
  const hasFreeSpot = assignments.length < room.capacity;
  const isClosed = deriveRoomDisplayStatus(room) === "closed";
  const iconMuted = isClosed;

  return (
    <div
      className={`relative grid grid-cols-12 items-center rounded-xl p-5 transition-shadow ${
        isClosed
          ? "border border-dashed border-[var(--color-outline-variant)]/30 bg-[var(--color-surface-container-low)]/50 opacity-80 shadow-none"
          : "bg-[var(--color-surface-container-lowest)] shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_24px_rgba(0,55,176,0.08)]"
      }`}
    >
      <div className="col-span-12 flex items-center gap-4 sm:col-span-4">
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${
            iconMuted
              ? "bg-[var(--color-surface-container-high)] text-[var(--color-outline)]"
              : "bg-[var(--color-primary-selected)] text-[var(--color-primary)]"
          }`}
        >
          <span
            className="material-symbols-outlined text-2xl"
            style={iconMuted ? undefined : { fontVariationSettings: "'FILL' 1" }}
          >
            bed
          </span>
        </div>
        <div className="min-w-0">
          <h4 className={`truncate font-bold ${isClosed ? "text-[var(--color-on-surface-variant)]" : "text-[var(--color-on-surface)]"}`}>
            {title}
          </h4>
          <p className="truncate text-xs font-medium text-[var(--color-on-surface-variant)]">{subtitle}</p>
        </div>
      </div>

      <div className="col-span-4 mt-3 text-center sm:col-span-2 sm:mt-0">
        <span className={`text-sm font-bold ${isClosed ? "text-[var(--color-outline)]" : "text-[var(--color-on-surface)]"}`}>
          {room.capacity} {room.capacity === 1 ? "Plaza" : "Plazas"}
        </span>
      </div>

      <div className="col-span-8 mt-3 sm:col-span-3 sm:mt-0">
        <RoomOccupantsStack assignments={assignments} />
      </div>

      <div className="col-span-4 mt-3 sm:col-span-2 sm:mt-0">
        <RoomStatusBadge room={room} />
      </div>

      <div className="col-span-8 mt-3 flex items-center justify-end gap-2 sm:col-span-1 sm:mt-0">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={rowActionClass}
          title="Consultar"
          onClick={() => onView(room)}
          aria-label="Ver cuarto"
        >
          <span className="material-symbols-outlined text-xl">visibility</span>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className={rowActionClass}
              aria-label="Más acciones"
            >
              <span className="material-symbols-outlined text-xl">more_vert</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[13rem]">
            <DropdownMenuItem onSelect={() => onEdit(room)}>
              <span className="material-symbols-outlined text-base">edit</span>
              Editar cuarto
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => onAssignStudent(room)}
              disabled={!room.is_active || !hasFreeSpot}
            >
              <span className="material-symbols-outlined text-base">person_add</span>
              Registrar estudiante
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => onPermute(room)}
              disabled={assignments.length === 0 || !room.is_active}
            >
              <span className="material-symbols-outlined text-base">swap_horiz</span>
              Permutar
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => onRevoke(room)} disabled={assignments.length === 0}>
              <span className="material-symbols-outlined text-base">do_not_disturb_on</span>
              Revocar
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => onClose(room)}
              disabled={!room.is_active}
              className="text-[var(--color-tertiary)] focus:text-[var(--color-tertiary)]"
            >
              <span className="material-symbols-outlined text-base">block</span>
              Clausurar
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={() => onDelete(room)}
              className="text-[var(--color-error)] focus:text-[var(--color-error)]"
            >
              <span className="material-symbols-outlined text-base">delete</span>
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
