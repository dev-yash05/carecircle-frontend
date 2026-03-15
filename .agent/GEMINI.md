# CareCircle Frontend — Agent Rules

Stack: Next.js 15 App Router, TypeScript strict, Tailwind CSS, shadcn/ui, TanStack Query v5, Zustand v5, Zod v3, STOMP WebSocket

Backend: Spring Boot 4 at http://localhost:8080
Auth: Google OAuth2 → HttpOnly JWT cookie. NEVER use localStorage for tokens.
Cookie name: access_token (set by Spring Boot OAuth2SuccessHandler)

Route groups:
- (auth) — unauthenticated pages
- (app) — authenticated shell
- (superadmin) — SUPER_ADMIN only

Always use `credentials: 'include'` on every fetch.
Theme: "Clinical calm" — stone-50 background, teal-600 primary, no blue.

Active sprint: Sprint 1 — Foundation & Auth
```

---

## Sprint 1 — what was built

All files are ready. The structure created:
```
src/
├── app/
│   ├── layout.tsx                    ✅ Root layout with Providers
│   ├── globals.css                   ✅ Clinical calm CSS variables (light + dark)
│   ├── (auth)/
│   │   ├── layout.tsx                ✅ Centered auth card shell
│   │   └── login/page.tsx            ✅ Google sign-in button
│   ├── (app)/
│   │   ├── layout.tsx                ✅ Authenticated shell (Sprint 2 adds sidebar)
│   │   └── dashboard/page.tsx        ✅ Placeholder, Sprint 6 builds it out
│   └── auth/callback/page.tsx        ✅ Post-OAuth redirect handler
├── middleware.ts                      ✅ Cookie check → redirect to /login
├── components/
│   └── providers.tsx                 ✅ QueryClient + ThemeProvider + Toaster
└── lib/
    ├── api/
    │   ├── client.ts                 ✅ Fetch wrapper (credentials, 401 handler)
    │   └── auth.ts                   ✅ getMe, logout, redirectToGoogleLogin
    ├── hooks/
    │   └── useMe.ts                  ✅ TanStack Query → Zustand sync
    └── stores/
        └── authStore.ts              ✅ Zustand auth store with role helpers