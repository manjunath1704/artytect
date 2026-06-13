import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const pageKey = searchParams.get("pageKey");

    const supabase = getAdminClient();

    if (pageKey) {
      const { data, error } = await supabase
        .from("page_hero_sections")
        .select("page_key, eyebrow, title, description, background_image_url, button_label, button_href, sidebar_label, sidebar_description")
        .eq("page_key", pageKey)
        .single();
      if (error) throw new Error(error.message);
      return NextResponse.json({ hero: data });
    }

    const { data, error } = await supabase
      .from("page_hero_sections")
      .select("page_key, eyebrow, title, description, background_image_url, button_label, button_href, sidebar_label, sidebar_description")
      .order("page_key");
    if (error) throw new Error(error.message);
    return NextResponse.json({ heroes: data ?? [] });
  } catch (error) {
    console.error("Error fetching page heroes:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to fetch page heroes." },
      { status: 500 },
    );
  }
}