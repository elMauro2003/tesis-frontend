"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { PORTAL_ROUTES } from "@/configs/portalRoutes";
import { PortalEmptyState } from "@/components/student-portal/PortalEmptyState";
import { PortalLoadMore } from "@/components/student-portal/PortalLoadMore";
import { PortalPageShell } from "@/components/student-portal/PortalPageShell";
import { PortalListSkeleton } from "@/components/student-portal/PortalSkeleton";
import { Button } from "@/components/ui/button";
import { CreateComplaintSheet } from "@/features/student-portal/complaints/components/CreateComplaintSheet";
import { DeleteComplaintModal } from "@/features/student-portal/complaints/components/DeleteComplaintModal";
import { MyComplaintCard } from "@/features/student-portal/complaints/components/MyComplaintCard";
import { VisibleComplaintsPanel } from "@/features/student-portal/complaints/components/VisibleComplaintsPanel";
import { useDailyComplaintQuota } from "@/features/student-portal/complaints/hooks/useDailyComplaintQuota";
import { useMyComplaints } from "@/features/student-portal/complaints/hooks/useMyComplaints";
import { usePublicComplaints } from "@/features/student-portal/complaints/hooks/usePublicComplaints";
import { canDeleteComplaint, canEditComplaint } from "@/features/student-portal/complaints/utils/complaintPresentation";
import { Complaint } from "@/types/models";

export function ComplaintsList() {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingComplaint, setEditingComplaint] = useState<Complaint | null>(null);
  const [followUpComplaint, setFollowUpComplaint] = useState<Complaint | null>(null);
  const [deletingComplaint, setDeletingComplaint] = useState<Complaint | null>(null);

  const complaintsQuery = useMyComplaints();
  const publicComplaintsQuery = usePublicComplaints();
  const dailyQuota = useDailyComplaintQuota();

  const complaints = complaintsQuery.data?.pages.flatMap((page) => page.results) ?? [];
  const publicComplaints = publicComplaintsQuery.data?.pages.flatMap((page) => page.results) ?? [];

  const { remainingToday, canCreate, limit: dailyLimit, isLoading: isQuotaLoading, isError: isQuotaError, refetch: refetchQuota } =
    dailyQuota;

  const closeSheet = () => {
    setSheetOpen(false);
    setEditingComplaint(null);
    setFollowUpComplaint(null);
  };

  const openEditSheet = (complaint: Complaint) => {
    if (!canEditComplaint(complaint.status)) {
      toast.error("No se puede editar", {
        description: "Solo puede modificar quejas pendientes o en proceso.",
      });
      return;
    }

    setFollowUpComplaint(null);
    setEditingComplaint(complaint);
    setSheetOpen(true);
  };

  const openFollowUpSheet = (complaint: Complaint) => {
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
    setFollowUpComplaint(complaint);
    setSheetOpen(true);
  };

  const openDeleteModal = (complaint: Complaint) => {
    if (!canDeleteComplaint(complaint.status)) {
      toast.error("No se puede eliminar", {
        description: "Solo puede eliminar quejas pendientes o en proceso.",
      });
      return;
    }

    setDeletingComplaint(complaint);
  };

  const quotaBadgeLabel = isQuotaLoading
    ? "Comprobando cupo diario..."
    : isQuotaError
      ? "Cupo diario no disponible"
      : `Quejas disponibles hoy: ${remainingToday} de ${dailyLimit}`;

  return (
    <PortalPageShell>
      <section className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <h1 className="font-headline text-3xl font-extrabold tracking-tight text-primary">Quejas</h1>
          <span
            className={
              isQuotaError
                ? "self-start rounded-full bg-error-container px-4 py-2 text-xs font-bold text-error"
                : "self-start rounded-full bg-primary-fixed px-4 py-2 text-xs font-bold text-on-primary-fixed"
            }
          >
            {quotaBadgeLabel}
            {isQuotaError ? (
              <button
                type="button"
                onClick={() => refetchQuota()}
                className="ml-2 underline underline-offset-2"
              >
                Reintentar
              </button>
            ) : null}
          </span>
        </div>

        {canCreate && !isQuotaLoading ? (
          <Button asChild variant="primary" className="w-full sm:w-auto">
            <Link href={PORTAL_ROUTES.quejasNueva}>
              <span className="material-symbols-outlined text-lg">add</span>
              Nueva queja
            </Link>
          </Button>
        ) : (
          <Button variant="primary" disabled className="w-full sm:w-auto">
            <span className="material-symbols-outlined text-lg">add</span>
            Nueva queja
          </Button>
        )}
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
                  canCreateFollowUp={canCreate}
                  onEdit={openEditSheet}
                  onDelete={openDeleteModal}
                  onFollowUp={openFollowUpSheet}
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
            isError={publicComplaintsQuery.isError}
            onRetry={() => publicComplaintsQuery.refetch()}
          />
        </div>
      </div>

      <CreateComplaintSheet
        open={sheetOpen}
        onClose={closeSheet}
        complaint={editingComplaint}
        followUpFrom={followUpComplaint}
      />

      <DeleteComplaintModal
        complaint={deletingComplaint}
        open={Boolean(deletingComplaint)}
        onClose={() => setDeletingComplaint(null)}
      />
    </PortalPageShell>
  );
}
