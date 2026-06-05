import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { title, description, icon_name } = body;

    const { data, error } = await supabase
      .from("our_story_values")
      .update({ title, description, icon_name })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ value: data });
  } catch (error) {
    console.error("Error updating value:", error);
    return NextResponse.json(
      { error: "Failed to update value" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const { error } = await supabase
      .from("our_story_values")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting value:", error);
    return NextResponse.json(
      { error: "Failed to delete value" },
      { status: 500 }
    );
  }
}
