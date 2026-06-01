import { NextResponse } from "next/server";

import { ensurePaymentAssetsBucket, getAdminClient, PAYMENT_BUCKET } from "@/lib/supabase/admin";

export async function PUT(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("qr");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Please upload a QR image." }, { status: 400 });
    }

    await ensurePaymentAssetsBucket();
    const supabase = getAdminClient();
    const extension = file.name.includes(".") ? file.name.split(".").pop() : "jpg";
    const filePath = `qr/payment-qr-${Date.now()}.${extension}`;
    const { error: uploadError } = await supabase.storage.from(PAYMENT_BUCKET).upload(
      filePath,
      Buffer.from(await file.arrayBuffer()),
      { contentType: file.type || "image/jpeg", upsert: false },
    );
    if (uploadError) throw new Error(uploadError.message);
    const { data } = supabase.storage.from(PAYMENT_BUCKET).getPublicUrl(filePath);

    const { error } = await supabase.from("admin_settings").upsert({
      key: "payment_qr",
      value: { url: data.publicUrl },
      updated_at: new Date().toISOString(),
    });
    if (error) throw new Error(error.message);

    return NextResponse.json({ url: data.publicUrl });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to save payment QR." },
      { status: 500 },
    );
  }
}
