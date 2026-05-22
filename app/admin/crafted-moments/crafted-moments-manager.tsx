"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Film, Loader2, Pencil, Plus, Sparkles, Trash2, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";
import { ImageUploader } from "@/components/ui/image-uploader";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

type CraftedMomentsHeader = {
  id?: string;
  eyebrow: string;
  title: string;
  description: string;
};

type CraftedMomentItemRow = {
  id: string;
  type: "image" | "video";
  title: string;
  caption: string;
  media_url: string;
  poster_url: string;
  label: string;
  is_featured: boolean;
  sort_order: number;
};

type CraftedMomentsManagerProps = {
  initialUserEmail: string;
  initialHeader: CraftedMomentsHeader;
  initialItems: CraftedMomentItemRow[];
};

const inputClassName =
  "mt-2 w-full rounded-2xl border border-[#d9ccbc] bg-white px-4 py-3 text-sm text-[#1b1511] outline-none transition placeholder:text-[#a69280] focus:border-[#b38d67] focus:ring-4 focus:ring-[#d7b68b]/20";

const emptyItem = {
  type: "image" as "image" | "video",
  title: "",
  caption: "",
  label: "Studio study",
  sortOrder: "1",
  isFeatured: false,
  mediaFile: null as File | null,
  posterFile: null as File | null,
};

function MediaFileInput({
  label,
  hint,
  accept,
  file,
  onChange,
  onRemove,
  required,
}: {
  label: string;
  hint?: string;
  accept: string;
  file: File | null;
  onChange: (file: File) => void;
  onRemove: () => void;
  required?: boolean;
}) {
  return (
    <div className="space-y-2">
      <div>
        <p className="text-sm font-medium text-[#352a21]">
          {label}
          {required && <span className="ml-0.5 text-[#b38d67]">*</span>}
        </p>
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
          <span className="text-sm font-medium text-[#1b1511]">Click to upload</span>
          <span className="text-xs text-[#8a7765]">{accept.split(",").join(", ")}</span>
          <input
            type="file"
            accept={accept}
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) onChange(file);
              event.target.value = "";
            }}
          />
        </label>
      )}
    </div>
  );
}

export default function CraftedMomentsManager({
  initialUserEmail,
  initialHeader,
  initialItems,
}: CraftedMomentsManagerProps) {
  const router = useRouter();
  const [checkingSession, setCheckingSession] = useState(true);
  const [headerEyebrow, setHeaderEyebrow] = useState(initialHeader.eyebrow);
  const [headerTitle, setHeaderTitle] = useState(initialHeader.title);
  const [headerDescription, setHeaderDescription] = useState(initialHeader.description);
  const [savingHeader, setSavingHeader] = useState(false);
  const [items, setItems] = useState(initialItems);
  const [itemForm, setItemForm] = useState(emptyItem);
  const [editingItem, setEditingItem] = useState<CraftedMomentItemRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CraftedMomentItemRow | null>(null);
  const [savingItem, setSavingItem] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

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

  const resetItemForm = () => {
    setItemForm({
      ...emptyItem,
      sortOrder: String(items.length + 1),
    });
    setEditingItem(null);
  };

  const openCreateItem = () => {
    const sortOrder = items.length + 1;
    setItemForm({
      ...emptyItem,
      sortOrder: String(sortOrder),
      isFeatured: items.length === 0,
      label: items.length === 0 ? "Featured process" : "Studio study",
    });
    setEditingItem({
      id: "",
      type: "image",
      title: "",
      caption: "",
      media_url: "",
      poster_url: "",
      label: "",
      is_featured: items.length === 0,
      sort_order: sortOrder,
    });
  };

  const openEditItem = (item: CraftedMomentItemRow) => {
    setEditingItem(item);
    setItemForm({
      type: item.type,
      title: item.title,
      caption: item.caption,
      label: item.label,
      sortOrder: String(item.sort_order),
      isFeatured: item.is_featured,
      mediaFile: null,
      posterFile: null,
    });
  };

  const saveHeader = async () => {
    if (!headerEyebrow.trim() || !headerTitle.trim() || !headerDescription.trim()) {
      toast.error("Crafted moments eyebrow, title, and description are required.");
      return;
    }

    setSavingHeader(true);
    const toastId = toast.loading("Saving crafted moments title...");
    try {
      const response = await fetch("/api/admin/crafted-moments-section", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eyebrow: headerEyebrow.trim(),
          title: headerTitle.trim(),
          description: headerDescription.trim(),
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result?.error ?? "Unable to save crafted moments title.");
      toast.success("Crafted moments title saved.", { id: toastId });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save crafted moments title.", { id: toastId });
    } finally {
      setSavingHeader(false);
    }
  };

  const saveItem = async () => {
    if (!editingItem) return;
    const isCreating = !editingItem.id;
    const sortOrder = Number(itemForm.sortOrder);

    if (!itemForm.title.trim() || !itemForm.caption.trim() || !itemForm.label.trim() || !Number.isFinite(sortOrder)) {
      toast.error("Please fill all required crafted moment fields.");
      return;
    }

    if (isCreating && !itemForm.mediaFile) {
      toast.error("Media is required for a new crafted moment.");
      return;
    }

    setSavingItem(true);
    const toastId = toast.loading(isCreating ? "Creating crafted moment..." : "Updating crafted moment...");

    try {
      const formData = new FormData();
      formData.append("type", itemForm.type);
      formData.append("title", itemForm.title.trim());
      formData.append("caption", itemForm.caption.trim());
      formData.append("label", itemForm.label.trim());
      formData.append("sortOrder", String(sortOrder));
      formData.append("isFeatured", String(itemForm.isFeatured));
      if (itemForm.mediaFile) formData.append("media", itemForm.mediaFile);
      if (itemForm.posterFile) formData.append("poster", itemForm.posterFile);

      const response = await fetch(
        isCreating
          ? "/api/admin/crafted-moments-items"
          : `/api/admin/crafted-moments-items/${editingItem.id}`,
        {
          method: isCreating ? "POST" : "PUT",
          body: formData,
        },
      );
      const result = await response.json();
      if (!response.ok) throw new Error(result?.error ?? "Unable to save crafted moment.");

      const savedItem = {
        id: String(result.item.id),
        type: result.item.type === "video" ? "video" as const : "image" as const,
        title: result.item.title,
        caption: result.item.caption,
        media_url: result.item.media_url,
        poster_url: result.item.poster_url || "",
        label: result.item.label,
        is_featured: Boolean(result.item.is_featured),
        sort_order: Number(result.item.sort_order),
      };

      setItems((current) =>
        (isCreating
          ? [...current.map((item) => itemForm.isFeatured ? { ...item, is_featured: false } : item), savedItem]
          : current.map((item) => {
              if (item.id === savedItem.id) return savedItem;
              return itemForm.isFeatured ? { ...item, is_featured: false } : item;
            })
        ).sort((a, b) => a.sort_order - b.sort_order),
      );
      toast.success(isCreating ? "Crafted moment created." : "Crafted moment updated.", { id: toastId });
      resetItemForm();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save crafted moment.", { id: toastId });
    } finally {
      setSavingItem(false);
    }
  };

  const deleteItem = async () => {
    if (!deleteTarget) return;
    setDeleting(deleteTarget.id);
    try {
      const response = await fetch(`/api/admin/crafted-moments-items/${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result?.error ?? "Unable to delete crafted moment.");
      }
      setItems((current) => current.filter((item) => item.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to delete crafted moment.");
    } finally {
      setDeleting(null);
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
              <h1 className="text-3xl tracking-[-0.03em] text-[#1b1511]">Manage Crafted Moments</h1>
              <p className="text-sm text-[#665b4f]">Edit section copy and manage image or video tiles.</p>
            </div>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-[0.75fr_1fr]">
            <label className="block text-sm font-medium text-[#352a21]">
              Eyebrow
              <input value={headerEyebrow} onChange={(event) => setHeaderEyebrow(event.target.value)} className={inputClassName} />
            </label>
            <label className="block text-sm font-medium text-[#352a21]">
              Title
              <input value={headerTitle} onChange={(event) => setHeaderTitle(event.target.value)} className={inputClassName} />
            </label>
          </div>
          <label className="mt-5 block text-sm font-medium text-[#352a21]">
            Description
            <textarea value={headerDescription} onChange={(event) => setHeaderDescription(event.target.value)} className={`${inputClassName} min-h-[110px] resize-y`} />
          </label>
          <Button onClick={saveHeader} disabled={savingHeader} className="mt-5 h-11 rounded-full bg-[#1b1511] px-6 text-[#f8f2e8] hover:bg-[#2a211a]">
            {savingHeader ? "Saving..." : "Save Crafted Moments Titles"}
          </Button>
        </section>

        <section className="mt-8 rounded-[32px] bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl tracking-[-0.03em] text-[#1b1511]">Crafted Moment Items</h2>
              <p className="mt-1 text-sm text-[#665b4f]">{items.length} {items.length === 1 ? "item" : "items"} in this collection</p>
            </div>
            <Button onClick={openCreateItem} className="h-11 rounded-full bg-[#1b1511] px-6 text-[#f8f2e8] hover:bg-[#2a211a]">
              <Plus className="mr-2 h-4 w-4" />
              Create Item
            </Button>
          </div>

          <div className="mt-6 overflow-x-auto">
            {items.length ? (
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b-2 border-[#d9ccbc]">
                    <th className="p-3 text-left text-xs font-semibold uppercase tracking-[0.25em] text-[#8a7765]">Order</th>
                    <th className="p-3 text-left text-xs font-semibold uppercase tracking-[0.25em] text-[#8a7765]">Media</th>
                    <th className="p-3 text-left text-xs font-semibold uppercase tracking-[0.25em] text-[#8a7765]">Title</th>
                    <th className="p-3 text-left text-xs font-semibold uppercase tracking-[0.25em] text-[#8a7765]">Type</th>
                    <th className="p-3 text-left text-xs font-semibold uppercase tracking-[0.25em] text-[#8a7765]">Featured</th>
                    <th className="p-3 text-center text-xs font-semibold uppercase tracking-[0.25em] text-[#8a7765]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} className="border-b border-[#e8ddd1] transition hover:bg-[#fcfaf7]">
                      <td className="p-3 text-sm text-[#665b4f]">{item.sort_order}</td>
                      <td className="p-3">
                        <div className="relative h-16 w-24 overflow-hidden rounded-2xl border border-[#e8ddd1] bg-[#17110d]">
                          {item.type === "image" ? (
                            <Image src={item.media_url} alt={item.title} fill unoptimized className="object-cover" />
                          ) : item.poster_url ? (
                            <Image src={item.poster_url} alt={item.title} fill unoptimized className="object-cover" />
                          ) : (
                            <div className="flex h-full items-center justify-center text-white">
                              <Film className="h-5 w-5" />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        <p className="text-sm font-medium text-[#1b1511]">{item.title}</p>
                        <p className="mt-1 max-w-sm line-clamp-1 text-xs text-[#665b4f]">{item.caption}</p>
                      </td>
                      <td className="p-3 text-sm capitalize text-[#665b4f]">{item.type}</td>
                      <td className="p-3 text-sm text-[#665b4f]">{item.is_featured ? "Yes" : "No"}</td>
                      <td className="p-3">
                        <div className="flex justify-center gap-2">
                          <button onClick={() => openEditItem(item)} className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#d9ccbc] text-[#1b1511] transition hover:bg-[#f5eee4]">
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button onClick={() => setDeleteTarget(item)} className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#d9ccbc] text-[#7a4d1d] transition hover:bg-[#faf4ea]">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="rounded-2xl border border-dashed border-[#d9ccbc] bg-[#fcfaf7] p-8 text-center text-sm text-[#665b4f]">
                No crafted moments yet. Create the first item.
              </div>
            )}
          </div>
        </section>
      </div>

      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[32px] bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl tracking-[-0.03em] text-[#1b1511]">{editingItem.id ? "Edit" : "Create"} Crafted Moment</h2>
              <button onClick={resetItemForm} className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#d9ccbc] text-[#1b1511] transition hover:bg-[#f5eee4]">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-6 space-y-5">
              <div className="grid gap-5 sm:grid-cols-[1fr_140px]">
                <label className="block text-sm font-medium text-[#352a21]">
                  Title
                  <input value={itemForm.title} onChange={(event) => setItemForm((current) => ({ ...current, title: event.target.value }))} className={inputClassName} />
                </label>
                <label className="block text-sm font-medium text-[#352a21]">
                  Order
                  <input type="number" value={itemForm.sortOrder} onChange={(event) => setItemForm((current) => ({ ...current, sortOrder: event.target.value }))} className={inputClassName} />
                </label>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="block text-sm font-medium text-[#352a21]">
                  Type
                  <select
                    value={itemForm.type}
                    onChange={(event) => setItemForm((current) => ({
                      ...current,
                      type: event.target.value === "video" ? "video" : "image",
                      posterFile: event.target.value === "image" ? null : current.posterFile,
                    }))}
                    className={inputClassName}
                  >
                    <option value="image">Image</option>
                    <option value="video">Video</option>
                  </select>
                </label>
                <label className="block text-sm font-medium text-[#352a21]">
                  Label
                  <input value={itemForm.label} onChange={(event) => setItemForm((current) => ({ ...current, label: event.target.value }))} className={inputClassName} />
                </label>
              </div>
              <label className="block text-sm font-medium text-[#352a21]">
                Caption
                <textarea value={itemForm.caption} onChange={(event) => setItemForm((current) => ({ ...current, caption: event.target.value }))} className={`${inputClassName} min-h-[120px] resize-y`} />
              </label>
              <label className="flex items-center gap-3 rounded-2xl border border-[#e8ddd1] bg-[#fcfaf7] px-4 py-3 text-sm font-medium text-[#352a21]">
                <input
                  type="checkbox"
                  checked={itemForm.isFeatured}
                  onChange={(event) => setItemForm((current) => ({ ...current, isFeatured: event.target.checked }))}
                  className="h-4 w-4 accent-[#1b1511]"
                />
                Use this item as the large featured tile
              </label>

              {itemForm.type === "image" ? (
                <ImageUploader
                  label="Image"
                  hint={editingItem.id ? "Leave empty to keep the current image" : "Required for new items"}
                  file={itemForm.mediaFile}
                  onChange={(file) => setItemForm((current) => ({ ...current, mediaFile: file }))}
                  onRemove={() => setItemForm((current) => ({ ...current, mediaFile: null }))}
                  required={!editingItem.id}
                />
              ) : (
                <>
                  <MediaFileInput
                    label="Video"
                    hint={editingItem.id ? "Leave empty to keep the current video" : "Required for new items"}
                    accept="video/mp4,video/webm,video/quicktime"
                    file={itemForm.mediaFile}
                    onChange={(file) => setItemForm((current) => ({ ...current, mediaFile: file }))}
                    onRemove={() => setItemForm((current) => ({ ...current, mediaFile: null }))}
                    required={!editingItem.id}
                  />
                  <ImageUploader
                    label="Video Poster"
                    hint="Optional, but recommended for clean previews"
                    file={itemForm.posterFile}
                    onChange={(file) => setItemForm((current) => ({ ...current, posterFile: file }))}
                    onRemove={() => setItemForm((current) => ({ ...current, posterFile: null }))}
                  />
                </>
              )}

              {editingItem.id && !itemForm.mediaFile && (
                <div className="overflow-hidden rounded-2xl border border-[#e8ddd1] bg-[#17110d]">
                  <div className="relative h-44 w-full">
                    {editingItem.type === "image" ? (
                      <Image src={editingItem.media_url} alt={editingItem.title} fill unoptimized className="object-contain" />
                    ) : (
                      <video src={editingItem.media_url} poster={editingItem.poster_url || undefined} controls className="h-full w-full object-contain" />
                    )}
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <Button onClick={saveItem} disabled={savingItem} className="h-12 flex-1 rounded-full bg-[#1b1511] text-[#f8f2e8] hover:bg-[#2a211a]">
                  {savingItem ? "Saving..." : editingItem.id ? "Update Item" : "Create Item"}
                </Button>
                <Button onClick={resetItemForm} variant="outline" className="h-12 rounded-full border-[#d9ccbc] bg-transparent text-[#1b1511] hover:bg-[#f5eee4]">Cancel</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <DeleteConfirmDialog
        open={!!deleteTarget}
        itemName={deleteTarget?.title}
        loading={deleting === deleteTarget?.id}
        onCancel={() => { if (!deleting) setDeleteTarget(null); }}
        onConfirm={deleteItem}
      />
    </div>
  );
}
