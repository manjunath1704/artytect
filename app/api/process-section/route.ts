import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ header: null, steps: [] }, { status: 200 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const [{ data: header, error: headerError }, { data: steps, error: stepsError }] =
      await Promise.all([
        supabase
          .from("process_sections")
          .select("id, eyebrow, title")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase
          .from("process_steps")
          .select("id, title, description, image_url, image_alt, sort_order")
          .order("sort_order", { ascending: true })
          .order("created_at", { ascending: true }),
      ]);

    if (headerError) console.error("Error fetching process header:", headerError);
    if (stepsError) console.error("Error fetching process steps:", stepsError);

    return NextResponse.json(
      {
        header: headerError ? null : header,
        steps: stepsError ? [] : steps ?? [],
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error fetching process section:", error);
    return NextResponse.json({ header: null, steps: [] }, { status: 200 });
  }
}
