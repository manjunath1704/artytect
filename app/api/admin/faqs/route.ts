import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("faqs")
      .select("*")
      .order("display_order", { ascending: true });

    if (error) throw error;

    return NextResponse.json({ faqs: data || [] });
  } catch (error) {
    console.error("Error fetching FAQs:", error);
    return NextResponse.json(
      { error: "Failed to fetch FAQs" },
      { status: 500 }
    );
  }
}

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
    const { question, answer, display_order, is_active } = body;

    if (!question || !answer) {
      return NextResponse.json(
        { error: "Question and answer are required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("faqs")
      .insert({
        question: question.trim(),
        answer: answer.trim(),
        display_order: parseInt(display_order) || 0,
        is_active: Boolean(is_active),
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ faq: data });
  } catch (error) {
    console.error("Error creating FAQ:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to create FAQ";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
