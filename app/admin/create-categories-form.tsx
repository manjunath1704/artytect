"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ImageUploader } from "@/components/ui/image-uploader";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

const inputClassName =
  "mt-2 w-full rounded-2xl border border-[#d9ccbc] bg-white px-4 py-3 text-sm text-[#1b1511] outline-none transition placeholder:text-[#a69280] focus:border-[#b38d67] focus:ring-4 focus:ring-[#d7b68b]/20";

const CreateCategoriesForm = () => {
  const router = useRouter();

  const [checkingSession, setCheckingSession] = useState(true);
  const [creating,        setCreating]        = useState(false);
  const [title,           setTitle]           = useState("");
  const [slug,            setSlug]            = useState("");
  const [description,     setDescription]     = useState("");
  const [thumbnailAlt,    setThumbnailAlt]    = useState("");
  const [thumbnailFile,   setThumbnailFile]   = useState<File | null>(null);
  const [hoverFile,       setHoverFile]       = useState<File | null>(null);
  const [error,           setError]           = useState<string | null>(null);
  const [success,         setSuccess]         = useState<string | null>(null);

  // ── session guard ──────────────────────────────────────────────────────────
  useEffect(() => {
    const syncSession = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) { router.replace("/admin/login"); return; }
      setCheckingSession(false);
    };
    void syncSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!session) router.replace("/admin/login");
    });
    return () => subscription.unsubscribe();
  }, [router]);

  // ── submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCreating(true);
    setError(null);
    setSuccess(null);

    try {
      if (!title.trim() || !slug.trim() || !description.trim() || !thumbnailAlt.trim()) {
        throw new Error("Please fill in all text fields.");
      }
      if (!thumbnailFile || !hoverFile) {
        throw new Error("Please upload both thumbnail images.");
      }

      const formData = new FormData();
      formData.append("title",        title.trim());
      formData.append("slug",         slug.trim());
      formData.append("description",  description.trim());
      formData.append("thumbnailAlt", thumbnailAlt.trim());
      formData.append("thumbnail",    thumbnailFile);
      formData.append("hoverThumbnail", hoverFile);

      const response = await fetch("/api/admin/categories", {
        method: "POST",
        body: formData,
      });

      const result = (await response.json().catch(() => null)) as { error?: string } | null;
      if (!response.ok) throw new Error(result?.error ?? "Unable to create category.");

      // Reset form
      setTitle("");
      setSlug("");
      setDescription("");
      setThumbnailAlt("");
      setThumbnailFile(null);
      setHoverFile(null);
      setSuccess("Category created successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create category.");
    } finally {
      setCreating(false);
    }
  };

  // ── loading state ──────────────────────────────────────────────────────────
  if (checkingSession) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-3 text-[#665b4f]">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Checking session…</span>
        </div>
      </div>
    );
  }

  // ── render ─────────────────────────────────────────────────────────────────
  return (
    <div className="px-6 py-8 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-4xl">
        <section className="rounded-[32px] bg-white p-6 shadow-sm sm:p-8">

          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1b1511] text-[#f8f2e8]">
              <Plus className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-3xl tracking-[-0.03em] text-[#1b1511]">Create category</h1>
              <p className="text-sm text-[#665b4f]">
                Add the title, description, and two thumbnail images.
              </p>
            </div>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>

            {/* Title */}
            <label className="block text-sm font-medium text-[#352a21]">
              Title <span className="text-[#b38d67]">*</span>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={inputClassName}
                placeholder="Mugs"
                required
              />
            </label>

            {/* Slug */}
            <label className="block text-sm font-medium text-[#352a21]">
              Slug <span className="text-[#b38d67]">*</span>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className={inputClassName}
                placeholder="mugs"
                required
              />
              <p className="mt-1 text-xs text-[#8a7765]">
                Used in URLs — lowercase letters, numbers, and hyphens only.
              </p>
            </label>

            {/* Description */}
            <label className="block text-sm font-medium text-[#352a21]">
              Description <span className="text-[#b38d67]">*</span>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={`${inputClassName} min-h-[120px] resize-y`}
                placeholder="Everyday forms with soft handles and warm glazes for slow mornings."
                required
              />
            </label>

            {/* Alt text */}
            <label className="block text-sm font-medium text-[#352a21]">
              Thumbnail Alt Text <span className="text-[#b38d67]">*</span>
              <input
                type="text"
                value={thumbnailAlt}
                onChange={(e) => setThumbnailAlt(e.target.value)}
                className={inputClassName}
                placeholder="Handcrafted ceramic mugs"
                required
              />
              <p className="mt-1 text-xs text-[#8a7765]">
                Describes the image for accessibility and SEO.
              </p>
            </label>

            {/* Image uploaders — side by side on sm+ */}
            <div className="grid gap-6 sm:grid-cols-2">
              <ImageUploader
                label="Default Thumbnail"
                hint="Shown in the category card at rest"
                file={thumbnailFile}
                onChange={setThumbnailFile}
                onRemove={() => setThumbnailFile(null)}
                required
              />
              <ImageUploader
                label="Hover Thumbnail"
                hint="Shown when the user hovers the card"
                file={hoverFile}
                onChange={setHoverFile}
                onRemove={() => setHoverFile(null)}
                required
              />
            </div>

            {/* Error / success */}
            {error && (
              <p className="rounded-2xl border border-[#d7b68b] bg-[#faf4ea] px-4 py-3 text-sm text-[#7a4d1d]">
                {error}
              </p>
            )}
            {success && (
              <p className="rounded-2xl border border-[#b7cfb7] bg-[#f1f8f1] px-4 py-3 text-sm text-[#2c5f2c]">
                {success}
              </p>
            )}

            {/* Submit */}
            <Button
              type="submit"
              size="lg"
              disabled={creating}
              className="h-12 rounded-full bg-[#1b1511] px-10 text-[#f8f2e8] hover:bg-[#2a211a]"
            >
              {creating ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating category…
                </span>
              ) : (
                "Create category"
              )}
            </Button>
          </form>
        </section>
      </div>
    </div>
  );
};

export default CreateCategoriesForm;
