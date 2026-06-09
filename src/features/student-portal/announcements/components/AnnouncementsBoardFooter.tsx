"use client";

interface AnnouncementsBoardFooterProps {
  message?: string;
}

export function AnnouncementsBoardFooter({
  message = "Has llegado al final del tablón por hoy.",
}: AnnouncementsBoardFooterProps) {
  return (
    <div className="mt-12 text-center md:mt-16">
      <div className="mx-auto mb-6 h-1 w-16 rounded-full bg-primary/20" />
      <p className="text-sm italic text-outline">{message}</p>
    </div>
  );
}
