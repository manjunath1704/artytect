"use client";

import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, Lock, Mail, User } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";

import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { authService } from "@/lib/auth/service";

const inputClassName =
  "mt-2 h-12 w-full rounded-[10px] border border-[#d9ccbc] bg-white px-4 py-3 text-sm text-[#1b1511] outline-none transition placeholder:text-[#a69280] focus:border-[#b38d67] focus:ring-4 focus:ring-[#d7b68b]/20";

export default function SignupForm() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!fullName.trim() || !email.trim() || !password || !confirmPassword) {
      setError("Please fill in all required fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (!acceptedTerms) {
      setError("Please accept the terms and conditions.");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Creating your account...");

    try {
      const data = await authService.signUp(fullName.trim(), email.trim(), password);
      toast.success(data.session ? "Account created." : "Check your email to confirm your account.", {
        id: toastId,
      });
      router.replace(data.session ? "/account" : "/login");
      router.refresh();
    } catch (signupError) {
      const message = signupError instanceof Error ? signupError.message : "Unable to create account.";
      setError(message);
      toast.error(message, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Sign up"
      title="Create account"
      description="Create your Studio Haritham account for a calmer shopping and class experience."
      footerText="Already have an account?"
      footerHref="/login"
      footerLabel="Login"
    >
      <form className="mt-8 space-y-3" onSubmit={handleSubmit}>
        <label className="block text-sm font-medium text-[#352a21]">
          Full Name
          <div className="relative">
            <User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8a7765]" />
            <input
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              className={`${inputClassName} pl-11`}
              placeholder="Your name"
              autoComplete="name"
            />
          </div>
        </label>

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
              placeholder="Create a password"
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
              placeholder="Repeat password"
              autoComplete="new-password"
            />
          </div>
        </label>

        <label className="flex items-start gap-3 text-sm leading-6 text-[#665b4f]">
          <input
            type="checkbox"
            checked={acceptedTerms}
            onChange={(event) => setAcceptedTerms(event.target.checked)}
            className="mt-1 h-4 w-4 rounded border-[#d9ccbc] accent-[#1b1511]"
          />
          <span>I agree to the Terms & Conditions and Privacy Policy.</span>
        </label>

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
          Sign Up
        </Button>
      </form>

    </AuthShell>
  );
}
