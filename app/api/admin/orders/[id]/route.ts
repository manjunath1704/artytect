import { NextResponse } from "next/server";

import { getAdminClient } from "@/lib/supabase/admin";

type OrderRouteProps = {
  params: Promise<{ id: string }>;
};

export async function PUT(request: Request, { params }: OrderRouteProps) {
  try {
    const { id } = await params;
    const body = await request.json();
    const update: Record<string, string> = { updated_at: new Date().toISOString() };
    if (body.payment_status) update.payment_status = body.payment_status;
    if (body.order_status) update.order_status = body.order_status;

    const supabase = getAdminClient();
    const { data, error } = await supabase
      .from("orders")
      .update(update)
      .eq("id", id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return NextResponse.json({ order: data });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to update order." },
      { status: 500 },
    );
  }
}
