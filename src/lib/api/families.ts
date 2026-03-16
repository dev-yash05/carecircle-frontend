import { apiClient } from "./client"

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface Family {
  id: number
  familyName: string
  createdAt: string
  memberCount: number
}

export interface FamilyMember {
  id: number
  displayName: string
  email: string
  role: string
  avatarUrl?: string
}

/* ------------------------------------------------------------------ */
/*  API calls (Sprint 3+ will flesh these out)                         */
/* ------------------------------------------------------------------ */

/** List all families — SUPER_ADMIN only */
export async function listFamilies(): Promise<Family[]> {
  return apiClient<Family[]>("/api/families")
}

/** Get a single family by id */
export async function getFamily(id: number): Promise<Family> {
  return apiClient<Family>(`/api/families/${id}`)
}

/** List members of a family */
export async function listFamilyMembers(familyId: number): Promise<FamilyMember[]> {
  return apiClient<FamilyMember[]>(`/api/families/${familyId}/members`)
}
