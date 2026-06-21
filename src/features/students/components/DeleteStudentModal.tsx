"use client";

import { useEffect, useMemo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { studentService } from "@/core/services/student.service";
import { FetchError } from "@/lib/fetchClient";
import { Student } from "@/types/models";
import { toast } from "sonner";

interface DeleteStudentModalProps {
  student: Student | null;
  open: boolean;
  onClose: () => void;
}

export function DeleteStudentModal({ student, open, onClose }: DeleteStudentModalProps) {
  const queryClient = useQueryClient();

  const { mutate, reset, isPending } = useMutation({
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
      toast.success("Estudiante dado de baja", {
        description: "La plaza qued? liberada en la residencia.",
      });
      onClose();
    },
    onError: (error) => {
      const description =
        error instanceof FetchError
          ? error.message
          : error instanceof Error && error.message.trim()
            ? error.message
            : "No se pudo completar la baja. Intente nuevamente.";
      toast.error("Error al dar de baja", { description });
    },
  });

  useEffect(() => {
    if (!open) reset();
  }, [open, reset]);

  const title = "Dar de Baja de la Residencia";

  const fullName = useMemo(() => {
    if (!student) return 'Estudiante';
    return student.full_name || `${student.first_name || ''} ${student.last_name || ''}`.trim() || 'Estudiante';
  }, [student]);

  const locationLabel = useMemo(() => {
    if (!student) return 'Sin ubicaci?n';
    if (student.current_room_info) {
      return `${student.current_room_info.building || 'Sin edificio'}${student.current_room_info.room_number ? ` - ${student.current_room_info.room_number}` : ''}`;
    }
    if (student.current_room) {
      return `${student.current_room.building || 'Sin edificio'}${student.current_room.number ? ` - ${student.current_room.number}` : ''}`;
    }
    return student.group_name || 'Sin ubicaci?n';
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
            <p className="text-sm text-[var(--color-on-surface-variant)]">Ubicaci?n actual: {locationLabel}</p>
          </div>
          <p className="text-sm text-[var(--color-on-surface-variant)] mb-6">
            Esta acci?n liberar? inmediatamente la plaza del estudiante en el cuarto asignado. Su matr?cula universitaria general se mantendr? activa, pero su estado en la residencia pasar? a &quot;Baja&quot;.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-[var(--color-outline)] uppercase tracking-wider mb-1.5">Motivo de la baja (referencia interna)</label>
              <Select defaultValue="Graduaci?n">
                <SelectTrigger className="w-full h-10 rounded-lg bg-[var(--color-surface-container-low)] text-sm font-medium text-[var(--color-on-surface)] shadow-none">
                  <SelectValue placeholder="Seleccionar motivo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Graduaci?n">Graduaci?n</SelectItem>
                  <SelectItem value="Abandono">Abandono</SelectItem>
                  <SelectItem value="Sanci?n Disciplinaria">Sanci?n Disciplinaria</SelectItem>
                  <SelectItem value="Traslado">Traslado</SelectItem>
                  <SelectItem value="Otro">Otro</SelectItem>
                </SelectContent>
              </Select>
              <p className="mt-1.5 ml-1 text-xs text-[var(--color-on-surface-variant)]">
                Este dato es solo de referencia local; la API registra la baja sin motivo adicional.
              </p>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-[var(--color-outline)] uppercase tracking-wider mb-1.5">Observaciones adicionales</label>
              <Textarea className="bg-[var(--color-surface-container-low)] text-sm placeholder:text-[var(--color-outline)]" placeholder="Detalles opcionales..." rows={2} />
            </div>
          </div>
        </div>

        <footer className="border-t border-[var(--color-outline-variant)]/15 p-6 flex justify-end gap-3 bg-[var(--color-surface-container-low)]/50">
          <Button type="button" variant="cancel" onClick={onClose} disabled={isPending}>
            Cancelar
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={() => mutate()}
            disabled={!student || isPending}
          >
            {isPending ? 'Eliminando...' : 'Confirmar Baja'}
          </Button>
        </footer>
      </div>
    </BottomSheet>
  );
}
