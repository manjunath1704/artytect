"use client";

import { MessageCircle } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { openWhatsApp } from "@/lib/whatsapp";

type WhatsAppButtonProps = {
  message: string;
  children?: ReactNode;
  className?: string;
  iconOnly?: boolean;
};

export default function WhatsAppButton({
  message,
  children = "Book via WhatsApp",
  className,
  iconOnly = false,
}: WhatsAppButtonProps) {
  const [isOpening, setIsOpening] = useState(false);

  const handleClick = () => {
    setIsOpening(true);
    openWhatsApp(message);
    window.setTimeout(() => setIsOpening(false), 700);
  };

  return (
    <Button
      type="button"
      onClick={handleClick}
      disabled={isOpening}
      aria-label={typeof children === "string" ? children : "Open WhatsApp"}
      className={cn(
        "min-h-12 h-12 rounded-full bg-[#1b1511] px-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white shadow-[0_16px_32px_rgba(27,21,17,0.14)] transition hover:-translate-y-0.5 hover:bg-[#3a2f27] focus-visible:ring-[#8a5f3b]/30 disabled:translate-y-0",
        iconOnly && "w-12 px-0",
        className,
      )}
    >
      <MessageCircle className="h-4 w-4" aria-hidden="true" />
      {iconOnly ? null : <span>{isOpening ? "Opening..." : children}</span>}
    </Button>
  );
}
