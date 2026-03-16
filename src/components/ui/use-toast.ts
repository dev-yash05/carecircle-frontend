"use client"

import * as React from "react"

/* ------------------------------------------------------------------
 * useToast – thin wrapper around sonner's toast() so callers can
 * import from "@/components/ui/use-toast" if they prefer the
 * object-based API.  Sonner Toaster is already mounted in Providers.
 * ------------------------------------------------------------------ */

import { toast as sonnerToast } from "sonner"

interface ToastOptions {
  title?: string
  description?: string
  variant?: "default" | "destructive"
}

function toast({ title, description, variant }: ToastOptions) {
  if (variant === "destructive") {
    sonnerToast.error(title, { description })
  } else {
    sonnerToast(title, { description })
  }
}

function useToast() {
  return { toast }
}

export { useToast, toast }
