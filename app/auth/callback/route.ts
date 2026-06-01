import { NextResponse, type NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { getAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") || "/account";

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=missing_code", request.url));
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error.message)}`, request.url));
  }

  const { data } = await supabase.auth.getUser();
  const user = data.user;

  if (user) {
    const admin = getAdminClient();
    await admin.from("user_profiles").upsert({
      id: user.id,
      full_name: user.user_metadata?.full_name ?? user.user_metadata?.name ?? null,
      email: user.email ?? "",
      avatar_url: user.user_metadata?.avatar_url ?? user.user_metadata?.picture ?? null,
      auth_provider: user.app_metadata?.provider ?? "email",
    });
  }

  return NextResponse.redirect(new URL(next, request.url));
}
