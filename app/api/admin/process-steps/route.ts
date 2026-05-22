import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

import {
  PROCESS_BUCKET,
  ensureProcessStepImagesBucket,
  getAdminClient,
} from "@/lib/supabase/admin";

const getAuthenticatedUser = async () => {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        },
      },
    },
  );

  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  return data.user;
};

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

    const formData = await request.formData();
    const title = String(formData.get("title") ?? "").trim();
    const description = String(formData.get("description") ?? "").trim();
    const imageAlt = String(formData.get("imageAlt") ?? "").trim();
    const sortOrder = Number(formData.get("sortOrder") ?? 0);
    const image = formData.get("image");

    if (!title || !description || !imageAlt || !Number.isFinite(sortOrder)) {
      return NextResponse.json(
        { error: "Title, description, image alt text, and sort order are required." },
        { status: 400 },
      );
    }

    if (!(image instanceof File)) {
      return NextResponse.json({ error: "Please upload a process step image." }, { status: 400 });
    }

    const supabase = getAdminClient();
    await ensureProcessStepImagesBucket();

    const timestamp = Date.now();
    const extension = image.name.includes(".") ? image.name.split(".").pop() : "jpg";
    const filePath = `step-${sortOrder}-${timestamp}.${extension}`;
    const buffer = Buffer.from(await image.arrayBuffer());

    const { error: uploadError } = await supabase.storage
      .from(PROCESS_BUCKET)
      .upload(filePath, buffer, {
        contentType: image.type || "image/jpeg",
        upsert: false,
      });

    if (uploadError) throw new Error(uploadError.message);

    const { data: publicUrlData } = supabase.storage.from(PROCESS_BUCKET).getPublicUrl(filePath);

    const { data: step, error } = await supabase
      .from("process_steps")
      .insert({
        title,
        description,
        image_url: publicUrlData.publicUrl,
        image_alt: imageAlt,
        sort_order: sortOrder,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);

    return NextResponse.json({ step }, { status: 201 });
  } catch (error) {
    console.error("Error creating process step:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to create process step." },
      { status: 500 },
    );
  }
}
