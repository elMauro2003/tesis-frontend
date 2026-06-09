"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PORTAL_ROUTES } from "@/configs/portalRoutes";
import { PortalBackLink } from "@/components/student-portal/PortalBackLink";
import { PortalPageShell } from "@/components/student-portal/PortalPageShell";
import { PortalSectionTitle } from "@/components/student-portal/PortalSectionTitle";
import { PortalComplaintFormSkeleton } from "@/components/student-portal/PortalSkeleton";
import { CreateComplaintSheet } from "@/features/student-portal/complaints/components/CreateComplaintSheet";
import { useDailyComplaintQuota } from "@/features/student-portal/complaints/hooks/useDailyComplaintQuota";

export default function NuevaQuejaPage() {
  const router = useRouter();
  const dailyQuota = useDailyComplaintQuota();
  const [canShowForm, setCanShowForm] = useState(false);

  useEffect(() => {
    if (dailyQuota.isLoading) {
      return;
    }

    if (dailyQuota.isReady && dailyQuota.remainingToday === 0) {
      toast.error("Límite diario alcanzado", {
        description: `Solo puede registrar ${dailyQuota.limit} quejas por día. Intente mañana.`,
      });
      router.replace(PORTAL_ROUTES.quejas);
      return;
    }

    setCanShowForm(true);
  }, [dailyQuota.isLoading, dailyQuota.isReady, dailyQuota.limit, dailyQuota.remainingToday, router]);

  const handleClose = () => {
    router.replace(PORTAL_ROUTES.quejas);
  };

  if (dailyQuota.isLoading || !canShowForm) {
    return (
      <PortalPageShell>
        <PortalBackLink href={PORTAL_ROUTES.quejas} label="Volver a quejas" />
        <PortalSectionTitle
          title="Nueva queja"
          description="Comprobando disponibilidad para registrar su queja."
        />
        <div className="rounded-xl bg-surface-container-lowest shadow-[var(--shadow-ambient)]">
          <PortalComplaintFormSkeleton />
        </div>
      </PortalPageShell>
    );
  }

  return <CreateComplaintSheet open onClose={handleClose} />;
}
