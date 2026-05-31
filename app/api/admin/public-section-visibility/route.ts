import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

import { getAdminClient } from "@/lib/supabase/admin";

const SECTION_DEFAULTS = [
  { section_key: "hero", label: "Hero", is_visible: true, sort_order: 10 },
  { section_key: "categories", label: "Categories", is_visible: true, sort_order: 20 },
  { section_key: "featured_products", label: "Featured Products", is_visible: true, sort_order: 30 },
  { section_key: "featured_classes", label: "Featured Classes", is_visible: true, sort_order: 40 },
  { section_key: "about", label: "About", is_visible: true, sort_order: 50 },
  { section_key: "process", label: "Process", is_visible: true, sort_order: 60 },
  { section_key: "testimonials", label: "Testimonials", is_visible: true, sort_order: 70 },
  { section_key: "crafted_moments", label: "Crafted Moments", is_visible: true, sort_order: 80 },
] as const;

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
  const { data: existingSections, error: lookupError } = await supabase
    .from("public_section_visibility")
    .select("section_key");

  if (lookupError) {
    throw new Error(lookupError.message);
  }

  const existingKeys = new Set((existingSections ?? []).map((section) => section.section_key));
  const missingSections = SECTION_DEFAULTS.filter(
    (section) => !existingKeys.has(section.section_key),
  );

  if (missingSections.length > 0) {
    const { error: insertError } = await supabase
      .from("public_section_visibility")
      .insert(missingSections);

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
      .from("public_section_visibility")
      .select("section_key, label, is_visible, sort_order")
      .order("sort_order", { ascending: true });

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({ sections: data ?? [] });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to load section visibility." },
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
      | { sectionKey?: string; isVisible?: boolean }
      | null;
    const sectionKey = String(body?.sectionKey ?? "");

    if (!sectionKey || typeof body?.isVisible !== "boolean") {
      return NextResponse.json(
        { error: "Section key and visibility are required." },
        { status: 400 },
      );
    }

    if (!SECTION_DEFAULTS.some((section) => section.section_key === sectionKey)) {
      return NextResponse.json({ error: "Unknown public section." }, { status: 400 });
    }

    const supabase = await ensureDefaults();
    const { data, error } = await supabase
      .from("public_section_visibility")
      .update({ is_visible: body.isVisible })
      .eq("section_key", sectionKey)
      .select("section_key, label, is_visible, sort_order")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({ section: data });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to update section visibility." },
      { status: 500 },
    );
  }
}
