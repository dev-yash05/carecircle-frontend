import Link from "next/link";
import {
  Activity,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  FileText,
  HeartPulse,
  Lock,
  Pill,
  ShieldCheck,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const coreFeatures = [
  {
    title: "Medication Tracking",
    description: "Automated reminders, dosage logging, and adherence insights for every family member.",
    icon: Pill,
    bullets: ["Smart scheduling", "Dose verification"],
  },
  {
    title: "Vital Monitoring",
    description: "Track blood pressure, glucose, SpO2, and temperature trends in real time.",
    icon: Activity,
    bullets: ["Anomaly detection", "Trend visualization"],
  },
  {
    title: "Role-Based Access",
    description: "Secure permissions for admins, caregivers, and viewers with scoped controls.",
    icon: ShieldCheck,
    bullets: ["Family + caregiver roles", "Protected workflows"],
  },
  {
    title: "Live Coordination",
    description: "See updates from every caregiver instantly with timeline-first collaboration.",
    icon: Users,
    bullets: ["WebSocket sync", "Shared status visibility"],
  },
  {
    title: "Audit & Reports",
    description: "Generate exportable reports and retain clear activity trails for transparency.",
    icon: FileText,
    bullets: ["PDF summary exports", "Verification history"],
  },
  {
    title: "Enterprise Security",
    description: "Hardened auth, scoped sessions, and role enforcement across the platform.",
    icon: Lock,
    bullets: ["OAuth + HttpOnly cookies", "Policy-based protection"],
  },
];

const metrics = [
  { value: "500+", label: "Families trusting CareCircle daily" },
  { value: "24/7", label: "Real-time status updates" },
  { value: "100%", label: "Secure role-based coordination" },
];

const trustPoints = [
  "Shared calendar for medical appointments and reminders",
  "Encrypted incident messaging for care-team collaboration",
  "Secure documentation storage for health records",
  "Exportable monthly care reports for consultations",
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 pb-12 pt-3 sm:px-6">
        <header className="flex items-center justify-between">
          <div className="inline-flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/15 text-primary">
              <HeartPulse className="h-4 w-4" />
            </div>
            <span className="text-sm font-semibold text-foreground">CareCircle</span>
          </div>
          <Button asChild size="sm" className="h-7 rounded-lg px-3 text-xs">
            <Link href="/login">Login</Link>
          </Button>
        </header>

        <section className="mt-8 grid gap-6 lg:grid-cols-2 lg:items-center">
          <div className="space-y-4">
            <h1 className="max-w-xl text-4xl font-extrabold leading-tight text-foreground">
              Care for the ones you love, from anywhere.
            </h1>
            <p className="max-w-xl text-sm text-muted-foreground sm:text-base">
              Real-time coordination for family caregiving. Keep everyone in the loop with a shared platform designed
              for health, safety, and happiness.
            </p>
            <Button asChild size="lg" className="h-12 w-full sm:w-auto">
              <Link href="/login">
                Get Started with Google
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/10 to-primary/5">
            <CardContent className="p-0">
              <div className="flex min-h-56 items-end justify-center bg-[radial-gradient(circle_at_60%_20%,hsl(211_80%_53%/0.22),transparent_45%)] p-6">
                <div className="rounded-2xl border border-white/60 bg-white/80 px-8 py-10 text-center text-sm font-semibold text-slate-700 shadow-sm">
                  Loved one status
                  <p className="mt-2 text-2xl font-bold text-foreground">Stable</p>
                  <p className="mt-1 text-xs text-muted-foreground">Updated 10m ago</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="mt-10 grid grid-cols-3 gap-2 rounded-2xl border bg-card p-4 sm:gap-4 sm:p-6">
          {metrics.map((metric) => (
            <div key={metric.label} className="text-center">
              <p className="text-xl font-extrabold text-primary sm:text-3xl">{metric.value}</p>
              <p className="mt-1 text-[10px] text-muted-foreground sm:text-xs">{metric.label}</p>
            </div>
          ))}
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-bold text-foreground">Full-Spectrum Care Coordination</h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            A comprehensive suite of tools designed to handle every detail of your loved one&apos;s health and daily
            routine.
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {coreFeatures.map((item) => {
            const Icon = item.icon;
            return (
                <Card key={item.title} className="h-full border-border/80">
                  <CardContent className="space-y-3 p-4">
                    <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="h-4 w-4" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
                    <p className="text-xs text-muted-foreground sm:text-sm">{item.description}</p>
                    <div className="space-y-1 pt-1">
                      {item.bullets.map((bullet) => (
                        <p key={bullet} className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="h-1.5 w-1.5 rounded-full bg-primary/55" />
                          {bullet}
                        </p>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        <section className="mt-10 grid gap-4 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="flex min-h-48 items-center justify-center bg-gradient-to-br from-cyan-100 via-cyan-50 to-sky-100">
                <div className="rounded-2xl border bg-white/80 px-6 py-5 text-center shadow-sm">
                  <Users className="mx-auto h-8 w-8 text-primary" />
                  <p className="mt-2 text-sm font-semibold text-foreground">Family + Caregiver</p>
                  <p className="text-xs text-muted-foreground">Shared care workspace</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-3">
            <h2 className="text-3xl font-extrabold leading-tight text-foreground">Built for families, by caregivers</h2>
            <p className="text-sm text-muted-foreground">
              We understand the challenges of remote caregiving because we&apos;ve been there. CareCircle was created to
              bridge communication gaps, reduce stress, and bring everyone onto one trusted platform.
            </p>
            <div className="space-y-2">
              {trustPoints.map((item) => (
                <p key={item} className="inline-flex items-start gap-2 text-xs text-muted-foreground sm:text-sm">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  {item}
                </p>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-10">
          <Card className="border-primary/20 bg-primary text-primary-foreground">
            <CardContent className="space-y-4 p-6 text-center sm:p-8">
              <h2 className="text-3xl font-extrabold leading-tight">Ready to provide better care?</h2>
              <p className="mx-auto max-w-xl text-sm text-primary-foreground/85 sm:text-base">
                Join over 500 families who have found peace of mind with CareCircle. Start your journey today.
              </p>
              <div className="flex justify-center">
                <Button asChild size="lg" variant="secondary" className="h-12 min-w-56 bg-white text-primary hover:bg-white/90">
                  <Link href="/login">
                    Get Started with Google
                    <BarChart3 className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        <footer className="mt-8 flex flex-col items-center justify-between gap-2 border-t border-border/70 py-6 text-xs text-muted-foreground sm:flex-row">
          <p>© CareCircle</p>
          <div className="flex items-center gap-4">
            <Link href="/login" className="hover:text-foreground">Privacy Policy</Link>
            <Link href="/login" className="hover:text-foreground">Terms of Service</Link>
            <Link href="/login" className="hover:text-foreground">Contact Us</Link>
          </div>
        </footer>
      </div>
    </main>
  );
}
