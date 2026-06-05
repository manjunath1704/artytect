"use client";

import { useState } from "react";
import Image from "next/image";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { ImageUploader } from "@/components/ui/image-uploader";

type HeroData = {
  id?: string;
  title: string;
  subtitle: string;
  hero_image_url: string;
  hero_image_alt: string;
} | null;

type HeroSectionProps = {
  hero: HeroData;
  onUpdate: (hero: HeroData) => void;
};

const inputClassName =
  "mt-2 w-full rounded-[24px] border border-[#d9ccbc] bg-white px-4 py-3 text-sm text-[#1b1511] outline-none transition placeholder:text-[#a69280] focus:border-[#b38d67] focus:ring-4 focus:ring-[#d7b68b]/20";

export default function HeroSection({ hero, onUpdate }: HeroSectionProps) {
  const [form, setForm] = useState({
    title: hero?.title || "Our Story",
    subtitle: hero?.subtitle || "",
    hero_image_url: hero?.hero_image_url || "",
    hero_image_alt: hero?.hero_image_alt || "Our Story Hero Image",
  });
  const [heroImage, setHeroImage] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!form.title) {
      toast.error("Title is required");
      return;
    }

    setSaving(true);
    const toastId = toast.loading("Saving hero section...");

    try {
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("subtitle", form.subtitle);
      formData.append("hero_image_alt", form.hero_image_alt);
      formData.append("existing_hero_image_url", form.hero_image_url);
      if (heroImage) {
        formData.append("hero_image", heroImage);
      }
      if (hero?.id) {
        formData.append("id", hero.id);
      }

      const response = await fetch("/api/admin/our-story/hero", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to save hero section");
      }

      onUpdate(result.hero);
      setForm({
        title: result.hero.title,
        subtitle: result.hero.subtitle,
        hero_image_url: result.hero.hero_image_url,
        hero_image_alt: result.hero.hero_image_alt,
      });
      setHeroImage(null);
      toast.success("Hero section saved successfully", { id: toastId });
    } catch (error) {
      console.error("Error saving hero section:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to save hero section",
        { id: toastId }
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[#1b1511]">
        Hero Section
      </h2>
      <p className="mt-2 text-sm text-[#6b5f55]">
        Configure the hero section at the top of the Our Story page
      </p>

      <div className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-[#352a21]">
            Title
          </label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className={inputClassName}
            placeholder="Our Story"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#352a21]">
            Subtitle
          </label>
          <textarea
            value={form.subtitle}
            onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
            rows={3}
            className={inputClassName}
            placeholder="A brief tagline or description"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#352a21]">
            Hero Image Alt Text
          </label>
          <input
            type="text"
            value={form.hero_image_alt}
            onChange={(e) =>
              setForm({ ...form, hero_image_alt: e.target.value })
            }
            className={inputClassName}
            placeholder="Our Story Hero Image"
          />
        </div>

        <div>
          <ImageUploader
            label="Hero Image"
            file={heroImage}
            onChange={setHeroImage}
            onRemove={() => setHeroImage(null)}
            hint={
              form.hero_image_url
                ? "Current image will be kept unless replaced"
                : undefined
            }
          />
          {form.hero_image_url && !heroImage && (
            <div className="mt-3 relative h-48 w-full overflow-hidden rounded-2xl">
              <Image
                src={form.hero_image_url}
                alt="Current hero image"
                fill
                className="object-cover"
              />
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex h-12 items-center gap-2 rounded-full bg-[#1b1511] px-6 text-[11px] font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-[#2d2319] disabled:opacity-60"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Hero Section
          </button>
        </div>
      </div>
    </div>
  );
}
