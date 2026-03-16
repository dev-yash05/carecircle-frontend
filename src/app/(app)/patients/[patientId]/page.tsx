/// <reference types="react/canary" />
"use client";

import * as React from "react";
import { useAuthStore } from "@/lib/stores/authStore";
import { usePatient } from "@/lib/hooks/usePatients";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

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

      <Card className="border-dashed md:col-span-3 lg:col-span-1">
        <CardContent className="p-10 text-center text-sm text-muted-foreground">Sprint 4 — Dose schedule insights</CardContent>
      </Card>
      <Card className="border-dashed md:col-span-3 lg:col-span-2">
        <CardContent className="p-10 text-center text-sm text-muted-foreground">Sprint 5 — Vitals chart snapshot</CardContent>
      </Card>
    </div>
  );
}
