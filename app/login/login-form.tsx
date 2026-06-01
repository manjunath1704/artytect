"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";

import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { authService } from "@/lib/auth/service";

const inputClassName =
  "mt-2 h-12 w-full rounded-[10px] border border-[#d9ccbc] bg-white px-4 py-3 text-sm text-[#1b1511] outline-none transition placeholder:text-[#a69280] focus:border-[#b38d67] focus:ring-4 focus:ring-[#d7b68b]/20";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/account";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError("Email and password are required.");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Signing in...");

    try {
      await authService.login(email.trim(), password);
      if (!rememberMe) {
        sessionStorage.setItem("haritham-session-mode", "temporary");
      }
      toast.success("Welcome back.", { id: toastId });
      router.replace(next);
      router.refresh();
    } catch (loginError) {
      const message = loginError instanceof Error ? loginError.message : "Unable to sign in.";
      setError(message);
      toast.error(message, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Login"
      title="Welcome back"
      description="Sign in to continue your Studio Haritham account."
      footerText="New here?"
      footerHref="/signup"
      footerLabel="Create an account"
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

        <label className="block text-sm font-medium text-[#352a21]">
          Password
          <div className="relative">
            <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8a7765]" />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className={`${inputClassName} pl-11 pr-12`}
              placeholder="Enter your password"
              autoComplete="current-password"
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

        <div className="flex items-center justify-between gap-4">
          <label className="flex items-center gap-2 text-sm text-[#665b4f]">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(event) => setRememberMe(event.target.checked)}
              className="h-4 w-4 rounded border-[#d9ccbc] accent-[#1b1511]"
            />
            Remember me
          </label>
          <Link href="/forgot-password" className="text-sm font-semibold text-[#1b1511] underline-offset-4 hover:underline">
            Forgot password?
          </Link>
        </div>

        {error && (
          <p className="rounded-[10px] border border-[#d7b68b] bg-[#faf4ea] px-4 py-3 text-sm text-[#7a4d1d]">
            {error}
          </p>
        )}

        <Button
          type="submit"
          size="lg"
          disabled={loading}
          className="h-12 w-full rounded-[10px] bg-[#1b1511] text-[#f8f2e8] hover:bg-[#2a211a]"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Login
        </Button>
      </form>

    </AuthShell>
  );
}
