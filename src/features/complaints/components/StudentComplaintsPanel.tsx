"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { DashboardEmptyState } from "@/components/shared/DashboardEmptyState";
import { DashboardPagination } from "@/components/shared/DashboardPagination";
import { DashboardAnnouncementListSkeleton } from "@/components/shared/DashboardSkeletons";
import { CreateComplaintSheet } from "@/features/student-portal/complaints/components/CreateComplaintSheet";
import { DeleteComplaintModal } from "@/features/student-portal/complaints/components/DeleteComplaintModal";
import { MyComplaintCard } from "@/features/student-portal/complaints/components/MyComplaintCard";
import { useDailyComplaintQuota } from "@/features/student-portal/complaints/hooks/useDailyComplaintQuota";
import { useMyComplaints } from "@/features/student-portal/complaints/hooks/useMyComplaints";
import {
  canDeleteComplaint,
  canEditComplaint,
} from "@/features/student-portal/complaints/utils/complaintPresentation";
import { Complaint } from "@/types/models";

const DEFAULT_PAGE_SIZE = 6;
const PAGE_SIZE_OPTIONS = [6, 12, 24];

export function StudentComplaintsPanel() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingComplaint, setEditingComplaint] = useState<Complaint | null>(null);
  const [followUpComplaint, setFollowUpComplaint] = useState<Complaint | null>(null);
  const [deletingComplaint, setDeletingComplaint] = useState<Complaint | null>(null);

  const complaintsQuery = useMyComplaints();
  const dailyQuota = useDailyComplaintQuota();

  const complaints = complaintsQuery.data?.pages.flatMap((entry) => entry.results) ?? [];
  const totalItems = complaints.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginatedComplaints = complaints.slice((safePage - 1) * pageSize, safePage * pageSize);

  const closeSheet = useCallback(() => {
    setSheetOpen(false);
    setEditingComplaint(null);
    setFollowUpComplaint(null);
  }, []);

  const openCreateSheet = () => {
    if (dailyQuota.isLoading) {
      return;
    }

    if (!dailyQuota.canCreate) {
      toast.error("Límite diario alcanzado", {
        description: `Solo puede registrar ${dailyQuota.limit} quejas por día. Intente mañana.`,
      });
      return;
    }

    setEditingComplaint(null);
    setFollowUpComplaint(null);
    setSheetOpen(true);
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
    if (!dailyQuota.canCreate) {
      toast.error("Límite diario alcanzado", {
        description: `Solo puede registrar ${dailyQuota.limit} quejas por día. Intente mañana.`,
      });
      return;
    }

    setEditingComplaint(null);
    setFollowUpComplaint(complaint);
    setSheetOpen(true);
  };

  const isLoading = complaintsQuery.isLoading && !complaintsQuery.data;
  const isError = complaintsQuery.isError;

  return (
    <>
      <section className="overflow-hidden rounded-3xl bg-[var(--color-surface-container-lowest)] shadow-[var(--shadow-ambient)]">
        <div className="flex items-center justify-between gap-4 bg-[var(--color-surface-container-low)] px-6 py-5">
          <div>
            <h2 className="text-base font-bold text-[var(--color-primary-dark)]">Mis solicitudes</h2>
            <p className="mt-1 text-sm text-[var(--color-on-surface-variant)]">
              {isLoading
                ? "Cargando quejas..."
                : `${totalItems} queja${totalItems === 1 ? "" : "s"} registrada${totalItems === 1 ? "" : "s"}`}
            </p>
          </div>
          <Button type="button" variant="add" onClick={openCreateSheet}>
            <span className="material-symbols-outlined text-lg">add</span>
            Nueva queja
          </Button>
        </div>

        <div className="p-6">
          {isError ? (
            <div className="rounded-2xl bg-[var(--color-surface-container-low)] p-6 text-sm text-[var(--color-on-surface-variant)]">
              No fue posible cargar sus quejas. Intente nuevamente.
            </div>
          ) : isLoading ? (
            <DashboardAnnouncementListSkeleton />
          ) : complaints.length === 0 ? (
            <DashboardEmptyState
              title="No hay quejas registradas"
              description="Cuando presente una solicitud, podrá consultar su estado y la respuesta de la administración desde aquí."
              icon="emergency_home"
              secondaryAction={
                <Button type="button" variant="add" onClick={openCreateSheet}>
                  <span className="material-symbols-outlined text-lg">add</span>
                  Registrar primera queja
                </Button>
              }
            />
          ) : (
            <div className="mx-auto max-w-3xl space-y-6">
              {paginatedComplaints.map((complaint) => (
                <MyComplaintCard
                  key={complaint.id}
                  complaint={complaint}
                  canCreateFollowUp={dailyQuota.canCreate}
                  onEdit={openEditSheet}
                  onDelete={(item) => {
                    if (!canDeleteComplaint(item.status)) {
                      toast.error("No se puede eliminar", {
                        description: "Solo puede eliminar quejas pendientes o en proceso.",
                      });
                      return;
                    }

                    setDeletingComplaint(item);
                  }}
                  onFollowUp={openFollowUpSheet}
                />
              ))}
            </div>
          )}
        </div>

        {!isLoading && !isError && totalItems > 0 ? (
          <DashboardPagination
            page={safePage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemLabel="quejas"
            pageSize={pageSize}
            pageSizeOptions={PAGE_SIZE_OPTIONS}
            onPageChange={setPage}
            onPageSizeChange={(value) => {
              setPageSize(value);
              setPage(1);
            }}
          />
        ) : null}
      </section>

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
    </>
  );
}
