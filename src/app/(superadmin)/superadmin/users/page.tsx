"use client";

import { Users } from "lucide-react";
import { useState } from "react";
import { UserTable } from "@/components/superadmin/UserTable";

export default function SuperAdminUsersPage() {
  const [totalUsers, setTotalUsers] = useState(0);

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3">
        <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <Users className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-foreground">All Users</h1>
          <p className="text-sm text-muted-foreground">{totalUsers} total users</p>
        </div>
      </div>

      <UserTable onTotalChange={setTotalUsers} />
    </div>
  );
}
