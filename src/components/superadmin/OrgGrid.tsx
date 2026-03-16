"use client";

import { Building2, HeartPulse, Loader2, Users } from "lucide-react";
import { useEffect, useState } from "react";
import type { OrgSummary } from "@/lib/api/superadmin";
import { useAllOrgs, useDeactivateOrg } from "@/lib/hooks/useSuperAdmin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toaster";

function planBadge(plan: string) {
  if (plan === "PREMIUM") return <Badge className="bg-primary/10 text-primary">PREMIUM</Badge>;
  if (plan === "ENTERPRISE") return <Badge className="bg-warning/15 text-warning">ENTERPRISE</Badge>;
  return <Badge variant="secondary">FREE</Badge>;
}

function prettyDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export function OrgGrid({ onTotalChange }: { onTotalChange?: (total: number) => void }) {
  const [page, setPage] = useState(0);
  const [target, setTarget] = useState<OrgSummary | null>(null);
  const { toast } = useToast();

  const orgsQuery = useAllOrgs(page, 20);
  const deactivateMutation = useDeactivateOrg();

  useEffect(() => {
    onTotalChange?.(orgsQuery.data?.totalElements ?? 0);
  }, [onTotalChange, orgsQuery.data?.totalElements]);

  const orgs = orgsQuery.data?.content ?? [];
  const totalPages = Math.max(1, orgsQuery.data?.totalPages ?? 1);

  async function confirmDeactivate() {
    if (!target) return;

    try {
      await deactivateMutation.mutateAsync(target.id);
      toast.warning(`${target.name} deactivated`, {
        description: "All members have lost access",
      });
      setTarget(null);
    } catch {
      toast.error("Unable to deactivate org");
    }
  }

  return (
    <div className="space-y-4">
      {orgsQuery.isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={`org-skeleton-${index}`} className="h-48 rounded-xl" />
          ))}
        </div>
      ) : null}

      {!orgsQuery.isLoading && orgs.length === 0 ? (
        <div className="rounded-xl border border-dashed p-12 text-center text-sm text-muted-foreground">
          No organisations found.
        </div>
      ) : null}

      {!orgsQuery.isLoading && orgs.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {orgs.map((org) => (
            <Card key={org.id} className={!org.active ? "opacity-60" : undefined}>
              <CardContent className="space-y-4 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div className="space-y-1">
                      <p className="max-w-[180px] truncate font-semibold text-foreground">{org.name}</p>
                      {planBadge(org.plan)}
                    </div>
                  </div>

                  {!org.active ? <Badge variant="destructive">Deactivated</Badge> : null}
                </div>

                <div className="space-y-2 text-sm text-muted-foreground">
                  <p className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    {org.memberCount} members
                  </p>
                  <p className="flex items-center gap-2">
                    <HeartPulse className="h-4 w-4" />
                    {org.patientCount} patients
                  </p>
                  <p>Created {prettyDate(org.createdAt)}</p>
                </div>

                {org.active ? (
                  <Button variant="outline" className="w-full border-destructive text-destructive hover:bg-destructive/10" onClick={() => setTarget(org)}>
                    Deactivate org
                  </Button>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}

      {(orgsQuery.data?.totalElements ?? 0) > 20 ? (
        <div className="flex items-center justify-between rounded-lg border p-3">
          <Button variant="outline" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0 || orgsQuery.isFetching}>
            Previous
          </Button>
          <p className="text-sm text-muted-foreground">Page {page + 1} of {totalPages}</p>
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={orgsQuery.isFetching || page + 1 >= totalPages}
          >
            Next
          </Button>
        </div>
      ) : null}

      <Dialog open={Boolean(target)} onOpenChange={(open) => (!open ? setTarget(null) : null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deactivate organisation?</DialogTitle>
            <DialogDescription>
              <span className="font-semibold text-foreground">{target?.name}</span> has {target?.memberCount ?? 0} members.
              <br />
              Patient data is preserved.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTarget(null)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDeactivate} disabled={deactivateMutation.isPending}>
              {deactivateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {deactivateMutation.isPending ? "Deactivating..." : "Deactivate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
