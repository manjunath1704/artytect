"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import { createClient } from "@/lib/supabase/client";
import { authService } from "@/lib/auth/service";
import type { AuthState } from "@/lib/auth/types";

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    profile: null,
    loading: true,
  });

  useEffect(() => {
    const supabase = createClient();
    let isMounted = true;

    const hydrate = async () => {
      const { data } = await supabase.auth.getSession();
      const user = data.session?.user ?? null;
      const profile = user ? await authService.getProfile(user.id).catch(() => null) : null;

      if (isMounted) {
        setState({
          user,
          session: data.session ?? null,
          profile,
          loading: false,
        });
      }
    };

    void hydrate();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user ?? null;
      setState((current) => ({
        ...current,
        user,
        session,
        loading: false,
      }));

      if (user) {
        queueMicrotask(async () => {
          const profile = await authService.getProfile(user.id).catch(() => null);
          if (isMounted) {
            setState((current) => ({ ...current, profile }));
          }
        });
      } else {
        setState((current) => ({ ...current, profile: null }));
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const value = useMemo(() => state, [state]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider.");
  }

  return context;
}
