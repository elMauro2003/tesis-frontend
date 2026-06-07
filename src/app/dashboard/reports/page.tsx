import { redirect } from "next/navigation";
import { DASHBOARD_ROUTES } from "@/configs/dashboardRoutes";

export default function ReportsLegacyRedirectPage() {
  redirect(DASHBOARD_ROUTES.reportes);
}
