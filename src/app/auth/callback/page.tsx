"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/lib/stores/authStore";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setUser = useAuthStore((s) => s.setUser);

  useEffect(() => {
    // After Google OAuth, Spring Boot sets the HttpOnly cookie and redirects here.
    // We fetch /api/users/me to populate the auth store, then redirect to dashboard.
    const redirect = searchParams.get("redirect") || "/dashboard";

    fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/users/me`, {
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Not authenticated");
        return res.json();
      })
      .then((user) => {
        setUser(user);
        router.replace(redirect);
      })
      .catch(() => {
        router.replace("/login");
      });
  }, [router, searchParams, setUser]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-muted-foreground">Signing you in…</p>
    </div>
  );
}
