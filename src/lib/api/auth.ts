import { ApiError, apiClient } from "./client";

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
export async function getMe(): Promise<User> {
  const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
  const endpoints = ["/api/v1/auth/me", "/api/users/me"];

  let lastStatus = 401;

  for (const endpoint of endpoints) {
    const res = await fetch(`${apiBase}${endpoint}`, {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (res.ok) {
      return res.json();
    }

    lastStatus = res.status;
    if (res.status === 404) {
      continue;
    }
  }

  throw new ApiError(lastStatus, "Unauthorized");
}

/** Logout — clears the HttpOnly cookie on the backend */
export async function logout(): Promise<void> {
  try {
    await apiClient<void>("/api/v1/auth/logout", { method: "POST" });
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      await apiClient<void>("/api/auth/logout", { method: "POST" });
    } else {
      throw error;
    }
  }

  if (typeof window !== "undefined") {
    window.location.reload();
  }
}

/** Redirect browser to Spring Boot's Google OAuth2 entry point */
export function redirectToGoogleLogin(): void {
  const apiBase =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
  window.location.href = `${apiBase}/oauth2/authorization/google`;
}
