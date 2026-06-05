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
      .from("our_story_timeline")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error) {
      console.error("Error fetching our story timeline:", error);
      return NextResponse.json({ timeline: [] });
    }

    return NextResponse.json({ timeline: data ?? [] });
  } catch (error) {
    console.error("Error in our-story timeline API:", error);
    return NextResponse.json({ timeline: [] });
  }
}
