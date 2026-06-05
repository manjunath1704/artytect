"use client";

import { useState } from "react";
import Image from "next/image";
import { Loader2, Plus, Trash2, X, Pencil } from "lucide-react";
import { toast } from "sonner";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";
import { ImageUploader } from "@/components/ui/image-uploader";

export type TeamData = {
  id: string;
  name: string;
  role: string;
  bio: string;
  image_url: string | null;
  sort_order: number;
  is_visible: boolean;
};

type TeamSectionProps = {
  team: TeamData[];
  onUpdate: (team: TeamData[]) => void;
};

const inputClassName =
  "mt-2 w-full rounded-[24px] border border-[#d9ccbc] bg-white px-4 py-3 text-sm text-[#1b1511] outline-none transition placeholder:text-[#a69280] focus:border-[#b38d67] focus:ring-4 focus:ring-[#d7b68b]/20";

export default function TeamSection({ team, onUpdate }: TeamSectionProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    role: "",
    bio: "",
    image_url: "",
    is_visible: true,
  });
  const [memberImage, setMemberImage] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<TeamData | null>(null);
  const [deleting, setDeleting] = useState(false);

  const openCreate = () => {
    setForm({ name: "", role: "", bio: "", image_url: "", is_visible: true });
    setMemberImage(null);
    setEditingId(null);
    setFormOpen(true);
  };

  const openEdit = (member: TeamData) => {
    setForm({
      name: member.name,
      role: member.role,
      bio: member.bio,
      image_url: member.image_url || "",
      is_visible: member.is_visible,
    });
    setMemberImage(null);
    setEditingId(member.id);
    setFormOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.role) {
      toast.error("Name and role are required");
      return;
    }

    setSaving(true);
    const toastId = toast.loading(
      editingId ? "Updating team member..." : "Adding team member..."
    );

    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("role", form.role);
      formData.append("bio", form.bio);
      formData.append("is_visible", String(form.is_visible));
      formData.append("existing_image_url", form.image_url);
      if (memberImage) {
        formData.append("member_image", memberImage);
      }
      if (editingId) {
        formData.append("id", editingId);
      }

      const response = await fetch(
        editingId
          ? `/api/admin/our-story/team/${editingId}`
          : "/api/admin/our-story/team",
        {
          method: editingId ? "PUT" : "POST",
          body: formData,
        }
      );

      const result = await response.json();

      if (!response.ok) {
        console.error("API error response:", result);
        throw new Error(result.error || "Failed to save team member");
      }

      if (editingId) {
        onUpdate(team.map((t) => (t.id === editingId ? result.member : t)));
      } else {
        onUpdate([...team, result.member]);
      }

      toast.success(
        editingId ? "Team member updated" : "Team member added",
        { id: toastId }
      );
      setFormOpen(false);
    } catch (error) {
      console.error("Error saving team member:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to save team member",
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
        `/api/admin/our-story/team/${deleteTarget.id}`,
        { method: "DELETE" }
      );

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Failed to delete team member");
      }

      onUpdate(team.filter((t) => t.id !== deleteTarget.id));
      toast.success("Team member deleted");
      setDeleteTarget(null);
    } catch (error) {
      console.error("Error deleting team member:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to delete team member"
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
            Team Members
          </h2>
          <p className="mt-2 text-sm text-[#6b5f55]">
            Showcase the people behind your brand
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex h-12 items-center gap-2 rounded-full bg-[#1b1511] px-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white"
        >
          <Plus className="h-4 w-4" />
          Add Member
        </button>
      </div>

      {team.length > 0 ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {team.map((member) => (
            <div
              key={member.id}
              className="overflow-hidden rounded-2xl border border-[#d9ccbc] bg-white shadow-sm"
            >
              {member.image_url && (
                <div className="relative aspect-square">
                  <Image
                    src={member.image_url}
                    alt={member.name}
                    fill
                    className="object-cover"
                  />
                  {!member.is_visible && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold">
                        Hidden
                      </span>
                    </div>
                  )}
                </div>
              )}
              <div className="p-5">
                <h3 className="text-lg font-semibold text-[#1b1511]">
                  {member.name}
                </h3>
                <p className="text-sm font-medium text-[#9a6b4e]">
                  {member.role}
                </p>
                <p className="mt-2 line-clamp-2 text-sm text-[#6b5f55]">
                  {member.bio}
                </p>
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => openEdit(member)}
                    className="flex-1 grid h-9 place-items-center rounded-full border border-[#d9ccbc] text-[#6b5f55] hover:bg-[#f5eee4]"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(member)}
                    className="flex-1 grid h-9 place-items-center rounded-full border border-[#d9ccbc] text-red-600 hover:bg-red-50"
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
            No team members yet. Click &quot;Add Member&quot; to create one.
          </p>
        </div>
      )}

      {/* Form Modal */}
      {formOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 p-4 backdrop-blur-sm">
          <div className="mx-auto my-8 max-w-2xl rounded-[32px] bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-semibold tracking-[-0.03em]">
                {editingId ? "Edit Team Member" : "Add Team Member"}
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
                  Name
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className={inputClassName}
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#352a21]">
                  Role/Title
                </label>
                <input
                  type="text"
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className={inputClassName}
                  placeholder="Founder & Ceramicist"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#352a21]">
                  Bio
                </label>
                <textarea
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  rows={3}
                  className={inputClassName}
                  placeholder="Brief bio..."
                />
              </div>

              <div>
                <ImageUploader
                  label="Profile Image"
                  file={memberImage}
                  onChange={setMemberImage}
                  onRemove={() => setMemberImage(null)}
                  hint={
                    form.image_url
                      ? "Current image will be kept unless replaced"
                      : undefined
                  }
                />
                {form.image_url && !memberImage && (
                  <div className="mt-3 relative h-48 w-full overflow-hidden rounded-2xl">
                    <Image
                      src={form.image_url}
                      alt="Current member image"
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="flex items-center gap-3 rounded-2xl border border-[#d9ccbc] bg-[#faf6f2] px-4 py-4">
                  <input
                    type="checkbox"
                    checked={form.is_visible}
                    onChange={(e) =>
                      setForm({ ...form, is_visible: e.target.checked })
                    }
                    className="h-5 w-5 rounded border-[#d9ccbc] text-[#1b1511] focus:ring-2 focus:ring-[#b38d67] focus:ring-offset-0"
                  />
                  <div>
                    <span className="block text-sm font-medium text-[#352a21]">
                      Visible on Website
                    </span>
                    <span className="text-xs text-[#665b4f]">
                      Show this team member on the public page
                    </span>
                  </div>
                </label>
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
        itemName={deleteTarget?.name}
        title="Delete Team Member"
      />
    </div>
  );
}
