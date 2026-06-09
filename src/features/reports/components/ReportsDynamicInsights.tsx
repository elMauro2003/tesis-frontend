import { DashboardInsightsSkeleton } from "@/components/shared/DashboardSkeletons";
import type { ReportInsight } from "@/features/reports/utils/reportAnalytics";
import { Building } from "@/types/models";

interface ReportsDynamicInsightsProps {
  insights: ReportInsight[];
  selectedBuilding: Building | null;
  isLoading?: boolean;
}

export function ReportsDynamicInsights({
  insights,
  selectedBuilding,
  isLoading,
}: ReportsDynamicInsightsProps) {
  if (isLoading) {
    return <DashboardInsightsSkeleton />;
  }

  if (insights.length === 0) {
    return null;
  }

  return (
    <div className="mt-8 space-y-4 border-t border-outline-variant/20 pt-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h4 className="font-headline text-sm font-bold text-on-surface">Indicadores en tiempo real</h4>
          <p className="text-xs text-outline">
            Se actualizan al cambiar los filtros, antes de aplicar.
            {selectedBuilding?.gender ? ` Edificio: ${selectedBuilding.gender}.` : ""}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {insights.map((insight) => (
          <div
            key={insight.id}
            className="rounded-xl border border-outline-variant/20 bg-surface-container-low/60 p-4"
          >
            <div className="mb-2 flex items-center gap-2">
              {insight.icon ? (
                <span className="material-symbols-outlined text-base text-primary">{insight.icon}</span>
              ) : null}
              <p className="text-[10px] font-bold uppercase tracking-wider text-outline">{insight.label}</p>
            </div>
            <p className="font-headline text-2xl font-extrabold text-on-surface">{insight.value}</p>
            {insight.hint ? <p className="mt-1 text-xs text-outline">{insight.hint}</p> : null}
          </div>
        ))}
      </div>
    </div>
  );
}
