import type { Session, User } from "@supabase/supabase-js";

export type UserProfile = {
  id: string;
  full_name: string | null;
  email: string;
  avatar_url: string | null;
  auth_provider: string | null;
  created_at: string;
  updated_at: string;
};

export type AuthState = {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
};
