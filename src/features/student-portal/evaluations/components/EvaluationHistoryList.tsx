"use client";

import { useState } from "react";
import { PortalEmptyState } from "@/components/student-portal/PortalEmptyState";
import { PortalListCard } from "@/components/student-portal/PortalListCard";
import { PortalLoadMore } from "@/components/student-portal/PortalLoadMore";
import { PortalListSkeleton } from "@/components/student-portal/PortalSkeleton";
import { PortalStatusBadge } from "@/components/student-portal/PortalStatusBadge";
import { EvaluationDetailSheet } from "@/features/student-portal/evaluations/components/EvaluationDetailSheet";
import {
  formatEvaluationDate,
  getEvaluationTitle,
  getGradeLabel,
  getGradeTone,
  PortalEvaluation,
} from "@/features/student-portal/evaluations/utils/evaluationPresentation";

interface EvaluationHistoryListProps {
  evaluations: PortalEvaluation[];
  isLoading?: boolean;
  isError?: boolean;
  hasMore?: boolean;
  isFetchingMore?: boolean;
  onLoadMore?: () => void;
  onRetry?: () => void;
}

export function EvaluationHistoryList({
  evaluations,
  isLoading = false,
  isError = false,
  hasMore = false,
  isFetchingMore = false,
  onLoadMore,
  onRetry,
}: EvaluationHistoryListProps) {
  const [selectedEvaluation, setSelectedEvaluation] = useState<PortalEvaluation | null>(null);

  if (isError) {
    return (
      <PortalEmptyState
        icon="error"
        title="No se pudieron cargar las evaluaciones"
        description="Verifique su conexión e intente nuevamente."
        onRetry={onRetry}
      />
    );
  }

  if (isLoading) {
    return <PortalListSkeleton count={4} />;
  }

  if (evaluations.length === 0) {
    return (
      <PortalEmptyState
        icon="emoji_events"
        title="Sin evaluaciones registradas"
        description="Cuando reciba evaluaciones de su instructor, aparecerán aquí."
      />
    );
  }

  return (
    <>
      <div className="space-y-3">
        {evaluations.map((evaluation) => {
          const tone = getGradeTone(evaluation.grade);

          return (
            <PortalListCard
              key={evaluation.id}
              title={getEvaluationTitle(evaluation)}
              subtitle={formatEvaluationDate(evaluation.date)}
              description={evaluation.comment || undefined}
              onClick={() => setSelectedEvaluation(evaluation)}
              badge={
                <PortalStatusBadge
                  label={getGradeLabel(evaluation.grade, evaluation.grade_display)}
                  tone={tone}
                />
              }
            />
          );
        })}

        {onLoadMore ? (
          <PortalLoadMore onClick={onLoadMore} isLoading={isFetchingMore} hasMore={hasMore} />
        ) : null}
      </div>

      <EvaluationDetailSheet
        evaluation={selectedEvaluation}
        open={Boolean(selectedEvaluation)}
        onClose={() => setSelectedEvaluation(null)}
      />
    </>
  );
}
