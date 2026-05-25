"use client";

import StudentFormWizard from "@/features/students/components/StudentFormWizard/StudentFormWizard";

export default function NuevaEstudiantePage() {
  return (
    <div className="h-full flex flex-col p-8 pt-4 max-w-6xl mx-auto w-full">
      <div className="mb-8 shrink-0">
        <h2 className="text-3xl font-extrabold text-blue-900 tracking-tight">Añadir Nuevo Estudiante</h2>
        <p className="text-slate-500 mt-1">Siga los pasos para registrar una nueva entrada en el sistema académico.</p>
      </div>
      <div className="flex-1 overflow-hidden min-h-[500px]">
        <StudentFormWizard />
      </div>
    </div>
  );
}