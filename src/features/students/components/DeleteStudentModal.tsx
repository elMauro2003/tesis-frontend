"use client";

import { useEffect, useMemo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { studentService } from "@/core/services/student.service";
import { Student } from "@/types/models";

interface DeleteStudentModalProps {
  student: Student | null;
  open: boolean;
  onClose: () => void;
}

export function DeleteStudentModal({ student, open, onClose }: DeleteStudentModalProps) {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!student) return;
      await studentService.deleteStudent(student.id);
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['students-all'] }),
        queryClient.invalidateQueries({ queryKey: ['students-visible-details'] }),
        queryClient.invalidateQueries({ queryKey: ['student-suggestions'] }),
      ]);
      onClose();
    },
  });

  useEffect(() => {
    if (!open) deleteMutation.reset();
  }, [open]);

  const title = "Dar de Baja de la Residencia";

  const fullName = useMemo(() => {
    if (!student) return 'Estudiante';
    return student.full_name || `${student.first_name || ''} ${student.last_name || ''}`.trim() || 'Estudiante';
  }, [student]);

  const locationLabel = useMemo(() => {
    if (!student) return 'Sin ubicación';
    if (student.current_room_info) {
      return `${student.current_room_info.building || 'Sin edificio'}${student.current_room_info.room_number ? ` - ${student.current_room_info.room_number}` : ''}`;
    }
    if (student.current_room) {
      return `${student.current_room.building || 'Sin edificio'}${student.current_room.number ? ` - ${student.current_room.number}` : ''}`;
    }
    return student.group_name || 'Sin ubicación';
  }, [student]);

  return (
    <BottomSheet
      open={open && !!student}
      onClose={onClose}
      maxWidthClassName="max-w-md"
    >
      <div className="overflow-hidden rounded-2xl bg-[var(--color-surface-container-lowest)] shadow-[var(--shadow-ambient)]">
        <div className="bg-red-50 p-6 flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-red-600 text-2xl">warning</span>
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-extrabold text-red-900 leading-tight">{title}</h3>
          </div>
          <button className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer" onClick={onClose} aria-label="Cerrar modal">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="p-6">
          <div className="bg-[var(--color-surface-container-low)] rounded-lg p-4 mb-6">
            <p className="text-sm font-semibold text-[var(--color-on-surface)]">Estudiante: {fullName}</p>
            <p className="text-sm text-[var(--color-on-surface-variant)]">CI: {student?.ci || '-'}</p>
            <p className="text-sm text-[var(--color-on-surface-variant)]">Ubicación actual: {locationLabel}</p>
          </div>
          <p className="text-sm text-[var(--color-on-surface-variant)] mb-6">
            Esta acción liberará inmediatamente la plaza del estudiante en el cuarto asignado. Su matrícula universitaria general se mantendrá activa, pero su estado en la residencia pasará a "Baja".
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-[var(--color-outline)] uppercase tracking-wider mb-1.5">Motivo de la baja</label>
              <Select defaultValue="Graduación">
                <SelectTrigger className="w-full bg-[var(--color-surface-container-low)] rounded-lg text-sm font-medium text-[var(--color-on-surface)] shadow-none h-10">
                  <SelectValue placeholder="Seleccionar motivo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Graduación">Graduación</SelectItem>
                  <SelectItem value="Abandono">Abandono</SelectItem>
                  <SelectItem value="Sanción Disciplinaria">Sanción Disciplinaria</SelectItem>
                  <SelectItem value="Traslado">Traslado</SelectItem>
                  <SelectItem value="Otro">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-[var(--color-outline)] uppercase tracking-wider mb-1.5">Observaciones adicionales</label>
              <Textarea className="bg-[var(--color-surface-container-low)] text-sm placeholder:text-[var(--color-outline)]" placeholder="Detalles opcionales..." rows={2} />
            </div>
          </div>
        </div>

        <footer className="border-t border-[var(--color-outline-variant)]/15 p-6 flex justify-end gap-3 bg-[var(--color-surface-container-low)]/50">
          <button className="px-4 py-2 text-sm font-semibold text-[var(--color-on-surface-variant)] bg-[var(--color-surface-container-lowest)] rounded-lg hover:bg-[var(--color-surface-container-low)] transition-colors shadow-sm cursor-pointer" onClick={onClose} disabled={deleteMutation.isPending}>
            Cancelar
          </button>
          <button
            className="px-4 py-2 text-sm font-bold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-all shadow-md active:scale-95 shadow-red-600/20 disabled:opacity-50 cursor-pointer"
            onClick={() => deleteMutation.mutate()}
            disabled={!student || deleteMutation.isPending}
          >
            {deleteMutation.isPending ? 'Eliminando...' : 'Confirmar Baja'}
          </button>
        </footer>
      </div>
    </BottomSheet>
  );
}