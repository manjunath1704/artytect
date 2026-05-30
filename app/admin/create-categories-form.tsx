"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ImageUploader } from "@/components/ui/image-uploader";
import { AppSelect, type SelectOption } from "@/components/ui/app-select";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

// ─── validation ───────────────────────────────────────────────────────────────
type Fields = {
  title:        string;
  slug:         string;
  description:  string;
  categoryType: "parent" | "child";
  parentCategoryId: string;
  thumbnailAlt: string;
  thumbnail:    File | null;
  hoverThumbnail: File | null;
};

type FieldErrors = Partial<Record<keyof Fields, string>>;

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function validate(fields: Fields): FieldErrors {
  const errors: FieldErrors = {};

  if (!fields.title.trim())
    errors.title = "Title is required.";

  if (!fields.slug.trim())
    errors.slug = "Slug is required.";
  else if (!SLUG_RE.test(fields.slug.trim()))
    errors.slug = "Slug must be lowercase letters, numbers, and hyphens only.";

  if (!fields.description.trim())
    errors.description = "Description is required.";

  if (fields.categoryType === "child" && !fields.parentCategoryId)
    errors.parentCategoryId = "Select a parent category.";

  if (!fields.thumbnailAlt.trim())
    errors.thumbnailAlt = "Alt text is required.";

  if (!fields.thumbnail)
    errors.thumbnail = "Default thumbnail image is required.";

  if (!fields.hoverThumbnail)
    errors.hoverThumbnail = "Hover thumbnail image is required.";

  return errors;
}

type ParentCategoryOption = {
  id: string;
  title: string;
};

type CreateCategoriesFormProps = {
  parentCategories: ParentCategoryOption[];
};

const categoryTypeOptions: SelectOption<"parent" | "child">[] = [
  { value: "parent", label: "Parent Category" },
  { value: "child", label: "Child Category" },
];

// ─── shared input style ───────────────────────────────────────────────────────
const inputBase =
  "mt-2 w-full rounded-[32px] border bg-white px-4 py-3 text-sm text-[#1b1511] outline-none transition placeholder:text-[#a69280] focus:ring-4 focus:ring-[#d7b68b]/20";

function inputCls(hasError: boolean) {
  return `${inputBase} ${
    hasError
      ? "border-red-400 focus:border-red-400"
      : "border-[#d9ccbc] focus:border-[#b38d67]"
  }`;
}

// ─── FieldError helper ────────────────────────────────────────────────────────
function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="mt-1.5 text-xs text-red-500">{msg}</p>;
}

// ─── component ────────────────────────────────────────────────────────────────
const CreateCategoriesForm = ({ parentCategories }: CreateCategoriesFormProps) => {
  const router = useRouter();

  const [checkingSession, setCheckingSession] = useState(true);
  const [creating,        setCreating]        = useState(false);

  // field state
  const [title,           setTitle]           = useState("");
  const [slug,            setSlug]            = useState("");
  const [description,     setDescription]     = useState("");
  const [categoryType,    setCategoryType]    = useState<"parent" | "child">("parent");
  const [parentCategoryId, setParentCategoryId] = useState("");
  const [thumbnailAlt,    setThumbnailAlt]    = useState("");
  const [thumbnailFile,   setThumbnailFile]   = useState<File | null>(null);
  const [hoverFile,       setHoverFile]       = useState<File | null>(null);

  // per-field errors (only shown after first submit attempt)
  const [errors,          setErrors]          = useState<FieldErrors>({});
  const [submitted,       setSubmitted]       = useState(false);

  // ── session guard ────────────────────────────────────────────────────────
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

  // ── live re-validation after first submit ────────────────────────────────
  useEffect(() => {
    if (!submitted) return;
    setErrors(validate({ title, slug, description, categoryType, parentCategoryId, thumbnailAlt, thumbnail: thumbnailFile, hoverThumbnail: hoverFile }));
  }, [title, slug, description, categoryType, parentCategoryId, thumbnailAlt, thumbnailFile, hoverFile, submitted]);

  // ── auto-generate slug from title ────────────────────────────────────────
  const handleTitleChange = (value: string) => {
    setTitle(value);
    // Only auto-fill slug if user hasn't manually edited it
    if (!submitted || !slug) {
      setSlug(
        value
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9\s-]/g, "")
          .replace(/\s+/g, "-")
          .replace(/-+/g, "-")
      );
    }
  };

  // ── submit ───────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);

    const fields: Fields = {
      title, slug, description, categoryType, parentCategoryId, thumbnailAlt,
      thumbnail: thumbnailFile,
      hoverThumbnail: hoverFile,
    };

    const validationErrors = validate(fields);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      toast.error("Please fix the errors before submitting.");
      return;
    }

    setCreating(true);

    const toastId = toast.loading("Creating category…");

    try {
      const formData = new FormData();
      formData.append("title",           title.trim());
      formData.append("slug",            slug.trim());
      formData.append("description",     description.trim());
      formData.append("categoryType",    categoryType);
      if (categoryType === "child") {
        formData.append("parentCategoryId", parentCategoryId);
      }
      formData.append("thumbnailAlt",    thumbnailAlt.trim());
      formData.append("thumbnail",       thumbnailFile!);
      formData.append("hoverThumbnail",  hoverFile!);

      const response = await fetch("/api/admin/categories", {
        method: "POST",
        body: formData,
      });

      const result = (await response.json().catch(() => null)) as { error?: string } | null;

      if (!response.ok) {
        throw new Error(result?.error ?? "Unable to create category.");
      }

      toast.success("Category created successfully.", { id: toastId });

      // Reset form
      setTitle("");
      setSlug("");
      setDescription("");
      setCategoryType("parent");
      setParentCategoryId("");
      setThumbnailAlt("");
      setThumbnailFile(null);
      setHoverFile(null);
      setErrors({});
      setSubmitted(false);

    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to create category.",
        { id: toastId }
      );
    } finally {
      setCreating(false);
    }
  };

  // ── loading state ────────────────────────────────────────────────────────
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

  const parentOptions: SelectOption[] = parentCategories.map((category) => ({
    value: category.id,
    label: category.title,
  }));

  // ── render ───────────────────────────────────────────────────────────────
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
                All fields are required.
              </p>
            </div>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit} noValidate>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-[#352a21]">
                Title <span className="text-[#b38d67]">*</span>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className={inputCls(!!errors.title)}
                  placeholder="Mugs"
                />
              </label>
              <FieldError msg={errors.title} />
            </div>

            {/* Slug */}
            <div>
              <label className="block text-sm font-medium text-[#352a21]">
                Slug <span className="text-[#b38d67]">*</span>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className={inputCls(!!errors.slug)}
                  placeholder="mugs"
                />
              </label>
              <p className="mt-1 text-xs text-[#8a7765]">
                Auto-generated from title. Lowercase letters, numbers, and hyphens only.
              </p>
              <FieldError msg={errors.slug} />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-[#352a21]">
                Description <span className="text-[#b38d67]">*</span>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className={`${inputCls(!!errors.description)} min-h-[120px] resize-y`}
                  placeholder="Everyday forms with soft handles and warm glazes for slow mornings."
                />
              </label>
              <FieldError msg={errors.description} />
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-[#352a21]">
                  Category Type <span className="text-[#b38d67]">*</span>
                </label>
                <div className="mt-2">
                  <AppSelect<SelectOption<"parent" | "child">>
                    instanceId="create-category-type"
                    value={categoryTypeOptions.find((option) => option.value === categoryType)}
                    options={categoryTypeOptions}
                    onChange={(option) => {
                      const nextType = option?.value ?? "parent";
                      setCategoryType(nextType);
                      if (nextType === "parent") setParentCategoryId("");
                    }}
                    isSearchable={false}
                  />
                </div>
              </div>

              {categoryType === "child" && (
                <div>
                  <label className="block text-sm font-medium text-[#352a21]">
                    Parent Category <span className="text-[#b38d67]">*</span>
                  </label>
                  <div className="mt-2">
                    <AppSelect
                      instanceId="create-parent-category"
                      value={parentOptions.find((option) => option.value === parentCategoryId) ?? null}
                      options={parentOptions}
                      onChange={(option) => setParentCategoryId(option?.value ?? "")}
                      placeholder="Select parent category"
                      invalid={!!errors.parentCategoryId}
                      noOptionsMessage={() => "No parent categories found"}
                    />
                  </div>
                  <FieldError msg={errors.parentCategoryId} />
                </div>
              )}
            </div>

            {/* Alt text */}
            <div>
              <label className="block text-sm font-medium text-[#352a21]">
                Thumbnail Alt Text <span className="text-[#b38d67]">*</span>
                <input
                  type="text"
                  value={thumbnailAlt}
                  onChange={(e) => setThumbnailAlt(e.target.value)}
                  className={inputCls(!!errors.thumbnailAlt)}
                  placeholder="Handcrafted ceramic mugs"
                />
              </label>
              <p className="mt-1 text-xs text-[#8a7765]">
                Describes the image for accessibility and SEO.
              </p>
              <FieldError msg={errors.thumbnailAlt} />
            </div>

            {/* Image uploaders */}
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <ImageUploader
                  label="Default Thumbnail"
                  hint="Shown in the category card at rest"
                  file={thumbnailFile}
                  onChange={(f) => setThumbnailFile(f)}
                  onRemove={() => setThumbnailFile(null)}
                  required
                  hasError={!!errors.thumbnail}
                />
                <FieldError msg={errors.thumbnail} />
              </div>
              <div>
                <ImageUploader
                  label="Hover Thumbnail"
                  hint="Shown when the user hovers the card"
                  file={hoverFile}
                  onChange={(f) => setHoverFile(f)}
                  onRemove={() => setHoverFile(null)}
                  required
                  hasError={!!errors.hoverThumbnail}
                />
                <FieldError msg={errors.hoverThumbnail} />
              </div>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              size="lg"
              disabled={creating}
              className="h-12 rounded-full bg-[#1b1511] px-10 text-[#f8f2e8] hover:bg-[#2a211a] disabled:opacity-60"
            >
              {creating ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating…
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
