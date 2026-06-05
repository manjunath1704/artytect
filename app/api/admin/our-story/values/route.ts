import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, icon_name } = body;

    // Get max sort_order
    const { data: maxData } = await supabase
      .from("our_story_values")
      .select("sort_order")
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle();

    const sort_order = (maxData?.sort_order || 0) + 10;

    const { data, error } = await supabase
      .from("our_story_values")
      .insert({ title, description, icon_name, sort_order })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ value: data });
  } catch (error) {
    console.error("Error creating value:", error);
    return NextResponse.json(
      { error: "Failed to create value" },
      { status: 500 }
    );
  }
}
