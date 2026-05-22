"use client"

import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info:    <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error:   <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      toastOptions={{
        unstyled: true,
        classNames: {
          // ── base shared by every toast ──────────────────────────────────
          toast: [
            "flex w-full items-center gap-3",
            "rounded-[38px] px-5 py-3.5",
            "shadow-md text-sm font-medium",
            "min-w-[260px] max-w-[380px]",
          ].join(" "),

          // ── per-type solid backgrounds ──────────────────────────────────
          success:     "bg-[#1a6b3a] text-white",
          error:       "bg-[#b91c1c] text-white",
          warning:     "bg-[#b45309] text-white",
          info:        "bg-[#1d4ed8] text-white",
          loading:     "bg-[#1b1511] text-[#f8f2e8]",

          // ── icon inherits text color ─────────────────────────────────────
          icon:        "shrink-0",

          // ── title + description ──────────────────────────────────────────
          title:       "leading-snug",
          description: "text-xs opacity-80 mt-0.5",

          // ── close button ─────────────────────────────────────────────────
          closeButton: [
            "ml-auto shrink-0 rounded-full p-1",
            "opacity-70 hover:opacity-100 transition-opacity",
            "bg-white/20 hover:bg-white/30",
          ].join(" "),

          // ── action button ─────────────────────────────────────────────────
          actionButton: [
            "ml-auto shrink-0 rounded-full px-3 py-1 text-xs font-semibold",
            "bg-white/20 hover:bg-white/30 transition-colors",
          ].join(" "),

          cancelButton: [
            "ml-auto shrink-0 rounded-full px-3 py-1 text-xs font-semibold",
            "bg-white/10 hover:bg-white/20 transition-colors",
          ].join(" "),
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
