"use client";

import { PortalPageShell } from "@/components/student-portal/PortalPageShell";
import { PortalSectionTitle } from "@/components/student-portal/PortalSectionTitle";
import { EvaluationHistoryList } from "@/features/student-portal/evaluations/components/EvaluationHistoryList";
import { useMyEvaluations } from "@/features/student-portal/evaluations/hooks/useMyEvaluations";

export function EvaluationsDashboard() {
  const evaluationsQuery = useMyEvaluations();

  const evaluations =
    evaluationsQuery.data?.pages.flatMap((page) =>
      page.results.map((item) => ({
        id: item.id,
        student_id: typeof item.student === "object" ? item.student.id : item.student,
        date: item.date,
        grade: String((item as { grade?: string | number }).grade ?? ""),
        grade_display: (item as { grade_display?: string }).grade_display,
        comment:
          (item as { comment?: string; comments?: string }).comment ??
          (item as { comments?: string }).comments ??
          "",
        created_by: (item as { created_by?: string }).created_by,
        created_by_id:
          (item as { evaluator_id?: number; created_by_id?: number }).evaluator_id ??
          (item as { created_by_id?: number }).created_by_id,
      }))
    ) ?? [];

  return (
    <PortalPageShell>
      <PortalSectionTitle
        title="Mis Evaluaciones"
        description="Historial de evaluaciones de desempeño académico y disciplinario."
      />

      <section className="overflow-hidden rounded-xl bg-surface-container-lowest shadow-[var(--shadow-ambient)]">
        <div className="px-4 py-4">
          <EvaluationHistoryList
            evaluations={evaluations}
            isLoading={evaluationsQuery.isLoading}
            isError={evaluationsQuery.isError}
            hasMore={Boolean(evaluationsQuery.hasNextPage)}
            isFetchingMore={evaluationsQuery.isFetchingNextPage}
            onLoadMore={() => evaluationsQuery.fetchNextPage()}
            onRetry={() => evaluationsQuery.refetch()}
          />
        </div>
      </section>
    </PortalPageShell>
  );
}
