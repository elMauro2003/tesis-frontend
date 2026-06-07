"use client";

import Link from "next/link";
import { PORTAL_ROUTES } from "@/configs/portalRoutes";
import { Complaint } from "@/types/models";
import {
  COMPLAINT_STATUS_LABELS,
  getBuildingLabel,
  getComplaintTitle,
} from "@/features/student-portal/complaints/utils/complaintPresentation";

interface VisibleComplaintsPanelProps {
  complaints: Complaint[];
  isLoading?: boolean;
}

export function VisibleComplaintsPanel({ complaints, isLoading = false }: VisibleComplaintsPanelProps) {
  const preview = complaints.slice(0, 3);

  return (
    <aside className="rounded-xl bg-surface-container-low p-5 lg:sticky lg:top-24">
      <h2 className="mb-5 flex items-center gap-2 font-headline text-base font-extrabold uppercase tracking-tight text-on-surface">
        <span className="material-symbols-outlined text-primary">public</span>
        Quejas Visibles
      </h2>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="animate-pulse space-y-2">
              <div className="h-3 w-20 rounded bg-surface-container-high" />
              <div className="h-4 w-full rounded bg-surface-container-high" />
            </div>
          ))}
        </div>
      ) : preview.length === 0 ? (
        <p className="text-sm text-on-surface-variant">
          No hay quejas visibles publicadas por la administración.
        </p>
      ) : (
        <div className="space-y-5">
          {preview.map((complaint, index) => (
            <div key={complaint.id}>
              <div className="group">
                <div className="mb-2 flex items-center gap-3">
                  <div className="h-1.5 w-1.5 rounded-full bg-outline-variant transition-colors group-hover:bg-primary" />
                  <span className="text-[10px] font-bold uppercase text-outline">
                    {getBuildingLabel(complaint).toUpperCase()}
                  </span>
                </div>
                <h4 className="line-clamp-2 font-headline text-sm font-bold text-on-surface-variant transition-colors group-hover:text-primary">
                  {getComplaintTitle(complaint.description)}
                </h4>
                <div className="mt-2 flex items-center gap-1.5">
                  {complaint.status === "resuelta" ? (
                    <span
                      className="material-symbols-outlined text-xs text-green-600"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      check_circle
                    </span>
                  ) : null}
                  <span
                    className={
                      complaint.status === "resuelta"
                        ? "text-[10px] font-bold uppercase text-green-700"
                        : "text-[10px] font-bold uppercase text-on-surface-variant"
                    }
                  >
                    {COMPLAINT_STATUS_LABELS[complaint.status]}
                  </span>
                </div>
              </div>
              {index < preview.length - 1 ? (
                <div className="mt-5 h-px bg-outline-variant/20" />
              ) : null}
            </div>
          ))}
        </div>
      )}

      <Link
        href={PORTAL_ROUTES.quejasVisibles}
        className="mt-6 flex w-full items-center justify-center rounded-lg border-2 border-primary/20 py-3 text-xs font-black uppercase tracking-widest text-primary transition-colors hover:bg-primary/5"
      >
        Ver todas las quejas
      </Link>
    </aside>
  );
}
