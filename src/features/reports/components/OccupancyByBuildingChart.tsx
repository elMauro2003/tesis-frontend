import type { BuildingOccupancyRow } from "@/features/reports/utils/metrics";

interface OccupancyByBuildingChartProps {
  rows: BuildingOccupancyRow[];
  isLoading?: boolean;
}

export function OccupancyByBuildingChart({ rows, isLoading }: OccupancyByBuildingChartProps) {
  if (isLoading) {
    return (
      <div className="rounded-2xl bg-surface-container-lowest p-8 shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
        <p className="text-sm text-outline">Cargando ocupación por edificio…</p>
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="rounded-2xl bg-surface-container-lowest p-8 shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
        <h4 className="mb-4 font-bold text-on-surface">Ocupación por edificio</h4>
        <p className="text-sm text-outline">No hay datos de cuartos activos para los filtros seleccionados.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-surface-container-lowest p-8 shadow-[0_4px_24px_rgba(0,0,0,0.02)] lg:col-span-2">
      <div className="mb-10 flex items-center justify-between gap-4">
        <h4 className="font-bold text-on-surface">Ocupación por edificio</h4>
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-primary" />
            <span className="text-xs font-medium text-outline">Ocupado</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-outline">
              {rows.reduce((sum, row) => sum + row.occupied, 0)} / {rows.reduce((sum, row) => sum + row.capacity, 0)} plazas
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {rows.map((row) => (
          <div key={row.buildingId}>
            <div className="mb-2 flex justify-between text-xs font-bold uppercase tracking-tighter text-on-surface">
              <span>{row.label}</span>
              <span>{row.percent}%</span>
            </div>
            <div className="h-4 w-full overflow-hidden rounded-full bg-surface-container">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: `${row.percent}%` }}
              />
            </div>
            <p className="mt-1 text-[11px] text-outline">
              {row.occupied} de {row.capacity} plazas ocupadas
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
