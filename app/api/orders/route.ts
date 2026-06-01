import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

import { ensurePaymentAssetsBucket, getAdminClient, PAYMENT_BUCKET } from "@/lib/supabase/admin";

const getUser = async () => {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)),
      },
    },
  );
  const { data } = await supabase.auth.getUser();
  return data.user ?? null;
};

const makeOrderId = () => `AT-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const customerName = String(formData.get("customer_name") ?? "").trim();
    const customerEmail = String(formData.get("customer_email") ?? "").trim();
    const customerPhone = String(formData.get("customer_phone") ?? "").trim();
    const address = String(formData.get("address") ?? "").trim();
    const itemsRaw = String(formData.get("items") ?? "[]");
    const totalAmount = Number(formData.get("total_amount") ?? 0);
    const proof = formData.get("payment_screenshot");

    if (!customerName || !customerEmail || !customerPhone || !address || !totalAmount) {
      return NextResponse.json({ error: "Customer details and total amount are required." }, { status: 400 });
    }
    if (!(proof instanceof File)) {
      return NextResponse.json({ error: "Please upload payment proof." }, { status: 400 });
    }

    const items = JSON.parse(itemsRaw) as Array<{
      productId: string;
      name: string;
      slug: string;
      image: string;
      price: number;
      size: string;
      color: string;
      quantity: number;
    }>;
    if (!Array.isArray(items) || !items.length) {
      return NextResponse.json({ error: "Cart is empty." }, { status: 400 });
    }

    const calculatedTotal = items.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity), 0);
    if (Math.abs(calculatedTotal - totalAmount) > 0.01) {
      return NextResponse.json({ error: "Payment amount does not match cart total." }, { status: 400 });
    }

    await ensurePaymentAssetsBucket();
    const supabase = getAdminClient();
    const extension = proof.name.includes(".") ? proof.name.split(".").pop() : "jpg";
    const filePath = `proofs/${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`;
    const { error: uploadError } = await supabase.storage.from(PAYMENT_BUCKET).upload(
      filePath,
      Buffer.from(await proof.arrayBuffer()),
      { contentType: proof.type || "image/jpeg", upsert: false },
    );
    if (uploadError) throw new Error(uploadError.message);
    const { data: publicUrl } = supabase.storage.from(PAYMENT_BUCKET).getPublicUrl(filePath);
    const user = await getUser();

    const { data: order, error } = await supabase
      .from("orders")
      .insert({
        order_id: makeOrderId(),
        user_id: user?.id ?? null,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        address,
        ordered_products: items,
        selected_sizes: items.map((item) => item.size),
        selected_colors: items.map((item) => item.color),
        quantities: items.map((item) => item.quantity),
        total_amount: calculatedTotal,
        payment_screenshot: publicUrl.publicUrl,
      })
      .select("order_id")
      .single();

    if (error) throw new Error(error.message);
    return NextResponse.json({ orderId: order.order_id }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to create order." },
      { status: 500 },
    );
  }
}
