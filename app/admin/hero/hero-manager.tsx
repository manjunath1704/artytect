"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Film, ImageIcon, Loader2, Sparkles, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ImageUploader } from "@/components/ui/image-uploader";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

type HeroRow = {
  id?: string;
  title: string;
  subtitle: string;
  button_label: string;
  button_href: string;
  desktop_video_url: string;
  mobile_video_url: string;
  poster_url: string;
  scroll_target: string;
};

type HeroManagerProps = {
  initialUserEmail: string;
  initialHero: HeroRow;
};

const inputClassName =
  "mt-2 w-full rounded-2xl border border-[#d9ccbc] bg-white px-4 py-3 text-sm text-[#1b1511] outline-none transition placeholder:text-[#a69280] focus:border-[#b38d67] focus:ring-4 focus:ring-[#d7b68b]/20";

function VideoUploader({
  label,
  hint,
  file,
  onChange,
  onRemove,
}: {
  label: string;
  hint?: string;
  file: File | null;
  onChange: (file: File) => void;
  onRemove: () => void;
}) {
  return (
    <div className="space-y-2">
      <div>
        <p className="text-sm font-medium text-[#352a21]">{label}</p>
        {hint && <p className="mt-0.5 text-xs text-[#8a7765]">{hint}</p>}
      </div>

      {file ? (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-[#e8ddd1] bg-[#fcfaf7] px-4 py-3">
          <p className="min-w-0 truncate text-sm text-[#1b1511]">{file.name}</p>
          <button
            type="button"
            onClick={onRemove}
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#d9ccbc] text-[#665b4f] transition hover:bg-[#f5eee4] hover:text-[#1b1511]"
            aria-label={`Remove ${label}`}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-[#d9ccbc] bg-[#fcfaf7] px-6 py-8 text-center transition hover:border-[#b38d67] hover:bg-[#faf4ea]">
          <Film className="h-6 w-6 text-[#b38d67]" />
          <span className="text-sm font-medium text-[#1b1511]">Click to upload video</span>
          <span className="text-xs text-[#8a7765]">MP4, WEBM, MOV</span>
          <input
            type="file"
            accept="video/mp4,video/webm,video/quicktime"
            className="sr-only"
            onChange={(event) => {
              const selectedFile = event.target.files?.[0];
              if (selectedFile) onChange(selectedFile);
              event.target.value = "";
            }}
          />
        </label>
      )}
    </div>
  );
}

export default function HeroManager({
  initialUserEmail,
  initialHero,
}: HeroManagerProps) {
  const router = useRouter();
  const [checkingSession, setCheckingSession] = useState(true);
  const [title, setTitle] = useState(initialHero.title);
  const [subtitle, setSubtitle] = useState(initialHero.subtitle);
  const [buttonLabel, setButtonLabel] = useState(initialHero.button_label);
  const [buttonHref, setButtonHref] = useState(initialHero.button_href);
  const [scrollTarget, setScrollTarget] = useState(initialHero.scroll_target);
  const [desktopVideoFile, setDesktopVideoFile] = useState<File | null>(null);
  const [mobileVideoFile, setMobileVideoFile] = useState<File | null>(null);
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [currentHero, setCurrentHero] = useState(initialHero);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const syncSession = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.replace("/admin/login");
        return;
      }
      setCheckingSession(false);
    };
    void syncSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) router.replace("/admin/login");
    });
    return () => subscription.unsubscribe();
  }, [initialUserEmail, router]);

  const uploadClientFile = async (file: File, prefix: string) => {
    const timestamp = Date.now();
    const extension = file.name.includes(".") ? file.name.split(".").pop() : "jpg";
    const filePath = `${prefix}-${timestamp}.${extension}`;

    const { error } = await supabase.storage
      .from("hero-media")
      .upload(filePath, file, {
        contentType: file.type || "application/octet-stream",
        upsert: false,
      });

    if (error) {
      throw new Error(`Failed to upload ${prefix}: ${error.message}`);
    }

    const { data } = supabase.storage.from("hero-media").getPublicUrl(filePath);
    return data.publicUrl;
  };

  const saveHero = async () => {
    if (!title.trim() || !subtitle.trim() || !buttonLabel.trim() || !buttonHref.trim() || !scrollTarget.trim()) {
      toast.error("Please fill all required hero fields.");
      return;
    }

    setSaving(true);
    const toastId = toast.loading("Saving hero section...");

    try {
      let desktopVideoUrl: string | undefined;
      let mobileVideoUrl: string | undefined;
      let posterUrl: string | undefined;

      if (desktopVideoFile) {
        toast.loading("Uploading desktop video...", { id: toastId });
        desktopVideoUrl = await uploadClientFile(desktopVideoFile, "desktop-video");
      }

      if (mobileVideoFile) {
        toast.loading("Uploading mobile video...", { id: toastId });
        mobileVideoUrl = await uploadClientFile(mobileVideoFile, "mobile-video");
      }

      if (posterFile) {
        toast.loading("Uploading poster image...", { id: toastId });
        posterUrl = await uploadClientFile(posterFile, "poster");
      }

      toast.loading("Saving details to database...", { id: toastId });

      const payload = {
        title: title.trim(),
        subtitle: subtitle.trim(),
        buttonLabel: buttonLabel.trim(),
        buttonHref: buttonHref.trim(),
        scrollTarget: scrollTarget.trim(),
        desktopVideoUrl,
        mobileVideoUrl,
        posterUrl,
      };

      const response = await fetch("/api/admin/hero-section", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      let result;
      const text = await response.text();
      try {
        result = text ? JSON.parse(text) : null;
      } catch (e) {
        // Not a JSON response (e.g. 413 plain text error or similar)
      }

      if (!response.ok) {
        throw new Error(result?.error ?? text ?? "Unable to save hero section.");
      }

      setCurrentHero({
        id: String(result.hero.id),
        title: result.hero.title,
        subtitle: result.hero.subtitle,
        button_label: result.hero.button_label,
        button_href: result.hero.button_href,
        desktop_video_url: result.hero.desktop_video_url,
        mobile_video_url: result.hero.mobile_video_url,
        poster_url: result.hero.poster_url,
        scroll_target: result.hero.scroll_target,
      });
      setDesktopVideoFile(null);
      setMobileVideoFile(null);
      setPosterFile(null);
      toast.success("Hero section saved.", { id: toastId });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save hero section.", { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-3 text-[#665b4f]">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Checking session...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 py-8 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <section className="rounded-[32px] bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1b1511] text-[#f8f2e8]">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-3xl tracking-[-0.03em] text-[#1b1511]">Manage Hero</h1>
              <p className="text-sm text-[#665b4f]">Edit the homepage hero copy, button, poster, and videos.</p>
            </div>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-[1.2fr_0.8fr]">
            <label className="block text-sm font-medium text-[#352a21]">
              Title
              <textarea
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className={`${inputClassName} min-h-[120px] resize-y`}
                placeholder={"Slow living,\nsculpted."}
              />
            </label>
            <div className="space-y-5">
              <label className="block text-sm font-medium text-[#352a21]">
                Button label
                <input value={buttonLabel} onChange={(event) => setButtonLabel(event.target.value)} className={inputClassName} />
              </label>
              <label className="block text-sm font-medium text-[#352a21]">
                Button href
                <input value={buttonHref} onChange={(event) => setButtonHref(event.target.value)} className={inputClassName} />
              </label>
            </div>
          </div>

          <div className="mt-5 grid gap-5 md:grid-cols-[1.2fr_0.8fr]">
            <label className="block text-sm font-medium text-[#352a21]">
              Subtitle
              <input value={subtitle} onChange={(event) => setSubtitle(event.target.value)} className={inputClassName} />
            </label>
            <label className="block text-sm font-medium text-[#352a21]">
              Scroll target
              <input value={scrollTarget} onChange={(event) => setScrollTarget(event.target.value)} className={inputClassName} />
            </label>
          </div>
        </section>

        <section className="mt-8 rounded-[32px] bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-2xl tracking-[-0.03em] text-[#1b1511]">Hero Media</h2>
          <p className="mt-1 text-sm text-[#665b4f]">Leave a field empty to keep the current media.</p>

          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            <VideoUploader
              label="Desktop video"
              hint="Used for tablet and desktop screens"
              file={desktopVideoFile}
              onChange={setDesktopVideoFile}
              onRemove={() => setDesktopVideoFile(null)}
            />
            <VideoUploader
              label="Mobile video"
              hint="Used below 768px"
              file={mobileVideoFile}
              onChange={setMobileVideoFile}
              onRemove={() => setMobileVideoFile(null)}
            />
            <ImageUploader
              label="Poster image"
              hint="Shown before video loads"
              file={posterFile}
              onChange={setPosterFile}
              onRemove={() => setPosterFile(null)}
            />
          </div>

          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            <div className="rounded-2xl border border-[#e8ddd1] bg-[#fcfaf7] p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#8a7765]">Current desktop video</p>
              <video src={currentHero.desktop_video_url} poster={currentHero.poster_url} controls className="aspect-video w-full rounded-xl bg-[#17110d] object-cover" />
            </div>
            <div className="rounded-2xl border border-[#e8ddd1] bg-[#fcfaf7] p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#8a7765]">Current mobile video</p>
              <video src={currentHero.mobile_video_url} poster={currentHero.poster_url} controls className="aspect-video w-full rounded-xl bg-[#17110d] object-cover" />
            </div>
            <div className="rounded-2xl border border-[#e8ddd1] bg-[#fcfaf7] p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#8a7765]">Current poster</p>
              <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-[#f5eee4]">
                {currentHero.poster_url ? (
                  <Image src={currentHero.poster_url} alt="Current hero poster" fill unoptimized className="object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-[#8a7765]">
                    <ImageIcon className="h-6 w-6" />
                  </div>
                )}
              </div>
            </div>
          </div>

          <Button onClick={saveHero} disabled={saving} className="mt-8 h-12 rounded-full bg-[#1b1511] px-8 text-[#f8f2e8] hover:bg-[#2a211a]">
            {saving ? "Saving..." : "Save Hero"}
          </Button>
          {/* <h1></h1> */}
        </section>
      </div>
    </div>
  );
}
