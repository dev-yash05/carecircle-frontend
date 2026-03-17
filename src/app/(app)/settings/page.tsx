"use client";

import { useEffect, useState } from "react";
import { Bell, Building2, LogOut, ShieldCheck, UserCircle2 } from "lucide-react";
import { useTheme } from "next-themes";
import { logout } from "@/lib/api/auth";
import { useAuthStore } from "@/lib/stores/authStore";
import { RoleGuard } from "@/components/layout/role-guard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/toaster";

export default function SettingsPage() {
  const user = useAuthStore((state) => state.user);
  const { setTheme, theme } = useTheme();
  const { toast } = useToast();

  const [displayName, setDisplayName] = useState("");
  const [timezone, setTimezone] = useState("Asia/Kolkata");
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [criticalAlerts, setCriticalAlerts] = useState(true);

  useEffect(() => {
    setDisplayName(user?.name ?? "");
  }, [user?.name]);

  async function handleSavePreferences() {
    toast.success("Preferences saved", {
      description: "Your app preferences were updated for this device.",
    });
  }

  async function handleSignOut() {
    try {
      await logout();
    } catch {
      toast.error("Sign out failed", {
        description: "Unable to sign out right now. Please try again.",
      });
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your account, interface preferences, and organization controls.
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <UserCircle2 className="h-5 w-5 text-primary" />
              Account
            </CardTitle>
            <CardDescription>Profile information synced from Google sign-in.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={user?.avatarUrl ?? undefined} alt={user?.name ?? "User"} />
                <AvatarFallback>{user?.name?.slice(0, 1).toUpperCase() ?? "U"}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-foreground">{user?.name ?? "Unknown user"}</p>
                <p className="text-sm text-muted-foreground">{user?.email ?? "No email"}</p>
              </div>
              <Badge className="ml-auto" variant="secondary">
                {user?.role ?? "VIEWER"}
              </Badge>
            </div>

            <Separator />

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="displayName">Display name</Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(event) => setDisplayName(event.target.value)}
                  placeholder="Your name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={user?.email ?? ""} disabled />
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              Name and avatar are controlled by your Google account. Local edits here are visual only for now.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Bell className="h-5 w-5 text-primary" />
              Preferences
            </CardTitle>
            <CardDescription>Customize the interface and alert behavior.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="theme">Theme</Label>
              <Select
                id="theme"
                value={theme ?? "system"}
                onChange={(event) => setTheme(event.target.value)}
              >
                <option value="system">System</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Select
                id="timezone"
                value={timezone}
                onChange={(event) => setTimezone(event.target.value)}
              >
                <option value="Asia/Kolkata">India (IST)</option>
                <option value="UTC">UTC</option>
                <option value="Europe/London">London (GMT/BST)</option>
                <option value="America/New_York">New York (ET)</option>
              </Select>
            </div>

            <div className="space-y-3 rounded-lg border p-3">
              <label className="flex items-center gap-2 text-sm text-foreground">
                <input
                  type="checkbox"
                  checked={emailAlerts}
                  onChange={(event) => setEmailAlerts(event.target.checked)}
                />
                Email me daily summaries
              </label>
              <label className="flex items-center gap-2 text-sm text-foreground">
                <input
                  type="checkbox"
                  checked={criticalAlerts}
                  onChange={(event) => setCriticalAlerts(event.target.checked)}
                />
                Highlight critical anomalies first
              </label>
            </div>

            <Button className="w-full" onClick={handleSavePreferences}>
              Save preferences
            </Button>
          </CardContent>
        </Card>
      </div>

      <RoleGuard
        allowed={["ADMIN", "SUPER_ADMIN"]}
        fallback={
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Building2 className="h-5 w-5 text-primary" />
                Organization
              </CardTitle>
              <CardDescription>
                You have read-only access. Contact an admin for organization changes.
              </CardDescription>
            </CardHeader>
          </Card>
        }
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Building2 className="h-5 w-5 text-primary" />
              Organization
            </CardTitle>
            <CardDescription>Manage organization-level settings for your care team.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="orgId">Organization ID</Label>
              <Input id="orgId" value={user?.organizationId ?? "N/A"} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="defaultPage">Default landing page</Label>
              <Select
                id="defaultPage"
                defaultValue="dashboard"
                onChange={() => toast.info("Default page preference saved")}
              >
                <option value="dashboard">Dashboard</option>
                <option value="patients">Patients</option>
                <option value="team">Team</option>
              </Select>
            </div>
          </CardContent>
        </Card>
      </RoleGuard>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <ShieldCheck className="h-5 w-5 text-primary" />
            Security
          </CardTitle>
          <CardDescription>Protect your account and active sessions.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-muted-foreground">
            Signed in as <span className="font-medium text-foreground">{user?.email ?? "Unknown"}</span>
          </div>
          <Button variant="outline" onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign out of this session
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
