"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Lock, Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

const inputClassName =
  "mt-2 w-full border border-gray-300 rounded-[32px] bg-white px-4 py-3 text-sm text-[#1b1511] outline-none transition placeholder:text-[#a69280] focus:border-[#b38d67] focus:ring-4 focus:ring-[#d7b68b]/20";

const AdminLoginForm = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError) {
        throw signInError;
      }

      router.replace("/admin");
      router.refresh();
    } catch (signInError) {
      setError(signInError instanceof Error ? signInError.message : "Unable to sign in.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-[100svh] bg-[linear-gradient(180deg,#f6efe4_0%,#efe4d5_100%)] px-6 py-12 sm:px-8 lg:px-10">
      <div className="mx-auto flex min-h-[calc(100svh-6rem)] max-w-7xl items-center justify-center">
        <section className="grid w-full max-w-5xl gap-0 overflow-hidden border border-[#dbcbb8] bg-white shadow-[0_24px_90px_rgba(23,20,15,0.12)] lg:grid-cols-[1.05fr_0.95fr]">
          <div className="hidden bg-[radial-gradient(circle_at_top_left,rgba(179,141,103,0.2),transparent_36%),linear-gradient(160deg,#1b1511,#3a2d24)] p-10 text-[#f7efe4] lg:flex lg:flex-col lg:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-[#d7b68b]">
                Admin access
              </p>
              <h1 className="mt-6 max-w-md text-5xl leading-[0.95] tracking-[-0.05em]">
                Sign in to manage categories and content.
              </h1>
              <p className="mt-5 max-w-md text-base leading-8 text-[#e8d8c7]">
                Use your Supabase email and password account to open the protected admin
                panel.
              </p>
            </div>
            <div className="text-sm text-[#ccb9a6]">
              Make sure Email/Password auth is enabled in Supabase before signing in.
            </div>
          </div>

          <div className="p-6 sm:p-10 lg:p-12">
            <div className="max-w-md">
              <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-[#8a7765]">
                Login
              </p>
              <h2 className="mt-4 text-4xl tracking-[-0.04em] text-[#1b1511]">
                Welcome back
              </h2>
              <p className="mt-4 text-sm leading-7 text-[#665b4f]">
                Sign in to access the admin panel and create new categories.
              </p>

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
                      placeholder="admin@example.com"
                      autoComplete="email"
                      required
                    />
                  </div>
                </label>

                <label className="block text-sm font-medium text-[#352a21]">
                  Password
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8a7765]" />
                    <input
                      type="password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      className={`${inputClassName} pl-11`}
                      placeholder="••••••••"
                      autoComplete="current-password"
                      required
                    />
                  </div>
                </label>

                {error ? (
                  <p className="border border-[#d7b68b] bg-[#faf4ea] px-4 py-3 text-sm text-[#7a4d1d]">
                    {error}
                  </p>
                ) : null}

                <Button
                  type="submit"
                  size="lg"
                  className="h-12 w-full rounded-[32px] bg-[#1b1511] text-[#f8f2e8] hover:bg-[#2a211a]"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Signing in
                    </span>
                  ) : (
                    "Sign in"
                  )}
                </Button>
              </form>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

export default AdminLoginForm;

