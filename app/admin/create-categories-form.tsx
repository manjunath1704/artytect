"use client";

import Image from "next/image";
import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, ArrowLeft, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

const inputClassName =
  "mt-2 w-full border border-[#d9ccbc] bg-white px-4 py-3 text-sm text-[#1b1511] outline-none transition placeholder:text-[#a69280] focus:border-[#b38d67] focus:ring-4 focus:ring-[#d7b68b]/20";

const CreateCategoriesForm = () => {
  const router = useRouter();
  const [checkingSession, setCheckingSession] = useState(true);
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnailAlt, setThumbnailAlt] = useState("");
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [hoverThumbnailFile, setHoverThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [hoverThumbnailPreview, setHoverThumbnailPreview] = useState<string | null>(null);
  const [fileInputKey, setFileInputKey] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.replace("/admin/login");
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  useEffect(() => {
    if (!thumbnailFile) {
      setThumbnailPreview(null);
      return;
    }

    const previewUrl = URL.createObjectURL(thumbnailFile);
    setThumbnailPreview(previewUrl);

    return () => URL.revokeObjectURL(previewUrl);
  }, [thumbnailFile]);

  useEffect(() => {
    if (!hoverThumbnailFile) {
      setHoverThumbnailPreview(null);
      return;
    }

    const previewUrl = URL.createObjectURL(hoverThumbnailFile);
    setHoverThumbnailPreview(previewUrl);

    return () => URL.revokeObjectURL(previewUrl);
  }, [hoverThumbnailFile]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCreating(true);
    setError(null);
    setSuccess(null);

    try {
      if (!title.trim() || !slug.trim() || !description.trim() || !thumbnailAlt.trim() || !thumbnailFile || !hoverThumbnailFile) {
        throw new Error("Please fill in all fields and upload both thumbnail images.");
      }

      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("slug", slug.trim());
      formData.append("description", description.trim());
      formData.append("thumbnailAlt", thumbnailAlt.trim());
      formData.append("thumbnail", thumbnailFile);
      formData.append("hoverThumbnail", hoverThumbnailFile);

      const response = await fetch("/api/admin/categories", {
        method: "POST",
        body: formData,
      });

      const result = (await response.json().catch(() => null)) as
        | { error?: string }
        | null;

      if (!response.ok) {
        throw new Error(result?.error ?? "Unable to create category.");
      }

      setTitle("");
      setSlug("");
      setDescription("");
      setThumbnailAlt("");
      setThumbnailFile(null);
      setHoverThumbnailFile(null);
      setFileInputKey((current) => current + 1);
      setSuccess("Category created successfully.");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to create category.");
    } finally {
      setCreating(false);
    }
  };

  if (checkingSession) {
    return (
      <main className="flex min-h-[100svh] items-center justify-center bg-[linear-gradient(180deg,#f6efe4_0%,#efe4d5_100%)] px-6">
        <div className="flex items-center gap-3 text-[#665b4f]">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Checking admin session...</span>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[100svh] bg-[linear-gradient(180deg,#f6efe4_0%,#efe4d5_100%)] px-6 py-8 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#1b1511] underline-offset-4 transition hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to admin
          </Link>
          <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-[#8a7765]">
            Create categories
          </p>
        </div>

        <section className="border border-[#dbcbb8] bg-white p-6 shadow-[0_20px_70px_rgba(23,20,15,0.08)] sm:p-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center bg-[#1b1511] text-[#f8f2e8]">
              <Plus className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-3xl tracking-[-0.03em] text-[#1b1511]">
                Create category
              </h1>
              <p className="text-sm text-[#665b4f]">
                Add the title, description, and two thumbnail images.
              </p>
            </div>
          </div>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <label className="block text-sm font-medium text-[#352a21]">
              Title
              <input
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className={inputClassName}
                placeholder="Mugs"
                required
              />
            </label>

            <label className="block text-sm font-medium text-[#352a21]">
              Slug (URL-friendly name)
              <input
                type="text"
                value={slug}
                onChange={(event) => setSlug(event.target.value)}
                className={inputClassName}
                placeholder="mugs"
                required
              />
              <p className="mt-1 text-xs text-[#8a7765]">
                Used in URLs. Use lowercase letters, numbers, and hyphens only.
              </p>
            </label>

            <label className="block text-sm font-medium text-[#352a21]">
              Description
              <textarea
                value={description}
                onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
                  setDescription(event.target.value)
                }
                className={`${inputClassName} min-h-[120px] resize-y`}
                placeholder="Everyday forms with soft handles and warm glazes for slow mornings."
                required
              />
            </label>

            <label className="block text-sm font-medium text-[#352a21]">
              Thumbnail Alt Text
              <input
                type="text"
                value={thumbnailAlt}
                onChange={(event) => setThumbnailAlt(event.target.value)}
                className={inputClassName}
                placeholder="Handcrafted ceramic mugs"
                required
              />
              <p className="mt-1 text-xs text-[#8a7765]">
                Describes the image for accessibility and SEO.
              </p>
            </label>

            <label className="block text-sm font-medium text-[#352a21]">
              Default thumbnail image
              <input
                key={`thumbnail-${fileInputKey}`}
                type="file"
                accept="image/*"
                onChange={(event) => {
                  setThumbnailFile(event.target.files?.[0] ?? null);
                }}
                className={inputClassName}
                required
              />
            </label>

            {thumbnailPreview ? (
              <div className="overflow-hidden border border-[#e8ddd1] bg-[#fcfaf7] p-3">
                <p className="text-xs uppercase tracking-[0.25em] text-[#8a7765]">
                  Default preview
                </p>
                <div className="relative mt-3 h-40 w-full">
                  <Image
                    src={thumbnailPreview}
                    alt="Default thumbnail preview"
                    fill
                    unoptimized
                    className="object-cover"
                  />
                </div>
              </div>
            ) : null}

            <label className="block text-sm font-medium text-[#352a21]">
              Hover thumbnail image
              <input
                key={`hover-${fileInputKey}`}
                type="file"
                accept="image/*"
                onChange={(event) => {
                  setHoverThumbnailFile(event.target.files?.[0] ?? null);
                }}
                className={inputClassName}
                required
              />
            </label>

            {hoverThumbnailPreview ? (
              <div className="overflow-hidden border border-[#e8ddd1] bg-[#fcfaf7] p-3">
                <p className="text-xs uppercase tracking-[0.25em] text-[#8a7765]">
                  Hover preview
                </p>
                <div className="relative mt-3 h-40 w-full">
                  <Image
                    src={hoverThumbnailPreview}
                    alt="Hover thumbnail preview"
                    fill
                    unoptimized
                    className="object-cover"
                  />
                </div>
              </div>
            ) : null}

            <p className="text-xs leading-6 text-[#8a7765]">
              The default and hover thumbnails are separate uploads.
            </p>

            {error ? (
              <p className="border border-[#d7b68b] bg-[#faf4ea] px-4 py-3 text-sm text-[#7a4d1d]">
                {error}
              </p>
            ) : null}

            {success ? (
              <p className="border border-[#b7cfb7] bg-[#f1f8f1] px-4 py-3 text-sm text-[#2c5f2c]">
                {success}
              </p>
            ) : null}

            <Button
              type="submit"
              size="lg"
              className="h-12 w-full rounded-none bg-[#1b1511] text-[#f8f2e8] hover:bg-[#2a211a]"
              disabled={creating}
            >
              {creating ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating category
                </span>
              ) : (
                "Create category"
              )}
            </Button>
          </form>
        </section>
      </div>
    </main>
  );
};

export default CreateCategoriesForm;
