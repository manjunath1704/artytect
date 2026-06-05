import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

function getPublicSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return null;
  }

  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export async function GET() {
  try {
    const supabase = getPublicSupabaseClient();

    if (!supabase) {
      return NextResponse.json(
        { error: "Database configuration error" },
        { status: 500 }
      );
    }

    const { data, error } = await supabase
      .from("our_story_values")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error) {
      console.error("Error fetching our story values:", error);
      return NextResponse.json({ values: [] });
    }

    return NextResponse.json({ values: data ?? [] });
  } catch (error) {
    console.error("Error in our-story values API:", error);
    return NextResponse.json({ values: [] });
  }
}
