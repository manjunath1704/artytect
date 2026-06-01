"use client";

import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, Lock } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";

import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { authService } from "@/lib/auth/service";

const inputClassName =
  "mt-2 h-12 w-full rounded-[10px] border border-[#d9ccbc] bg-white px-4 py-3 text-sm text-[#1b1511] outline-none transition placeholder:text-[#a69280] focus:border-[#b38d67] focus:ring-4 focus:ring-[#d7b68b]/20";

export default function ResetPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!password || !confirmPassword) {
      toast.error("Enter and confirm your new password.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Updating password...");

    try {
      await authService.updatePassword(password);
      toast.success("Password updated.", { id: toastId });
      router.replace("/account");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update password.", {
        id: toastId,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Secure reset"
      title="New password"
      description="Choose a strong password for your account."
      footerText="Ready to continue?"
      footerHref="/login"
      footerLabel="Login"
    >
      <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
        <label className="block text-sm font-medium text-[#352a21]">
          New Password
          <div className="relative">
            <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8a7765]" />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className={`${inputClassName} pl-11 pr-12`}
              placeholder="New password"
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="absolute right-3 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-[10px] text-[#8a7765] transition hover:bg-[#f5eee4] hover:text-[#1b1511]"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </label>

        <label className="block text-sm font-medium text-[#352a21]">
          Confirm Password
          <div className="relative">
            <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8a7765]" />
            <input
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className={`${inputClassName} pl-11`}
              placeholder="Repeat new password"
              autoComplete="new-password"
            />
          </div>
        </label>

        <Button
          type="submit"
          size="lg"
          disabled={loading}
          className="h-12 w-full rounded-[10px] bg-[#1b1511] text-[#f8f2e8] hover:bg-[#2a211a]"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Reset Password
        </Button>
      </form>
    </AuthShell>
  );
}
