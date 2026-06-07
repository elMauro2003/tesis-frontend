import { Evaluation } from "@/types/models/operations.types";

export type GradeCode = "B" | "R" | "M" | string;

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

export function getOverallEvaluationLabel(evaluations: Evaluation[]) {
  if (evaluations.length === 0) {
    return "Sin datos";
  }

  const scores = evaluations.map((item) => gradeToScore(String(item.grade)));
  const average = scores.reduce((sum, value) => sum + value, 0) / scores.length;

  if (average >= 2.5) return "Sobresaliente";
  if (average >= 1.5) return "Satisfactorio";
  return "En mejora";
}

export function getAverageGradeScore(evaluations: Evaluation[]) {
  if (evaluations.length === 0) {
    return null;
  }

  const scores = evaluations.map((item) => gradeToScore(String(item.grade)));
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

export function getEvaluationTitle(evaluation: Evaluation) {
  if (evaluation.created_by?.trim()) {
    return `Evaluación — ${evaluation.created_by}`;
  }

  return "Evaluación de residencia";
}
