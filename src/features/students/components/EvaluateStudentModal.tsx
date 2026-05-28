"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { evaluationService } from "@/core/services/evaluation.service";
import { Student } from "@/types/models";
// import { toast } from "sonner"; // If they use sonner, wait I don't know, let's omit if not sure

interface EvaluateStudentModalProps {
  student: Student | null;
  open: boolean;
  onClose: () => void;
}

export function EvaluateStudentModal({ student, open, onClose }: EvaluateStudentModalProps) {
  const queryClient = useQueryClient();
  const [grade, setGrade] = useState<string>("B");
  const [date, setDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [comments, setComments] = useState<string>("");

  const evaluateMutation = useMutation({
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
      ]);
      onClose();
    },
  });

  useEffect(() => {
    if (open) {
      setGrade("B");
      setDate(new Date().toISOString().split("T")[0]);
      setComments("");
      evaluateMutation.reset();
    }
  }, [open]);

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
              <input 
                type="text" 
                className="w-full bg-[var(--color-surface-container-low)] border-none rounded-lg py-2.5 px-4 text-sm text-[var(--color-on-surface-variant)] font-medium cursor-not-allowed" 
                disabled 
                value={fullName} 
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-[var(--color-outline)] uppercase tracking-wider mb-1.5">Edificio</label>
              <input 
                type="text" 
                className="w-full bg-[var(--color-surface-container-low)] border-none rounded-lg py-2.5 px-4 text-sm text-[var(--color-on-surface-variant)] font-medium cursor-not-allowed" 
                disabled 
                value={buildingLabel} 
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-[var(--color-outline)] uppercase tracking-wider mb-1.5">Cuarto</label>
              <input 
                type="text" 
                className="w-full bg-[var(--color-surface-container-low)] border-none rounded-lg py-2.5 px-4 text-sm text-[var(--color-on-surface-variant)] font-medium cursor-not-allowed" 
                disabled 
                value={roomLabel} 
              />
            </div>
          </div>

          {/* Section B (Active) */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-[var(--color-on-surface-variant)] uppercase tracking-wider mb-1.5">Evaluación</label>
                <Select value={grade} onValueChange={setGrade}>
                  <SelectTrigger className="w-full bg-[var(--color-surface-container-lowest)] border-none rounded-lg text-sm text-[var(--color-on-surface)] font-medium shadow-none h-11">
                    <SelectValue placeholder="Seleccionar evaluación" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="B">Bien (B)</SelectItem>
                    <SelectItem value="R">Regular (R)</SelectItem>
                    <SelectItem value="M">Mal (M)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[var(--color-on-surface-variant)] uppercase tracking-wider mb-1.5">Fecha</label>
                <input 
                  type="date" 
                  className="w-full bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)] rounded-lg py-2.5 px-4 text-sm text-[var(--color-on-surface)] font-medium focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-all outline-none"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-[var(--color-on-surface-variant)] uppercase tracking-wider mb-1.5">Comentario Evaluativo</label>
              <textarea 
                className="w-full bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)] rounded-xl py-3 px-4 text-sm text-[var(--color-on-surface)] placeholder:text-[var(--color-outline)] focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-all resize-none outline-none" 
                placeholder="Redacte los detalles..." 
                rows={4}
                value={comments}
                onChange={(e) => setComments(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <footer className="border-t border-[var(--color-outline-variant)]/20 p-6 flex justify-end items-center gap-3 bg-[var(--color-surface-container-lowest)]">
          <button 
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-semibold text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)] transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button 
            onClick={() => evaluateMutation.mutate()}
            disabled={evaluateMutation.isPending}
            className="flex items-center gap-2 px-6 py-2.5 bg-[var(--color-primary)] text-[var(--color-on-primary)] rounded-lg text-sm font-semibold shadow-[var(--shadow-primary-btn)] hover:bg-[var(--color-on-primary-fixed-variant)] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg">save</span>
            {evaluateMutation.isPending ? "Guardando..." : "Guardar Evaluación"}
          </button>
        </footer>
      </div>
    </BottomSheet>
  );
}
