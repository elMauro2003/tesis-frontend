"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FormFieldError } from "@/components/shared/FormFieldError";
import { evaluationService } from "@/core/services/evaluation.service";
import { FetchError } from "@/lib/fetchClient";
import { Student } from "@/types/models";
import { clearFieldError, FieldErrors, validateFields } from "@/utils/helpers/formFieldErrors";
import { toast } from "sonner";

interface EvaluateStudentModalProps {
  student: Student | null;
  open: boolean;
  onClose: () => void;
}

type EvaluateFormField = "date" | "grade";

export function EvaluateStudentModal({ student, open, onClose }: EvaluateStudentModalProps) {
  const queryClient = useQueryClient();
  const [grade, setGrade] = useState<string>("B");
  const [date, setDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [comments, setComments] = useState<string>("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors<EvaluateFormField> | null>(null);

  const { mutate, reset, isPending } = useMutation({
    mutationFn: async () => {
      if (!student) return;
      // API expects: { student: int, date: string (YYYY-MM-DD), grade: 'B'|'R'|'M', comment?: string }
      await evaluationService.createEvaluation({
        student: student.id,
        date,
        grade,
        comment: comments || null,
      } as any);
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["students-all"] }),
        queryClient.invalidateQueries({ queryKey: ["students-visible-details"] }),
        queryClient.invalidateQueries({ queryKey: ["student-suggestions"] }),
        queryClient.invalidateQueries({ queryKey: ["student-evaluations"] }),
        queryClient.invalidateQueries({ queryKey: ["student", student?.id] }),
      ]);
      toast.success("Evaluación registrada", {
        description: "La evaluación quedó guardada correctamente.",
      });
      onClose();
    },
    onError: (error) => {
      const description =
        error instanceof FetchError
          ? error.message
          : error instanceof Error && error.message.trim()
            ? error.message
            : "No se pudo guardar la evaluación. Intente nuevamente.";
      toast.error("Error al guardar", { description });
    },
  });

  useEffect(() => {
    if (!open) return;
    setGrade("B");
    setDate(new Date().toISOString().split("T")[0]);
    setComments("");
    setFieldErrors(null);
    reset();
  }, [open, reset]);

  const handleSubmit = () => {
    const errors = validateFields<EvaluateFormField>([
      {
        field: "grade",
        valid: grade === "B" || grade === "R" || grade === "M",
        message: "Seleccione una evaluación válida.",
      },
      {
        field: "date",
        valid: !!date,
        message: "Seleccione la fecha de la evaluación.",
      },
    ]);

    if (errors) {
      setFieldErrors(errors);
      toast.error("Revise el formulario", {
        description: "Complete los campos obligatorios marcados.",
      });
      return;
    }

    setFieldErrors(null);
    mutate();
  };

  const fullName = useMemo(() => {
    if (!student) return "Estudiante";
    return student.full_name || `${student.first_name || ""} ${student.last_name || ""}`.trim() || "Estudiante";
  }, [student]);

  const buildingLabel = useMemo(() => {
    if (!student) return "Sin edificio";
    if (student.current_room_info) return student.current_room_info.building || "Sin edificio";
    if (student.current_room) return student.current_room.building || "Sin edificio";
    return "Sin edificio";
  }, [student]);
  
  const roomLabel = useMemo(() => {
    if (!student) return "Sin cuarto";
    if (student.current_room_info) return `Apto ${student.current_room_info.room_number || '-'}`;
    if (student.current_room) return `Apto ${student.current_room.number || '-'}`;
    return "Sin cuarto";
  }, [student]);

  return (
    <BottomSheet open={open} onClose={onClose} maxWidthClassName="max-w-lg">
      <div className="overflow-hidden rounded-2xl bg-[var(--color-surface-container-lowest)] shadow-[var(--shadow-ambient)]">
        <div className="bg-blue-50 p-6 flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-blue-600 text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-extrabold text-blue-900 leading-tight">Añadir Evaluación</h3>
            <p className="text-xs text-[var(--color-on-surface-variant)] mt-1">Registro de evaluación integral o disciplinaria</p>
          </div>
          <button className="text-[var(--color-outline)] hover:text-[var(--color-on-surface)] transition-colors cursor-pointer" onClick={onClose} aria-label="Cerrar modal">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Section A (Read-only) */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-[10px] font-bold text-[var(--color-outline)] uppercase tracking-wider mb-1.5">Nombre Completo</label>
              <Input type="text" className="bg-[var(--color-surface-container-low)] text-[var(--color-on-surface-variant)] font-medium cursor-not-allowed" disabled value={fullName} />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-[var(--color-outline)] uppercase tracking-wider mb-1.5">Edificio</label>
              <Input type="text" className="bg-[var(--color-surface-container-low)] text-[var(--color-on-surface-variant)] font-medium cursor-not-allowed" disabled value={buildingLabel} />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-[var(--color-outline)] uppercase tracking-wider mb-1.5">Cuarto</label>
              <Input type="text" className="bg-[var(--color-surface-container-low)] text-[var(--color-on-surface-variant)] font-medium cursor-not-allowed" disabled value={roomLabel} />
            </div>
          </div>

          {/* Section B (Active) */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-[var(--color-on-surface-variant)] uppercase tracking-wider mb-1.5">Evaluación</label>
                <Select
                  value={grade}
                  onValueChange={(value) => {
                    setGrade(value);
                    setFieldErrors((current) => clearFieldError(current, "grade"));
                  }}
                >
                  <SelectTrigger className="w-full h-11 rounded-lg bg-[var(--color-surface-container-lowest)] text-sm font-medium text-[var(--color-on-surface)] shadow-none">
                    <SelectValue placeholder="Seleccionar evaluación" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="B">Bien (B)</SelectItem>
                    <SelectItem value="R">Regular (R)</SelectItem>
                    <SelectItem value="M">Mal (M)</SelectItem>
                  </SelectContent>
                </Select>
                <FormFieldError message={fieldErrors?.grade} />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[var(--color-on-surface-variant)] uppercase tracking-wider mb-1.5">Fecha</label>
                <Input
                  type="date"
                  className="bg-[var(--color-surface-container-lowest)] text-[var(--color-on-surface)] font-medium"
                  value={date}
                  aria-invalid={Boolean(fieldErrors?.date)}
                  onChange={(e) => {
                    setDate(e.target.value);
                    setFieldErrors((current) => clearFieldError(current, "date"));
                  }}
                />
                <FormFieldError message={fieldErrors?.date} />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-[var(--color-on-surface-variant)] uppercase tracking-wider mb-1.5">Comentario Evaluativo</label>
              <Textarea className="bg-[var(--color-surface-container-lowest)] text-[var(--color-on-surface)] placeholder:text-[var(--color-outline)]" placeholder="Redacte los detalles..." rows={4} value={comments} onChange={(e) => setComments(e.target.value)} />
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <footer className="border-t border-[var(--color-outline-variant)]/20 p-6 flex justify-end items-center gap-3 bg-[var(--color-surface-container-lowest)]">
          <Button type="button" variant="cancel" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            type="button"
            variant="confirm"
            onClick={handleSubmit}
            disabled={isPending}
          >
            <span className="material-symbols-outlined text-lg">save</span>
            {isPending ? "Guardando..." : "Guardar Evaluación"}
          </Button>
        </footer>
      </div>
    </BottomSheet>
  );
}
