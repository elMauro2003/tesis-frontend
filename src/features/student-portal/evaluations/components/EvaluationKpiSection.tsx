"use client";

import { PortalKpiCard } from "@/components/student-portal/PortalKpiCard";
import { PortalKpiSkeleton } from "@/components/student-portal/PortalSkeleton";
import { Evaluation } from "@/types/models/operations.types";
import {
  getAverageGradeScore,
  getOverallEvaluationLabel,
} from "@/features/student-portal/evaluations/utils/evaluationPresentation";

interface EvaluationKpiSectionProps {
  evaluations: Evaluation[];
  pendingComplaints: number;
  isLoading?: boolean;
}

export function EvaluationKpiSection({
  evaluations,
  pendingComplaints,
  isLoading = false,
}: EvaluationKpiSectionProps) {
  if (isLoading) {
    return (
      <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <PortalKpiSkeleton />
        <PortalKpiSkeleton />
        <PortalKpiSkeleton />
      </section>
    );
  }

  const average = getAverageGradeScore(evaluations);
  const averagePercent = average !== null ? Math.round((average / 3) * 100) : 0;

  return (
    <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
      <PortalKpiCard
        label="Evaluación general"
        value={getOverallEvaluationLabel(evaluations)}
        icon="emoji_events"
        iconContainerClassName="bg-amber-100"
        iconClassName="text-amber-600"
        filledIcon
        footer={
          evaluations.length > 0 ? (
            <span className="text-sm font-medium text-primary">
              {evaluations.length} evaluación{evaluations.length === 1 ? "" : "es"} registrada
              {evaluations.length === 1 ? "" : "s"}
            </span>
          ) : null
        }
      />

      <PortalKpiCard
        label="Promedio actual"
        value={average !== null ? average.toFixed(1) : "—"}
        icon="trending_up"
        iconContainerClassName="bg-success-light"
        iconClassName="text-success"
        footer={
          average !== null ? (
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-container">
              <div
                className="h-full rounded-full bg-primary-container"
                style={{ width: `${averagePercent}%` }}
              />
            </div>
          ) : null
        }
      />

      <PortalKpiCard
        label="Quejas pendientes"
        value={pendingComplaints}
        icon="notifications_active"
        iconContainerClassName="bg-tertiary-fixed"
        iconClassName="text-tertiary"
        filledIcon
        footer={
          pendingComplaints > 0 ? (
            <p className="text-sm font-medium text-tertiary">Revisión en curso</p>
          ) : (
            <p className="text-sm font-medium text-on-surface-variant">Sin quejas pendientes</p>
          )
        }
      />
    </section>
  );
}
