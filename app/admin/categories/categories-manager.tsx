"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, LogOut, ArrowLeft, Pencil, Trash2, X, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

type CategoryRow = {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnail_url: string;
  hover_thumbnail_url: string;
  thumbnail_alt: string;
};

type CategoriesManagerProps = {
  initialUserEmail: string;
  initialCategories: CategoryRow[];
};

const inputClassName =
  "mt-2 w-full border border-[#d9ccbc] bg-white px-4 py-3 text-sm text-[#1b1511] outline-none transition placeholder:text-[#a69280] focus:border-[#b38d67] focus:ring-4 focus:ring-[#d7b68b]/20";

const CategoriesManager = ({ initialUserEmail, initialCategories }: CategoriesManagerProps) => {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState(initialUserEmail);
  const [categories, setCategories] = useState<CategoryRow[]>(initialCategories);
  const [checkingSession, setCheckingSession] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [editingCategory, setEditingCategory] = useState<CategoryRow | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editSlug, setEditSlug] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editThumbnailAlt, setEditThumbnailAlt] = useState("");
  const [editThumbnailFile, setEditThumbnailFile] = useState<File | null>(null);
  const [editHoverThumbnailFile, setEditHoverThumbnailFile] = useState<File | null>(null);
  const [editThumbnailPreview, setEditThumbnailPreview] = useState<string | null>(null);
  const [editHoverThumbnailPreview, setEditHoverThumbnailPreview] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  useEffect(() => {
    const syncSession = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.replace("/admin/login");
        return;
      }
      setUserEmail(data.user.email ?? initialUserEmail);
      setCheckingSession(false);
    };
    void syncSession();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.replace("/admin/login");
      }
    });
    return () => subscription.unsubscribe();
  }, [initialUserEmail, router]);

  useEffect(() => {
    if (!editThumbnailFile) {
      setEditThumbnailPreview(null);
      return;
    }
    const previewUrl = URL.createObjectURL(editThumbnailFile);
    setEditThumbnailPreview(previewUrl);
    return () => URL.revokeObjectURL(previewUrl);
  }, [editThumbnailFile]);

  useEffect(() => {
    if (!editHoverThumbnailFile) {
      setEditHoverThumbnailPreview(null);
      return;
    }
    const previewUrl = URL.createObjectURL(editHoverThumbnailFile);
    setEditHoverThumbnailPreview(previewUrl);
    return () => URL.revokeObjectURL(previewUrl);
  }, [editHoverThumbnailFile]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/admin/login");
    router.refresh();
  };

  const handleEdit = (category: CategoryRow) => {
    setEditingCategory(category);
    setEditTitle(category.title);
    setEditSlug(category.slug);
    setEditDescription(category.description);
    setEditThumbnailAlt(category.thumbnail_alt);
    setEditThumbnailFile(null);
    setEditHoverThumbnailFile(null);
    setEditThumbnailPreview(null);
    setEditHoverThumbnailPreview(null);
    setEditError(null);
  };

  const handleCloseEdit = () => {
    setEditingCategory(null);
    setEditTitle("");
    setEditSlug("");
    setEditDescription("");
    setEditThumbnailAlt("");
    setEditThumbnailFile(null);
    setEditHoverThumbnailFile(null);
    setEditThumbnailPreview(null);
    setEditHoverThumbnailPreview(null);
    setEditError(null);
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory) return;
    setUpdating(true);
    setEditError(null);
    try {
      if (!editTitle.trim() || !editSlug.trim() || !editDescription.trim() || !editThumbnailAlt.trim()) {
        throw new Error("Please fill in all required fields.");
      }
      const formData = new FormData();
      formData.append("title", editTitle.trim());
      formData.append("slug", editSlug.trim());
      formData.append("description", editDescription.trim());
      formData.append("thumbnailAlt", editThumbnailAlt.trim());
      if (editThumbnailFile) {
        formData.append("thumbnail", editThumbnailFile);
      }
      if (editHoverThumbnailFile) {
        formData.append("hoverThumbnail", editHoverThumbnailFile);
      }
      const response = await fetch(`/api/admin/categories/${editingCategory.id}`, {
        method: "PUT",
        body: formData,
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result?.error ?? "Unable to update category.");
      }
      setCategories((current) =>
        current.map((cat) =>
          cat.id === editingCategory.id
            ? {
                ...cat,
                title: editTitle,
                slug: editSlug,
                description: editDescription,
                thumbnail_alt: editThumbnailAlt,
                thumbnail_url: result.category.thumbnail_url || cat.thumbnail_url,
                hover_thumbnail_url: result.category.hover_thumbnail_url || cat.hover_thumbnail_url,
              }
            : cat
        )
      );
      handleCloseEdit();
    } catch (error) {
      setEditError(error instanceof Error ? error.message : "Unable to update category.");
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async (categoryId: string) => {
    if (!confirm("Are you sure you want to delete this category?")) {
      return;
    }
    setDeleting(categoryId);
    try {
      const response = await fetch(`/api/admin/categories/${categoryId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result?.error ?? "Unable to delete category.");
      }
      setCategories((current) => current.filter((cat) => cat.id !== categoryId));
    } catch (error) {
      alert(error instanceof Error ? error.message : "Unable to delete category.");
    } finally {
      setDeleting(null);
    }
  };

  if (checkingSession) {
    return (
      <main className="flex min-h-[100svh] items-center justify-center bg-[linear-gradient(180deg,#f6efe4_0%,#efe4d5_100%)] px-6">
        <div className="flex items-center gap-3 text-[#665b4f]">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Checking admin session...</span>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[100svh] bg-[linear-gradient(180deg,#f6efe4_0%,#efe4d5_100%)] px-6 py-8 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <Link href="/admin" className="inline-flex items-center gap-2 text-sm font-medium text-[#1b1511] underline-offset-4 transition hover:underline">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
          <div className="flex items-center gap-3">
            <p className="text-xs uppercase tracking-[0.25em] text-[#8a7765]">{userEmail}</p>
            <Button type="button" variant="outline" size="sm" className="h-10 rounded-full border-[#d9ccbc] bg-transparent text-[#1b1511] hover:bg-[#f5eee4]" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>

        <div className="rounded-[32px] border border-[#dbcbb8] bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl tracking-[-0.03em] text-[#1b1511]">Manage Categories</h1>
              <p className="mt-2 text-sm text-[#665b4f]">{categories.length} {categories.length === 1 ? 'category' : 'categories'} in database</p>
            </div>
            <Link href="/admin/create-categories" className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#1b1511] px-6 text-sm font-medium text-[#f8f2e8] transition hover:bg-[#2a211a]">
              <Plus className="h-4 w-4" />
              Create Category
            </Link>
          </div>
        </div>

        <div className="mt-8 rounded-[32px] border border-[#dbcbb8] bg-white p-6 shadow-sm sm:p-8">
          <div className="overflow-x-auto">
            {categories.length ? (
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b-2 border-[#d9ccbc]">
                    <th className="p-3 text-left text-xs font-semibold uppercase tracking-[0.25em] text-[#8a7765]">#</th>
                    <th className="p-3 text-left text-xs font-semibold uppercase tracking-[0.25em] text-[#8a7765]">Thumbnails</th>
                    <th className="p-3 text-left text-xs font-semibold uppercase tracking-[0.25em] text-[#8a7765]">Title</th>
                    <th className="p-3 text-left text-xs font-semibold uppercase tracking-[0.25em] text-[#8a7765]">Slug</th>
                    <th className="p-3 text-left text-xs font-semibold uppercase tracking-[0.25em] text-[#8a7765]">Description</th>
                    <th className="p-3 text-left text-xs font-semibold uppercase tracking-[0.25em] text-[#8a7765]">Alt Text</th>
                    <th className="p-3 text-center text-xs font-semibold uppercase tracking-[0.25em] text-[#8a7765]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((category, index) => (
                    <tr key={category.id} className="border-b border-[#e8ddd1] transition hover:bg-[#fcfaf7]">
                      <td className="p-3 text-sm text-[#665b4f]">{String(index + 1).padStart(2, '0')}</td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          <div className="relative h-16 w-16 overflow-hidden rounded-2xl border border-[#e8ddd1]">
                            <Image src={category.thumbnail_url} alt={category.thumbnail_alt} fill unoptimized className="object-cover" />
                          </div>
                          <div className="relative h-16 w-16 overflow-hidden rounded-2xl border border-[#e8ddd1]">
                            <Image src={category.hover_thumbnail_url} alt={`${category.thumbnail_alt} hover`} fill unoptimized className="object-cover" />
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-sm font-medium text-[#1b1511]">{category.title}</td>
                      <td className="p-3 text-sm text-[#665b4f]">{category.slug}</td>
                      <td className="p-3 text-sm text-[#665b4f]"><div className="max-w-xs line-clamp-2">{category.description}</div></td>
                      <td className="p-3 text-sm text-[#665b4f]"><div className="max-w-xs line-clamp-1">{category.thumbnail_alt}</div></td>
                      <td className="p-3">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => handleEdit(category)} className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#d9ccbc] text-[#1b1511] transition hover:bg-[#f5eee4]" title="Edit category">
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button onClick={() => handleDelete(category.id)} disabled={deleting === category.id} className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#d9ccbc] text-[#7a4d1d] transition hover:bg-[#faf4ea] disabled:opacity-50" title="Delete category">
                            {deleting === category.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="rounded-2xl border border-dashed border-[#d9ccbc] bg-[#fcfaf7] p-8 text-center text-sm leading-7 text-[#665b4f]">
                No categories yet. Create the first one.
              </div>
            )}
          </div>
        </div>

        {editingCategory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[32px] border border-[#dbcbb8] bg-white p-6 shadow-2xl sm:p-8">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl tracking-[-0.03em] text-[#1b1511]">Edit Category</h2>
                <button onClick={handleCloseEdit} className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#d9ccbc] text-[#1b1511] transition hover:bg-[#f5eee4]">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-6 space-y-5">
                <label className="block text-sm font-medium text-[#352a21]">
                  Title
                  <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className={inputClassName} placeholder="Mugs" required />
                </label>

                <label className="block text-sm font-medium text-[#352a21]">
                  Slug
                  <input type="text" value={editSlug} onChange={(e) => setEditSlug(e.target.value)} className={inputClassName} placeholder="mugs" required />
                </label>

                <label className="block text-sm font-medium text-[#352a21]">
                  Description
                  <textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} className={`${inputClassName} min-h-[120px] resize-y`} placeholder="Description..." required />
                </label>

                <label className="block text-sm font-medium text-[#352a21]">
                  Alt Text
                  <input type="text" value={editThumbnailAlt} onChange={(e) => setEditThumbnailAlt(e.target.value)} className={inputClassName} placeholder="Alt text..." required />
                </label>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-[#352a21]">
                      Default Thumbnail
                      <input type="file" accept="image/*" onChange={(e) => setEditThumbnailFile(e.target.files?.[0] ?? null)} className={inputClassName} />
                    </label>
                    {editThumbnailPreview ? (
                      <div className="relative mt-3 h-32 w-full overflow-hidden rounded-2xl border border-[#e8ddd1]">
                        <Image src={editThumbnailPreview} alt="New thumbnail" fill unoptimized className="object-cover" />
                      </div>
                    ) : (
                      <div className="relative mt-3 h-32 w-full overflow-hidden rounded-2xl border border-[#e8ddd1]">
                        <Image src={editingCategory.thumbnail_url} alt="Current" fill unoptimized className="object-cover" />
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#352a21]">
                      Hover Thumbnail
                      <input type="file" accept="image/*" onChange={(e) => setEditHoverThumbnailFile(e.target.files?.[0] ?? null)} className={inputClassName} />
                    </label>
                    {editHoverThumbnailPreview ? (
                      <div className="relative mt-3 h-32 w-full overflow-hidden rounded-2xl border border-[#e8ddd1]">
                        <Image src={editHoverThumbnailPreview} alt="New hover" fill unoptimized className="object-cover" />
                      </div>
                    ) : (
                      <div className="relative mt-3 h-32 w-full overflow-hidden rounded-2xl border border-[#e8ddd1]">
                        <Image src={editingCategory.hover_thumbnail_url} alt="Current hover" fill unoptimized className="object-cover" />
                      </div>
                    )}
                  </div>
                </div>

                {editError && <p className="rounded-2xl border border-[#d7b68b] bg-[#faf4ea] px-4 py-3 text-sm text-[#7a4d1d]">{editError}</p>}

                <div className="flex gap-3">
                  <Button type="button" onClick={handleUpdateCategory} disabled={updating} className="h-12 flex-1 rounded-full bg-[#1b1511] text-[#f8f2e8] hover:bg-[#2a211a]">
                    {updating ? <span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" />Updating...</span> : "Update Category"}
                  </Button>
                  <Button type="button" onClick={handleCloseEdit} variant="outline" className="h-12 rounded-full border-[#d9ccbc] bg-transparent text-[#1b1511] hover:bg-[#f5eee4]">
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default CategoriesManager;
