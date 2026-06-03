"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ModalCloseButton } from "@/components/shared/ModalCloseButton";
import { infrastructureService } from "@/core/services/infrastructure.service";
import { Room, RoomAssignment } from "@/types/models";
import { RoomOccupantsStack } from "@/features/rooms/components/RoomOccupantsStack";
import { RoomStatusBadge } from "@/features/rooms/components/RoomStatusBadge";
import { getRoomOccupancy, getRoomAvailableSpots } from "@/features/rooms/utils/roomStatus";
import { getStudentInitials } from "@/features/rooms/utils/roomLabels";

const ANIM_MS = 320;

interface ViewRoomPanelProps {
  roomId: number | null;
  roomLabel: string;
  locationSubtitle: string;
  assignments: RoomAssignment[];
  open: boolean;
  onClose: () => void;
}

export function ViewRoomPanel({
  roomId,
  roomLabel,
  locationSubtitle,
  assignments,
  open,
  onClose,
}: ViewRoomPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  const detailQuery = useQuery({
    queryKey: ["room-detail", roomId],
    queryFn: () => infrastructureService.getRoomById(roomId!),
    enabled: open && roomId !== null,
    staleTime: 30 * 1000,
  });

  useEffect(() => {
    setIsOpen(open && roomId !== null);
  }, [open, roomId]);

  const handleRequestClose = () => {
    setIsOpen(false);
    window.setTimeout(() => onClose(), ANIM_MS);
  };

  if (!isOpen && !roomId) return null;

  const room: Room | undefined = detailQuery.data;
  const title = room?.number ?? roomLabel;
  const subtitle =
    room?.building_name && room?.wing_name
      ? `${room.building_name} • ${room.wing_name}`
      : locationSubtitle;
  const occupancy = room ? getRoomOccupancy(room) : 0;
  const available = room ? getRoomAvailableSpots(room) : 0;

  return (
    <>
      <div
        className={`fixed inset-0 z-[60] bg-slate-900/20 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={handleRequestClose}
        aria-hidden
      />
      <div
        className={`fixed inset-y-0 right-0 z-[70] flex w-full max-w-md flex-col overflow-hidden bg-[var(--color-surface-container-lowest)] shadow-2xl transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "translate-x-full"}`}
        role="dialog"
        aria-modal="true"
      >
        <header className="relative flex flex-col gap-4 border-b border-[var(--color-outline-variant)]/20 bg-[var(--color-surface-container-lowest)] p-6">
          <ModalCloseButton
            onClick={handleRequestClose}
            label="Cerrar panel"
            className="absolute right-4 top-4"
          />
          <div className="mt-2 flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--color-primary-selected)] text-[var(--color-primary)] shadow-sm ring-4 ring-[var(--color-surface-container-lowest)]">
              <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                bed
              </span>
            </div>
            <div>
              <h3 className="font-headline text-2xl font-bold leading-tight text-[var(--color-primary-dark)]">{title}</h3>
              <p className="text-sm text-[var(--color-on-surface-variant)]">{subtitle}</p>
            </div>
          </div>
          {room ? (
            <div className="flex flex-wrap items-center gap-3">
              <RoomStatusBadge room={room} />
              <span className="text-xs font-medium text-[var(--color-on-surface-variant)]">
                {occupancy}/{room.capacity} ocupadas · {available} disponible{available === 1 ? "" : "s"}
              </span>
            </div>
          ) : null}
        </header>

        <div className="flex-1 space-y-6 overflow-y-auto p-6">
          {detailQuery.isLoading ? (
            <div className="space-y-3 animate-pulse">
              <div className="h-4 w-2/3 rounded bg-[var(--color-surface-container-high)]" />
              <div className="h-20 rounded-xl bg-[var(--color-surface-container-low)]" />
            </div>
          ) : (
            <>
              <section>
                <h4 className="mb-3 text-[10px] font-bold uppercase tracking-wider text-[var(--color-outline)]">
                  Ocupantes actuales
                </h4>
                <RoomOccupantsStack assignments={assignments} />
                {assignments.length > 0 ? (
                  <ul className="mt-4 space-y-2">
                    {assignments.map((assignment) => {
                      const name = assignment.student_name ?? "Estudiante";
                      return (
                        <li
                          key={assignment.id}
                          className="flex items-center gap-3 rounded-xl bg-[var(--color-surface-container-low)] px-4 py-3"
                        >
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-primary-light)] text-xs font-bold text-[var(--color-primary)]">
                            {getStudentInitials(name)}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-[var(--color-on-surface)]">{name}</p>
                            {assignment.student_id_code ? (
                              <p className="text-xs text-[var(--color-on-surface-variant)]">{assignment.student_id_code}</p>
                            ) : null}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                ) : null}
              </section>
            </>
          )}
        </div>
      </div>
    </>
  );
}
