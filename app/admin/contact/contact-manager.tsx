"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, Plus, X } from "lucide-react";
import { toast } from "sonner";

import { ImageUploader } from "@/components/ui/image-uploader";
import type { ContactPageData } from "./page";

const emptyForm = {
  hero_subtitle: "Contact us",
  hero_title: "Let's shape something thoughtful",
  hero_description: "Reach out for custom pottery, collection questions, collaborations, or studio visits. We usually reply within one business day.",
  hero_image_url: "",
  email: "hello@Haritham.com",
  phone: "+91 98765 43210",
  map_embed_url: "",
};

export default function ContactPageManager({ initialData }: { initialData: ContactPageData | null }) {
  const [form, setForm] = useState(initialData || emptyForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);
console.log(form,'form')
  const saveContact = async () => {
    setSaving(true);
    const toastId = toast.loading(initialData ? "Updating contact page..." : "Creating contact page...");
    try {
      const formData = new FormData();
      formData.append("hero_subtitle", form.hero_subtitle);
      formData.append("hero_title", form.hero_title);
      formData.append("hero_description", form.hero_description);
      formData.append("email", form.email);
      formData.append("phone", form.phone);
      formData.append("map_embed_url", form.map_embed_url);
      if (form.hero_image_url) formData.append("existing_image_url", form.hero_image_url);
      if (imageFile) formData.append("hero_image", imageFile);

      const response = await fetch(
        initialData ? `/api/admin/contact/${initialData.id}` : "/api/admin/contact",
        {
          method: initialData ? "PUT" : "POST",
          body: formData,
        }
      );

      const result = await response.json();
      if (!response.ok) throw new Error(result?.error ?? "Unable to save contact page.");

      setForm(result.data);
      setImageFile(null);
      setIsFormOpen(false);
      toast.success(initialData ? "Contact page updated." : "Contact page created.", { id: toastId });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save contact page.", { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="px-6 py-8 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <section className="flex flex-wrap items-center justify-between gap-4 rounded-[32px] bg-white p-6 shadow-sm">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-[#8a7765]">Page management</p>
            <h1 className="mt-2 text-4xl tracking-[-0.04em] text-[#1b1511]">Contact Page</h1>
          </div>
          <button
            onClick={() => setIsFormOpen(true)}
            className="inline-flex h-12 items-center gap-2 rounded-full bg-[#1b1511] px-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white"
          >
            <Plus className="h-4 w-4" /> Edit content
          </button>
        </section>

        <AnimatePresence>
          {isFormOpen && (
            <motion.section
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 18 }}
              className="mt-6 rounded-[32px] bg-white p-6 shadow-sm sm:p-8"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-3xl tracking-[-0.03em] text-[#1b1511]">Edit contact page</h2>
                  <p className="mt-2 text-sm text-[#665b4f]">Manage hero section, contact details, and map embed URL.</p>
                </div>
                <button
                  onClick={() => setIsFormOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f5eee4] text-[#1b1511] transition hover:bg-[#e8ddd1]"
                  aria-label="Close form"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
                <div className="grid gap-5">
                  <div className="grid gap-4 sm:grid-cols-3">
                    <label className="block">
                      <span className="text-sm font-medium text-[#352a21]">Hero Subtitle</span>
                      <input
                        type="text"
                        value={form.hero_subtitle}
                        onChange={(event) => setForm((c) => ({ ...c, hero_subtitle: event.target.value }))}
                        className="mt-2 h-11 rounded-[32px] border border-[#d9ccbc] bg-white px-4 py-3 text-sm text-[#1b1511] outline-none transition placeholder:text-[#a69280] focus:border-[#b38d67] focus:ring-4 focus:ring-[#d7b68b]/20"
                      />
                    </label>
                    <label className="block sm:col-span-2">
                      <span className="text-sm font-medium text-[#352a21]">Hero Title</span>
                      <input
                        type="text"
                        value={form.hero_title}
                        onChange={(event) => setForm((c) => ({ ...c, hero_title: event.target.value }))}
                        className="mt-2 h-11 rounded-[32px] border border-[#d9ccbc] bg-white px-4 py-3 text-sm text-[#1b1511] outline-none transition placeholder:text-[#a69280] focus:border-[#b38d67] focus:ring-4 focus:ring-[#d7b68b]/20"
                      />
                    </label>
                  </div>

                  <label className="block">
                    <span className="text-sm font-medium text-[#352a21]">Hero Description</span>
                    <textarea
                      value={form.hero_description}
                      onChange={(event) => setForm((c) => ({ ...c, hero_description: event.target.value }))}
                      rows={4}
                      className="mt-2 w-full rounded-[32px] border border-[#d9ccbc] bg-white px-4 py-3 text-sm text-[#1b1511] outline-none transition placeholder:text-[#a69280] focus:border-[#b38d67] focus:ring-4 focus:ring-[#d7b68b]/20"
                    />
                  </label>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block">
                      <span className="text-sm font-medium text-[#352a21]">Email</span>
                      <input
                        type="email"
                        value={form.email}
                        onChange={(event) => setForm((c) => ({ ...c, email: event.target.value }))}
                        className="mt-2 h-11 rounded-[32px] border border-[#d9ccbc] bg-white px-4 py-3 text-sm text-[#1b1511] outline-none transition placeholder:text-[#a69280] focus:border-[#b38d67] focus:ring-4 focus:ring-[#d7b68b]/20"
                      />
                    </label>
                    <label className="block">
                      <span className="text-sm font-medium text-[#352a21]">Phone</span>
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={(event) => setForm((c) => ({ ...c, phone: event.target.value }))}
                        className="mt-2 h-11 rounded-[32px] border border-[#d9ccbc] bg-white px-4 py-3 text-sm text-[#1b1511] outline-none transition placeholder:text-[#a69280] focus:border-[#b38d67] focus:ring-4 focus:ring-[#d7b68b]/20"
                      />
                    </label>
                  </div>

                  <label className="block">
                    <span className="text-sm font-medium text-[#352a21]">Map Embed URL (Google Maps iframe src)</span>
                    <input
                      type="text"
                      value={form.map_embed_url}
                      onChange={(event) => setForm((c) => ({ ...c, map_embed_url: event.target.value }))}
                      placeholder="https://www.google.com/maps/embed?pb=..."
                      className="mt-2 h-11 rounded-[32px] border border-[#d9ccbc] bg-white px-4 py-3 text-sm text-[#1b1511] outline-none transition placeholder:text-[#a69280] focus:border-[#b38d67] focus:ring-4 focus:ring-[#d7b68b]/20"
                    />
                  </label>
                </div>

                <aside className="space-y-4">
                  <div className="rounded-[32px] border border-[#e8ddd1] bg-[#fcfaf7] p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-sm font-medium text-[#352a21]">Hero Image</p>
                        <p className="text-xs text-[#8a7765] mt-1">Drag & drop or click to upload new image</p>
                      </div>
                      {form.hero_image_url && !imageFile && (
                        <div className="flex items-center gap-2 px-3 py-1 bg-[#f5eee4] rounded-full">
                          <div className="h-2 w-2 rounded-full bg-green-500"></div>
                          <span className="text-xs text-[#352a21]">Current image set</span>
                        </div>
                      )}
                    </div>
                    <ImageUploader
                      label=""
                      hint="JPG, PNG, or WebP. Max 5MB"
                      file={imageFile}
                      onChange={setImageFile}
                      onRemove={() => setImageFile(null)}
                    />
                    
                    <div className="mt-4 pt-4 border-t border-[#e8ddd1]">
                      <p className="text-xs font-medium text-[#352a21] mb-3">Current Hero Image</p>
                      
                      <div className="relative aspect-[1.35/1] overflow-hidden rounded-[32px] bg-[#e8dfd2] mb-3">
                        {form.hero_image_url ? (
                          <img
                            src={form.hero_image_url}
                            alt="Current hero image"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-[#8a7765]">
                            <p className="text-sm">No hero image set</p>
                          </div>
                        )}
                      </div>
                      
                      {imageFile && (
                        <>
                          <p className="text-xs font-medium text-[#352a21] mb-2">New Image Preview</p>
                          <div className="relative aspect-[1.35/1] overflow-hidden rounded-[32px] bg-[#e8dfd2] mb-3">
                            <img
                              src={URL.createObjectURL(imageFile)}
                              alt="New hero image preview"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <p className="text-xs text-[#8a7765] mb-4">This new image will replace the current one when saved</p>
                        </>
                      )}
                      
                      <p className="text-xs text-[#665b4f]">
                        Hero images display with 1.35:1 aspect ratio and rounded corners on the contact page.
                      </p>
                    </div>
                  </div>
                </aside>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setIsFormOpen(false)}
                  className="inline-flex h-12 items-center gap-2 rounded-full border border-[#d9ccbc] px-6 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#1b1511] transition hover:bg-[#f5eee4]"
                >
                  Cancel
                </button>
                <button
                  disabled={saving}
                  onClick={saveContact}
                  className="inline-flex h-12 items-center gap-2 rounded-full bg-[#1b1511] px-6 text-[11px] font-semibold uppercase tracking-[0.18em] text-white disabled:opacity-60"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Save changes
                </button>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {form && (
          <section className="mt-6 rounded-[32px] bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[#1b1511]">Current Content</h2>

            <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_1fr]">
              <div className="space-y-4">
                <div className="rounded-[24px] border border-[#e8ddd1] bg-[#fcfaf7] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8a7765]">Hero Section</p>
                  <div className="mt-3 space-y-2">
                    <p className="text-xs text-[#8a7765]">Subtitle: <span className="font-semibold text-[#1b1511]">{form.hero_subtitle}</span></p>
                    <p className="text-xs text-[#8a7765]">Title: <span className="font-semibold text-[#1b1511]">{form.hero_title}</span></p>
                    <p className="text-xs text-[#8a7765]">Description:</p>
                    <p className="text-sm text-[#1b1511]">{form.hero_description}</p>
                    {/* <div className="mt-3 pt-3 border-t border-[#e8ddd1]">
                      <p className="text-xs text-[#8a7765] mb-2">Hero Image:</p>
                      {form.hero_image_url ? (
                        <div className="relative aspect-[1.35/1] overflow-hidden rounded-[32px] bg-[#e8dfd2]">
                          <img
                            src={form.hero_image_url}
                            alt="Current hero image"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="relative aspect-[1.35/1] overflow-hidden rounded-[32px] bg-[#e8dfd2] flex items-center justify-center">
                          <p className="text-sm text-[#8a7765]">No hero image set</p>
                        </div>
                      )}
                     
                    </div> */}
                  </div>
                </div>

                <div className="rounded-[24px] border border-[#e8ddd1] bg-[#fcfaf7] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8a7765]">Contact Details</p>
                  <div className="mt-3 space-y-2">
                    <p className="text-sm"><span className="text-xs font-semibold text-[#8a7765]">Email:</span> <span className="text-[#1b1511]">{form.email}</span></p>
                    <p className="text-sm"><span className="text-xs font-semibold text-[#8a7765]">Phone:</span> <span className="text-[#1b1511]">{form.phone}</span></p>
                  </div>
                </div>

                {form.map_embed_url && (
                  <div className="rounded-[24px] border border-[#e8ddd1] bg-[#fcfaf7] p-4">
                    <p className="text-xs mb-3 font-semibold uppercase tracking-[0.2em] text-[#8a7765]">Map Embed</p>
                    {/* <p className="mt-2 text-xs text-[#665b4f] break-all"></p> */}
                  <iframe src={form.map_embed_url} className="h-[300px] w-full rounded-[30px]"/>
                  </div>
                )}
              </div>

              <div className="rounded-[24px] border border-[#e8ddd1] bg-[#fcfaf7] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8a7765] mb-4">Hero Image Preview</p>
                <div className="relative aspect-[1.35/1] overflow-hidden rounded-[32px] bg-[#e8dfd2]">
                  {form.hero_image_url ? (
                    <img
                      src={form.hero_image_url}
                      alt="Hero image preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-[#8a7765]">
                      <div className="text-center">
                        <div className="mx-auto mb-2 h-10 w-10 rounded-full bg-[#d9ccbc] flex items-center justify-center">
                          <span className="text-lg">📷</span>
                        </div>
                        <p className="text-sm font-medium">No hero image set</p>
                        <p className="text-xs mt-1">Default image will be used</p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="mt-4 text-xs text-[#665b4f]">
                  <p>Hero image displays with 1.35:1 aspect ratio and rounded corners on the contact page.</p>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
