"use client";

import { useState } from "react";
import { toast } from "sonner";
import { PortalEmptyState } from "@/components/student-portal/PortalEmptyState";
import { PortalLoadMore } from "@/components/student-portal/PortalLoadMore";
import { PortalPageShell } from "@/components/student-portal/PortalPageShell";
import { PortalListSkeleton } from "@/components/student-portal/PortalSkeleton";
import { CreateComplaintSheet } from "@/features/student-portal/complaints/components/CreateComplaintSheet";
import { DeleteComplaintModal } from "@/features/student-portal/complaints/components/DeleteComplaintModal";
import { MyComplaintCard } from "@/features/student-portal/complaints/components/MyComplaintCard";
import { VisibleComplaintsPanel } from "@/features/student-portal/complaints/components/VisibleComplaintsPanel";
import { useDailyComplaintQuota } from "@/features/student-portal/complaints/hooks/useDailyComplaintQuota";
import { useMyComplaints } from "@/features/student-portal/complaints/hooks/useMyComplaints";
import { usePublicComplaints } from "@/features/student-portal/complaints/hooks/usePublicComplaints";
import { Complaint } from "@/types/models";

export function ComplaintsList() {
  const [createOpen, setCreateOpen] = useState(false);
  const [editingComplaint, setEditingComplaint] = useState<Complaint | null>(null);
  const [deletingComplaint, setDeletingComplaint] = useState<Complaint | null>(null);

  const complaintsQuery = useMyComplaints();
  const publicComplaintsQuery = usePublicComplaints();
  const dailyQuota = useDailyComplaintQuota();

  const complaints = complaintsQuery.data?.pages.flatMap((page) => page.results) ?? [];
  const publicComplaints = publicComplaintsQuery.data?.pages.flatMap((page) => page.results) ?? [];

  const { remainingToday, canCreate, limit: dailyLimit, isLoading: isQuotaLoading } = dailyQuota;

  const openCreateSheet = () => {
    if (isQuotaLoading) {
      return;
    }

    if (!canCreate) {
      toast.error("Límite diario alcanzado", {
        description: `Solo puede registrar ${dailyLimit} quejas por día. Intente mañana.`,
      });
      return;
    }

    setEditingComplaint(null);
    setCreateOpen(true);
  };

  const openEditSheet = (complaint: Complaint) => {
    setEditingComplaint(complaint);
    setCreateOpen(true);
  };

  const openDeleteModal = (complaint: Complaint) => {
    setDeletingComplaint(complaint);
  };

  return (
    <PortalPageShell>
      <section className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <h1 className="font-headline text-3xl font-extrabold tracking-tight text-primary">Quejas</h1>
          <span className="self-start rounded-full bg-primary-fixed px-4 py-2 text-xs font-bold text-on-primary-fixed">
            {isQuotaLoading
              ? "Comprobando cupo diario..."
              : `Quejas disponibles hoy: ${remainingToday} de ${dailyLimit}`}
          </span>
        </div>

        <button
          type="button"
          onClick={openCreateSheet}
          disabled={isQuotaLoading || !canCreate}
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
                  onDelete={openDeleteModal}
                  onFollowUp={() => openCreateSheet()}
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

      <DeleteComplaintModal
        complaint={deletingComplaint}
        open={Boolean(deletingComplaint)}
        onClose={() => setDeletingComplaint(null)}
      />
    </PortalPageShell>
  );
}
