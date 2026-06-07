"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PORTAL_ROUTES } from "@/configs/portalRoutes";
import { CreateComplaintSheet } from "@/features/student-portal/complaints/components/CreateComplaintSheet";

export default function NuevaQuejaPage() {
  const router = useRouter();
  const [open, setOpen] = useState(true);

  useEffect(() => {
    if (!open) {
      router.replace(PORTAL_ROUTES.quejas);
    }
  }, [open, router]);

  return <CreateComplaintSheet open={open} onClose={() => setOpen(false)} />;
}
