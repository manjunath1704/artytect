"use client";

import { useState } from "react";
import Image from "next/image";
import { Loader2, Plus, Trash2, X, Pencil } from "lucide-react";
import { toast } from "sonner";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";
import { ImageUploader } from "@/components/ui/image-uploader";

export type TimelineData = {
  id: string;
  year: string;
  title: string;
  description: string;
  image_url: string | null;
  sort_order: number;
};

type TimelineSectionProps = {
  timeline: TimelineData[];
  onUpdate: (timeline: TimelineData[]) => void;
};

const inputClassName =
  "mt-2 w-full rounded-[24px] border border-[#d9ccbc] bg-white px-4 py-3 text-sm text-[#1b1511] outline-none transition placeholder:text-[#a69280] focus:border-[#b38d67] focus:ring-4 focus:ring-[#d7b68b]/20";

export default function TimelineSection({ timeline, onUpdate }: TimelineSectionProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    year: "",
    title: "",
    description: "",
    image_url: "",
  });
  const [timelineImage, setTimelineImage] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<TimelineData | null>(null);
  const [deleting, setDeleting] = useState(false);

  const openCreate = () => {
    setForm({ year: "", title: "", description: "", image_url: "" });
    setTimelineImage(null);
    setEditingId(null);
    setFormOpen(true);
  };

  const openEdit = (item: TimelineData) => {
    setForm({
      year: item.year,
      title: item.title,
      description: item.description,
      image_url: item.image_url || "",
    });
    setTimelineImage(null);
    setEditingId(item.id);
    setFormOpen(true);
  };

  const handleSave = async () => {
    if (!form.year || !form.title) {
      toast.error("Year and title are required");
      return;
    }

    setSaving(true);
    const toastId = toast.loading(
      editingId ? "Updating timeline item..." : "Creating timeline item..."
    );

    try {
      const formData = new FormData();
      formData.append("year", form.year);
      formData.append("title", form.title);
      formData.append("description", form.description);
      formData.append("existing_image_url", form.image_url);
      if (timelineImage) {
        formData.append("timeline_image", timelineImage);
      }
      if (editingId) {
        formData.append("id", editingId);
      }

      const response = await fetch(
        editingId
          ? `/api/admin/our-story/timeline/${editingId}`
          : "/api/admin/our-story/timeline",
        {
          method: editingId ? "PUT" : "POST",
          body: formData,
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to save timeline item");
      }

      if (editingId) {
        onUpdate(timeline.map((t) => (t.id === editingId ? result.timeline : t)));
      } else {
        onUpdate([...timeline, result.timeline]);
      }

      toast.success(
        editingId ? "Timeline item updated" : "Timeline item created",
        { id: toastId }
      );
      setFormOpen(false);
    } catch (error) {
      console.error("Error saving timeline item:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to save timeline item",
        { id: toastId }
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    setDeleting(true);
    try {
      const response = await fetch(
        `/api/admin/our-story/timeline/${deleteTarget.id}`,
        { method: "DELETE" }
      );

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Failed to delete timeline item");
      }

      onUpdate(timeline.filter((t) => t.id !== deleteTarget.id));
      toast.success("Timeline item deleted");
      setDeleteTarget(null);
    } catch (error) {
      console.error("Error deleting timeline item:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to delete timeline item"
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[#1b1511]">
            Brand Timeline
          </h2>
          <p className="mt-2 text-sm text-[#6b5f55]">
            Create a visual journey of your brand&apos;s history
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex h-12 items-center gap-2 rounded-full bg-[#1b1511] px-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white"
        >
          <Plus className="h-4 w-4" />
          Add Item
        </button>
      </div>

      {timeline.length > 0 ? (
        <div className="mt-6 space-y-4">
          {timeline.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-[#d9ccbc] bg-white p-5 shadow-sm"
            >
              <div className="flex gap-4">
                {item.image_url && (
                  <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl">
                    <Image
                      src={item.image_url}
                      alt={item.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="inline-block rounded-full bg-[#f5eee4] px-3 py-1 text-xs font-semibold text-[#9a6b4e]">
                        {item.year}
                      </span>
                      <h3 className="mt-2 text-lg font-semibold text-[#1b1511]">
                        {item.title}
                      </h3>
                      <p className="mt-1 text-sm text-[#6b5f55]">
                        {item.description}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEdit(item)}
                        className="grid h-9 w-9 place-items-center rounded-full border border-[#d9ccbc] text-[#6b5f55] hover:bg-[#f5eee4]"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(item)}
                        className="grid h-9 w-9 place-items-center rounded-full border border-[#d9ccbc] text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border border-[#d9ccbc] bg-[#faf6f2] p-12 text-center">
          <p className="text-sm text-[#6b5f55]">
            No timeline items yet. Click &quot;Add Item&quot; to create one.
          </p>
        </div>
      )}

      {/* Form Modal */}
      {formOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 p-4 backdrop-blur-sm">
          <div className="mx-auto my-8 max-w-2xl rounded-[32px] bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-semibold tracking-[-0.03em]">
                {editingId ? "Edit Timeline Item" : "Add Timeline Item"}
              </h3>
              <button
                onClick={() => setFormOpen(false)}
                className="grid h-10 w-10 place-items-center rounded-full border border-[#d9ccbc]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#352a21]">
                  Year
                </label>
                <input
                  type="text"
                  value={form.year}
                  onChange={(e) => setForm({ ...form, year: e.target.value })}
                  className={inputClassName}
                  placeholder="2020"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#352a21]">
                  Title
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className={inputClassName}
                  placeholder="The Beginning"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#352a21]">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  rows={3}
                  className={inputClassName}
                  placeholder="Describe this milestone..."
                />
              </div>

              <div>
                <ImageUploader
                  label="Timeline Image (Optional)"
                  file={timelineImage}
                  onChange={setTimelineImage}
                  onRemove={() => setTimelineImage(null)}
                  hint={
                    form.image_url
                      ? "Current image will be kept unless replaced"
                      : undefined
                  }
                />
                {form.image_url && !timelineImage && (
                  <div className="mt-3 relative h-48 w-full overflow-hidden rounded-2xl">
                    <Image
                      src={form.image_url}
                      alt="Current timeline image"
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => setFormOpen(false)}
                  className="h-12 rounded-full border border-[#d9ccbc] px-6 text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="inline-flex h-12 items-center gap-2 rounded-full bg-[#1b1511] px-6 text-[11px] font-semibold uppercase tracking-[0.18em] text-white disabled:opacity-60"
                >
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                  {editingId ? "Update" : "Create"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <DeleteConfirmDialog
        open={!!deleteTarget}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        itemName={deleteTarget?.title}
        title="Delete Timeline Item"
      />
    </div>
  );
}
