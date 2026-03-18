"use client";

import Link from "next/link";
import { AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDashboardStore } from "@/lib/stores/dashboardStore";

export function AnomalyAlertBanner() {
  const anomalies = useDashboardStore((state) => state.anomalies);
  const dismissAnomaly = useDashboardStore((state) => state.dismissAnomaly);

  if (anomalies.length === 0) return null;

  return (
    <div className="space-y-2 animate-fade-in">
      {anomalies.map((anomaly, i) => (
        <div
          key={anomaly.id}
          className="flex items-start justify-between gap-3 rounded-2xl border border-destructive/25 bg-destructive/8 px-4 py-3.5 shadow-sm animate-scale-in"
          style={{ animationDelay: `${i * 80}ms` }}
        >
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-destructive/15">
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </div>
            <div>
              <p className="text-sm font-semibold text-destructive">
                {anomaly.patientName} · {anomaly.anomalyType}
              </p>
              <Link
                href={`/patients/${anomaly.patientId}/vitals`}
                className="text-xs font-medium text-destructive/80 underline-offset-2 hover:underline transition-colors"
              >
                View vitals →
              </Link>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-destructive hover:bg-destructive/15 transition-colors"
            onClick={() => dismissAnomaly(anomaly.id)}
            aria-label="Dismiss anomaly"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  );
}
