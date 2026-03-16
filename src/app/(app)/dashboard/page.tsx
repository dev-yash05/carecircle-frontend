"use client";

import { RoleGuard } from "@/components/layout/role-guard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/lib/stores/authStore";

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const firstName = user?.name?.split(" ")[0];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="mt-2 text-muted-foreground">Welcome back, {firstName}.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sprint 1 & 2 verification</CardTitle>
          <CardDescription>Auth hydration and shell status from the current client session.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>User id: {user?.id ?? "Not loaded"}</p>
          <p>Role: {user?.role ?? "Not loaded"}</p>
          <p>Email: {user?.email ?? "Not loaded"}</p>
        </CardContent>
      </Card>

      <RoleGuard allowed={["ADMIN", "SUPER_ADMIN"]}>
        <Card className="border-primary/30 bg-primary/10">
          <CardHeader>
            <CardTitle className="text-primary">Admin tools</CardTitle>
            <CardDescription className="text-primary/80">
              This card is only visible to ADMIN and SUPER_ADMIN roles.
            </CardDescription>
          </CardHeader>
        </Card>
      </RoleGuard>

      <Card className="border-dashed">
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          Dashboard widgets land here in upcoming sprints.
        </CardContent>
      </Card>
    </div>
  );
}
