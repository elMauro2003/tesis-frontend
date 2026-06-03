import { cn } from "@/utils/helpers/shadcn/index";

type ReportMetricTone = "default" | "success" | "warning" | "danger";

interface ReportMetricCardProps {
  title: string;
  value: string;
  suffix?: string;
  badge?: string;
  icon: string;
  tone?: ReportMetricTone;
  filledIcon?: boolean;
}

const toneStyles: Record<ReportMetricTone, { icon: string; badge: string; value: string }> = {
  default: {
    icon: "bg-surface-container-low text-outline group-hover:text-primary",
    badge: "bg-primary/10 text-primary",
    value: "text-on-surface",
  },
  success: {
    icon: "bg-green-50 text-green-600",
    badge: "bg-green-50 text-green-600",
    value: "text-green-600",
  },
  warning: {
    icon: "bg-amber-50 text-amber-500",
    badge: "bg-amber-50 text-amber-600",
    value: "text-amber-500",
  },
  danger: {
    icon: "bg-red-50 text-red-600",
    badge: "bg-red-50 text-red-600",
    value: "text-red-600",
  },
};

export function ReportMetricCard({
  title,
  value,
  suffix,
  badge,
  icon,
  tone = "default",
  filledIcon = false,
}: ReportMetricCardProps) {
  const styles = toneStyles[tone];

  return (
    <div className="group flex h-40 flex-col justify-between rounded-xl bg-surface-container-lowest p-6 shadow-[0_4px_20px_rgba(0,55,176,0.03)] transition-shadow duration-300 hover:shadow-lg">
      <div className="flex items-start justify-between">
        <div
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-xl transition-colors",
            styles.icon
          )}
        >
          <span
            className="material-symbols-outlined"
            style={filledIcon ? { fontVariationSettings: "'FILL' 1" } : undefined}
          >
            {icon}
          </span>
        </div>
        {badge ? (
          <span className={cn("rounded-full px-2 py-1 text-[10px] font-bold uppercase", styles.badge)}>
            {badge}
          </span>
        ) : null}
      </div>
      <div>
        <h3 className="mb-1 text-[10px] font-bold uppercase tracking-[0.15em] text-outline">{title}</h3>
        <p className={cn("font-headline text-3xl font-extrabold", styles.value)}>
          {value}
          {suffix ? <span className="ml-1 text-sm font-medium text-outline">{suffix}</span> : null}
        </p>
      </div>
    </div>
  );
}
