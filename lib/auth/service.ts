"use client";

import { createClient } from "@/lib/supabase/client";
import type { UserProfile } from "./types";

const getOrigin = () => window.location.origin;

export const authService = {
  async signUp(fullName: string, email: string, password: string) {
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          name: fullName,
        },
        emailRedirectTo: `${getOrigin()}/auth/callback?next=/account`,
      },
    });

    if (error) throw error;

    if (data.user) {
      await this.upsertProfile({
        id: data.user.id,
        full_name: fullName,
        email,
        avatar_url: data.user.user_metadata?.avatar_url ?? null,
        auth_provider: data.user.app_metadata?.provider ?? "email",
      });
    }

    return data;
  },

  async login(email: string, password: string) {
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    if (data.user) {
      await this.upsertProfile({
        id: data.user.id,
        full_name: data.user.user_metadata?.full_name ?? data.user.user_metadata?.name ?? null,
        email: data.user.email ?? email,
        avatar_url: data.user.user_metadata?.avatar_url ?? data.user.user_metadata?.picture ?? null,
        auth_provider: data.user.app_metadata?.provider ?? "email",
      });
    }

    return data;
  },

  async logout() {
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async sendPasswordReset(email: string) {
    const supabase = createClient();
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${getOrigin()}/reset-password`,
    });

    if (error) throw error;
    return data;
  },

  async updatePassword(password: string) {
    const supabase = createClient();
    const { data, error } = await supabase.auth.updateUser({ password });

    if (error) throw error;
    return data;
  },

  async getProfile(userId: string): Promise<UserProfile | null> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("user_profiles")
      .select("id, full_name, email, avatar_url, auth_provider, created_at, updated_at")
      .eq("id", userId)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async upsertProfile(profile: {
    id: string;
    full_name: string | null;
    email: string;
    avatar_url: string | null;
    auth_provider: string | null;
  }) {
    const supabase = createClient();
    const { error } = await supabase.from("user_profiles").upsert(profile, {
      onConflict: "id",
    });

    if (error) throw error;
  },
};
