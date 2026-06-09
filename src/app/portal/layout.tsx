import { StudentPortalLayout } from "@/components/layouts/StudentPortalLayout";
import { RoleGuard } from "@/components/layouts/RoleGuard";
import { PortalLayoutSkeleton } from "@/components/student-portal/PortalSkeleton";

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allowedRoles={["estudiante"]} loadingFallback={<PortalLayoutSkeleton />}>
      <StudentPortalLayout>{children}</StudentPortalLayout>
    </RoleGuard>
  );
}
