import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase/admin";

type RouteProps = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, { params }: RouteProps) {
  try {
    const { id } = await params;
    const supabase = getAdminClient();

    const { data: variants, error: vErr } = await supabase
      .from("product_variants")
      .select("*")
      .eq("product_id", id)
      .order("sort_order");

    if (vErr) throw new Error(vErr.message);

    if (!variants?.length) {
      return NextResponse.json({ variants: [] });
    }

    const variantIds = variants.map((v) => v.id);

    const { data: sizes } = await supabase
      .from("variant_sizes")
      .select("*")
      .in("variant_id", variantIds)
      .order("size");

    const sizeMap = new Map<string, typeof sizes>();
    if (sizes?.length) {
      for (const s of sizes) {
        const list = sizeMap.get(s.variant_id) ?? [];
        list.push(s);
        sizeMap.set(s.variant_id, list);
      }
    }

    const result = variants.map((v) => ({
      ...v,
      sizes: sizeMap.get(v.id) ?? [],
    }));

    return NextResponse.json({ variants: result });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to fetch variants." },
      { status: 500 },
    );
  }
}