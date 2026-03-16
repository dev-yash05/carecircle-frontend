# CareCircle Frontend — Agent Rules

## Project identity
- **App**: CareCircle — remote family caregiving coordination platform
- **Repo root**: `carecircle-frontend/`
- **Backend**: Spring Boot 4 running at `http://localhost:8080`
- **Frontend port**: `http://localhost:3000`

---

## Stack (do not deviate)
| Layer | Choice | Version |
|---|---|---|
| Framework | Next.js App Router | ^15.2.0 |
| Language | TypeScript strict | ^5.7.0 |
| Styling | Tailwind CSS + CSS variables | ^3.4 |
| Components | shadcn/ui (hand-rolled, no CLI import needed) | — |
| Server state | TanStack Query v5 | ^5.62.0 |
| Client state | Zustand v5 | ^5.0.0 |
| Validation | Zod v3 + React Hook Form | ^3.23 / ^7.54 |
| WebSocket | @stomp/stompjs + sockjs-client | ^7.0 / ^1.6 |
| Charts | Recharts | ^2.13 |
| Icons | lucide-react | ^0.468 |
| Theme | next-themes | ^0.4.4 |

---

## Auth rules (CRITICAL — never break these)
- Auth = Google OAuth2 → Spring Boot sets `access_token` **HttpOnly cookie**
- The cookie is **invisible to JavaScript** — never read `document.cookie` for the token
- Every fetch call MUST include `credentials: 'include'` — handled by `lib/api/client.ts`
- On 401 → `window.location.href = '/login'` — handled by the fetch wrapper
- Token storage in `localStorage` or `sessionStorage` is **forbidden**
- Login flow: `/login` → `window.location.href = 'http://localhost:8080/oauth2/authorization/google'` → Google → Spring Boot callback → redirect to `http://localhost:3000/auth/callback` → `/auth/callback` calls `/api/v1/auth/me` → sets Zustand store → redirects to `/dashboard`

---

## Route groups (App Router)
```
src/app/
├── (auth)/          — unauthenticated pages (login)
├── (app)/           — authenticated app shell (sidebar + topbar)
├── (superadmin)/    — SUPER_ADMIN only
└── auth/callback/   — post-OAuth hydration page (no layout)
```

---

## Role system
```
SUPER_ADMIN > ADMIN > CAREGIVER > VIEWER
```
- `SUPER_ADMIN` — no `organizationId` in JWT, god-view
- `ADMIN` — org owner, full CRUD + team management
- `CAREGIVER` — can mark doses, record vitals, read everything
- `VIEWER` — read-only

**RoleGuard usage:**
```tsx
<RoleGuard allow={["ADMIN", "SUPER_ADMIN"]}>
  <AddPatientButton />
</RoleGuard>
```
RoleGuard is UI-only. The backend enforces all roles. Never skip backend calls based on role.

---

## File structure map
```
src/
├── app/
│   ├── layout.tsx                        Root layout (Providers: QueryClient + ThemeProvider + Toaster)
│   ├── globals.css                        "Clinical calm" CSS variables
│   ├── (auth)/
│   │   ├── layout.tsx                    Centered card shell
│   │   └── login/page.tsx                Google sign-in button
│   ├── (app)/
│   │   ├── layout.tsx                    useMe() → AppShell (Sidebar + Topbar)
│   │   ├── dashboard/page.tsx
│   │   ├── patients/
│   │   │   ├── page.tsx                  Paginated list + create dialog
│   │   │   └── [patientId]/
│   │   │       ├── layout.tsx            Patient header + 6-tab nav
│   │   │       ├── page.tsx              Overview tab
│   │   │       ├── medications/page.tsx  Sprint 7
│   │   │       ├── doses/page.tsx        Sprint 4
│   │   │       ├── vitals/page.tsx       Sprint 5
│   │   │       ├── audit/page.tsx        Sprint 7
│   │   │       └── report/page.tsx       Sprint 8
│   │   ├── team/page.tsx                 Sprint 7
│   │   └── settings/page.tsx             Sprint 7
│   ├── (superadmin)/
│   │   ├── layout.tsx                    SUPER_ADMIN guard → AppShell
│   │   └── superadmin/page.tsx           Sprint 8
│   └── auth/callback/page.tsx            Hydrates Zustand then redirects
├── middleware.ts                          Cookie check → redirect
├── components/
│   ├── providers.tsx                     QueryClient + ThemeProvider + Toaster
│   ├── layout/
│   │   ├── AppShell.tsx                  Sidebar + Topbar wrapper
│   │   ├── Sidebar.tsx                   Role-filtered nav links
│   │   ├── Topbar.tsx                    User avatar + theme toggle + logout
│   │   └── RoleGuard.tsx                 Show/hide by role
│   ├── ui/
│   │   ├── button.tsx
│   │   ├── badge.tsx
│   │   ├── avatar.tsx
│   │   ├── separator.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── form-elements.tsx             Input, Label, Textarea, Select, SelectItem
│   │   ├── skeleton.tsx
│   │   ├── toast.tsx                     Radix Toast primitives
│   │   └── toaster.tsx                   useToast hook + Toaster component
│   └── patients/
│       ├── PatientCard.tsx               Clickable card: name, age, blood group, allergies
│       └── PatientForm.tsx               Zod + RHF form: name, DOB, blood group, notes
└── lib/
    ├── utils.ts                          cn() helper (clsx + tailwind-merge)
    ├── api/
    │   ├── client.ts                     fetch wrapper (credentials:include, 401→/login)
    │   ├── auth.ts                       getMe, logout, redirectToGoogleLogin
    │   └── patients.ts                   getPatients, getPatient, createPatient, updatePatient, deletePatient
    ├── hooks/
    │   ├── useMe.ts                      useQuery(['me'], getMe) → syncs to Zustand
    │   └── usePatients.ts                usePatients, usePatient, useCreatePatient, useUpdatePatient, useDeletePatient
    ├── schemas/
    │   └── patient.schema.ts             PatientCreateSchema, PatientUpdateSchema (Zod)
    └── stores/
        └── authStore.ts                  Zustand: { user, isLoading, setUser, clearUser, isAdmin(), isSuperAdmin(), canWrite() }
```

---

## Theme — "Clinical calm"
```
Background:   stone-50  hsl(60 9% 98%)    — warm off-white, NOT white
Surface/Card: white     hsl(0 0% 100%)
Primary:      teal-600  hsl(174 74% 31%)  — interactive elements, active states
Warning:      amber-500 hsl(38 92% 50%)   — allergy badges, pending doses
Danger:       red-500   hsl(0 72% 51%)    — anomalies, errors
Text:         slate-900 / slate-500
Border:       stone-200 hsl(60 6% 87%)
```
Dark mode: slate-950 background, teal-400 primary.
**No blue anywhere** — that's what hospitals use. The warmth makes it feel like a family product.

All CSS variables are defined in `src/app/globals.css`. Use Tailwind semantic tokens (`bg-background`, `text-foreground`, `border-border`, `bg-primary`, etc.) — never hardcode hex values.

---

## API conventions
- Base URL: `process.env.NEXT_PUBLIC_API_URL` (default `http://localhost:8080`)
- All calls go through `lib/api/client.ts` → `api.get/post/put/delete`
- Org-scoped endpoints pattern: `/api/v1/organizations/{orgId}/...`
- `orgId` always comes from `useAuthStore().user.organizationId`
- Pagination: `?page=0&size=20`, response shape: `{ content: T[], totalElements, totalPages, number, size }`

---

## TanStack Query conventions
- Query key factories live in the hook file (e.g., `patientKeys.list(orgId, page)`)
- `staleTime: 60_000` default (1 min)
- Mutations always `invalidateQueries` on success — never manually update cache
- `keepPreviousData` on paginated queries
- Optimistic updates only for dose marking (Sprint 4) — nowhere else

---

## Component conventions
- All interactive components are `"use client"` — server components only for static pages/layouts
- shadcn components live in `src/components/ui/` — hand-rolled, no external import needed
- Import path alias: `@/` maps to `src/`
- Forms: React Hook Form + `zodResolver` — never manage form state with `useState`
- Loading states: always use `<Skeleton>` — never show blank space
- Errors: always show a bordered error card — never throw to the error boundary for API errors

---

## Completed sprints
- ✅ **Sprint 1** — Auth flow, fetch wrapper, Zustand store, middleware, login page, auth/callback
- ✅ **Sprint 2** — Design system (CSS vars, theme), AppShell, Sidebar, Topbar, RoleGuard, all UI primitives
- ✅ **Sprint 3** — Patient list + paginated cards + PatientForm + patient detail layout + 6-tab shell

## Active sprint
**Sprint 2 — verify and run** (all code is written, agent must install, fix, and boot)

## Upcoming
- Sprint 4 — Dose timeline + optimistic mark/skip + 409 handling
- Sprint 5 — Vitals Recharts + RecordVitalForm
- Sprint 6 — WebSocket STOMP hook + Dashboard widgets
- Sprint 7 — Team management + medication scheduling (CRON picker) + audit log
- Sprint 8 — PDF report + SuperAdmin panel
- Sprint 9 — Security headers + error boundaries + Playwright E2E
- Sprint 10 — CI/CD + deployment

---

## Known package note
`@radix-ui/react-badge` does not exist as a package — Badge component is custom in `src/components/ui/badge.tsx`. Remove it from `package.json` before running `npm install`.

---

## Backend CORS requirement
Spring Boot `SecurityConfig.java` must allow:
```java
configuration.setAllowedOrigins(List.of("http://localhost:3000"));
configuration.setAllowCredentials(true);
```
`OAuth2SuccessHandler.java` must redirect to:
```java
response.sendRedirect("http://localhost:3000/auth/callback");
```