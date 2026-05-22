"use client";

import { Toaster as Sonner, type ToasterProps } from "sonner";
import { CheckCircle2, XCircle, Loader2, X } from "lucide-react";

import { cn } from "@/lib/utils";

const toastClassNames = {
  toast: [
    "relative flex w-[min(22rem,calc(100vw-2rem))] items-start gap-3",
    "overflow-visible rounded-[14px] shadow-md  px-4 py-3.5 pr-9",
    "font-sans text-sm font-medium leading-snug tracking-normal",
    "shadow-[0_18px_45px_rgba(23,20,15,0.18)] backdrop-blur-sm",
    "transition-[box-shadow,filter] duration-300 ease-out",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-earth-600/35",
  ].join(" "),
  success: [
    "border-earth-400/35 bg-earth-800 text-brand-text-light",
    "shadow-md",
  ].join(" "),
  error: [
    "border-earth-600/45 bg-brand-bg-darkest text-brand-text-light",
    "shadow-md",
  ].join(" "),
  loading: [
    "border-brand-border-secondary/35 bg-brand-bg-darker text-brand-text-lighter",
    "shadow-md",
  ].join(" "),
  default: [
    "border-brand-border-primary bg-brand-bg-secondary text-brand-text-primary",
  ].join(" "),
  warning: [
    "border-earth-600/40 bg-brand-bg-warm text-brand-text-primary",
  ].join(" "),
  info: [
    "border-brand-border-secondary/45 bg-brand-bg-tertiary text-brand-text-primary",
  ].join(" "),
  icon: "mt-0.5 shrink-0",
  content: "flex min-w-0 flex-1 flex-col gap-1",
  title: "leading-snug",
  description: "text-xs font-normal leading-relaxed opacity-80",
  closeButton: [
    "!absolute !-right-2 !-top-2 z-20",
    "flex !h-6 !w-6 items-center justify-center rounded-full border",
    "border-brand-border-light bg-brand-bg-secondary text-brand-text-primary",
    "shadow-[0_8px_18px_rgba(23,20,15,0.18)]",
    "transition-all duration-200 ease-out",
    "hover:-rotate-6 hover:scale-110 hover:border-earth-600 hover:bg-brand-bg-primary hover:text-earth-800",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-earth-600/35 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-bg-secondary",
    "active:scale-95",
  ].join(" "),
};

// ─── Toaster ──────────────────────────────────────────────────────────────────
const Toaster = ({ className, ...props }: ToasterProps) => {
  return (
    <Sonner
      className={cn("haritham-toaster", className)}
      position="top-right"
      gap={12}
      mobileOffset={16}
      offset={24}
      closeButton
      toastOptions={{
        unstyled: true,
        closeButtonAriaLabel: "Dismiss notification",
        classNames: toastClassNames,
      }}
      icons={{
        success: <CheckCircle2 className="h-4 w-4" />,
        error: <XCircle className="h-4 w-4" />,
        loading: (
          <Loader2 className="h-4 w-4 animate-spin text-brand-text-accent" />
        ),
        warning: <XCircle className="h-4 w-4" />,
        info: <CheckCircle2 className="h-4 w-4 text-brand-text-accent" />,
        close: <X className="h-3.5 w-3.5" aria-hidden="true" />,
      }}
      {...props}
    />
  );
};

export { Toaster };
