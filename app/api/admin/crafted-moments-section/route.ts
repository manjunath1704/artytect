import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

import { getAdminClient } from "@/lib/supabase/admin";

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
  if (error || !data.user) return null;
  return data.user;
};

export async function PUT(request: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

    const body = (await request.json()) as {
      eyebrow?: string;
      title?: string;
      description?: string;
    };
    const eyebrow = String(body.eyebrow ?? "").trim();
    const title = String(body.title ?? "").trim();
    const description = String(body.description ?? "").trim();

    if (!eyebrow || !title || !description) {
      return NextResponse.json(
        { error: "Eyebrow, title, and description are required." },
        { status: 400 },
      );
    }

    const supabase = getAdminClient();
    const { data: current, error: currentError } = await supabase
      .from("crafted_moments_sections")
      .select("id")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (currentError) throw new Error(currentError.message);

    const query = current
      ? supabase
          .from("crafted_moments_sections")
          .update({ eyebrow, title, description })
          .eq("id", current.id)
      : supabase
          .from("crafted_moments_sections")
          .insert({ eyebrow, title, description });

    const { data: header, error } = await query.select().single();
    if (error) throw new Error(error.message);

    return NextResponse.json({ header }, { status: 200 });
  } catch (error) {
    console.error("Error updating crafted moments section:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to update crafted moments section." },
      { status: 500 },
    );
  }
}
