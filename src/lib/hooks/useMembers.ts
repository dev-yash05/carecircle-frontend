import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addMember, getMembers, removeMember, type Member } from "@/lib/api/members";
import type { MemberAddInput } from "@/lib/schemas/member.schema";
import { useAuthStore } from "@/lib/stores/authStore";

const memberKeys = {
  all: ["members"] as const,
  list: (orgId: string) => [...memberKeys.all, orgId] as const,
};

export function useMembers() {
  const orgId = useAuthStore((state) => state.user?.organizationId ?? undefined);

  return useQuery<Member[]>({
    queryKey: orgId ? memberKeys.list(orgId) : [...memberKeys.all, "disabled"],
    queryFn: () => getMembers(orgId as string),
    enabled: Boolean(orgId),
    staleTime: 60_000,
  });
}

export function useAddMember() {
  const orgId = useAuthStore((state) => state.user?.organizationId ?? undefined);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: MemberAddInput) => addMember(orgId as string, payload),
    onSuccess: async () => {
      if (!orgId) return;
      await queryClient.invalidateQueries({ queryKey: memberKeys.list(orgId) });
    },
  });
}

export function useRemoveMember() {
  const orgId = useAuthStore((state) => state.user?.organizationId ?? undefined);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (memberId: string) => removeMember(orgId as string, memberId),
    onSuccess: async () => {
      if (!orgId) return;
      await queryClient.invalidateQueries({ queryKey: memberKeys.list(orgId) });
    },
  });
}
