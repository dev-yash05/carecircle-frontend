"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type RefObject } from "react";
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

/* ── Intersection Observer hook ───────────────────────────── */
function useInView<T extends HTMLElement>(
  options?: IntersectionObserverInit,
): [RefObject<T | null>, boolean] {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.unobserve(node);
        }
      },
      { threshold: 0.15, ...options },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [options]);

  return [ref, inView];
}

/* ── Animated counter ─────────────────────────────────────── */
function AnimatedCounter({
  end,
  suffix = "",
  duration = 1800,
  active,
}: {
  end: number;
  suffix?: string;
  duration?: number;
  active: boolean;
}) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!active) return;
    let raf: number;
    const start = performance.now();
    const step = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - t, 3); // easeOutCubic
      setValue(Math.round(ease * end));
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [active, end, duration]);
  return (
    <span>
      {value}
      {suffix}
    </span>
  );
}

/* ── Data ─────────────────────────────────────────────────── */
const coreFeatures = [
  {
    title: "Medication Tracking",
    description:
      "Automated reminders, dosage logging, and adherence insights for every family member.",
    icon: Pill,
    bullets: ["Smart scheduling", "Dose verification"],
    gradient: "from-teal-500 to-cyan-400",
  },
  {
    title: "Vital Monitoring",
    description:
      "Track blood pressure, glucose, SpO₂, and temperature trends in real time.",
    icon: Activity,
    bullets: ["Anomaly detection", "Trend visualization"],
    gradient: "from-violet-500 to-purple-400",
  },
  {
    title: "Role-Based Access",
    description:
      "Secure permissions for admins, caregivers, and viewers with scoped controls.",
    icon: ShieldCheck,
    bullets: ["Family + caregiver roles", "Protected workflows"],
    gradient: "from-amber-500 to-orange-400",
  },
  {
    title: "Live Coordination",
    description:
      "See updates from every caregiver instantly with timeline-first collaboration.",
    icon: Users,
    bullets: ["WebSocket sync", "Shared status visibility"],
    gradient: "from-blue-500 to-indigo-400",
  },
  {
    title: "Audit & Reports",
    description:
      "Generate exportable reports and retain clear activity trails for transparency.",
    icon: FileText,
    bullets: ["PDF summary exports", "Verification history"],
    gradient: "from-emerald-500 to-green-400",
  },
  {
    title: "Enterprise Security",
    description:
      "Hardened auth, scoped sessions, and role enforcement across the platform.",
    icon: Lock,
    bullets: ["OAuth + HttpOnly cookies", "Policy-based protection"],
    gradient: "from-rose-500 to-pink-400",
  },
];

const metricsData = [
  { end: 500, suffix: "+", label: "Families trusting CareCircle daily" },
  { end: 24, suffix: "/7", label: "Real-time status updates" },
  { end: 100, suffix: "%", label: "Secure role-based coordination" },
];

const trustPoints = [
  "Shared calendar for medical appointments and reminders",
  "Encrypted incident messaging for care-team collaboration",
  "Secure documentation storage for health records",
  "Exportable monthly care reports for consultations",
];

/* ── Floating hero icons ──────────────────────────────────── */
const floatingIcons = [
  { Icon: HeartPulse, size: 28, top: "15%", left: "8%", delay: "0s", dur: "18s", radius: "60px", opacity: 0.18 },
  { Icon: Pill, size: 22, top: "70%", left: "12%", delay: "4s", dur: "22s", radius: "50px", opacity: 0.14 },
  { Icon: Activity, size: 26, top: "25%", right: "10%", delay: "2s", dur: "20s", radius: "70px", opacity: 0.16 },
  { Icon: ShieldCheck, size: 20, top: "75%", right: "8%", delay: "6s", dur: "24s", radius: "45px", opacity: 0.12 },
  { Icon: Users, size: 24, top: "50%", left: "5%", delay: "8s", dur: "26s", radius: "55px", opacity: 0.13 },
  { Icon: FileText, size: 18, top: "40%", right: "5%", delay: "10s", dur: "19s", radius: "40px", opacity: 0.11 },
];

/* ── Component ────────────────────────────────────────────── */
export default function LandingPage() {
  const [heroRef, heroInView] = useInView<HTMLElement>();
  const [metricsRef, metricsInView] = useInView<HTMLElement>();
  const [featuresRef, featuresInView] = useInView<HTMLElement>();
  const [trustRef, trustInView] = useInView<HTMLElement>();
  const [ctaRef, ctaInView] = useInView<HTMLElement>();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <main className="relative min-h-screen overflow-x-hidden">
      {/* ── Sticky Navbar ──────────────────────────────────── */}
      <nav
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          scrolled
            ? "border-b border-border/40 bg-background/80 backdrop-blur-xl shadow-sm"
            : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-lg shadow-primary/20 transition-transform duration-300 group-hover:scale-110">
              <HeartPulse className="h-4 w-4" />
            </div>
            <span className="text-base font-bold text-foreground tracking-tight">
              CareCircle
            </span>
          </Link>
          <Button asChild size="sm" className="rounded-xl bg-gradient-to-r from-primary to-primary/80 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-300 hover:scale-[1.03]">
            <Link href="/login">Get Started</Link>
          </Button>
        </div>
      </nav>

      {/* ── Hero Section ───────────────────────────────────── */}
      <section
        ref={heroRef}
        className="relative flex min-h-screen items-center justify-center hero-gradient pt-16"
      >
        {/* Background floating icons */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          {floatingIcons.map(({ Icon, size, top, left, right, delay, dur, radius, opacity }, i) => (
            <div
              key={i}
              className="absolute floating-icon text-primary"
              style={{
                top,
                left,
                right,
                opacity,
                animationDelay: delay,
                ["--orbit-duration" as string]: dur,
                ["--orbit-radius" as string]: radius,
              }}
            >
              <Icon style={{ width: size, height: size }} />
            </div>
          ))}
        </div>

        {/* Decorative gradient orbs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-primary/10 blur-3xl animate-float" />
          <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-violet-500/10 blur-3xl animate-float" style={{ animationDelay: "2s" }} />
          <div className="absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 rounded-full bg-cyan-400/8 blur-3xl animate-float" style={{ animationDelay: "4s" }} />
        </div>

        {/* Hero content */}
        <div className="relative z-10 mx-auto max-w-4xl px-4 text-center sm:px-6">
          <div
            className={`transition-all duration-700 ${
              heroInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-medium text-primary backdrop-blur-sm">
              <HeartPulse className="h-3.5 w-3.5" />
              Trusted by 500+ families
            </div>

            <h1 className="text-4xl font-extrabold leading-[1.1] tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
              Care for the ones{" "}
              <span className="bg-gradient-to-r from-primary via-violet-500 to-cyan-500 bg-clip-text text-transparent">
                you love
              </span>
              , from anywhere.
            </h1>

            <p
              className={`mx-auto mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg transition-all duration-700 delay-200 ${
                heroInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
              }`}
            >
              Real-time coordination for family caregiving. Keep everyone in the
              loop with a shared platform designed for health, safety, and
              happiness.
            </p>

            <div
              className={`mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center transition-all duration-700 delay-[400ms] ${
                heroInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
              }`}
            >
              <Button
                asChild
                size="lg"
                className="h-13 min-w-56 rounded-2xl bg-gradient-to-r from-primary to-primary/80 text-base font-semibold shadow-xl shadow-primary/25 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/35 hover:scale-[1.03] active:scale-[0.98]"
              >
                <Link href="/login">
                  Get Started with Google
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <span className="text-sm text-muted-foreground">
                Free for families · No credit card
              </span>
            </div>
          </div>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce text-muted-foreground/50">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M5 12l7 7 7-7" />
          </svg>
        </div>
      </section>

      {/* ── Metrics Bar ────────────────────────────────────── */}
      <section
        ref={metricsRef}
        className="relative z-10 -mt-8 mx-4 sm:mx-6"
      >
        <div className="mx-auto max-w-4xl rounded-2xl border border-border/50 bg-card/80 p-6 shadow-xl backdrop-blur-lg sm:p-8">
          <div className="grid grid-cols-3 divide-x divide-border/60">
            {metricsData.map((m) => (
              <div key={m.label} className="px-2 text-center sm:px-4">
                <p className="text-2xl font-extrabold text-primary sm:text-4xl">
                  <AnimatedCounter
                    end={m.end}
                    suffix={m.suffix}
                    active={metricsInView}
                  />
                </p>
                <p className="mt-1 text-[10px] text-muted-foreground sm:text-xs leading-snug">
                  {m.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features Grid ──────────────────────────────────── */}
      <section
        ref={featuresRef}
        className="mx-auto mt-20 max-w-6xl px-4 sm:px-6 lg:mt-28"
      >
        <div
          className={`text-center transition-all duration-700 ${
            featuresInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Full-Spectrum{" "}
            <span className="bg-gradient-to-r from-primary to-violet-500 bg-clip-text text-transparent">
              Care Coordination
            </span>
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
            A comprehensive suite of tools designed to handle every detail of
            your loved one&apos;s health and daily routine.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {coreFeatures.map((item, i) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className={`group rounded-2xl border border-border/50 bg-card/60 p-5 backdrop-blur-sm transition-all duration-500 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 hover:border-primary/20 ${
                  featuresInView
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-10"
                }`}
                style={{
                  transitionDelay: featuresInView ? `${i * 100}ms` : "0ms",
                }}
              >
                <div
                  className={`inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${item.gradient} text-white shadow-lg transition-transform duration-300 group-hover:scale-110`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-lg font-bold text-foreground">
                  {item.title}
                </h3>
                <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
                <div className="mt-3 space-y-1.5">
                  {item.bullets.map((b) => (
                    <p
                      key={b}
                      className="flex items-center gap-2 text-xs text-muted-foreground"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-primary to-primary/60" />
                      {b}
                    </p>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Trust Section ──────────────────────────────────── */}
      <section
        ref={trustRef}
        className="mx-auto mt-20 max-w-6xl px-4 sm:px-6 lg:mt-28"
      >
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          {/* Illustration card */}
          <div
            className={`relative overflow-hidden rounded-3xl border border-border/40 bg-gradient-to-br from-primary/5 via-violet-500/5 to-cyan-400/5 p-8 transition-all duration-700 ${
              trustInView ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10"
            }`}
          >
            <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-primary/10 blur-2xl" />
            <div className="absolute -bottom-6 -left-6 h-32 w-32 rounded-full bg-violet-500/10 blur-2xl" />
            <div className="relative flex min-h-[240px] items-center justify-center">
              <div className="glass-card rounded-2xl border border-border/50 px-8 py-6 text-center shadow-xl">
                <Users className="mx-auto h-10 w-10 text-primary" />
                <p className="mt-3 text-base font-bold text-foreground">
                  Family + Caregiver
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Shared care workspace
                </p>
              </div>
            </div>
          </div>

          {/* Trust content */}
          <div
            className={`space-y-5 transition-all duration-700 delay-200 ${
              trustInView ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10"
            }`}
          >
            <h2 className="text-3xl font-extrabold leading-tight text-foreground sm:text-4xl">
              Built for families,{" "}
              <span className="bg-gradient-to-r from-primary to-cyan-500 bg-clip-text text-transparent">
                by caregivers
              </span>
            </h2>
            <p className="text-sm text-muted-foreground sm:text-base leading-relaxed">
              We understand the challenges of remote caregiving because
              we&apos;ve been there. CareCircle was created to bridge
              communication gaps, reduce stress, and bring everyone onto one
              trusted platform.
            </p>
            <div className="space-y-3">
              {trustPoints.map((item, i) => (
                <div
                  key={item}
                  className={`flex items-start gap-3 transition-all duration-500 ${
                    trustInView
                      ? "opacity-100 translate-x-0"
                      : "opacity-0 translate-x-6"
                  }`}
                  style={{
                    transitionDelay: trustInView ? `${300 + i * 120}ms` : "0ms",
                  }}
                >
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <span className="text-sm text-muted-foreground">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA Section ────────────────────────────────────── */}
      <section ref={ctaRef} className="mx-auto mt-20 max-w-6xl px-4 sm:px-6 lg:mt-28">
        <div
          className={`relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary/90 to-violet-600 p-8 text-center shadow-2xl sm:p-12 transition-all duration-700 ${
            ctaInView ? "opacity-100 scale-100" : "opacity-0 scale-95"
          }`}
        >
          {/* Decorative elements */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
            <div className="absolute -left-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-2xl animate-float" />
            <div className="absolute -bottom-12 -right-12 h-48 w-48 rounded-full bg-white/8 blur-2xl animate-float" style={{ animationDelay: "3s" }} />
          </div>

          <div className="relative z-10">
            <h2 className="text-3xl font-extrabold leading-tight text-primary-foreground sm:text-4xl">
              Ready to provide better care?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm text-primary-foreground/80 sm:text-base">
              Join over 500 families who have found peace of mind with
              CareCircle. Start your journey today.
            </p>
            <div className="mt-8 flex justify-center">
              <Button
                asChild
                size="lg"
                variant="secondary"
                className="h-13 min-w-56 rounded-2xl bg-white text-primary font-semibold shadow-xl transition-all duration-300 hover:bg-white/90 hover:shadow-2xl hover:scale-[1.03] active:scale-[0.98]"
              >
                <Link href="/login">
                  Get Started with Google
                  <BarChart3 className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="mx-auto mt-16 max-w-6xl px-4 pb-8 sm:px-6">
        <div className="h-px w-full bg-gradient-to-r from-transparent via-border to-transparent" />
        <div className="mt-6 flex flex-col items-center justify-between gap-3 text-xs text-muted-foreground sm:flex-row">
          <div className="flex items-center gap-2">
            <HeartPulse className="h-3.5 w-3.5 text-primary" />
            <span>© {new Date().getFullYear()} CareCircle</span>
          </div>
          <div className="flex items-center gap-5">
            <Link href="/login" className="transition-colors hover:text-foreground">Privacy Policy</Link>
            <Link href="/login" className="transition-colors hover:text-foreground">Terms of Service</Link>
            <Link href="/login" className="transition-colors hover:text-foreground">Contact Us</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
