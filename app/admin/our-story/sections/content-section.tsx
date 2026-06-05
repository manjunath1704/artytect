"use client";

import { useState } from "react";
import Image from "next/image";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { ImageUploader } from "@/components/ui/image-uploader";

type ContentData = {
  id?: string;
  who_we_are_title: string;
  who_we_are_content: string;
  who_we_are_image_url: string | null;
  journey_title: string;
  journey_content: string;
  journey_image_url: string | null;
  mission_title: string;
  mission_content: string;
  vision_title: string;
  vision_content: string;
} | null;

type ContentSectionProps = {
  content: ContentData;
  onUpdate: (content: ContentData) => void;
};

const inputClassName =
  "mt-2 w-full rounded-[24px] border border-[#d9ccbc] bg-white px-4 py-3 text-sm text-[#1b1511] outline-none transition placeholder:text-[#a69280] focus:border-[#b38d67] focus:ring-4 focus:ring-[#d7b68b]/20";

export default function ContentSection({ content, onUpdate }: ContentSectionProps) {
  const [form, setForm] = useState({
    who_we_are_title: content?.who_we_are_title || "Who We Are",
    who_we_are_content: content?.who_we_are_content || "",
    who_we_are_image_url: content?.who_we_are_image_url || "",
    journey_title: content?.journey_title || "Our Journey",
    journey_content: content?.journey_content || "",
    journey_image_url: content?.journey_image_url || "",
    mission_title: content?.mission_title || "Our Mission",
    mission_content: content?.mission_content || "",
    vision_title: content?.vision_title || "Our Vision",
    vision_content: content?.vision_content || "",
  });
  const [whoWeAreImage, setWhoWeAreImage] = useState<File | null>(null);
  const [journeyImage, setJourneyImage] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const toastId = toast.loading("Saving content...");

    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        formData.append(key, value || "");
      });
      if (content?.id) {
        formData.append("id", content.id);
      }
      if (whoWeAreImage) {
        formData.append("who_we_are_image", whoWeAreImage);
      }
      if (journeyImage) {
        formData.append("journey_image", journeyImage);
      }

      const response = await fetch("/api/admin/our-story/content", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to save content");
      }

      onUpdate(result.content);
      setForm({
        who_we_are_title: result.content.who_we_are_title,
        who_we_are_content: result.content.who_we_are_content,
        who_we_are_image_url: result.content.who_we_are_image_url,
        journey_title: result.content.journey_title,
        journey_content: result.content.journey_content,
        journey_image_url: result.content.journey_image_url,
        mission_title: result.content.mission_title,
        mission_content: result.content.mission_content,
        vision_title: result.content.vision_title,
        vision_content: result.content.vision_content,
      });
      setWhoWeAreImage(null);
      setJourneyImage(null);
      toast.success("Content saved successfully", { id: toastId });
    } catch (error) {
      console.error("Error saving content:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to save content",
        { id: toastId }
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[#1b1511]">
        Brand Story Content
      </h2>
      <p className="mt-2 text-sm text-[#6b5f55]">
        Configure the main content sections of your story
      </p>

      <div className="mt-6 space-y-8">
        {/* Who We Are */}
        <div className="rounded-2xl border border-[#d9ccbc] bg-[#faf6f2] p-6">
          <h3 className="text-lg font-semibold text-[#1b1511]">Who We Are</h3>
          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#352a21]">
                Section Title
              </label>
              <input
                type="text"
                value={form.who_we_are_title}
                onChange={(e) =>
                  setForm({ ...form, who_we_are_title: e.target.value })
                }
                className={inputClassName}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#352a21]">
                Content
              </label>
              <textarea
                value={form.who_we_are_content}
                onChange={(e) =>
                  setForm({ ...form, who_we_are_content: e.target.value })
                }
                rows={4}
                className={inputClassName}
              />
            </div>
            <div>
              <ImageUploader
                label="Section Image"
                file={whoWeAreImage}
                onChange={setWhoWeAreImage}
                onRemove={() => setWhoWeAreImage(null)}
                hint={
                  form.who_we_are_image_url
                    ? "Current image will be kept unless replaced"
                    : undefined
                }
              />
              {form.who_we_are_image_url && !whoWeAreImage && (
                <div className="mt-3 relative h-48 w-full overflow-hidden rounded-2xl">
                  <Image
                    src={form.who_we_are_image_url}
                    alt="Current who we are image"
                    fill
                    className="object-cover"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Journey */}
        <div className="rounded-2xl border border-[#d9ccbc] bg-[#faf6f2] p-6">
          <h3 className="text-lg font-semibold text-[#1b1511]">Our Journey</h3>
          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#352a21]">
                Section Title
              </label>
              <input
                type="text"
                value={form.journey_title}
                onChange={(e) =>
                  setForm({ ...form, journey_title: e.target.value })
                }
                className={inputClassName}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#352a21]">
                Content
              </label>
              <textarea
                value={form.journey_content}
                onChange={(e) =>
                  setForm({ ...form, journey_content: e.target.value })
                }
                rows={4}
                className={inputClassName}
              />
            </div>
            <div>
              <ImageUploader
                label="Section Image"
                file={journeyImage}
                onChange={setJourneyImage}
                onRemove={() => setJourneyImage(null)}
                hint={
                  form.journey_image_url
                    ? "Current image will be kept unless replaced"
                    : undefined
                }
              />
              {form.journey_image_url && !journeyImage && (
                <div className="mt-3 relative h-48 w-full overflow-hidden rounded-2xl">
                  <Image
                    src={form.journey_image_url}
                    alt="Current journey image"
                    fill
                    className="object-cover"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mission & Vision */}
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-[#d9ccbc] bg-[#faf6f2] p-6">
            <h3 className="text-lg font-semibold text-[#1b1511]">Mission</h3>
            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#352a21]">
                  Title
                </label>
                <input
                  type="text"
                  value={form.mission_title}
                  onChange={(e) =>
                    setForm({ ...form, mission_title: e.target.value })
                  }
                  className={inputClassName}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#352a21]">
                  Content
                </label>
                <textarea
                  value={form.mission_content}
                  onChange={(e) =>
                    setForm({ ...form, mission_content: e.target.value })
                  }
                  rows={4}
                  className={inputClassName}
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[#d9ccbc] bg-[#faf6f2] p-6">
            <h3 className="text-lg font-semibold text-[#1b1511]">Vision</h3>
            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#352a21]">
                  Title
                </label>
                <input
                  type="text"
                  value={form.vision_title}
                  onChange={(e) =>
                    setForm({ ...form, vision_title: e.target.value })
                  }
                  className={inputClassName}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#352a21]">
                  Content
                </label>
                <textarea
                  value={form.vision_content}
                  onChange={(e) =>
                    setForm({ ...form, vision_content: e.target.value })
                  }
                  rows={4}
                  className={inputClassName}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex h-12 items-center gap-2 rounded-full bg-[#1b1511] px-6 text-[11px] font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-[#2d2319] disabled:opacity-60"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Content
          </button>
        </div>
      </div>
    </div>
  );
}
