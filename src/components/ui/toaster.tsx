"use client";

import { Toaster as SonnerToaster, toast } from "sonner";

function useToast() {
  return { toast };
}

function Toaster() {
  return <SonnerToaster position="bottom-right" richColors />;
}

export { Toaster, useToast, toast };
