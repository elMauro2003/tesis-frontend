"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { evaluationService } from "@/core/services/evaluation.service";
import {
  formatEvaluationDate,
  getDashboardGradeBadgeClass,
  getGradeLabel,
  getOverallEvaluationLabel,
  normalizePortalEvaluation,
  sortEvaluationsByDateDesc,
} from "@/features/student-portal/evaluations/utils/evaluationPresentation";
import { cn } from "@/utils/helpers/shadcn/index";

interface StudentEvaluationsSectionProps {
  studentId: number | null;
}

export function StudentEvaluationsSection({ studentId }: StudentEvaluationsSectionProps) {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["student-evaluations", studentId],
    queryFn: () =>
      studentId
        ? evaluationService.getEvaluations({ student: studentId, page_size: 50 })
        : Promise.resolve({ results: [], count: 0, next: null, previous: null }),
    enabled: !!studentId,
    staleTime: 60 * 1000,
  });

  const evaluations = useMemo(
    () => sortEvaluationsByDateDesc((data?.results ?? []).map(normalizePortalEvaluation)),
    [data?.results]
  );

  const overallLabel = getOverallEvaluationLabel(evaluations);
  const latestEvaluation = evaluations[0];

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="h-14 rounded-xl bg-[var(--color-surface-container-high)] animate-pulse" />
        <div className="h-20 rounded-xl bg-[var(--color-surface-container-high)] animate-pulse" />
        <div className="h-20 rounded-xl bg-[var(--color-surface-container-high)] animate-pulse" />
      </div>
    );
  }

  if (isError) {
    return (
      <p className="text-sm text-[var(--color-error)] font-medium">
        No se pudieron cargar las evaluaciones.
      </p>
    );
  }

  if (evaluations.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-[var(--color-outline-variant)]/40 bg-[var(--color-surface-container-low)] px-4 py-6 text-center">
        <span className="material-symbols-outlined text-3xl text-[var(--color-outline)]">emoji_events</span>
        <p className="mt-2 text-sm font-semibold text-[var(--color-on-surface)]">Sin evaluaciones registradas</p>
        <p className="mt-1 text-xs text-[var(--color-on-surface-variant)]">
          Aún no hay evaluaciones disciplinarias o integrales para este estudiante.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-[var(--color-surface-container-low)] px-4 py-3">
          <p className="text-[10px] uppercase text-[var(--color-outline)] font-bold tracking-wider">Rendimiento general</p>
          <p className="mt-1 text-sm font-bold text-[var(--color-on-surface)]">{overallLabel}</p>
        </div>
        <div className="rounded-xl bg-[var(--color-surface-container-low)] px-4 py-3">
          <p className="text-[10px] uppercase text-[var(--color-outline)] font-bold tracking-wider">Última evaluación</p>
          {latestEvaluation ? (
            <div className="mt-1 flex items-center gap-2">
              <span
                className={cn(
                  "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold border",
                  getDashboardGradeBadgeClass(latestEvaluation.grade)
                )}
              >
                {getGradeLabel(latestEvaluation.grade, latestEvaluation.grade_display)}
              </span>
              <span className="text-xs text-[var(--color-on-surface-variant)] font-medium">
                {formatEvaluationDate(latestEvaluation.date)}
              </span>
            </div>
          ) : (
            <p className="mt-1 text-sm font-semibold text-[var(--color-on-surface-variant)]">—</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        {evaluations.map((evaluation) => {
          const isExpanded = expandedId === evaluation.id;
          const hasComment = Boolean(evaluation.comment?.trim());

          return (
            <div
              key={evaluation.id}
              className="rounded-xl border border-[var(--color-outline-variant)]/20 bg-[var(--color-surface-container-lowest)] overflow-hidden"
            >
              <button
                type="button"
                className={cn(
                  "w-full px-4 py-3 flex items-start gap-3 text-left transition-colors",
                  hasComment ? "hover:bg-[var(--color-surface-container-low)] cursor-pointer" : "cursor-default"
                )}
                onClick={() => {
                  if (!hasComment) return;
                  setExpandedId(isExpanded ? null : evaluation.id);
                }}
                aria-expanded={isExpanded}
              >
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--color-primary-selected)] text-[var(--color-primary)]">
                  <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
                    star
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold border",
                        getDashboardGradeBadgeClass(evaluation.grade)
                      )}
                    >
                      {getGradeLabel(evaluation.grade, evaluation.grade_display)}
                    </span>
                    <span className="text-xs font-semibold text-[var(--color-on-surface-variant)]">
                      {formatEvaluationDate(evaluation.date)}
                    </span>
                  </div>
                  {evaluation.evaluator_name ? (
                    <p className="mt-1 text-xs text-[var(--color-on-surface-variant)]">
                      Evaluado por {evaluation.evaluator_name}
                    </p>
                  ) : null}
                  {hasComment && !isExpanded ? (
                    <p className="mt-1 line-clamp-2 text-sm text-[var(--color-on-surface)]">{evaluation.comment}</p>
                  ) : null}
                </div>
                {hasComment ? (
                  <span className="material-symbols-outlined text-[var(--color-outline)] text-lg shrink-0">
                    {isExpanded ? "expand_less" : "expand_more"}
                  </span>
                ) : null}
              </button>
              {isExpanded && hasComment ? (
                <div className="border-t border-[var(--color-outline-variant)]/15 px-4 py-3 bg-[var(--color-surface-container-low)]/60">
                  <p className="text-[10px] uppercase text-[var(--color-outline)] font-bold tracking-wider mb-1.5">
                    Comentario
                  </p>
                  <p className="text-sm text-[var(--color-on-surface)] whitespace-pre-wrap">{evaluation.comment}</p>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
