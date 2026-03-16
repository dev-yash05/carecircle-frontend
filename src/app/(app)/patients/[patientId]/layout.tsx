/// <reference types="react/canary" />
"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Droplets, Pencil } from "lucide-react";
import { useAuthStore } from "@/lib/stores/authStore";
import { usePatient } from "@/lib/hooks/usePatients";
import { RoleGuard } from "@/components/layout/role-guard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const tabs = [
  { href: "", label: "Overview" },
  { href: "/medications", label: "Medications" },
  { href: "/doses", label: "Doses" },
  { href: "/vitals", label: "Vitals" },
  { href: "/audit", label: "Audit" },
  { href: "/report", label: "Report" },
];

function getAge(dateOfBirth: string) {
  const dob = new Date(dateOfBirth);
  if (Number.isNaN(dob.getTime())) return "-";
  const diff = Date.now() - dob.getTime();
  const ageDate = new Date(diff);
  return String(Math.abs(ageDate.getUTCFullYear() - 1970));
}

export default function PatientDetailLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ patientId: string }>;
}) {
  const pathname = usePathname();
  const { patientId } = React.use(params);
  const orgId = useAuthStore((state) => state.user?.organizationId ?? undefined);
  const patientQuery = usePatient(orgId, patientId);

  const patient = patientQuery.data;

  return (
    <div className="space-y-5">
      <Link href="/patients" className="inline-flex text-sm text-muted-foreground transition-colors hover:text-primary">
        ← All patients
      </Link>

      {patientQuery.isLoading || !patient ? (
        <Skeleton className="h-44 rounded-xl" />
      ) : (
        <Card>
          <CardContent className="space-y-4 p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/15 text-lg font-semibold text-primary">
                  {patient.name.slice(0, 1).toUpperCase()}
                </div>
                <div>
                  <h1 className="text-2xl font-semibold text-foreground">{patient.name}</h1>
                  <p className="text-sm text-muted-foreground">{getAge(patient.dateOfBirth)} years old</p>
                </div>
              </div>

              <RoleGuard allowed={["ADMIN", "SUPER_ADMIN"]}>
                <Button variant="outline" size="sm">
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              </RoleGuard>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              {patient.bloodGroup ? (
                <span className="inline-flex items-center gap-1">
                  <Droplets className="h-4 w-4 text-primary" />
                  {patient.bloodGroup}
                </span>
              ) : null}

              {(patient.allergies ?? []).slice(0, 4).map((allergy) => (
                <Badge key={allergy} variant="warning">
                  ⚠ {allergy}
                </Badge>
              ))}
            </div>

            {patient.notes ? (
              <p
                className="text-sm text-muted-foreground"
                style={{
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {patient.notes}
              </p>
            ) : null}
          </CardContent>
        </Card>
      )}

      <div className="overflow-x-auto border-b">
        <nav className="flex min-w-max gap-6">
          {tabs.map((tab) => {
            const tabHref = `/patients/${patientId}${tab.href}`;
            const active = pathname === tabHref;

            return (
              <Link
                key={tab.label}
                href={tabHref}
                className={[
                  "border-b-2 pb-3 pt-1 text-sm font-medium transition-colors",
                  active ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground",
                ].join(" ")}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div>{children}</div>
    </div>
  );
}
