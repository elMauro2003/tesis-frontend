import { DashboardComplaintsChartSkeleton } from "@/components/shared/DashboardSkeletons";
import { COMPLAINTS_LOOKBACK_DAYS } from "@/features/reports/constants";
import type { ComplaintStatusBreakdown } from "@/features/reports/utils/metrics";

interface ComplaintsStatusPanelProps {
  breakdown: ComplaintStatusBreakdown;
  isLoading?: boolean;
}

const RING_CIRCUMFERENCE = 251.2;

const statusLegend = [
  { key: "resuelta" as const, label: "Solucionadas", color: "bg-green-500", surface: "bg-green-50/50", text: "text-green-800" },
  { key: "en_proceso" as const, label: "En proceso", color: "bg-blue-500", surface: "bg-blue-50/50", text: "text-blue-800" },
  { key: "pendiente" as const, label: "Pendientes", color: "bg-amber-500", surface: "bg-amber-50/50", text: "text-amber-800" },
];

export function ComplaintsStatusPanel({ breakdown, isLoading }: ComplaintsStatusPanelProps) {
  if (isLoading) {
    return <DashboardComplaintsChartSkeleton />;
  }

  const segments = [
    { value: breakdown.resuelta, color: "#10b981" },
    { value: breakdown.en_proceso, color: "#3b82f6" },
    { value: breakdown.pendiente, color: "#f59e0b" },
  ];

  let offset = 0;

  return (
    <div className="flex flex-col items-center justify-between rounded-2xl bg-surface-container-lowest p-8 shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
      <h4 className="mb-6 self-start font-bold text-on-surface">
        Estado de quejas (últimos {COMPLAINTS_LOOKBACK_DAYS} días)
      </h4>

      <div className="relative mb-8 h-48 w-48">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f2f4f6" strokeWidth="12" />
          {breakdown.total === 0 ? null : (
            segments.map((segment, index) => {
              const length = (segment.value / breakdown.total) * RING_CIRCUMFERENCE;
              const dashOffset = offset;
              offset += length;

              return (
                <circle
                  key={index}
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke={segment.color}
                  strokeWidth="12"
                  strokeDasharray={`${length} ${RING_CIRCUMFERENCE - length}`}
                  strokeDashoffset={-dashOffset}
                  strokeLinecap="round"
                />
              );
            })
          )}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-headline text-3xl font-extrabold">{breakdown.efficacyPercent}%</span>
          <span className="text-[10px] font-bold uppercase text-outline">Eficacia</span>
        </div>
      </div>

      <div className="w-full space-y-3">
        {statusLegend.map((item) => (
          <div
            key={item.key}
            className={`flex items-center justify-between rounded-xl p-3 text-sm ${item.surface}`}
          >
            <div className="flex items-center gap-3">
              <span className={`h-2 w-2 rounded-full ${item.color}`} />
              <span className={`font-medium ${item.text}`}>{item.label}</span>
            </div>
            <span className={`font-bold ${item.text}`}>{breakdown[item.key]}</span>
          </div>
        ))}
        {breakdown.rechazada > 0 ? (
          <p className="text-center text-[11px] text-outline">
            {breakdown.rechazada} queja(s) rechazada(s) en el periodo
          </p>
        ) : null}
      </div>
    </div>
  );
}
