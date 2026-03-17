"use client";

import { ShieldCheck } from "lucide-react";
import { TeamTable } from "@/components/superadmin/TeamTable";

export default function SuperAdminTeamPage() {
  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3">
        <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Team Administration</h1>
          <p className="text-sm text-muted-foreground">
            Search and manage admins, caregivers, and viewers across organisations.
          </p>
        </div>
      </div>

      <TeamTable />
    </div>
  );
}
