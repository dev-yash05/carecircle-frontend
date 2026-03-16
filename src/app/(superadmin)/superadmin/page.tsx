"use client";

import { Building2 } from "lucide-react";
import { useState } from "react";
import { OrgGrid } from "@/components/superadmin/OrgGrid";

export default function SuperAdminOrgsPage() {
  const [totalOrgs, setTotalOrgs] = useState(0);

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3">
        <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <Building2 className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-foreground">All Organisations</h1>
          <p className="text-sm text-muted-foreground">{totalOrgs} total orgs across the platform</p>
        </div>
      </div>

      <OrgGrid onTotalChange={setTotalOrgs} />
    </div>
  );
}
