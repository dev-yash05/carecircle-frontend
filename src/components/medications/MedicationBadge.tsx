import { CRON_PRESETS } from "@/lib/schemas/medication.schema";
import { cn } from "@/lib/utils";

function cronToLabel(cronExpression: string) {
  const preset = CRON_PRESETS.find((item) => item.value === cronExpression);
  return preset?.label ?? cronExpression;
}

export function MedicationBadge({ cronExpression, className }: { cronExpression: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary",
        className,
      )}
      title={cronExpression}
    >
      {cronToLabel(cronExpression)}
    </span>
  );
}
