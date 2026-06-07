"use client";

import { PortalEmptyState } from "@/components/student-portal/PortalEmptyState";
import { PortalListCard } from "@/components/student-portal/PortalListCard";
import { PortalLoadMore } from "@/components/student-portal/PortalLoadMore";
import { PortalListSkeleton } from "@/components/student-portal/PortalSkeleton";
import { PortalStatusBadge } from "@/components/student-portal/PortalStatusBadge";
import { Evaluation } from "@/types/models/operations.types";
import {
  formatEvaluationDate,
  getEvaluationTitle,
  getGradeLabel,
  getGradeTone,
} from "@/features/student-portal/evaluations/utils/evaluationPresentation";

interface EvaluationHistoryListProps {
  evaluations: Evaluation[];
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
    <div className="space-y-3">
      {evaluations.map((evaluation) => {
        const tone = getGradeTone(String(evaluation.grade));

        return (
          <PortalListCard
            key={evaluation.id}
            title={getEvaluationTitle(evaluation)}
            subtitle={formatEvaluationDate(evaluation.date)}
            description={evaluation.comment || undefined}
            badge={
              <PortalStatusBadge
                label={getGradeLabel(String(evaluation.grade), evaluation.grade_display)}
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
  );
}
