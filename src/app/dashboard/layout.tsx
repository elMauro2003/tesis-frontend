import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { RoleGuard } from "@/components/layouts/RoleGuard";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard>
      <DashboardLayout>{children}</DashboardLayout>
    </RoleGuard>
  );
}
