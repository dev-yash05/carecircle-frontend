"use client";

import { useMemo, useState } from "react";
import { ApiError } from "@/lib/api/client";
import { type BloodPressureValue, type SingleValue, type VitalReading } from "@/lib/api/vitals";
import { useRecordVital, useVitals } from "@/lib/hooks/useVitals";
import { VITAL_DEFAULT_UNITS, type VitalCreateInput, type VitalType } from "@/lib/schemas/vital.schema";
import { RoleGuard } from "@/components/layout/role-guard";
import { RecordVitalForm } from "@/components/vitals/RecordVitalForm";
import { VitalsChart } from "@/components/vitals/VitalsChart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toaster";

const tabs: Array<{ label: string; value: VitalType }> = [
  { label: "Blood Pressure", value: "BLOOD_PRESSURE" },
  { label: "Blood Sugar", value: "BLOOD_SUGAR" },
  { label: "SpO2", value: "SPO2" },
  { label: "Temperature", value: "TEMPERATURE" },
  { label: "Heart Rate", value: "HEART_RATE" },
  { label: "Weight", value: "WEIGHT" },
];

function formatVitalValue(type: VitalType, readingValue: VitalReading["readingValue"]) {
  if (type === "BLOOD_PRESSURE") {
    const bp = readingValue as BloodPressureValue;
    return `${bp.systolic}/${bp.diastolic} ${VITAL_DEFAULT_UNITS.BLOOD_PRESSURE}`;
  }
  const single = readingValue as SingleValue;
  return `${single.value} ${VITAL_DEFAULT_UNITS[type]}`;
}

export function VitalsPanel({ patientId }: { patientId: string }) {
  const [activeType, setActiveType] = useState<VitalType>("BLOOD_PRESSURE");
  const [dialogOpen, setDialogOpen] = useState(false);

  const { toast } = useToast();

  const vitalsQuery = useVitals(patientId, activeType);
  const recordVital = useRecordVital(patientId);

  const readings = useMemo(() => vitalsQuery.data?.content ?? [], [vitalsQuery.data?.content]);
  const anomalies = useMemo(
    () => readings.filter((reading) => reading.isAnomalous).length,
    [readings],
  );

  async function handleRecord(payload: VitalCreateInput) {
    try {
      const response = await recordVital.mutateAsync(payload);
      setDialogOpen(false);
      if (response.isAnomalous) {
        toast.warning("⚠ Anomalous reading detected");
      } else {
        toast.success("Vital recorded");
      }
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Unable to record vital";
      toast.error("Save failed", { description: message });
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Vitals</h2>
          <p className="text-sm text-muted-foreground">Track trends and anomalies over time.</p>
        </div>

        <RoleGuard allowed={["CAREGIVER", "ADMIN", "SUPER_ADMIN"]} fallback={<></>}>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>Record vital</Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl">
              <DialogHeader>
                <DialogTitle>Record a vital</DialogTitle>
                <DialogDescription>Add a new reading for this patient.</DialogDescription>
              </DialogHeader>
              <RecordVitalForm onSubmit={handleRecord} />
            </DialogContent>
          </Dialog>
        </RoleGuard>
      </div>

      {anomalies > 0 ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {anomalies} anomalous readings
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => {
          const active = tab.value === activeType;
          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => setActiveType(tab.value)}
              className={[
                "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                active
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:text-foreground",
              ].join(" ")}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <VitalsChart
        vitalType={activeType}
        readings={readings}
        unit={VITAL_DEFAULT_UNITS[activeType]}
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent readings</CardTitle>
        </CardHeader>
        <CardContent>
          {vitalsQuery.isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-12 rounded-md" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border text-sm">
                <thead>
                  <tr className="text-left text-muted-foreground">
                    <th className="py-2 pr-4">Date & Time</th>
                    <th className="py-2 pr-4">Reading</th>
                    <th className="hidden py-2 pr-4 sm:table-cell">Recorded by</th>
                    <th className="py-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {readings.map((reading: VitalReading) => {
                    const dt = new Date(reading.recordedAt);
                    const dateText = Number.isNaN(dt.getTime())
                      ? "Unknown"
                      : dt.toLocaleString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        });
                    return (
                      <tr
                        key={reading.id}
                        className={reading.isAnomalous ? "bg-destructive/5" : ""}
                      >
                        <td className="py-3 pr-4 text-muted-foreground">{dateText}</td>
                        <td className="py-3 pr-4">
                          <p>{formatVitalValue(activeType, reading.readingValue)}</p>
                          {reading.notes ? (
                            <p className="text-xs italic text-muted-foreground">{reading.notes}</p>
                          ) : null}
                        </td>
                        <td className="hidden py-3 pr-4 text-muted-foreground sm:table-cell">
                          {reading.recordedByName ?? "-"}
                        </td>
                        <td className="py-3">
                          {reading.isAnomalous ? (
                            <Badge variant="destructive">Anomalous</Badge>
                          ) : (
                            <Badge variant="success">Normal</Badge>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {!vitalsQuery.isLoading && readings.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-sm text-muted-foreground">
                        No readings yet
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
