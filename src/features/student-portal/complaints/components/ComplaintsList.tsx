"use client";

import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PortalEmptyState } from "@/components/student-portal/PortalEmptyState";
import { PortalLoadMore } from "@/components/student-portal/PortalLoadMore";
import { PortalPageShell } from "@/components/student-portal/PortalPageShell";
import { PortalListSkeleton } from "@/components/student-portal/PortalSkeleton";
import { CreateComplaintSheet } from "@/features/student-portal/complaints/components/CreateComplaintSheet";
import { MyComplaintCard } from "@/features/student-portal/complaints/components/MyComplaintCard";
import { PublicComplaintsArchiveSheet } from "@/features/student-portal/complaints/components/PublicComplaintsArchiveSheet";
import { VisibleComplaintsPanel } from "@/features/student-portal/complaints/components/VisibleComplaintsPanel";
import { useMyComplaints } from "@/features/student-portal/complaints/hooks/useMyComplaints";
import { usePublicComplaints } from "@/features/student-portal/complaints/hooks/usePublicComplaints";
import {
  DAILY_COMPLAINT_LIMIT,
  countTodayComplaints,
} from "@/features/student-portal/complaints/utils/complaintPresentation";
import { complaintService } from "@/core/services/complaint.service";
import { FetchError } from "@/lib/fetchClient";
import { Complaint } from "@/types/models";

export function ComplaintsList() {
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [editingComplaint, setEditingComplaint] = useState<Complaint | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const complaintsQuery = useMyComplaints();
  const publicComplaintsQuery = usePublicComplaints();

  const complaints = complaintsQuery.data?.pages.flatMap((page) => page.results) ?? [];
  const publicComplaints = publicComplaintsQuery.data?.results ?? [];

  const todayCount = useMemo(() => countTodayComplaints(complaints), [complaints]);
  const remainingToday = Math.max(0, DAILY_COMPLAINT_LIMIT - todayCount);
  const canCreateToday = remainingToday > 0;

  const deleteMutation = useMutation({
    mutationFn: (id: number) => complaintService.deleteComplaint(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["portal", "complaints"] });
      toast.success("Queja eliminada");
      setDeletingId(null);
    },
    onError: (error) => {
      const message = error instanceof FetchError ? error.message : "No se pudo eliminar la queja.";
      toast.error("Error", { description: message });
      setDeletingId(null);
    },
  });

  const openCreateSheet = () => {
    setEditingComplaint(null);
    setCreateOpen(true);
  };

  const openEditSheet = (complaint: Complaint) => {
    setEditingComplaint(complaint);
    setCreateOpen(true);
  };

  const handleDelete = (complaint: Complaint) => {
    const confirmed = window.confirm("¿Desea eliminar esta queja?");
    if (!confirmed) {
      return;
    }

    setDeletingId(complaint.id);
    deleteMutation.mutate(complaint.id);
  };

  return (
    <PortalPageShell>
      <section className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <h1 className="font-headline text-3xl font-extrabold tracking-tight text-primary">Quejas</h1>
          <span className="self-start rounded-full bg-primary-fixed px-4 py-2 text-xs font-bold text-on-primary-fixed">
            Quejas disponibles hoy: {remainingToday} de {DAILY_COMPLAINT_LIMIT}
          </span>
        </div>

        <button
          type="button"
          onClick={openCreateSheet}
          disabled={!canCreateToday}
          className="bg-primary-gradient flex items-center justify-center gap-2 self-stretch rounded-lg px-6 py-3 font-headline text-sm font-bold text-on-primary shadow-[var(--shadow-primary-btn)] transition-transform hover:scale-[0.98] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 sm:self-auto"
        >
          <span className="material-symbols-outlined">add</span>
          Nueva queja
        </button>
      </section>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10">
        <div className="space-y-6 lg:col-span-8">
          <h2 className="flex items-center gap-2 font-headline text-xl font-bold text-on-surface-variant">
            <span className="material-symbols-outlined text-primary">history</span>
            Mis quejas recientes
          </h2>

          {complaintsQuery.isError ? (
            <PortalEmptyState
              icon="error"
              title="No se pudieron cargar las quejas"
              onRetry={() => complaintsQuery.refetch()}
            />
          ) : complaintsQuery.isLoading ? (
            <PortalListSkeleton count={3} />
          ) : complaints.length === 0 ? (
            <PortalEmptyState
              icon="emergency_home"
              title="No hay quejas registradas"
              description="Cuando presente una queja o sugerencia, aparecerá aquí para su seguimiento."
            />
          ) : (
            <div className="space-y-6">
              {complaints.map((complaint) => (
                <MyComplaintCard
                  key={complaint.id}
                  complaint={complaint}
                  onEdit={openEditSheet}
                  onDelete={handleDelete}
                  onFollowUp={openCreateSheet}
                  isDeleting={deletingId === complaint.id}
                />
              ))}

              <PortalLoadMore
                onClick={() => complaintsQuery.fetchNextPage()}
                isLoading={complaintsQuery.isFetchingNextPage}
                hasMore={Boolean(complaintsQuery.hasNextPage)}
              />
            </div>
          )}
        </div>

        <div className="lg:col-span-4">
          <VisibleComplaintsPanel
            complaints={publicComplaints}
            isLoading={publicComplaintsQuery.isLoading}
            onViewAll={() => setArchiveOpen(true)}
          />
        </div>
      </div>

      <CreateComplaintSheet
        open={createOpen}
        onClose={() => {
          setCreateOpen(false);
          setEditingComplaint(null);
        }}
        complaint={editingComplaint}
      />

      <PublicComplaintsArchiveSheet
        open={archiveOpen}
        onClose={() => setArchiveOpen(false)}
        complaints={publicComplaints}
      />
    </PortalPageShell>
  );
}
