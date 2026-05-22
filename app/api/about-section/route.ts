import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ aboutSection: null }, { status: 200 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const { data, error } = await supabase
      .from("about_sections")
      .select("id, eyebrow, title, description_primary, description_secondary, image_url, image_alt, button_label, button_href")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("Error fetching about section:", error);
      return NextResponse.json({ aboutSection: null }, { status: 200 });
    }

    return NextResponse.json({ aboutSection: data ?? null }, { status: 200 });
  } catch (error) {
    console.error("Error fetching about section:", error);
    return NextResponse.json({ aboutSection: null }, { status: 200 });
  }
}
