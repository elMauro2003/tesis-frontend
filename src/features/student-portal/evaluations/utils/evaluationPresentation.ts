import { Evaluation } from "@/types/models";

export type GradeCode = "B" | "R" | "M" | string;

export type PortalEvaluation = {
  id: number;
  date: string;
  grade: string;
  grade_display?: string;
  comment: string;
  evaluator_name?: string;
};

const GRADE_LABELS: Record<string, string> = {
  B: "Bien",
  R: "Regular",
  M: "Mal",
};

const GRADE_TONES = {
  B: "success",
  R: "warning",
  M: "error",
} as const;

export function normalizePortalEvaluation(item: Evaluation): PortalEvaluation {
  return {
    id: item.id,
    date: item.date,
    grade: String(item.grade ?? ""),
    grade_display: item.grade_display,
    comment: item.comment ?? item.comments ?? "",
    evaluator_name: item.created_by_name,
  };
}

export function sortEvaluationsByDateDesc(evaluations: PortalEvaluation[]) {
  return [...evaluations].sort(
    (left, right) => new Date(right.date).getTime() - new Date(left.date).getTime()
  );
}

export function formatEvaluationDate(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(parsed);
}

export function getGradeLabel(grade: GradeCode, gradeDisplay?: string) {
  if (gradeDisplay?.trim()) {
    return gradeDisplay;
  }

  const normalized = String(grade).toUpperCase();
  return GRADE_LABELS[normalized] ?? String(grade);
}

export function getGradeTone(grade: GradeCode) {
  const normalized = String(grade).toUpperCase() as keyof typeof GRADE_TONES;
  return GRADE_TONES[normalized] ?? "neutral";
}

export function getOverallEvaluationLabel(evaluations: PortalEvaluation[]) {
  if (evaluations.length === 0) {
    return "Sin datos";
  }

  const scores = evaluations.map((item) => gradeToScore(item.grade));
  const average = scores.reduce((sum, value) => sum + value, 0) / scores.length;

  if (average >= 2.5) return "Sobresaliente";
  if (average >= 1.5) return "Satisfactorio";
  return "En mejora";
}

export function getAverageGradeScore(evaluations: PortalEvaluation[]) {
  if (evaluations.length === 0) {
    return null;
  }

  const scores = evaluations.map((item) => gradeToScore(item.grade));
  return scores.reduce((sum, value) => sum + value, 0) / scores.length;
}

function gradeToScore(grade: string) {
  const normalized = grade.toUpperCase();
  if (normalized === "B") return 3;
  if (normalized === "R") return 2;
  if (normalized === "M") return 1;

  const numeric = Number(grade);
  if (!Number.isNaN(numeric)) {
    return numeric;
  }

  return 2;
}

export function getEvaluationTitle(evaluation: PortalEvaluation) {
  if (evaluation.evaluator_name?.trim()) {
    return `Evaluación — ${evaluation.evaluator_name}`;
  }

  return "Evaluación de residencia";
}
