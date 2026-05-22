"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Pencil, Plus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ImageUploader } from "@/components/ui/image-uploader";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

type AboutSectionRow = {
  id: string;
  eyebrow: string;
  title: string;
  description_primary: string;
  description_secondary: string;
  image_url: string;
  image_alt: string;
  button_label: string;
  button_href: string;
};

type AboutSectionsManagerProps = {
  initialUserEmail: string;
  initialAboutSections: AboutSectionRow[];
};

const inputClassName =
  "mt-2 w-full border border-[#d9ccbc] bg-white px-4 py-3 text-sm text-[#1b1511] outline-none transition placeholder:text-[#a69280] focus:border-[#b38d67] focus:ring-4 focus:ring-[#d7b68b]/20";

export default function AboutSectionsManager({
  initialUserEmail,
  initialAboutSections,
}: AboutSectionsManagerProps) {
  const router = useRouter();
  const [section, setSection] = useState<AboutSectionRow | null>(initialAboutSections[0] ?? null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [editingSection, setEditingSection] = useState<AboutSectionRow | null>(null);
  const [editEyebrow, setEditEyebrow] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editDescriptionPrimary, setEditDescriptionPrimary] = useState("");
  const [editDescriptionSecondary, setEditDescriptionSecondary] = useState("");
  const [editImageAlt, setEditImageAlt] = useState("");
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editButtonLabel, setEditButtonLabel] = useState("");
  const [editButtonHref, setEditButtonHref] = useState("");
  const [updating, setUpdating] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

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

  const openEdit = (section: AboutSectionRow) => {
    setEditingSection(section);
    setEditEyebrow(section.eyebrow);
    setEditTitle(section.title);
    setEditDescriptionPrimary(section.description_primary);
    setEditDescriptionSecondary(section.description_secondary);
    setEditImageAlt(section.image_alt);
    setEditImageFile(null);
    setEditButtonLabel(section.button_label);
    setEditButtonHref(section.button_href);
    setEditError(null);
  };

  const closeEdit = () => {
    setEditingSection(null);
    setEditImageFile(null);
    setEditError(null);
  };

  const updateSection = async () => {
    if (!editingSection) return;
    if (!editEyebrow.trim() || !editTitle.trim() || !editDescriptionPrimary.trim() || !editDescriptionSecondary.trim() || !editImageAlt.trim() || !editButtonLabel.trim() || !editButtonHref.trim()) {
      setEditError("Please fill in all required fields.");
      return;
    }

    setUpdating(true);
    setEditError(null);

    try {
      const formData = new FormData();
      formData.append("eyebrow", editEyebrow.trim());
      formData.append("title", editTitle.trim());
      formData.append("descriptionPrimary", editDescriptionPrimary.trim());
      formData.append("descriptionSecondary", editDescriptionSecondary.trim());
      formData.append("imageAlt", editImageAlt.trim());
      formData.append("buttonLabel", editButtonLabel.trim());
      formData.append("buttonHref", editButtonHref.trim());
      if (editImageFile) formData.append("image", editImageFile);

      const response = await fetch(`/api/admin/about-sections/${editingSection.id}`, {
        method: "PUT",
        body: formData,
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result?.error ?? "Unable to update about section.");

      setSection({
        ...editingSection,
        eyebrow: editEyebrow,
        title: editTitle,
        description_primary: editDescriptionPrimary,
        description_secondary: editDescriptionSecondary,
        image_alt: editImageAlt,
        image_url: result.aboutSection.image_url || editingSection.image_url,
        button_label: editButtonLabel,
        button_href: editButtonHref,
      });
      closeEdit();
    } catch (error) {
      setEditError(error instanceof Error ? error.message : "Unable to update about section.");
    } finally {
      setUpdating(false);
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
        <div className="rounded-[32px] bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl tracking-[-0.03em] text-[#1b1511]">Manage About Section</h1>
              <p className="mt-2 text-sm text-[#665b4f]">
                This homepage section has one editable entry.
              </p>
            </div>
            {!section && (
              <Link href="/admin/create-about-sections" className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#1b1511] px-6 text-sm font-medium text-[#f8f2e8] transition hover:bg-[#2a211a]">
                <Plus className="h-4 w-4" />
                Create About Section
              </Link>
            )}
          </div>
        </div>

        <div className="mt-8 rounded-[32px] bg-white p-6 shadow-sm sm:p-8">
          <div className="overflow-x-auto">
            {section ? (
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b-2 border-[#d9ccbc]">
                    <th className="p-3 text-left text-xs font-semibold uppercase tracking-[0.25em] text-[#8a7765]">Image</th>
                    <th className="p-3 text-left text-xs font-semibold uppercase tracking-[0.25em] text-[#8a7765]">Title</th>
                    <th className="p-3 text-left text-xs font-semibold uppercase tracking-[0.25em] text-[#8a7765]">Content</th>
                    <th className="p-3 text-left text-xs font-semibold uppercase tracking-[0.25em] text-[#8a7765]">CTA</th>
                    <th className="p-3 text-center text-xs font-semibold uppercase tracking-[0.25em] text-[#8a7765]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-[#e8ddd1] transition hover:bg-[#fcfaf7]">
                      <td className="p-3">
                        <div className="relative h-16 w-20 overflow-hidden rounded-2xl border border-[#e8ddd1]">
                          <Image src={section.image_url} alt={section.image_alt} fill unoptimized className="object-cover" />
                        </div>
                      </td>
                      <td className="p-3">
                        <p className="text-xs uppercase tracking-[0.18em] text-[#8a7765]">{section.eyebrow}</p>
                        <p className="mt-1 text-sm font-medium text-[#1b1511]">{section.title}</p>
                      </td>
                      <td className="p-3 text-sm text-[#665b4f]">
                        <div className="max-w-md line-clamp-2">{section.description_primary}</div>
                      </td>
                      <td className="p-3 text-sm text-[#665b4f]">
                        <p>{section.button_label}</p>
                        <p className="text-xs text-[#8a7765]">{section.button_href}</p>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => openEdit(section)} className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#d9ccbc] text-[#1b1511] transition hover:bg-[#f5eee4]" title="Edit about section">
                            <Pencil className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                </tbody>
              </table>
            ) : (
              <div className="rounded-2xl border border-dashed border-[#d9ccbc] bg-[#fcfaf7] p-8 text-center text-sm leading-7 text-[#665b4f]">
                No about section exists yet. Create the single homepage about section.
              </div>
            )}
          </div>
        </div>

        {editingSection && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[32px] bg-white p-6 shadow-sm sm:p-8">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl tracking-[-0.03em] text-[#1b1511]">Edit About Section</h2>
                <button onClick={closeEdit} className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#d9ccbc] text-[#1b1511] transition hover:bg-[#f5eee4]">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="mt-6 space-y-5">
                <label className="block text-sm font-medium text-[#352a21]">Eyebrow<input value={editEyebrow} onChange={(event) => setEditEyebrow(event.target.value)} className={inputClassName} /></label>
                <label className="block text-sm font-medium text-[#352a21]">Title<input value={editTitle} onChange={(event) => setEditTitle(event.target.value)} className={inputClassName} /></label>
                <label className="block text-sm font-medium text-[#352a21]">Primary description<textarea value={editDescriptionPrimary} onChange={(event) => setEditDescriptionPrimary(event.target.value)} className={`${inputClassName} min-h-[120px] resize-y`} /></label>
                <label className="block text-sm font-medium text-[#352a21]">Secondary description<textarea value={editDescriptionSecondary} onChange={(event) => setEditDescriptionSecondary(event.target.value)} className={`${inputClassName} min-h-[100px] resize-y`} /></label>
                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="block text-sm font-medium text-[#352a21]">Button label<input value={editButtonLabel} onChange={(event) => setEditButtonLabel(event.target.value)} className={inputClassName} /></label>
                  <label className="block text-sm font-medium text-[#352a21]">Button link<input value={editButtonHref} onChange={(event) => setEditButtonHref(event.target.value)} className={inputClassName} /></label>
                </div>
                <label className="block text-sm font-medium text-[#352a21]">Image alt text<input value={editImageAlt} onChange={(event) => setEditImageAlt(event.target.value)} className={inputClassName} /></label>
                <ImageUploader label="About Image" hint="Leave empty to keep the current image" file={editImageFile} onChange={setEditImageFile} onRemove={() => setEditImageFile(null)} />
                {!editImageFile && (
                  <div className="relative h-36 w-full overflow-hidden rounded-2xl border border-[#e8ddd1] bg-[#f5eee4]">
                    <Image src={editingSection.image_url} alt={editingSection.image_alt} fill unoptimized className="object-contain" />
                  </div>
                )}
                {editError && <p className="rounded-2xl border border-[#d7b68b] bg-[#faf4ea] px-4 py-3 text-sm text-[#7a4d1d]">{editError}</p>}
                <div className="flex gap-3">
                  <Button type="button" onClick={updateSection} disabled={updating} className="h-12 flex-1 rounded-full bg-[#1b1511] text-[#f8f2e8] hover:bg-[#2a211a]">
                    {updating ? <span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" />Updating...</span> : "Update About Section"}
                  </Button>
                  <Button type="button" onClick={closeEdit} variant="outline" className="h-12 rounded-full border-[#d9ccbc] bg-transparent text-[#1b1511] hover:bg-[#f5eee4]">Cancel</Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
