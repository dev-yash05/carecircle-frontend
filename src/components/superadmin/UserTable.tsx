"use client";

import { Loader2, UserX } from "lucide-react";
import { useEffect, useState } from "react";
import type { UserSummary } from "@/lib/api/superadmin";
import { useAllUsers, useDeactivateUser } from "@/lib/hooks/useSuperAdmin";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
  return `${parts[0].slice(0, 1)}${parts[1].slice(0, 1)}`.toUpperCase();
}

function roleBadge(role: string) {
  if (role === "SUPER_ADMIN") return <Badge variant="destructive">SUPER_ADMIN</Badge>;
  if (role === "ADMIN") return <Badge className="bg-primary/10 text-primary">ADMIN</Badge>;
  if (role === "CAREGIVER") return <Badge variant="secondary">Caregiver</Badge>;
  return <Badge variant="outline">Viewer</Badge>;
}

export function UserTable({ onTotalChange }: { onTotalChange?: (total: number) => void }) {
  const [page, setPage] = useState(0);
  const [target, setTarget] = useState<UserSummary | null>(null);
  const { toast } = useToast();

  const usersQuery = useAllUsers(page, 20);
  const deactivateMutation = useDeactivateUser();

  useEffect(() => {
    onTotalChange?.(usersQuery.data?.totalElements ?? 0);
  }, [onTotalChange, usersQuery.data?.totalElements]);

  const users = usersQuery.data?.content ?? [];
  const totalPages = Math.max(1, usersQuery.data?.totalPages ?? 1);

  async function confirmDeactivate() {
    if (!target) return;

    try {
      await deactivateMutation.mutateAsync(target.id);
      toast.warning(`${target.name} deactivated`);
      setTarget(null);
    } catch {
      toast.error("Unable to deactivate user");
    }
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-xl border">
        <table className="min-w-full divide-y divide-border text-sm">
          <thead>
            <tr className="text-left text-muted-foreground">
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Role</th>
              <th className="hidden px-4 py-3 md:table-cell">Organisation</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>

          <tbody className="divide-y divide-border">
            {usersQuery.isLoading
              ? Array.from({ length: 8 }).map((_, index) => (
                  <tr key={`user-skeleton-${index}`}>
                    <td colSpan={5} className="px-4 py-2">
                      <Skeleton className="h-8 w-full" />
                    </td>
                  </tr>
                ))
              : null}

            {!usersQuery.isLoading && users.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">No users found.</td>
              </tr>
            ) : null}

            {!usersQuery.isLoading
              ? users.map((user) => {
                  const canDeactivate = user.active && user.role !== "SUPER_ADMIN";

                  return (
                    <tr key={user.id} className={!user.active ? "opacity-50" : undefined}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            {user.avatarUrl ? <AvatarImage src={user.avatarUrl} alt={user.name} /> : null}
                            <AvatarFallback>{initials(user.name)}</AvatarFallback>
                          </Avatar>

                          <div>
                            <p className="font-medium text-foreground">{user.name}</p>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3">{roleBadge(user.role)}</td>

                      <td className="hidden px-4 py-3 md:table-cell text-muted-foreground">
                        {user.organizationName ?? <span className="italic">No org</span>}
                      </td>

                      <td className="px-4 py-3">
                        {user.active ? (
                          <span className="inline-flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                            <span className="h-2 w-2 rounded-full bg-emerald-500" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-2 text-muted-foreground">
                            <span className="h-2 w-2 rounded-full bg-muted-foreground/60" />
                            Inactive
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3 text-right">
                        {canDeactivate ? (
                          <Button variant="ghost" size="icon" aria-label="Deactivate user" onClick={() => setTarget(user)}>
                            <UserX className="h-4 w-4 text-destructive" />
                          </Button>
                        ) : null}
                      </td>
                    </tr>
                  );
                })
              : null}
          </tbody>
        </table>
      </div>

      {(usersQuery.data?.totalElements ?? 0) > 20 ? (
        <div className="flex items-center justify-between rounded-lg border p-3">
          <p className="text-sm text-muted-foreground">{usersQuery.data?.totalElements ?? 0} total users</p>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0 || usersQuery.isFetching}>
              Previous
            </Button>
            <Button
              variant="outline"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={usersQuery.isFetching || page + 1 >= totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">{usersQuery.data?.totalElements ?? 0} total users</p>
      )}

      <Dialog open={Boolean(target)} onOpenChange={(open) => (!open ? setTarget(null) : null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deactivate user?</DialogTitle>
            <DialogDescription>
              {target?.name} ({target?.email}) will lose access immediately.
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
