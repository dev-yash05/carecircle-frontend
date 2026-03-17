"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuthStore } from "@/lib/stores/authStore"
import { Sidebar } from "./sidebar"
import { NAV_ITEMS } from "./sidebar"
import { Topbar } from "./topbar"

/**
 * AppShell wraps authenticated pages with a sidebar + topbar chrome.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const user = useAuthStore((state) => state.user)

  const mobileItems = NAV_ITEMS.filter((item) => {
    if (item.roles && (!user || !item.roles.includes(user.role))) return false

    if (user?.role === "SUPER_ADMIN") {
      return ["/superadmin", "/superadmin/users", "/superadmin/team", "/settings"].includes(item.href)
    }

    return ["/dashboard", "/patients", "/team", "/settings"].includes(item.href)
  }).slice(0, 4)

  return (
    <div className="flex h-dvh overflow-hidden">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />

        <main className="mx-auto min-h-0 w-full max-w-screen-2xl flex-1 overflow-y-auto px-4 pb-24 pt-7 md:px-6 md:pb-8 md:pt-10">
          {children}
        </main>

        <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border/80 bg-card/95 px-3 py-2 backdrop-blur lg:hidden">
          <div className="mx-auto grid max-w-xl grid-cols-4 gap-1">
            {mobileItems.map((item) => {
              const active = item.href === "/superadmin"
                ? pathname === "/superadmin"
                : pathname.startsWith(item.href)

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={[
                    "flex flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 text-[11px] font-semibold transition-colors [&_svg]:h-5 [&_svg]:w-5",
                    active
                      ? "bg-primary/12 text-primary"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground",
                  ].join(" ")}
                >
                  {item.icon}
                  <span className="truncate">{item.label}</span>
                </Link>
              )
            })}
          </div>
        </nav>
      </div>
    </div>
  )
}
