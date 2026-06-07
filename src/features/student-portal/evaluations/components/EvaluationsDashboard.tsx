"use client";

import { PortalPageShell } from "@/components/student-portal/PortalPageShell";
import { PortalSectionTitle } from "@/components/student-portal/PortalSectionTitle";
import { EvaluationHistoryList } from "@/features/student-portal/evaluations/components/EvaluationHistoryList";
import { EvaluationKpiSection } from "@/features/student-portal/evaluations/components/EvaluationKpiSection";
import { useMyEvaluations } from "@/features/student-portal/evaluations/hooks/useMyEvaluations";
import { useNextRoomDuty } from "@/features/student-portal/evaluations/hooks/useNextRoomDuty";
import { usePendingComplaintsCount } from "@/features/student-portal/evaluations/hooks/usePendingComplaintsCount";
import { formatEvaluationDate } from "@/features/student-portal/evaluations/utils/evaluationPresentation";

export function EvaluationsDashboard() {
  const evaluationsQuery = useMyEvaluations();
  const pendingComplaintsQuery = usePendingComplaintsCount();
  const nextDutyQuery = useNextRoomDuty();

  const evaluations = evaluationsQuery.data?.pages.flatMap((page) =>
    page.results.map((item) => ({
      id: item.id,
      student_id: typeof item.student === "object" ? item.student.id : item.student,
      date: item.date,
      grade: String((item as { grade?: string | number }).grade ?? ""),
      grade_display: (item as { grade_display?: string }).grade_display,
      comment: (item as { comment?: string; comments?: string }).comment ?? (item as { comments?: string }).comments ?? "",
      created_by: (item as { created_by?: string }).created_by,
      created_by_id: (item as { evaluator_id?: number; created_by_id?: number }).evaluator_id ?? (item as { created_by_id?: number }).created_by_id,
    }))
  ) ?? [];

  const lastUpdated = evaluations[0]?.date
    ? formatEvaluationDate(evaluations[0].date)
    : null;

  const nextDuty = nextDutyQuery.data;
  const nextDutyDate = nextDuty?.date ? new Date(nextDuty.date) : null;

  return (
    <PortalPageShell>
      <PortalSectionTitle
        title="Mis Evaluaciones"
        description="Seguimiento de desempeño académico y disciplinario."
        action={
          lastUpdated ? (
            <div className="hidden text-right sm:block">
              <span className="block text-[10px] font-medium uppercase tracking-widest text-outline">
                Última actualización
              </span>
              <span className="text-sm font-semibold text-on-surface">{lastUpdated}</span>
            </div>
          ) : null
        }
      />

      <EvaluationKpiSection
        evaluations={evaluations}
        pendingComplaints={pendingComplaintsQuery.data ?? 0}
        isLoading={evaluationsQuery.isLoading || pendingComplaintsQuery.isLoading}
      />

      <section className="mb-8 overflow-hidden rounded-xl bg-surface-container-lowest shadow-[var(--shadow-ambient)]">
        <div className="bg-surface-container-low/30 px-4 py-4">
          <h2 className="font-headline text-lg font-bold text-on-surface">Historial de evaluaciones</h2>
        </div>
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

      <section className="space-y-4">
        <div className="relative overflow-hidden rounded-xl bg-surface-container-low p-5">
          <h3 className="font-headline text-lg font-bold text-on-surface">
            ¿Por qué es importante tu evaluación?
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-on-surface-variant">
            El sistema de residencias premia la excelencia y el compromiso ciudadano. Mantener un
            buen desempeño te otorga prioridad en la renovación de matrícula y beneficios en el
            comedor universitario.
          </p>
          <button
            type="button"
            className="mt-4 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-on-primary shadow-[var(--shadow-primary-btn)]"
          >
            Ver normativa completa
          </button>
          <span className="material-symbols-outlined pointer-events-none absolute -bottom-6 -right-6 text-[7rem] text-primary/5">
            school
          </span>
        </div>

        <div className="rounded-xl bg-primary p-5 text-on-primary-container">
          <h3 className="font-headline text-lg font-bold text-white">Próximo evento</h3>
          {nextDuty ? (
            <>
              <p className="mt-1 text-sm text-white/70">Cuartelería asignada</p>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-4xl font-extrabold text-white">
                  {nextDutyDate?.getDate() ?? "—"}
                </span>
                <span className="text-lg font-medium text-white/80">
                  {nextDutyDate
                    ? new Intl.DateTimeFormat("es-ES", { month: "long" }).format(nextDutyDate)
                    : ""}
                </span>
              </div>
              <p className="mt-3 text-sm font-bold text-primary-fixed">
                ¡Tu asistencia suma puntos!
              </p>
            </>
          ) : (
            <p className="mt-3 text-sm text-white/80">
              No tienes cuartelerías pendientes por el momento.
            </p>
          )}
        </div>
      </section>
    </PortalPageShell>
  );
}
