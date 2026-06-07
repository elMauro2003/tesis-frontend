"use client";

import { PortalEmptyState } from "@/components/student-portal/PortalEmptyState";
import { PortalListCard } from "@/components/student-portal/PortalListCard";
import { PortalPageShell } from "@/components/student-portal/PortalPageShell";
import { PortalSectionTitle } from "@/components/student-portal/PortalSectionTitle";
import { PortalListSkeleton } from "@/components/student-portal/PortalSkeleton";
import { PortalStatusBadge } from "@/components/student-portal/PortalStatusBadge";
import { useMyRoomDuties } from "@/features/student-portal/room-duties/hooks/useMyRoomDuties";

function formatDutyDate(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(parsed);
}

export function RoomDutiesList() {
  const dutiesQuery = useMyRoomDuties();
  const duties = dutiesQuery.data?.results ?? [];

  return (
    <PortalPageShell>
      <PortalSectionTitle
        title="Mis cuartelerías"
        description="Consulte sus asignaciones de limpieza y áreas comunes."
      />

      {dutiesQuery.isError ? (
        <PortalEmptyState
          icon="error"
          title="No se pudieron cargar las cuartelerías"
          onRetry={() => dutiesQuery.refetch()}
        />
      ) : dutiesQuery.isLoading ? (
        <PortalListSkeleton count={3} />
      ) : duties.length === 0 ? (
        <PortalEmptyState
          icon="cleaning_services"
          title="Sin cuartelerías asignadas"
          description="Cuando se le asigne una cuartelería, aparecerá aquí."
        />
      ) : (
        <div className="space-y-3">
          {duties.map((duty) => (
            <PortalListCard
              key={duty.id}
              title="Cuartelería"
              subtitle={formatDutyDate(duty.date)}
              description={duty.notes || undefined}
              badge={
                <PortalStatusBadge
                  label={duty.completed ? "Completada" : "Pendiente"}
                  tone={duty.completed ? "success" : "warning"}
                />
              }
            />
          ))}
        </div>
      )}
    </PortalPageShell>
  );
}
