"use client";

import { BottomSheet } from "@/components/ui/BottomSheet";
import { CollapsibleText } from "@/components/student-portal/CollapsibleText";
import { PortalStatusBadge } from "@/components/student-portal/PortalStatusBadge";
import {
  formatEvaluationDate,
  getEvaluationTitle,
  getGradeLabel,
  getGradeTone,
  PortalEvaluation,
} from "@/features/student-portal/evaluations/utils/evaluationPresentation";

interface EvaluationDetailSheetProps {
  evaluation: PortalEvaluation | null;
  open: boolean;
  onClose: () => void;
}

export function EvaluationDetailSheet({ evaluation, open, onClose }: EvaluationDetailSheetProps) {
  if (!evaluation) {
    return null;
  }

  const tone = getGradeTone(evaluation.grade);

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title={getEvaluationTitle(evaluation)}
      subtitle={formatEvaluationDate(evaluation.date)}
      scrollable
    >
      <div className="space-y-5">
        <div className="flex flex-wrap items-center gap-3">
          <PortalStatusBadge
            label={getGradeLabel(evaluation.grade, evaluation.grade_display)}
            tone={tone}
          />
          {evaluation.evaluator_name ? (
            <span className="inline-flex items-center gap-1.5 text-sm text-on-surface-variant">
              <span className="material-symbols-outlined text-base text-primary">person</span>
              {evaluation.evaluator_name}
            </span>
          ) : null}
        </div>

        <div>
          <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-outline">
            Comentario del instructor
          </p>
          {evaluation.comment.trim() ? (
            <CollapsibleText
              text={evaluation.comment}
              className="text-sm text-on-surface-variant"
              maxCharsBeforeCollapse={400}
              clampLines={8}
            />
          ) : (
            <p className="text-sm italic text-on-surface-variant">Sin comentario registrado.</p>
          )}
        </div>
      </div>
    </BottomSheet>
  );
}
