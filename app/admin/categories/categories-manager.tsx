"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Pencil, Trash2, X, Plus, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { ImageUploader } from "@/components/ui/image-uploader";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";
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
  const [updating, setUpdating] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Delete confirmation dialog state
  const [deleteTarget, setDeleteTarget] = useState<CategoryRow | null>(null);

  // Reset to page 1 when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  console.log('CategoriesManager rendered with', initialCategories.length, 'categories');

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
      if (!session) {
        router.replace("/admin/login");
      }
    });
    return () => subscription.unsubscribe();
  }, [initialUserEmail, router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/admin/login");
  };

  const handleEdit = (category: CategoryRow) => {
    setEditingCategory(category);
    setEditTitle(category.title);
    setEditSlug(category.slug);
    setEditDescription(category.description);
    setEditThumbnailAlt(category.thumbnail_alt);
    setEditThumbnailFile(null);
    setEditHoverThumbnailFile(null);
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

  // Open the delete confirmation dialog
  const handleDeleteClick = (category: CategoryRow) => {
    setDeleteTarget(category);
  };

  // Called when user confirms deletion in the dialog
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(deleteTarget.id);
    try {
      const response = await fetch(`/api/admin/categories/${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result?.error ?? "Unable to delete category.");
      }
      setCategories((current) => current.filter((cat) => cat.id !== deleteTarget.id));
      setDeleteTarget(null); // close dialog on success
    } catch (error) {
      // Keep dialog open so user sees the error — we just stop the spinner
      console.error(error);
    } finally {
      setDeleting(null);
    }
  };

  if (checkingSession) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-3 text-[#665b4f]">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Checking session…</span>
        </div>
      </div>
    );
  }

  // Filter categories based on search query
  const filteredCategories = categories.filter((category) => {
    const query = searchQuery.toLowerCase();
    return (
      category.title.toLowerCase().includes(query) ||
      category.slug.toLowerCase().includes(query) ||
      category.description.toLowerCase().includes(query) ||
      category.thumbnail_alt.toLowerCase().includes(query)
    );
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCategories = filteredCategories.slice(startIndex, endIndex);

  return (
    <div className="px-6 py-8 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-[32px] bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl tracking-[-0.03em] text-[#1b1511]">Manage Categories</h1>
              <p className="mt-2 text-sm text-[#665b4f]">
                {categories.length} {categories.length === 1 ? "category" : "categories"} in database
              </p>
            </div>
            <Link href="/admin/create-categories" className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#1b1511] px-6 text-sm font-medium text-[#f8f2e8] transition hover:bg-[#2a211a]">
              <Plus className="h-4 w-4" />
              Create Category
            </Link>
          </div>
        </div>

        <div className="mt-8 rounded-[32px] bg-white p-6 shadow-sm sm:p-8">
          {/* Search Input */}
          <div className="mb-6 flex items-center gap-3 rounded-full border border-[#d9ccbc] bg-[#fcfaf7] px-4 py-3">
            <Search className="h-5 w-5 text-[#8a7765]" />
            <input
              type="text"
              placeholder="Search by title, slug, description, or alt text..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent text-sm text-[#1b1511] outline-none placeholder:text-[#a69280]"
            />
          </div>

          <div className="overflow-x-auto">
            {paginatedCategories.length ? (
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
                  {paginatedCategories.map((category, index) => (
                    <tr key={category.id} className="border-b border-[#e8ddd1] transition hover:bg-[#fcfaf7]">
                      <td className="p-3 text-sm text-[#665b4f]">{String(startIndex + index + 1).padStart(2, '0')}</td>
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
                          <button onClick={() => handleDeleteClick(category)} disabled={deleting === category.id} className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#d9ccbc] text-[#7a4d1d] transition hover:bg-[#faf4ea] disabled:opacity-50" title="Delete category">
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
                {searchQuery ? "No categories match your search." : "No categories yet. Create the first one."}
              </div>
            )}
          </div>

          {/* Pagination */}
          {filteredCategories.length > 0 && totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between border-t border-[#e8ddd1] pt-6">
              <p className="text-sm text-[#665b4f]">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredCategories.length)} of {filteredCategories.length} categories
              </p>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </div>

        {editingCategory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[32px]  bg-white p-6 shadow-sm sm:p-8">
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
                  <ImageUploader
                    label="Default Thumbnail"
                    hint="Leave empty to keep the current image"
                    file={editThumbnailFile}
                    onChange={setEditThumbnailFile}
                    onRemove={() => setEditThumbnailFile(null)}
                  />
                  <ImageUploader
                    label="Hover Thumbnail"
                    hint="Leave empty to keep the current image"
                    file={editHoverThumbnailFile}
                    onChange={setEditHoverThumbnailFile}
                    onRemove={() => setEditHoverThumbnailFile(null)}
                  />
                </div>

                {/* Current images (shown when no new file selected) */}
                {(!editThumbnailFile || !editHoverThumbnailFile) && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {!editThumbnailFile && (
                      <div>
                        <p className="mb-2 text-xs text-[#8a7765]">Current default thumbnail</p>
                        <div className="relative h-32 w-full overflow-hidden rounded-2xl border border-[#e8ddd1] bg-[#f5eee4]">
                          <Image src={editingCategory.thumbnail_url} alt="Current" fill unoptimized className="object-contain" />
                        </div>
                      </div>
                    )}
                    {!editHoverThumbnailFile && (
                      <div>
                        <p className="mb-2 text-xs text-[#8a7765]">Current hover thumbnail</p>
                        <div className="relative h-32 w-full overflow-hidden rounded-2xl border border-[#e8ddd1] bg-[#f5eee4]">
                          <Image src={editingCategory.hover_thumbnail_url} alt="Current hover" fill unoptimized className="object-contain" />
                        </div>
                      </div>
                    )}
                  </div>
                )}

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

      {/* ── Delete confirmation dialog ── */}
      <DeleteConfirmDialog
        open={!!deleteTarget}
        itemName={deleteTarget?.title}
        loading={deleting === deleteTarget?.id}
        onCancel={() => { if (!deleting) setDeleteTarget(null); }}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};

export default CategoriesManager;
