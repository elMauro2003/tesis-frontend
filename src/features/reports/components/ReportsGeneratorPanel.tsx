"use client";

import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { DashboardFilterSelect } from "@/components/shared/DashboardFilterSelect";
import { ReportsDynamicInsights } from "@/features/reports/components/ReportsDynamicInsights";
import {
  ACADEMIC_YEAR_OPTIONS,
  GENDER_FILTER_OPTIONS,
  HOUSING_FILTER_OPTIONS,
  MILITANT_FILTER_OPTIONS,
  PERFORMANCE_FILTER_OPTIONS,
  REPORT_TYPE_OPTIONS,
} from "@/features/reports/constants";
import type { useReportAnalytics } from "@/features/reports/hooks/useReportAnalytics";
import type { ReportsDraftFilters } from "@/features/reports/types";
import { Career, Faculty } from "@/types/models";

interface ReportsGeneratorPanelProps {
  draftFilters: ReportsDraftFilters;
  onChange: (next: ReportsDraftFilters) => void;
  sites: Array<{ id: number; name: string }>;
  buildingOptions: Array<{ value: string; label: string }>;
  faculties: Faculty[];
  careers: Career[];
  careersLoading?: boolean;
  draftAnalytics: ReturnType<typeof useReportAnalytics>;
  resultsCount?: number;
  onApply: () => void;
  onClear: () => void;
  disabled?: boolean;
}

function FilterField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <label className="text-[10px] font-bold uppercase tracking-wider text-outline">{label}</label>
      {children}
    </div>
  );
}

export function ReportsGeneratorPanel({
  draftFilters,
  onChange,
  sites,
  buildingOptions,
  faculties,
  careers,
  careersLoading,
  draftAnalytics,
  resultsCount,
  onApply,
  onClear,
  disabled,
}: ReportsGeneratorPanelProps) {
  const patch = (partial: Partial<ReportsDraftFilters>) => onChange({ ...draftFilters, ...partial });

  const siteOptions = [
    { value: "all", label: "Todas las sedes" },
    ...sites.map((site) => ({ value: String(site.id), label: site.name })),
  ];

  const facultyOptions = [
    { value: "all", label: "Todas las facultades" },
    ...faculties.map((faculty) => ({ value: String(faculty.id), label: faculty.name })),
  ];

  const careerOptions = [
    { value: "all", label: "Todas las carreras" },
    ...careers.map((career) => ({ value: String(career.id), label: career.name })),
  ];

  const liveCount = draftAnalytics.totalStudents;
  const formattedResults = new Intl.NumberFormat("es-ES").format(
    resultsCount !== undefined && resultsCount !== liveCount ? resultsCount : liveCount
  );

  const showGenderHint =
    draftAnalytics.selectedBuilding?.gender?.toLowerCase().includes("mixto") ?? false;

  return (
    <section className="mb-12">
      <div className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-6 shadow-sm lg:p-8">
        <div className="mb-8 flex items-start gap-3">
          <span className="material-symbols-outlined mt-0.5 text-primary">tune</span>
          <div>
            <h3 className="font-headline text-lg font-bold text-on-surface">Generador de reportes</h3>
            <p className="mt-1 text-sm text-outline">
              Combine criterios académicos, de infraestructura y perfil estudiantil. Los indicadores
              inferiores se recalculan al cambiar los filtros.
            </p>
          </div>
        </div>

        <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-primary">Alcance</p>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
          <FilterField label="Tipo de informe">
            <DashboardFilterSelect
              value={draftFilters.reportType}
              onValueChange={(value) => patch({ reportType: value })}
              placeholder="Tipo"
              options={REPORT_TYPE_OPTIONS.map((option) => ({ value: option.value, label: option.label }))}
              disabled={disabled}
            />
          </FilterField>

          <FilterField label="Sede">
            <DashboardFilterSelect
              value={draftFilters.siteId === "all" ? "all" : String(draftFilters.siteId)}
              onValueChange={(value) =>
                patch({ siteId: value === "all" ? "all" : Number(value), buildingId: "all" })
              }
              placeholder="Sede"
              options={siteOptions}
              disabled={disabled}
            />
          </FilterField>

          <FilterField label="Edificio">
            <DashboardFilterSelect
              value={draftFilters.buildingId === "all" ? "all" : String(draftFilters.buildingId)}
              onValueChange={(value) => patch({ buildingId: value === "all" ? "all" : Number(value) })}
              placeholder="Edificio"
              options={buildingOptions}
              disabled={disabled}
            />
          </FilterField>
        </div>

        <p className="mb-4 mt-8 text-xs font-semibold uppercase tracking-wider text-primary">
          Perfil académico
        </p>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
          <FilterField label="Facultad">
            <DashboardFilterSelect
              value={draftFilters.facultyId === "all" ? "all" : String(draftFilters.facultyId)}
              onValueChange={(value) =>
                patch({
                  facultyId: value === "all" ? "all" : Number(value),
                  careerId: "all",
                })
              }
              placeholder="Facultad"
              options={facultyOptions}
              disabled={disabled}
            />
          </FilterField>

          <FilterField label="Carrera">
            <DashboardFilterSelect
              value={draftFilters.careerId === "all" ? "all" : String(draftFilters.careerId)}
              onValueChange={(value) => patch({ careerId: value === "all" ? "all" : Number(value) })}
              placeholder="Carrera"
              options={careerOptions}
              disabled={disabled || draftFilters.facultyId === "all" || careersLoading}
            />
          </FilterField>

          <FilterField label="Año académico">
            <DashboardFilterSelect
              value={draftFilters.academicYear === "all" ? "all" : String(draftFilters.academicYear)}
              onValueChange={(value) => patch({ academicYear: value === "all" ? "all" : Number(value) })}
              placeholder="Año"
              options={ACADEMIC_YEAR_OPTIONS.map((option) => ({ value: option.value, label: option.label }))}
              disabled={disabled}
            />
          </FilterField>
        </div>

        <p className="mb-4 mt-8 text-xs font-semibold uppercase tracking-wider text-primary">
          Perfil estudiantil
          {showGenderHint ? " · edificio mixto detectado" : ""}
        </p>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
          <FilterField label="Sexo">
            <DashboardFilterSelect
              value={draftFilters.gender}
              onValueChange={(value) => patch({ gender: value as ReportsDraftFilters["gender"] })}
              placeholder="Sexo"
              options={GENDER_FILTER_OPTIONS.map((option) => ({ value: option.value, label: option.label }))}
              disabled={disabled}
            />
          </FilterField>

          <FilterField label="Alojamiento">
            <DashboardFilterSelect
              value={draftFilters.housing}
              onValueChange={(value) => patch({ housing: value as ReportsDraftFilters["housing"] })}
              placeholder="Alojamiento"
              options={HOUSING_FILTER_OPTIONS.map((option) => ({ value: option.value, label: option.label }))}
              disabled={disabled}
            />
          </FilterField>

          <FilterField label="Militancia">
            <DashboardFilterSelect
              value={draftFilters.militant}
              onValueChange={(value) => patch({ militant: value as ReportsDraftFilters["militant"] })}
              placeholder="Militancia"
              options={MILITANT_FILTER_OPTIONS.map((option) => ({ value: option.value, label: option.label }))}
              disabled={disabled}
            />
          </FilterField>

          <FilterField label="Aprovechamiento docente">
            <DashboardFilterSelect
              value={draftFilters.performance}
              onValueChange={(value) =>
                patch({ performance: value as ReportsDraftFilters["performance"] })
              }
              placeholder="Aprovechamiento"
              options={PERFORMANCE_FILTER_OPTIONS.map((option) => ({
                value: option.value,
                label: option.label,
              }))}
              disabled={disabled}
            />
          </FilterField>
        </div>

        <ReportsDynamicInsights
          insights={draftAnalytics.insights}
          selectedBuilding={draftAnalytics.selectedBuilding}
          isLoading={draftAnalytics.isLoading}
        />

        <div className="mt-8 flex flex-col gap-4 border-t border-outline-variant/20 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-xs font-medium text-outline">
            {formattedResults}{" "}
            {liveCount === 1 ? "estudiante coincide" : "estudiantes coinciden"} con la vista previa
          </span>

          <div className="flex flex-wrap items-center gap-3 sm:justify-end">
            <Button type="button" variant="outline" onClick={onClear} disabled={disabled} className="cursor-pointer">
              Limpiar
            </Button>
            <Button type="button" variant="default" onClick={onApply} disabled={disabled} className="cursor-pointer">
              Aplicar y actualizar vista
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
