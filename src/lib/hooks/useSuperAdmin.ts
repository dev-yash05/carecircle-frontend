import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deactivateOrg,
  deactivateUser,
  getAllOrgs,
  getAllUsers,
  getOrgDetail,
  type OrgDetail,
  type OrgSummary,
  type PaginatedResponse,
  type UserSummary,
} from "@/lib/api/superadmin";

const superAdminKeys = {
  all: ["superadmin"] as const,
  orgs: (page: number, size: number) => [...superAdminKeys.all, "orgs", page, size] as const,
  orgDetail: (orgId: string) => [...superAdminKeys.all, "org", orgId] as const,
  users: (page: number, size: number) => [...superAdminKeys.all, "users", page, size] as const,
};

export function useAllOrgs(page: number, size = 20) {
  return useQuery<PaginatedResponse<OrgSummary>>({
    queryKey: superAdminKeys.orgs(page, size),
    queryFn: () => getAllOrgs(page, size),
    staleTime: 60_000,
    placeholderData: keepPreviousData,
  });
}

export function useOrgDetail(orgId: string | undefined) {
  return useQuery<OrgDetail>({
    queryKey: orgId ? superAdminKeys.orgDetail(orgId) : [...superAdminKeys.all, "org", "disabled"],
    queryFn: () => getOrgDetail(orgId as string),
    enabled: Boolean(orgId),
    staleTime: 60_000,
  });
}

export function useAllUsers(page: number, size = 20) {
  return useQuery<PaginatedResponse<UserSummary>>({
    queryKey: superAdminKeys.users(page, size),
    queryFn: () => getAllUsers(page, size),
    staleTime: 60_000,
    placeholderData: keepPreviousData,
  });
}

export function useDeactivateOrg() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (orgId: string) => deactivateOrg(orgId),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["superadmin", "orgs"] });
      await qc.invalidateQueries({ queryKey: ["superadmin", "org"] });
    },
  });
}

export function useDeactivateUser() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => deactivateUser(userId),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["superadmin", "users"] });
    },
  });
}
