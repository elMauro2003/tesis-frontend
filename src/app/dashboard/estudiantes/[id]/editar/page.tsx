"use client";

import Link from "next/link";
import { use } from "react";
import StudentFormWizard from "@/features/students/components/StudentFormWizard/StudentFormWizard";
import { DASHBOARD_ROUTES } from "@/configs/dashboardRoutes";
import { Button } from "@/components/ui/button";

export default function EditarEstudiantePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const id = Number(resolvedParams.id);
  const isValidId = Number.isFinite(id) && id > 0;

  return (
    <div className="h-full flex flex-col p-8 pt-4 max-w-6xl mx-auto w-full">
      <div className="mb-8 shrink-0">
        <h2 className="text-3xl font-extrabold text-[var(--color-primary-dark)] tracking-tight">Editar Estudiante</h2>
        <p className="text-[var(--color-outline)] mt-1">Modifique los datos del estudiante seleccionado.</p>
      </div>
      <div className="flex-1 overflow-hidden min-h-[500px]">
        {isValidId ? (
          <StudentFormWizard initialStudentId={id} />
        ) : (
          <div className="flex h-full flex-col items-center justify-center rounded-xl bg-[var(--color-surface-container-lowest)] p-10 text-center shadow-[var(--shadow-ambient)]">
            <span className="material-symbols-outlined mb-4 text-4xl text-[var(--color-error)]">person_off</span>
            <h3 className="font-headline text-xl font-bold text-[var(--color-on-surface)]">Estudiante no encontrado</h3>
            <p className="mt-2 max-w-md text-sm text-[var(--color-on-surface-variant)]">
              El identificador en la URL no es válido. Verifique el enlace o regrese al listado.
            </p>
            <Button type="button" variant="neutral" className="mt-6" asChild>
              <Link href={DASHBOARD_ROUTES.estudiantes}>Volver al listado</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
