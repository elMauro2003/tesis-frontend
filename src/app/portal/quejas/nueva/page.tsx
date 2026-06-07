"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PORTAL_ROUTES } from "@/configs/portalRoutes";
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
    return null;
  }

  return <CreateComplaintSheet open onClose={handleClose} />;
}
