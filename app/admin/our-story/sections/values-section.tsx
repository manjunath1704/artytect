"use client";

import { useState } from "react";
import { Loader2, Plus, Trash2, X, GripVertical } from "lucide-react";
import { toast } from "sonner";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";
import { AppSelect, type SelectOption } from "@/components/ui/app-select";

export type ValueData = {
  id: string;
  title: string;
  description: string;
  icon_name: string;
  sort_order: number;
};

type ValuesSectionProps = {
  values: ValueData[];
  onUpdate: (values: ValueData[]) => void;
};

const iconOptions: SelectOption[] = [
  { value: "award", label: "Award" },
  { value: "palette", label: "Palette" },
  { value: "leaf", label: "Leaf" },
  { value: "heart", label: "Heart" },
  { value: "sparkles", label: "Sparkles" },
  { value: "star", label: "Star" },
  { value: "sun", label: "Sun" },
  { value: "shield", label: "Shield" },
];

const inputClassName =
  "mt-2 w-full rounded-[24px] border border-[#d9ccbc] bg-white px-4 py-3 text-sm text-[#1b1511] outline-none transition placeholder:text-[#a69280] focus:border-[#b38d67] focus:ring-4 focus:ring-[#d7b68b]/20";

export default function ValuesSection({ values, onUpdate }: ValuesSectionProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    icon_name: "award",
  });
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ValueData | null>(null);
  const [deleting, setDeleting] = useState(false);

  const openCreate = () => {
    setForm({ title: "", description: "", icon_name: "award" });
    setEditingId(null);
    setFormOpen(true);
  };

  const openEdit = (value: ValueData) => {
    setForm({
      title: value.title,
      description: value.description,
      icon_name: value.icon_name,
    });
    setEditingId(value.id);
    setFormOpen(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.description) {
      toast.error("Title and description are required");
      return;
    }

    setSaving(true);
    const toastId = toast.loading(editingId ? "Updating value..." : "Creating value...");

    try {
      const response = await fetch(
        editingId ? `/api/admin/our-story/values/${editingId}` : "/api/admin/our-story/values",
        {
          method: editingId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to save value");
      }

      if (editingId) {
        onUpdate(values.map((v) => (v.id === editingId ? result.value : v)));
      } else {
        onUpdate([...values, result.value]);
      }

      toast.success(editingId ? "Value updated" : "Value created", { id: toastId });
      setFormOpen(false);
    } catch (error) {
      console.error("Error saving value:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to save value",
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
      const response = await fetch(`/api/admin/our-story/values/${deleteTarget.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Failed to delete value");
      }

      onUpdate(values.filter((v) => v.id !== deleteTarget.id));
      toast.success("Value deleted");
      setDeleteTarget(null);
    } catch (error) {
      console.error("Error deleting value:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to delete value"
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
            Brand Values
          </h2>
          <p className="mt-2 text-sm text-[#6b5f55]">
            Define the core values that drive your brand
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex h-12 items-center gap-2 rounded-full bg-[#1b1511] px-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white"
        >
          <Plus className="h-4 w-4" />
          Add Value
        </button>
      </div>

      {values.length > 0 ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {values.map((value) => (
            <div
              key={value.id}
              className="rounded-2xl border border-[#d9ccbc] bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-[#1b1511]">
                    {value.title}
                  </h3>
                  <p className="mt-2 text-sm text-[#6b5f55]">
                    {value.description}
                  </p>
                  <p className="mt-3 text-xs text-[#9a8d82]">
                    Icon: {value.icon_name}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEdit(value)}
                    className="grid h-9 w-9 place-items-center rounded-full border border-[#d9ccbc] text-[#6b5f55] hover:bg-[#f5eee4]"
                  >
                    <GripVertical className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(value)}
                    className="grid h-9 w-9 place-items-center rounded-full border border-[#d9ccbc] text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border border-[#d9ccbc] bg-[#faf6f2] p-12 text-center">
          <p className="text-sm text-[#6b5f55]">
            No values added yet. Click &quot;Add Value&quot; to create one.
          </p>
        </div>
      )}

      {/* Form Modal */}
      {formOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 p-4 backdrop-blur-sm">
          <div className="mx-auto my-8 max-w-2xl rounded-[32px] bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-semibold tracking-[-0.03em]">
                {editingId ? "Edit Value" : "Add Value"}
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
                  Title
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className={inputClassName}
                  placeholder="Quality"
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
                  placeholder="Describe this value..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#352a21]">
                  Icon
                </label>
                <div className="mt-2">
                  <AppSelect
                    instanceId="value-icon"
                    value={iconOptions.find((opt) => opt.value === form.icon_name)}
                    options={iconOptions}
                    onChange={(opt) =>
                      setForm({ ...form, icon_name: opt?.value || "award" })
                    }
                  />
                </div>
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
        title="Delete Value"
      />
    </div>
  );
}
