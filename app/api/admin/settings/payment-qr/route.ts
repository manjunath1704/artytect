import { NextResponse } from "next/server";

import { ensurePaymentAssetsBucket, getAdminClient, PAYMENT_BUCKET } from "@/lib/supabase/admin";
import { deleteStorageFile } from "@/lib/supabase/storage-utils";

export async function PUT(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("qr");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Please upload a QR image." }, { status: 400 });
    }

    await ensurePaymentAssetsBucket();
    const supabase = getAdminClient();

    // Fetch existing QR URL to delete old file
    const { data: existingSetting } = await supabase
      .from("admin_settings")
      .select("value")
      .eq("key", "payment_qr")
      .maybeSingle();
    const existingUrl = existingSetting?.value?.url as string | undefined;
    if (existingUrl) {
      await deleteStorageFile(existingUrl, PAYMENT_BUCKET);
    }

    const extension = file.name.includes(".") ? file.name.split(".").pop() : "jpg";
    const filePath = `qr/payment-qr-${Date.now()}.${extension}`;
    const { error: uploadError } = await supabase.storage.from(PAYMENT_BUCKET).upload(
      filePath,
      Buffer.from(await file.arrayBuffer()),
      { contentType: file.type || "image/jpeg", upsert: false },
    );
    if (uploadError) throw new Error(uploadError.message);
    const { data } = supabase.storage.from(PAYMENT_BUCKET).getPublicUrl(filePath);

    // Try to update existing row first
    const { data: updatedRows, error: updateError } = await supabase
      .from("admin_settings")
      .update({ value: { url: data.publicUrl }, updated_at: new Date().toISOString() })
      .eq("key", "payment_qr")
      .select("id");

    if (updateError) throw new Error(updateError.message);

    // If no existing row was updated, insert a new one
    if (!updatedRows || updatedRows.length === 0) {
      const { error: insertError } = await supabase.from("admin_settings").insert({
        key: "payment_qr",
        value: { url: data.publicUrl },
        updated_at: new Date().toISOString(),
      });
      if (insertError) throw new Error(insertError.message);
    }

    return NextResponse.json({ url: data.publicUrl });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to save payment QR." },
      { status: 500 },
    );
  }
}
