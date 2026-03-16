/// <reference types="react/canary" />
"use client";

import * as React from "react";
import Link from "next/link";
import { useAuthStore } from "@/lib/stores/authStore";
import { usePatient } from "@/lib/hooks/usePatients";
import { useDoses } from "@/lib/hooks/useDoses";
import { useVitals } from "@/lib/hooks/useVitals";
import type { VitalType } from "@/lib/schemas/vital.schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

function PendingDosesSummary({ patientId }: { patientId: string }) {
  const { data } = useDoses(patientId, 0, "PENDING");
  const count = data?.totalElements ?? 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm text-muted-foreground font-medium">
          Pending doses
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {count === 0 ? (
          <p className="text-sm text-muted-foreground">All caught up ✓</p>
        ) : (
          <div className="flex items-center justify-between">
            <p className="text-2xl font-bold text-warning">{count}</p>
            <Link
              href={`/patients/${patientId}/doses`}
              className="text-xs text-primary hover:underline"
            >
              View doses →
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function formatVitalValue(type: VitalType, readingValue: any) {
  if (type === "BLOOD_PRESSURE") {
    return `${readingValue.systolic}/${readingValue.diastolic} mmHg`;
  }
  if (type === "BLOOD_SUGAR") {
    return `${readingValue.value} mg/dL`;
  }
  if (type === "SPO2") {
    return `${readingValue.value} %`;
  }
  return `${readingValue.value}`;
}

function LatestVitalsSummary({ patientId }: { patientId: string }) {
  const bp = useVitals(patientId, "BLOOD_PRESSURE");
  const bs = useVitals(patientId, "BLOOD_SUGAR");
  const spo2 = useVitals(patientId, "SPO2");

  const cards: Array<{ label: string; type: VitalType; latest?: any }> = [
    { label: "Blood Pressure", type: "BLOOD_PRESSURE", latest: bp.data?.content?.[0] },
    { label: "Blood Sugar", type: "BLOOD_SUGAR", latest: bs.data?.content?.[0] },
    { label: "SpO2", type: "SPO2", latest: spo2.data?.content?.[0] },
  ];

  return (
    <Card className="md:col-span-3">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Latest vitals</CardTitle>
        <Link href={`/patients/${patientId}/vitals`} className="text-xs text-primary hover:underline">
          All vitals →
        </Link>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-3">
          {cards.map(({ label, type, latest }) => (
            <div key={type} className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">{label}</p>
              {latest ? (
                <div className="mt-2 flex items-center gap-2">
                  <p className={latest.isAnomalous ? "text-lg font-semibold text-destructive" : "text-lg font-semibold text-foreground"}>
                    {formatVitalValue(type, latest!.readingValue)}
                  </p>
                  {latest.isAnomalous ? <Badge variant="destructive">!</Badge> : null}
                </div>
              ) : (
                <p className="mt-2 text-lg font-semibold text-muted-foreground">—</p>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function PatientOverviewPage({
  params,
}: {
  params: Promise<{ patientId: string }>;
}) {
  const { patientId } = React.use(params);
  const orgId = useAuthStore((state) => state.user?.organizationId ?? undefined);
  const patientQuery = usePatient(orgId, patientId);

  if (patientQuery.isLoading || !patientQuery.data) {
    return <Skeleton className="h-72 rounded-xl" />;
  }

  const patient = patientQuery.data;
  const dob = new Date(patient.dateOfBirth);

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Date of birth</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          {Number.isNaN(dob.getTime()) ? "Unknown" : dob.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Blood group</CardTitle>
        </CardHeader>
        <CardContent className="text-3xl font-semibold text-primary">{patient.bloodGroup ?? "-"}</CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Allergies</CardTitle>
        </CardHeader>
        <CardContent>
          {(patient.allergies ?? []).length > 0 ? (
            <ul className="space-y-1 text-sm text-muted-foreground">
              {(patient.allergies ?? []).map((allergy) => (
                <li key={allergy}>⚠ {allergy}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No known allergies</p>
          )}
        </CardContent>
      </Card>

      <Card className="md:col-span-3">
        <CardHeader>
          <CardTitle className="text-base">Notes</CardTitle>
        </CardHeader>
        <CardContent className="whitespace-pre-wrap text-sm text-muted-foreground">
          {patient.notes?.trim() || "No notes added yet."}
        </CardContent>
      </Card>

      <div className="md:col-span-3 lg:col-span-1">
        <PendingDosesSummary patientId={patientId} />
      </div>

      <LatestVitalsSummary patientId={patientId} />
    </div>
  );
}
