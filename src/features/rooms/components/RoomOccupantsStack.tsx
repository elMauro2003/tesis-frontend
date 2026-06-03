"use client";

import { RoomAssignment } from "@/types/models";
import { getStudentInitials } from "@/features/rooms/utils/roomLabels";

const MAX_VISIBLE = 3;

interface RoomOccupantsStackProps {
  assignments: RoomAssignment[];
}

export function RoomOccupantsStack({ assignments }: RoomOccupantsStackProps) {
  if (assignments.length === 0) {
    return <span className="text-xs font-medium text-[var(--color-on-surface-variant)] italic">Vacío</span>;
  }

  const visible = assignments.slice(0, MAX_VISIBLE);
  const overflow = assignments.length - MAX_VISIBLE;

  return (
    <div className="flex -space-x-3 overflow-hidden">
      {visible.map((assignment) => {
        const name = assignment.student_name ?? "Estudiante";
        return (
          <div
            key={assignment.id}
            title={name}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-primary-light)] ring-2 ring-[var(--color-surface-container-lowest)] text-[10px] font-bold text-[var(--color-primary)]"
          >
            {getStudentInitials(name)}
          </div>
        );
      })}
      {overflow > 0 ? (
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-surface-container-high)] ring-2 ring-[var(--color-surface-container-lowest)] text-[10px] font-bold text-[var(--color-on-surface-variant)]">
          +{overflow}
        </div>
      ) : null}
    </div>
  );
}
