import { redirect } from "next/navigation";
import { PORTAL_ROUTES } from "@/configs/portalRoutes";

export default function PortalPage() {
  redirect(PORTAL_ROUTES.home);
}
