"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { HeartHandshake, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ImageUploader } from "@/components/ui/image-uploader";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

type Fields = {
  eyebrow: string;
  title: string;
  descriptionPrimary: string;
  descriptionSecondary: string;
  imageAlt: string;
  image: File | null;
  buttonLabel: string;
  buttonHref: string;
};

type FieldErrors = Partial<Record<keyof Fields, string>>;

const inputBase =
  "mt-2 w-full rounded-2xl border bg-white px-4 py-3 text-sm text-[#1b1511] outline-none transition placeholder:text-[#a69280] focus:ring-4 focus:ring-[#d7b68b]/20";

function inputCls(hasError: boolean) {
  return `${inputBase} ${
    hasError
      ? "border-red-400 focus:border-red-400"
      : "border-[#d9ccbc] focus:border-[#b38d67]"
  }`;
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="mt-1.5 text-xs text-red-500">{msg}</p>;
}

function validate(fields: Fields): FieldErrors {
  const errors: FieldErrors = {};
  if (!fields.eyebrow.trim()) errors.eyebrow = "Eyebrow is required.";
  if (!fields.title.trim()) errors.title = "Title is required.";
  if (!fields.descriptionPrimary.trim()) errors.descriptionPrimary = "Primary description is required.";
  if (!fields.descriptionSecondary.trim()) errors.descriptionSecondary = "Secondary description is required.";
  if (!fields.imageAlt.trim()) errors.imageAlt = "Image alt text is required.";
  if (!fields.image) errors.image = "Image is required.";
  if (!fields.buttonLabel.trim()) errors.buttonLabel = "Button label is required.";
  if (!fields.buttonHref.trim()) errors.buttonHref = "Button link is required.";
  return errors;
}

export default function CreateAboutSectionsForm() {
  const router = useRouter();
  const [checkingSession, setCheckingSession] = useState(true);
  const [creating, setCreating] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});

  const [eyebrow, setEyebrow] = useState("About the Creator");
  const [title, setTitle] = useState("Crafting Timeless Ceramics with Soul");
  const [descriptionPrimary, setDescriptionPrimary] = useState("");
  const [descriptionSecondary, setDescriptionSecondary] = useState("");
  const [imageAlt, setImageAlt] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [buttonLabel, setButtonLabel] = useState("Explore Collection");
  const [buttonHref, setButtonHref] = useState("/products");

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
  }, [router]);

  useEffect(() => {
    if (!submitted) return;
    setErrors(validate({ eyebrow, title, descriptionPrimary, descriptionSecondary, imageAlt, image: imageFile, buttonLabel, buttonHref }));
  }, [eyebrow, title, descriptionPrimary, descriptionSecondary, imageAlt, imageFile, buttonLabel, buttonHref, submitted]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
    const fields = { eyebrow, title, descriptionPrimary, descriptionSecondary, imageAlt, image: imageFile, buttonLabel, buttonHref };
    const validationErrors = validate(fields);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      toast.error("Please fill all required about section fields.");
      return;
    }

    setCreating(true);
    const toastId = toast.loading("Creating about section...");

    try {
      const formData = new FormData();
      formData.append("eyebrow", eyebrow.trim());
      formData.append("title", title.trim());
      formData.append("descriptionPrimary", descriptionPrimary.trim());
      formData.append("descriptionSecondary", descriptionSecondary.trim());
      formData.append("imageAlt", imageAlt.trim());
      formData.append("image", imageFile!);
      formData.append("buttonLabel", buttonLabel.trim());
      formData.append("buttonHref", buttonHref.trim());

      const response = await fetch("/api/admin/about-sections", {
        method: "POST",
        body: formData,
      });
      const result = (await response.json().catch(() => null)) as { error?: string } | null;
      if (!response.ok) throw new Error(result?.error ?? "Unable to create about section.");

      toast.success("About section created successfully.", { id: toastId });
      router.replace("/admin/about-sections");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create about section.", { id: toastId });
    } finally {
      setCreating(false);
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
      <div className="mx-auto max-w-4xl">
        <section className="rounded-[32px] bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1b1511] text-[#f8f2e8]">
              <HeartHandshake className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-3xl tracking-[-0.03em] text-[#1b1511]">Create about section</h1>
              <p className="text-sm text-[#665b4f]">All fields are required.</p>
            </div>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit} noValidate>
            <label className="block text-sm font-medium text-[#352a21]">
              Eyebrow <span className="text-[#b38d67]">*</span>
              <input value={eyebrow} onChange={(event) => setEyebrow(event.target.value)} className={inputCls(!!errors.eyebrow)} />
            </label>
            <FieldError msg={errors.eyebrow} />

            <label className="block text-sm font-medium text-[#352a21]">
              Title <span className="text-[#b38d67]">*</span>
              <input value={title} onChange={(event) => setTitle(event.target.value)} className={inputCls(!!errors.title)} />
            </label>
            <FieldError msg={errors.title} />

            <label className="block text-sm font-medium text-[#352a21]">
              Primary description <span className="text-[#b38d67]">*</span>
              <textarea value={descriptionPrimary} onChange={(event) => setDescriptionPrimary(event.target.value)} className={`${inputCls(!!errors.descriptionPrimary)} min-h-[130px] resize-y`} />
            </label>
            <FieldError msg={errors.descriptionPrimary} />

            <label className="block text-sm font-medium text-[#352a21]">
              Secondary description <span className="text-[#b38d67]">*</span>
              <textarea value={descriptionSecondary} onChange={(event) => setDescriptionSecondary(event.target.value)} className={`${inputCls(!!errors.descriptionSecondary)} min-h-[100px] resize-y`} />
            </label>
            <FieldError msg={errors.descriptionSecondary} />

            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-[#352a21]">
                  Button label <span className="text-[#b38d67]">*</span>
                  <input value={buttonLabel} onChange={(event) => setButtonLabel(event.target.value)} className={inputCls(!!errors.buttonLabel)} />
                </label>
                <FieldError msg={errors.buttonLabel} />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#352a21]">
                  Button link <span className="text-[#b38d67]">*</span>
                  <input value={buttonHref} onChange={(event) => setButtonHref(event.target.value)} className={inputCls(!!errors.buttonHref)} placeholder="/products" />
                </label>
                <FieldError msg={errors.buttonHref} />
              </div>
            </div>

            <label className="block text-sm font-medium text-[#352a21]">
              Image alt text <span className="text-[#b38d67]">*</span>
              <input value={imageAlt} onChange={(event) => setImageAlt(event.target.value)} className={inputCls(!!errors.imageAlt)} placeholder="Pottery artist at work" />
            </label>
            <FieldError msg={errors.imageAlt} />

            <ImageUploader
              label="About Image"
              hint="Shown beside the homepage about text"
              file={imageFile}
              onChange={setImageFile}
              onRemove={() => setImageFile(null)}
              required
              hasError={!!errors.image}
            />
            <FieldError msg={errors.image} />

            <Button type="submit" size="lg" disabled={creating} className="h-12 rounded-full bg-[#1b1511] px-10 text-[#f8f2e8] hover:bg-[#2a211a] disabled:opacity-60">
              {creating ? <span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" />Creating...</span> : "Create about section"}
            </Button>
          </form>
        </section>
      </div>
    </div>
  );
}
