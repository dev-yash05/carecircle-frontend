"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Trash2, UserCheck, UserPlus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { ApiError } from "@/lib/api/client";
import type { Member } from "@/lib/api/members";
import { useAddMember, useMembers, useRemoveMember } from "@/lib/hooks/useMembers";
import { MemberAddSchema, type MemberAddInput } from "@/lib/schemas/member.schema";
import { useAuthStore } from "@/lib/stores/authStore";
import { RoleGuard } from "@/components/layout/role-guard";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toaster";

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
  return `${parts[0].slice(0, 1)}${parts[1].slice(0, 1)}`.toUpperCase();
}

function roleBadge(role: string) {
  if (role === "ADMIN" || role === "SUPER_ADMIN") return <Badge variant="default">{role}</Badge>;
  if (role === "CAREGIVER") return <Badge variant="secondary">Caregiver</Badge>;
  return <Badge variant="outline">Viewer</Badge>;
}

function AddMemberDialog() {
  const [open, setOpen] = useState(false);
  const addMutation = useAddMember();
  const { toast } = useToast();

  const {
    register,
    setValue,
    watch,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<MemberAddInput>({
    resolver: zodResolver(MemberAddSchema),
    defaultValues: {
      email: "",
      role: "CAREGIVER",
    },
  });

  async function onSubmit(values: MemberAddInput) {
    try {
      await addMutation.mutateAsync(values);
      toast.success("Member added", {
        description: `${values.email} will join as caregiver on first login`,
      });
      reset({ email: "", role: "CAREGIVER" });
      setOpen(false);
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        toast.error("Email already exists", { description: "This member is already part of the team." });
        return;
      }
      toast.error("Unable to add member");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Add member
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a team member</DialogTitle>
          <DialogDescription>
            Share access by email. The user will join your organization on first login.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <Label htmlFor="member-email">Email</Label>
            <Input id="member-email" type="email" placeholder="caregiver@example.com" {...register("email")} />
            {errors.email ? <p className="text-xs text-destructive">{errors.email.message}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="member-role">Role</Label>
            <Select
              id="member-role"
              value={watch("role")}
              onChange={(event) => setValue("role", event.target.value as MemberAddInput["role"], { shouldValidate: true })}
            >
              <option value="CAREGIVER">Caregiver - can mark doses and record vitals</option>
              <option value="VIEWER">Viewer - read-only access</option>
            </Select>
            {errors.role ? <p className="text-xs text-destructive">{errors.role.message}</p> : null}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting || addMutation.isPending}>
              {isSubmitting || addMutation.isPending ? "Sending..." : "Send invite"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function RemoveMemberDialog({
  target,
  onClose,
}: {
  target: Member | null;
  onClose: () => void;
}) {
  const { toast } = useToast();
  const removeMutation = useRemoveMember();

  async function handleRemove() {
    if (!target) return;

    try {
      await removeMutation.mutateAsync(target.id);
      toast.success("Member removed");
      onClose();
    } catch {
      toast.error("Unable to remove member");
    }
  }

  return (
    <Dialog open={Boolean(target)} onOpenChange={(open) => (!open ? onClose() : null)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Remove member?</DialogTitle>
          <DialogDescription>
            {target?.name} ({target?.email}) will lose access to this organization.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="destructive" onClick={handleRemove} disabled={removeMutation.isPending}>
            {removeMutation.isPending ? "Removing..." : "Remove"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function TeamPage() {
  const { toast } = useToast();
  const query = useMembers();
  const currentUser = useAuthStore((state) => state.user);
  const [removeTarget, setRemoveTarget] = useState<Member | null>(null);

  const canManage = currentUser?.role === "ADMIN" || currentUser?.role === "SUPER_ADMIN";

  if (!currentUser?.organizationId) {
    return (
      <div className="rounded-xl border border-dashed p-12 text-center text-sm text-muted-foreground">
        Team management requires an organization context.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Team</h1>
          <p className="text-sm text-muted-foreground">Manage caregivers and viewers in your organization.</p>
        </div>

        <RoleGuard allowed={["ADMIN", "SUPER_ADMIN"]} fallback={<></>}>
          <AddMemberDialog />
        </RoleGuard>
      </div>

      {query.isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-20 rounded-xl" />
          ))}
        </div>
      ) : null}

      {!query.isLoading && (query.data?.length ?? 0) === 0 ? (
        <div className="rounded-xl border border-dashed p-12 text-center">
          <UserCheck className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">No team members yet</p>
        </div>
      ) : null}

      {!query.isLoading && (query.data?.length ?? 0) > 0 ? (
        <div className="rounded-xl border">
          {(query.data ?? []).map((member) => {
            const isCurrentUser = member.email === currentUser.email || member.id === currentUser.id;
            return (
              <div key={member.id} className="flex items-center justify-between gap-3 border-b p-4 last:border-b-0">
                <div className="flex items-center gap-3">
                  <Avatar>
                    {member.avatarUrl ? <AvatarImage src={member.avatarUrl} alt={member.name} /> : null}
                    <AvatarFallback>{initials(member.name)}</AvatarFallback>
                  </Avatar>

                  <div>
                    <p className="font-medium text-foreground">
                      {member.name}
                      {isCurrentUser ? <span className="ml-2 text-xs font-normal text-muted-foreground">(you)</span> : null}
                    </p>
                    <p className="text-sm text-muted-foreground">{member.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {roleBadge(member.role)}
                  {canManage && !isCurrentUser ? (
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Remove member"
                      onClick={() => setRemoveTarget(member)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      ) : null}

      {query.isError ? (
        <div className="rounded-xl border border-dashed p-6 text-sm text-muted-foreground">
          Failed to load members.
          <Button
            variant="link"
            className="h-auto px-1"
            onClick={() => {
              query.refetch();
              toast("Retrying member fetch");
            }}
          >
            Retry
          </Button>
        </div>
      ) : null}

      <RemoveMemberDialog target={removeTarget} onClose={() => setRemoveTarget(null)} />
    </div>
  );
}
