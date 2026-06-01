import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

import { getAdminClient } from "@/lib/supabase/admin";
import { PUBLIC_PAGE_DEFAULTS } from "@/lib/public-page-visibility";

const getAuthenticatedUser = async () => {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        },
      },
    },
  );

  const { data, error } = await supabase.auth.getUser();
  return error || !data.user ? null : data.user;
};

async function ensureDefaults() {
  const supabase = getAdminClient();
  const { data: existingPages, error: lookupError } = await supabase
    .from("public_page_visibility")
    .select("page_key");

  if (lookupError) {
    throw new Error(lookupError.message);
  }

  const existingKeys = new Set((existingPages ?? []).map((page) => page.page_key));
  const missingPages = PUBLIC_PAGE_DEFAULTS.filter(
    (page) => !existingKeys.has(page.page_key),
  );

  if (missingPages.length > 0) {
    const { error: insertError } = await supabase
      .from("public_page_visibility")
      .insert(missingPages);

    if (insertError) {
      throw new Error(insertError.message);
    }
  }

  return supabase;
}

export async function GET() {
  try {
    const user = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const supabase = await ensureDefaults();
    const { data, error } = await supabase
      .from("public_page_visibility")
      .select("page_key, label, path, is_visible, sort_order")
      .order("sort_order", { ascending: true });

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({ pages: data ?? [] });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to load page visibility." },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const body = (await request.json().catch(() => null)) as
      | { pageKey?: string; isVisible?: boolean }
      | null;
    const pageKey = String(body?.pageKey ?? "");

    if (!pageKey || typeof body?.isVisible !== "boolean") {
      return NextResponse.json(
        { error: "Page key and visibility are required." },
        { status: 400 },
      );
    }

    if (!PUBLIC_PAGE_DEFAULTS.some((page) => page.page_key === pageKey)) {
      return NextResponse.json({ error: "Unknown public page." }, { status: 400 });
    }

    const supabase = await ensureDefaults();
    const { data, error } = await supabase
      .from("public_page_visibility")
      .update({ is_visible: body.isVisible })
      .eq("page_key", pageKey)
      .select("page_key, label, path, is_visible, sort_order")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({ page: data });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to update page visibility." },
      { status: 500 },
    );
  }
}
