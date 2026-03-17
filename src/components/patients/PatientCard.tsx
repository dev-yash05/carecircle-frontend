"use client";

import Link from "next/link";
import { Droplets } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { Patient } from "@/lib/api/patients";

function getAge(dateOfBirth: string) {
  const dob = new Date(dateOfBirth);
  if (Number.isNaN(dob.getTime())) return "-";

  const diff = Date.now() - dob.getTime();
  const ageDate = new Date(diff);
  return String(Math.abs(ageDate.getUTCFullYear() - 1970));
}

export function PatientCard({ patient }: { patient: Patient }) {
  const initials = patient.name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((chunk) => chunk[0]?.toUpperCase() ?? "")
    .join("");

  const allergies = patient.allergies ?? [];
  const visibleAllergies = allergies.slice(0, 3);
  const overflow = Math.max(allergies.length - visibleAllergies.length, 0);

  return (
    <Link href={`/patients/${patient.id}`} className="group block">
      <Card className="h-full border-border/90 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:border-primary/40 group-hover:shadow-[0_12px_26px_hsl(var(--primary)/0.12)]">
        <CardContent className="space-y-3 p-4 sm:p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/12 text-base font-semibold text-primary">
              {initials || "P"}
            </div>
            <div className="min-w-0">
              <p className="truncate text-[1.05rem] font-semibold leading-tight text-foreground transition-colors group-hover:text-primary">
                {patient.name}
              </p>
              <p className="text-sm text-muted-foreground">{getAge(patient.dateOfBirth)} years</p>
            </div>
          </div>

          {patient.bloodGroup ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Droplets className="h-4 w-4 text-primary" />
              <span>{patient.bloodGroup}</span>
            </div>
          ) : null}

          {visibleAllergies.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {visibleAllergies.map((allergy) => (
                <Badge key={allergy} variant="warning">
                  {allergy}
                </Badge>
              ))}
              {overflow > 0 ? <Badge variant="outline">+{overflow}</Badge> : null}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </Link>
  );
}
