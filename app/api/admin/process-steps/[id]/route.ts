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

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
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

    const supabase = getAdminClient();
    const updateData: {
      title: string;
      description: string;
      image_alt: string;
      sort_order: number;
      image_url?: string;
    } = {
      title,
      description,
      image_alt: imageAlt,
      sort_order: sortOrder,
    };

    if (image instanceof File) {
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
      const { data } = supabase.storage.from(PROCESS_BUCKET).getPublicUrl(filePath);
      updateData.image_url = data.publicUrl;
    }

    const { data: step, error } = await supabase
      .from("process_steps")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return NextResponse.json({ step }, { status: 200 });
  } catch (error) {
    console.error("Error updating process step:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to update process step." },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const user = await getAuthenticatedUser();
    if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

    const supabase = getAdminClient();
    const { error } = await supabase.from("process_steps").delete().eq("id", id);
    if (error) throw new Error(error.message);

    return NextResponse.json({ message: "Process step deleted successfully." }, { status: 200 });
  } catch (error) {
    console.error("Error deleting process step:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to delete process step." },
      { status: 500 },
    );
  }
}
