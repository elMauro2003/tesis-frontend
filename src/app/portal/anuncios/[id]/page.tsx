import { AnnouncementDetail } from "@/features/student-portal/announcements/components/AnnouncementDetail";

interface AnuncioDetallePageProps {
  params: Promise<{ id: string }>;
}

export default async function AnuncioDetallePage({ params }: AnuncioDetallePageProps) {
  const { id } = await params;
  return <AnnouncementDetail id={Number(id)} />;
}
