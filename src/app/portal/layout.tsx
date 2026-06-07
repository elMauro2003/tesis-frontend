import { StudentPortalLayout } from "@/components/layouts/StudentPortalLayout";
import { RoleGuard } from "@/components/layouts/RoleGuard";

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allowedRoles={["estudiante"]}>
      <StudentPortalLayout>{children}</StudentPortalLayout>
    </RoleGuard>
  );
}
