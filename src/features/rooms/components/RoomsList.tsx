"use client";

import { Room, RoomAssignment } from "@/types/models";
import { DashboardEmptyState } from "@/components/shared/DashboardEmptyState";
import { RoomListRow } from "@/features/rooms/components/RoomListRow";

export type EnrichedRoom = {
  room: Room;
  title: string;
  subtitle: string;
  assignments: RoomAssignment[];
};

interface RoomsListProps {
  items: EnrichedRoom[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  onCreate: () => void;
  onView: (room: Room) => void;
  onEdit: (room: Room) => void;
  onPermute: (room: Room) => void;
  onRevoke: (room: Room) => void;
  onClose: (room: Room) => void;
  onDelete: (room: Room) => void;
}

export function RoomsList({
  items,
  loading,
  error,
  onRetry,
  onCreate,
  onView,
  onEdit,
  onPermute,
  onRevoke,
  onClose,
  onDelete,
}: RoomsListProps) {
  return (
    <section className="space-y-4">
      <div className="hidden px-6 py-3 text-xs font-bold uppercase tracking-widest text-[var(--color-outline)] lg:grid lg:grid-cols-12">
        <div className="col-span-4">Ubicación y Detalle</div>
        <div className="col-span-2 text-center">Capacidad</div>
        <div className="col-span-3">Ocupantes</div>
        <div className="col-span-2">Estado</div>
        <div className="col-span-1 text-right">Acciones</div>
      </div>

      {loading ? (
        Array.from({ length: 5 }).map((_, index) => (
          <div
            key={`room-skeleton-${index}`}
            className="h-[88px] animate-pulse rounded-xl bg-[var(--color-surface-container-low)]"
          />
        ))
      ) : error ? (
        <div className="rounded-xl bg-[var(--color-surface-container-lowest)] p-8 text-center shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
          <p className="text-sm text-[var(--color-error)]">{error}</p>
          <button
            type="button"
            onClick={onRetry}
            className="mt-4 text-sm font-semibold text-[var(--color-primary)] hover:underline cursor-pointer"
          >
            Reintentar
          </button>
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-xl bg-[var(--color-surface-container-lowest)] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
          <DashboardEmptyState
            title="No hay cuartos para mostrar"
            description="Ajuste los filtros o registre un nuevo cuarto para comenzar."
            icon="bed"
            actionLabel="Añadir cuarto"
            onAction={onCreate}
          />
        </div>
      ) : (
        items.map((item) => (
          <RoomListRow
            key={item.room.id}
            room={item.room}
            title={item.title}
            subtitle={item.subtitle}
            assignments={item.assignments}
            onView={onView}
            onEdit={onEdit}
            onPermute={onPermute}
            onRevoke={onRevoke}
            onClose={onClose}
            onDelete={onDelete}
          />
        ))
      )}
    </section>
  );
}
