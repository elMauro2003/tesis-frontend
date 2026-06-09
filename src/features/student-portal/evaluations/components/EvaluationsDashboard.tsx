"use client";

import { PortalKpiCard } from "@/components/student-portal/PortalKpiCard";
import { PortalPageShell } from "@/components/student-portal/PortalPageShell";
import { PortalSectionTitle } from "@/components/student-portal/PortalSectionTitle";
import { EvaluationHistoryList } from "@/features/student-portal/evaluations/components/EvaluationHistoryList";
import { useMyEvaluations } from "@/features/student-portal/evaluations/hooks/useMyEvaluations";
import {
  formatEvaluationDate,
  getOverallEvaluationLabel,
  normalizePortalEvaluation,
  sortEvaluationsByDateDesc,
} from "@/features/student-portal/evaluations/utils/evaluationPresentation";

export function EvaluationsDashboard() {
  const evaluationsQuery = useMyEvaluations();

  const evaluations = sortEvaluationsByDateDesc(
    evaluationsQuery.data?.pages.flatMap((page) => page.results.map(normalizePortalEvaluation)) ?? []
  );

  const latestEvaluation = evaluations[0];

  return (
    <PortalPageShell>
      <PortalSectionTitle
        title="Mis Evaluaciones"
        description="Historial de evaluaciones de desempeño académico y disciplinario."
      />

      {evaluations.length > 0 ? (
        <section className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-3">
          <PortalKpiCard
            label="Registradas"
            value={evaluations.length}
            icon="assignment"
            iconContainerClassName="bg-primary-fixed"
            iconClassName="text-primary"
          />
          <PortalKpiCard
            label="Desempeño"
            value={getOverallEvaluationLabel(evaluations)}
            icon="trending_up"
            iconContainerClassName="bg-success-light"
            iconClassName="text-success"
          />
          <PortalKpiCard
            label="Última evaluación"
            value={latestEvaluation ? formatEvaluationDate(latestEvaluation.date) : "—"}
            icon="event"
            iconContainerClassName="bg-secondary-container"
            iconClassName="text-primary"
            className="col-span-2 md:col-span-1"
          />
        </section>
      ) : null}

      <section>
        <h2 className="mb-4 flex items-center gap-2 font-headline text-xl font-bold text-on-surface-variant">
          <span className="material-symbols-outlined text-primary">history</span>
          Historial
        </h2>

        <EvaluationHistoryList
          evaluations={evaluations}
          isLoading={evaluationsQuery.isLoading}
          isError={evaluationsQuery.isError}
          hasMore={Boolean(evaluationsQuery.hasNextPage)}
          isFetchingMore={evaluationsQuery.isFetchingNextPage}
          onLoadMore={() => evaluationsQuery.fetchNextPage()}
          onRetry={() => evaluationsQuery.refetch()}
        />
      </section>
    </PortalPageShell>
  );
}
