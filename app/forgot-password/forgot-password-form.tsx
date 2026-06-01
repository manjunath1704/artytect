"use client";

import { Loader2, Mail } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";

import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { authService } from "@/lib/auth/service";

const inputClassName =
  "mt-2 h-12 w-full rounded-[10px] border border-[#d9ccbc] bg-white px-4 py-3 text-sm text-[#1b1511] outline-none transition placeholder:text-[#a69280] focus:border-[#b38d67] focus:ring-4 focus:ring-[#d7b68b]/20";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email.trim()) {
      toast.error("Enter your email address.");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Sending reset link...");

    try {
      await authService.sendPasswordReset(email.trim());
      setSent(true);
      toast.success("Password reset link sent.", { id: toastId });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to send reset email.", {
        id: toastId,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Password help"
      title="Reset password"
      description="Enter your email and we will send a secure reset link."
      footerText="Remembered it?"
      footerHref="/login"
      footerLabel="Back to login"
    >
      <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
        <label className="block text-sm font-medium text-[#352a21]">
          Email
          <div className="relative">
            <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8a7765]" />
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className={`${inputClassName} pl-11`}
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>
        </label>

        {sent && (
          <p className="rounded-[10px] border border-[#d9ccbc] bg-[#faf6f2] px-4 py-3 text-sm text-[#665b4f]">
            If an account exists for that email, a reset link has been sent.
          </p>
        )}

        <Button
          type="submit"
          size="lg"
          disabled={loading}
          className="h-12 w-full rounded-[10px] bg-[#1b1511] text-[#f8f2e8] hover:bg-[#2a211a]"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Send Reset Link
        </Button>
      </form>
    </AuthShell>
  );
}
