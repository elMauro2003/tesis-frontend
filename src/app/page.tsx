import { redirect } from "next/navigation";
import { DASHBOARD_ROUTES } from "@/configs/dashboardRoutes";

export default function Home() {
  redirect(DASHBOARD_ROUTES.home);
}
