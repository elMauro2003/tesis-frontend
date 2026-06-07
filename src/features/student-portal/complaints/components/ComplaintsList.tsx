"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PortalEmptyState } from "@/components/student-portal/PortalEmptyState";
import { PortalListCard } from "@/components/student-portal/PortalListCard";
import { PortalLoadMore } from "@/components/student-portal/PortalLoadMore";
import { PortalPageShell } from "@/components/student-portal/PortalPageShell";
import { PortalSectionTitle } from "@/components/student-portal/PortalSectionTitle";
import { PortalListSkeleton } from "@/components/student-portal/PortalSkeleton";
import { PortalStatusBadge } from "@/components/student-portal/PortalStatusBadge";
import { CreateComplaintSheet } from "@/features/student-portal/complaints/components/CreateComplaintSheet";
import { useMyComplaints } from "@/features/student-portal/complaints/hooks/useMyComplaints";
import {
  COMPLAINT_STATUS_LABELS,
  COMPLAINT_TYPE_LABELS,
  formatComplaintDate,
  getComplaintStatusTone,
} from "@/features/student-portal/complaints/utils/complaintPresentation";

export function ComplaintsList() {
  const [createOpen, setCreateOpen] = useState(false);
  const complaintsQuery = useMyComplaints();

  const complaints = complaintsQuery.data?.pages.flatMap((page) => page.results) ?? [];

  return (
    <PortalPageShell>
      <PortalSectionTitle
        title="Mis quejas"
        description="Revise el estado de sus quejas y presente nuevas solicitudes."
        action={
          <Button type="button" variant="add" size="sm" onClick={() => setCreateOpen(true)}>
            <span className="material-symbols-outlined text-lg">add</span>
            Nueva
          </Button>
        }
      />

      {complaintsQuery.isError ? (
        <PortalEmptyState
          icon="error"
          title="No se pudieron cargar las quejas"
          onRetry={() => complaintsQuery.refetch()}
        />
      ) : complaintsQuery.isLoading ? (
        <PortalListSkeleton count={4} />
      ) : complaints.length === 0 ? (
        <PortalEmptyState
          icon="emergency_home"
          title="No hay quejas registradas"
          description="Cuando presente una queja o sugerencia, aparecerá aquí para su seguimiento."
        />
      ) : (
        <div className="space-y-3">
          {complaints.map((complaint) => (
            <PortalListCard
              key={complaint.id}
              title={COMPLAINT_TYPE_LABELS[complaint.type] ?? complaint.type}
              subtitle={formatComplaintDate(complaint.date)}
              description={complaint.description}
              badge={
                <PortalStatusBadge
                  label={COMPLAINT_STATUS_LABELS[complaint.status]}
                  tone={getComplaintStatusTone(complaint.status)}
                />
              }
              meta={
                complaint.response ? (
                  <p className="text-xs text-on-surface-variant">
                    <span className="font-semibold not-italic">Respuesta: </span>
                    {complaint.response}
                  </p>
                ) : null
              }
            />
          ))}

          <PortalLoadMore
            onClick={() => complaintsQuery.fetchNextPage()}
            isLoading={complaintsQuery.isFetchingNextPage}
            hasMore={Boolean(complaintsQuery.hasNextPage)}
          />
        </div>
      )}

      <CreateComplaintSheet open={createOpen} onClose={() => setCreateOpen(false)} />
    </PortalPageShell>
  );
}
