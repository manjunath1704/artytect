"use client";

import Image from "next/image";
import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, LogOut, Plus, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

type CategoryRow = {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnail_url: string;
  hover_thumbnail_url: string;
};

type CategoryCardRow = {
  id: string;
  title: string;
  description: string;
  slug: string;
  thumbnailSrc: string;
  hoverThumbnailSrc: string;
};

type AdminPanelProps = {
  initialUserEmail: string;
  initialCategories: CategoryRow[];
};

const inputClassName =
  "mt-2 w-full border border-[#d9ccbc] bg-white px-4 py-3 text-sm text-[#1b1511] outline-none transition placeholder:text-[#a69280] focus:border-[#b38d67] focus:ring-4 focus:ring-[#d7b68b]/20";

const mapCategory = (row: CategoryRow): CategoryCardRow => ({
  id: row.id,
  title: row.title,
  slug: row.slug,
  description: row.description,
  thumbnailSrc: row.thumbnail_url,
  hoverThumbnailSrc: row.hover_thumbnail_url,
});

const AdminPanel = ({ initialUserEmail, initialCategories }: AdminPanelProps) => {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState(initialUserEmail);
  const [categories, setCategories] = useState<CategoryCardRow[]>(
    initialCategories.map(mapCategory),
  );
  const [checkingSession, setCheckingSession] = useState(true);
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
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

      setUserEmail(data.user.email ?? initialUserEmail);
      setCheckingSession(false);
    };

    void syncSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.replace("/admin/login");
        return;
      }

      setUserEmail(session.user.email ?? initialUserEmail);
    });

    return () => subscription.unsubscribe();
  }, [initialUserEmail, router]);

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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/admin/login");
    router.refresh();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCreating(true);
    setError(null);
    setSuccess(null);

    try {
      if (!title.trim() || !description.trim() || !thumbnailFile || !hoverThumbnailFile) {
        throw new Error("Please fill in title, description, and both thumbnail images.");
      }

      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("description", description.trim());
      formData.append("thumbnail", thumbnailFile);
      formData.append("hoverThumbnail", hoverThumbnailFile);

      const response = await fetch("/api/admin/categories", {
        method: "POST",
        body: formData,
      });

      const result = (await response.json().catch(() => null)) as
        | { error?: string; category?: CategoryRow }
        | null;

      if (!response.ok) {
        throw new Error(result?.error ?? "Unable to create category.");
      }

      const insertedCategory = result?.category;
      if (insertedCategory) {
        setCategories((current) => [mapCategory(insertedCategory as CategoryRow), ...current]);
      }

      setTitle("");
      setDescription("");
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
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-6 border border-[#dbcbb8] bg-white p-6 shadow-[0_24px_90px_rgba(23,20,15,0.12)] sm:p-8 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-[#8a7765]">
              Admin panel
            </p>
            <h1 className="mt-3 text-4xl tracking-[-0.04em] text-[#1b1511]">
              Manage categories
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[#665b4f]">
              Create category records for the storefront. These are stored in Supabase
              and can be reused in the homepage carousel or any future category grid.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/admin/create-categories"
              className="inline-flex h-12 items-center justify-center border border-[#d9ccbc] px-4 text-sm font-medium text-[#1b1511] transition hover:bg-[#f5eee4]"
            >
              Create categories
            </Link>
            <div className="text-right">
              <p className="text-xs uppercase tracking-[0.25em] text-[#8a7765]">
                Signed in as
              </p>
              <p className="mt-1 text-sm font-medium text-[#1b1511]">{userEmail}</p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="rounded-none border-[#d9ccbc] bg-transparent text-[#1b1511] hover:bg-[#f5eee4]"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <section className="border border-[#dbcbb8] bg-white p-6 shadow-[0_20px_70px_rgba(23,20,15,0.08)] sm:p-8">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center bg-[#1b1511] text-[#f8f2e8]">
                <Plus className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-2xl tracking-[-0.03em] text-[#1b1511]">
                  Create category
                </h2>
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

          <section className="border border-[#dbcbb8] bg-white p-6 shadow-[0_20px_70px_rgba(23,20,15,0.08)] sm:p-8">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center bg-[#d7b68b] text-[#1b1511]">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-2xl tracking-[-0.03em] text-[#1b1511]">
                  Existing categories
                </h2>
                <p className="text-sm text-[#665b4f]">
                  Live data from Supabase.
                </p>
              </div>
            </div>

            <div className="mt-8 grid gap-4">
              {categories.length ? (
                categories.map((category, index) => (
                  <article
                    key={category.id}
                    className="border border-[#e8ddd1] bg-[#fcfaf7] p-4"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h3 className="text-lg tracking-[-0.02em] text-[#1b1511]">
                          {category.title}
                        </h3>
                        <p className="mt-1 text-xs uppercase tracking-[0.25em] text-[#8a7765]">
                          0{index + 1} {category.slug}
                        </p>
                        <p className="mt-3 text-sm leading-7 text-[#665b4f]">
                          {category.description}
                        </p>
                      </div>
                      <div className="grid gap-3 sm:w-40">
                        <div className="relative h-24 w-full">
                          <Image
                            src={category.thumbnailSrc}
                            alt={`${category.title} default thumbnail`}
                            fill
                            unoptimized
                            className="object-cover"
                          />
                        </div>
                        <div className="relative h-24 w-full">
                          <Image
                            src={category.hoverThumbnailSrc}
                            alt={`${category.title} hover thumbnail`}
                            fill
                            unoptimized
                            className="object-cover"
                          />
                        </div>
                      </div>
                    </div>
                  </article>
                ))
              ) : (
                <div className="border border-dashed border-[#d9ccbc] bg-[#fcfaf7] p-6 text-sm leading-7 text-[#665b4f]">
                  No categories yet. Create the first one using the form on the left.
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
};

export default AdminPanel;
