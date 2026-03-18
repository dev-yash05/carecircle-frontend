"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { redirectToGoogleLogin } from "@/lib/api/auth";

function LoginContent() {
  const searchParams = useSearchParams();
  const from = searchParams.get("from");

  return (
    <div className="glass-card rounded-3xl border border-border/50 p-8 shadow-2xl animate-scale-in">
      <div className="mb-8 text-center">
        {/* Animated logo */}
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-lg font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-transform duration-300 hover:scale-110">
          C
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground animate-fade-in" style={{ animationDelay: "0.15s" }}>
          Welcome to CareCircle
        </h1>
        <p className="mt-2 text-sm text-muted-foreground animate-fade-in" style={{ animationDelay: "0.25s" }}>
          Manage your family&apos;s health in one place
        </p>
        {from ? (
          <p className="mt-2 text-xs text-muted-foreground animate-fade-in" style={{ animationDelay: "0.35s" }}>
            Sign in to return to your page.
          </p>
        ) : null}
      </div>

      <button
        id="google-sign-in-button"
        onClick={redirectToGoogleLogin}
        className="flex w-full items-center justify-center gap-3 rounded-2xl border border-border/70 bg-white px-4 py-3.5 text-sm font-semibold text-stone-700 shadow-sm transition-all duration-200 hover:shadow-md hover:scale-[1.01] active:scale-[0.99] dark:bg-stone-800/80 dark:text-stone-200 dark:hover:bg-stone-700/80 animate-fade-in-up"
        style={{ animationDelay: "0.35s" }}
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
        Continue with Google
      </button>

      <p className="mt-6 text-center text-xs text-muted-foreground animate-fade-in" style={{ animationDelay: "0.45s" }}>
        By signing in you agree to our Terms of Service and Privacy Policy.
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="glass-card rounded-3xl border border-border/50 p-8 shadow-2xl h-64 animate-pulse" />}>
      <LoginContent />
    </Suspense>
  );
}
