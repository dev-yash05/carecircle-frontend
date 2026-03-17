"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getMe } from "@/lib/api/auth";
import { useAuthStore } from "@/lib/stores/authStore";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setUser = useAuthStore((s) => s.setUser);

  useEffect(() => {
    // After Google OAuth, Spring Boot sets the HttpOnly cookie and redirects here.
    // We fetch current user to populate auth store, then redirect to dashboard.
    const redirect = searchParams.get("redirect") || "/dashboard";

    getMe()
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

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <p className="text-muted-foreground">Signing you in…</p>
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
