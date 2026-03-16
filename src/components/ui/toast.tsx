import { cva, type VariantProps } from "class-variance-authority";

const toastVariants = cva("group pointer-events-auto relative flex w-full items-center justify-between space-x-2 overflow-hidden rounded-md p-4 pr-6 shadow-lg", {
  variants: {
    variant: {
      default: "border border-border bg-card text-foreground",
      destructive: "border-destructive/50 bg-destructive text-destructive-foreground",
      success: "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-100",
      warning: "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-100",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

type ToastProps = VariantProps<typeof toastVariants>;

export { toastVariants };
export type { ToastProps };
