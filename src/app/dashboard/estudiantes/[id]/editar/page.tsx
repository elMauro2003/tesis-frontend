"use client";

import { use } from "react";
import StudentFormWizard from "@/features/students/components/StudentFormWizard/StudentFormWizard";

export default function EditarEstudiantePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const id = Number(resolvedParams.id);

  return (
    <div className="h-full flex flex-col p-8 pt-4 max-w-6xl mx-auto w-full">
      <div className="mb-8 shrink-0">
        <h2 className="text-3xl font-extrabold text-[var(--color-primary-dark)] tracking-tight">Editar Estudiante</h2>
        <p className="text-[var(--color-outline)] mt-1">Modifique los datos del estudiante seleccionado.</p>
      </div>
      <div className="flex-1 overflow-hidden min-h-[500px]">
        <StudentFormWizard initialStudentId={id} />
      </div>
    </div>
  );
}