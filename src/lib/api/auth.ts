import { apiClient } from "./client";

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  organizationId?: string | null;
  role:
    | "VIEWER"
    | "CAREGIVER"
    | "ADMIN"
    | "SUPER_ADMIN"
    | "MEMBER"
    | "FAMILY_ADMIN";
}

/** Get the currently authenticated user */
export function getMe(): Promise<User> {
  return apiClient<User>("/api/users/me");
}

/** Logout — clears the HttpOnly cookie on the backend */
export function logout(): Promise<void> {
  return apiClient<void>("/api/auth/logout", { method: "POST" });
}

/** Redirect browser to Spring Boot's Google OAuth2 entry point */
export function redirectToGoogleLogin(): void {
  const apiBase =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
  window.location.href = `${apiBase}/oauth2/authorization/google`;
}
