import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

import {
  HERO_BUCKET,
  ensureHeroMediaBucket,
  getAdminClient,
} from "@/lib/supabase/admin";
import { deleteStorageFile, STORAGE_BUCKETS } from "@/lib/supabase/storage-utils";

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
  const filePath = `${prefix}-${timestamp}.${extension}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await supabase.storage
    .from(HERO_BUCKET)
    .upload(filePath, buffer, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });

  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from(HERO_BUCKET).getPublicUrl(filePath);
  return data.publicUrl;
};

export async function PUT(request: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

    let title = "";
    let subtitle = "";
    let buttonLabel = "";
    let buttonHref = "";
    let scrollTarget = "";
    let desktopVideoUrl: string | undefined;
    let mobileVideoUrl: string | undefined;
    let posterUrl: string | undefined;
    let desktopVideo: any = null;
    let mobileVideo: any = null;
    let poster: any = null;

    const contentType = request.headers.get("content-type") || "";
    const isJson = contentType.includes("application/json");

    if (isJson) {
      const body = await request.json();
      title = String(body.title ?? "").trim();
      subtitle = String(body.subtitle ?? "").trim();
      buttonLabel = String(body.buttonLabel ?? "").trim();
      buttonHref = String(body.buttonHref ?? "").trim();
      scrollTarget = String(body.scrollTarget ?? "").trim();
      desktopVideoUrl = body.desktopVideoUrl;
      mobileVideoUrl = body.mobileVideoUrl;
      posterUrl = body.posterUrl;
    } else {
      const formData = await request.formData();
      title = String(formData.get("title") ?? "").trim();
      subtitle = String(formData.get("subtitle") ?? "").trim();
      buttonLabel = String(formData.get("buttonLabel") ?? "").trim();
      buttonHref = String(formData.get("buttonHref") ?? "").trim();
      scrollTarget = String(formData.get("scrollTarget") ?? "").trim();
      desktopVideo = formData.get("desktopVideo");
      mobileVideo = formData.get("mobileVideo");
      poster = formData.get("poster");
    }

    if (!title || !subtitle || !buttonLabel || !buttonHref || !scrollTarget) {
      return NextResponse.json(
        { error: "Title, subtitle, button, and scroll target fields are required." },
        { status: 400 },
      );
    }

    const supabase = getAdminClient();
    const { data: current, error: currentError } = await supabase
      .from("hero_sections")
      .select("id, desktop_video_url, mobile_video_url, poster_url")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (currentError) throw new Error(currentError.message);

    const payload: {
      title: string;
      subtitle: string;
      button_label: string;
      button_href: string;
      scroll_target: string;
      desktop_video_url?: string;
      mobile_video_url?: string;
      poster_url?: string;
    } = {
      title,
      subtitle,
      button_label: buttonLabel,
      button_href: buttonHref,
      scroll_target: scrollTarget,
    };

    if (isJson) {
      if (desktopVideoUrl) {
        if (current?.desktop_video_url) {
          await deleteStorageFile(current.desktop_video_url, STORAGE_BUCKETS.HERO);
        }
        payload.desktop_video_url = desktopVideoUrl;
      }
      if (mobileVideoUrl) {
        if (current?.mobile_video_url) {
          await deleteStorageFile(current.mobile_video_url, STORAGE_BUCKETS.HERO);
        }
        payload.mobile_video_url = mobileVideoUrl;
      }
      if (posterUrl) {
        if (current?.poster_url) {
          await deleteStorageFile(current.poster_url, STORAGE_BUCKETS.HERO);
        }
        payload.poster_url = posterUrl;
      }
    } else {
      if (desktopVideo instanceof File) {
        // Delete old desktop video if exists
        if (current?.desktop_video_url) {
          await deleteStorageFile(current.desktop_video_url, STORAGE_BUCKETS.HERO);
        }
        payload.desktop_video_url = await uploadFile(desktopVideo, "desktop-video");
      }

      if (mobileVideo instanceof File) {
        // Delete old mobile video if exists
        if (current?.mobile_video_url) {
          await deleteStorageFile(current.mobile_video_url, STORAGE_BUCKETS.HERO);
        }
        payload.mobile_video_url = await uploadFile(mobileVideo, "mobile-video");
      }

      if (poster instanceof File) {
        // Delete old poster if exists
        if (current?.poster_url) {
          await deleteStorageFile(current.poster_url, STORAGE_BUCKETS.HERO);
        }
        payload.poster_url = await uploadFile(poster, "poster");
      }
    }

    if (!current && (!payload.desktop_video_url || !payload.mobile_video_url || !payload.poster_url)) {
      return NextResponse.json(
        { error: "Desktop video, mobile video, and poster are required for the first hero section save." },
        { status: 400 },
      );
    }

    const query = current
      ? supabase.from("hero_sections").update(payload).eq("id", current.id)
      : supabase.from("hero_sections").insert(payload);

    const { data: hero, error } = await query.select().single();
    if (error) throw new Error(error.message);

    return NextResponse.json({ hero }, { status: 200 });
  } catch (error) {
    console.error("Error updating hero section:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to update hero section." },
      { status: 500 },
    );
  }
}
