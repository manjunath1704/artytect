import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

import { getAdminClient, HERO_BUCKET, ensureHeroMediaBucket } from "@/lib/supabase/admin";
import { deleteStorageFile } from "@/lib/supabase/storage-utils";

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

const uploadFile = async (file: File, prefix: string) => {
  const supabase = getAdminClient();
  await ensureHeroMediaBucket();

  const timestamp = Date.now();
  const extension = file.name.includes(".") ? file.name.split(".").pop() : "jpg";
  const filePath = `page-heroes/${prefix}-${timestamp}.${extension}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await supabase.storage
    .from(HERO_BUCKET)
    .upload(filePath, buffer, {
      contentType: file.type || "image/jpeg",
      upsert: false,
    });

  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from(HERO_BUCKET).getPublicUrl(filePath);
  return data.publicUrl;
};

export async function GET() {
  try {
    const supabase = getAdminClient();
    const { data, error } = await supabase
      .from("page_hero_sections")
      .select("*")
      .order("page_key");

    if (error) throw new Error(error.message);

    return NextResponse.json({ heroes: data ?? [] });
  } catch (error) {
    console.error("Error fetching page heroes:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to fetch page heroes." },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

    const formData = await request.formData();
    const pageKey = String(formData.get("pageKey") ?? "").trim();
    const eyebrow = String(formData.get("eyebrow") ?? "").trim();
    const title = String(formData.get("title") ?? "").trim();
    const description = String(formData.get("description") ?? "").trim();
    const buttonLabel = String(formData.get("buttonLabel") ?? "").trim();
    const buttonHref = String(formData.get("buttonHref") ?? "").trim();
    const sidebarLabel = String(formData.get("sidebarLabel") ?? "").trim();
    const sidebarDescription = String(formData.get("sidebarDescription") ?? "").trim();
    const sidebarStat1Value = String(formData.get("sidebarStat1Value") ?? "").trim();
    const sidebarStat1Label = String(formData.get("sidebarStat1Label") ?? "").trim();
    const sidebarStat2Value = String(formData.get("sidebarStat2Value") ?? "").trim();
    const sidebarStat2Label = String(formData.get("sidebarStat2Label") ?? "").trim();
    const sidebarStat3Value = String(formData.get("sidebarStat3Value") ?? "").trim();
    const sidebarStat3Label = String(formData.get("sidebarStat3Label") ?? "").trim();
    const backgroundImage = formData.get("backgroundImage");

    if (!pageKey || !title) {
      return NextResponse.json(
        { error: "Page key and title are required." },
        { status: 400 },
      );
    }

    const validKeys = ["categories", "classes", "products", "blog"];
    if (!validKeys.includes(pageKey)) {
      return NextResponse.json(
        { error: "Invalid page key." },
        { status: 400 },
      );
    }

    const supabase = getAdminClient();

    // Fetch existing hero to get old background image URL
    const { data: existing } = await supabase
      .from("page_hero_sections")
      .select("background_image_url")
      .eq("page_key", pageKey)
      .maybeSingle();

    const payload: Record<string, string> = {
      page_key: pageKey,
      eyebrow,
      title,
      description,
      button_label: buttonLabel,
      button_href: buttonHref,
      sidebar_label: sidebarLabel,
      sidebar_description: sidebarDescription,
      sidebar_stat_1_value: sidebarStat1Value,
      sidebar_stat_1_label: sidebarStat1Label,
      sidebar_stat_2_value: sidebarStat2Value,
      sidebar_stat_2_label: sidebarStat2Label,
      sidebar_stat_3_value: sidebarStat3Value,
      sidebar_stat_3_label: sidebarStat3Label,
      updated_at: new Date().toISOString(),
    };

    if (backgroundImage instanceof File) {
      // Delete old background image if it exists and is a storage URL
      if (existing?.background_image_url && existing.background_image_url.startsWith("http")) {
        await deleteStorageFile(existing.background_image_url, HERO_BUCKET);
      }
      payload.background_image_url = await uploadFile(backgroundImage, `${pageKey}-hero`);
    }

    const { data: hero, error } = await supabase
      .from("page_hero_sections")
      .upsert(payload, { onConflict: "page_key" })
      .select()
      .single();

    if (error) throw new Error(error.message);

    return NextResponse.json({ hero });
  } catch (error) {
    console.error("Error saving page hero:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to save page hero." },
      { status: 500 },
    );
  }
}