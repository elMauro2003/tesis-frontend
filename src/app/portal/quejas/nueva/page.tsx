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
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (dailyQuota.isLoading) {
      return;
    }

    if (!dailyQuota.canCreate) {
      toast.error("Límite diario alcanzado", {
        description: `Solo puede registrar ${dailyQuota.limit} quejas por día. Intente mañana.`,
      });
      router.replace(PORTAL_ROUTES.quejas);
      return;
    }

    setOpen(true);
  }, [dailyQuota.canCreate, dailyQuota.isLoading, dailyQuota.limit, router]);

  useEffect(() => {
    if (!open && !dailyQuota.isLoading) {
      router.replace(PORTAL_ROUTES.quejas);
    }
  }, [dailyQuota.isLoading, open, router]);

  if (dailyQuota.isLoading || !open) {
    return null;
  }

  return <CreateComplaintSheet open={open} onClose={() => setOpen(false)} />;
}
