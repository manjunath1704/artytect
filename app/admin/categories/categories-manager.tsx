"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Pencil, Trash2, X, Plus, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { ImageUploader } from "@/components/ui/image-uploader";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";
import { AppSelect, type SelectOption } from "@/components/ui/app-select";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

const supabase = createClient();

type CategoryRow = {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnail_url: string;
  hover_thumbnail_url: string;
  thumbnail_alt: string;
  parent_category_id: string | null;
  created_at: string;
};

type CategoriesHeader = {
  id?: string;
  eyebrow: string;
  title: string;
  description: string;
};

type CategoriesManagerProps = {
  initialUserEmail: string;
  initialHeader: CategoriesHeader;
  initialCategories: CategoryRow[];
};

const inputClassName =
  "mt-2 w-full border border-[#d9ccbc] rounded-[32px] bg-white px-4 py-3 text-sm text-[#1b1511] outline-none transition placeholder:text-[#a69280] focus:border-[#b38d67] focus:ring-4 focus:ring-[#d7b68b]/20";

type CategoryFilter = "all" | "parent" | "child";
type SortKey = "hierarchy" | "name-asc" | "name-desc" | "created-desc" | "created-asc" | "type";

const categoryTypeOptions: SelectOption<"parent" | "child">[] = [
  { value: "parent", label: "Parent Category" },
  { value: "child", label: "Child Category" },
];

const filterOptions: SelectOption<CategoryFilter>[] = [
  { value: "all", label: "All Categories" },
  { value: "parent", label: "Parent Categories" },
  { value: "child", label: "Child Categories" },
];

const sortOptions: SelectOption<SortKey>[] = [
  { value: "hierarchy", label: "Hierarchy" },
  { value: "name-asc", label: "Name A-Z" },
  { value: "name-desc", label: "Name Z-A" },
  { value: "created-desc", label: "Newest first" },
  { value: "created-asc", label: "Oldest first" },
  { value: "type", label: "Type" },
];

const formatDate = (value: string) => {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
};

const CategoriesManager = ({ initialUserEmail, initialHeader, initialCategories }: CategoriesManagerProps) => {
  const router = useRouter();
  const [headerEyebrow, setHeaderEyebrow] = useState(initialHeader.eyebrow);
  const [headerTitle, setHeaderTitle] = useState(initialHeader.title);
  const [headerDescription, setHeaderDescription] = useState(initialHeader.description);
  const [savingHeader, setSavingHeader] = useState(false);
  const [categories, setCategories] = useState<CategoryRow[]>(initialCategories);
  const [checkingSession, setCheckingSession] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [editingCategory, setEditingCategory] = useState<CategoryRow | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editSlug, setEditSlug] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editCategoryType, setEditCategoryType] = useState<"parent" | "child">("parent");
  const [editParentCategoryId, setEditParentCategoryId] = useState("");
  const [editThumbnailAlt, setEditThumbnailAlt] = useState("");
  const [editThumbnailFile, setEditThumbnailFile] = useState<File | null>(null);
  const [editHoverThumbnailFile, setEditHoverThumbnailFile] = useState<File | null>(null);
  const [updating, setUpdating] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [sort, setSort] = useState<SortKey>("hierarchy");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Delete confirmation dialog state
  const [deleteTarget, setDeleteTarget] = useState<CategoryRow | null>(null);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, categoryFilter, sort]);

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

  const saveHeader = async () => {
    if (!headerEyebrow.trim() || !headerTitle.trim() || !headerDescription.trim()) {
      toast.error("Categories eyebrow, title, and description are required.");
      return;
    }

    setSavingHeader(true);
    const toastId = toast.loading("Saving categories section...");
    try {
      const response = await fetch("/api/admin/categories-section", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eyebrow: headerEyebrow.trim(),
          title: headerTitle.trim(),
          description: headerDescription.trim(),
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result?.error ?? "Unable to save categories section.");
      toast.success("Categories section saved.", { id: toastId });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save categories section.", { id: toastId });
    } finally {
      setSavingHeader(false);
    }
  };

  const handleEdit = (category: CategoryRow) => {
    setEditingCategory(category);
    setEditTitle(category.title);
    setEditSlug(category.slug);
    setEditDescription(category.description);
    setEditCategoryType(category.parent_category_id ? "child" : "parent");
    setEditParentCategoryId(category.parent_category_id ?? "");
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
    setEditCategoryType("parent");
    setEditParentCategoryId("");
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
      if (editCategoryType === "child" && !editParentCategoryId) {
        throw new Error("Select a parent category for child categories.");
      }
      const formData = new FormData();
      formData.append("title", editTitle.trim());
      formData.append("slug", editSlug.trim());
      formData.append("description", editDescription.trim());
      formData.append("categoryType", editCategoryType);
      if (editCategoryType === "child") {
        formData.append("parentCategoryId", editParentCategoryId);
      }
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
                parent_category_id: result.category.parent_category_id ?? null,
                thumbnail_alt: editThumbnailAlt,
                thumbnail_url: result.category.thumbnail_url || cat.thumbnail_url,
                hover_thumbnail_url: result.category.hover_thumbnail_url || cat.hover_thumbnail_url,
              }
            : cat
        )
      );
      toast.success("Category updated successfully.");
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
      toast.success("Category deleted successfully.");
      setDeleteTarget(null); // close dialog on success
    } catch (error) {
      // Keep dialog open so user sees the error — we just stop the spinner
      toast.error(error instanceof Error ? error.message : "Unable to delete category.");
    } finally {
      setDeleting(null);
    }
  };

  const categoryById = useMemo(
    () => new Map(categories.map((category) => [category.id, category])),
    [categories],
  );

  const childrenByParentId = useMemo(() => {
    const groups = new Map<string, CategoryRow[]>();
    categories.forEach((category) => {
      if (!category.parent_category_id) return;
      const children = groups.get(category.parent_category_id) ?? [];
      children.push(category);
      groups.set(category.parent_category_id, children);
    });
    return groups;
  }, [categories]);

  const parentOptions = useMemo<SelectOption[]>(
    () =>
      categories
        .filter((category) => !category.parent_category_id && category.id !== editingCategory?.id)
        .sort((a, b) => a.title.localeCompare(b.title))
        .map((category) => ({ value: category.id, label: category.title })),
    [categories, editingCategory?.id],
  );

  const visibleCategories = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const matches = categories.filter((category) => {
      const parentTitle = category.parent_category_id ? categoryById.get(category.parent_category_id)?.title ?? "" : "";
      const type = category.parent_category_id ? "child" : "parent";
      const matchesQuery =
        !query ||
        category.title.toLowerCase().includes(query) ||
        category.slug.toLowerCase().includes(query) ||
        category.description.toLowerCase().includes(query) ||
        category.thumbnail_alt.toLowerCase().includes(query) ||
        parentTitle.toLowerCase().includes(query);
      const matchesType = categoryFilter === "all" || type === categoryFilter;
      return matchesQuery && matchesType;
    });

    const byName = (a: CategoryRow, b: CategoryRow) => a.title.localeCompare(b.title);
    const byCreated = (a: CategoryRow, b: CategoryRow) =>
      new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();

    if (sort === "hierarchy") {
      const parents = matches.filter((category) => !category.parent_category_id).sort(byName);
      const parentIds = new Set(parents.map((category) => category.id));
      const orphanedChildren = matches
        .filter((category) => category.parent_category_id && !parentIds.has(category.parent_category_id))
        .sort(byName);

      return [
        ...parents.flatMap((parent) => [
          parent,
          ...(childrenByParentId.get(parent.id) ?? []).filter((child) => matches.some((match) => match.id === child.id)).sort(byName),
        ]),
        ...orphanedChildren,
      ];
    }

    return [...matches].sort((a, b) => {
      if (sort === "name-asc") return byName(a, b);
      if (sort === "name-desc") return byName(b, a);
      if (sort === "created-asc") return byCreated(a, b);
      if (sort === "created-desc") return byCreated(b, a);
      if (sort === "type") {
        const typeCompare = Number(!!a.parent_category_id) - Number(!!b.parent_category_id);
        return typeCompare || byName(a, b);
      }
      return 0;
    });
  }, [categories, categoryById, categoryFilter, childrenByParentId, searchQuery, sort]);

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

  // Pagination logic
  const totalPages = Math.ceil(visibleCategories.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCategories = visibleCategories.slice(startIndex, endIndex);

  return (
    <div className="px-6 py-8 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <section className="mb-8 rounded-[32px] bg-white p-6 shadow-sm sm:p-8">
          <div>
            <h1 className="text-3xl tracking-[-0.03em] text-[#1b1511]">Categories Section Header</h1>
            <p className="mt-2 text-sm text-[#665b4f]">
              Edit the homepage collections section title and description.
            </p>
          </div>
          <div className="mt-8 grid gap-5 md:grid-cols-[0.8fr_1.2fr]">
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
            {savingHeader ? "Saving..." : "Save Categories Header"}
          </Button>
        </section>

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
          <div className="mb-6 grid gap-3 lg:grid-cols-[1.5fr_0.8fr_0.8fr]">
            <div className="flex items-center gap-3 rounded-full border border-[#d9ccbc] bg-[#fcfaf7] px-4 py-3">
              <Search className="h-5 w-5 text-[#8a7765]" />
              <input
                type="text"
                placeholder="Search by name, slug, parent, description, or alt text..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent text-sm text-[#1b1511] outline-none placeholder:text-[#a69280]"
              />
            </div>
            <AppSelect<SelectOption<CategoryFilter>>
              instanceId="admin-category-filter"
              value={filterOptions.find((option) => option.value === categoryFilter)}
              options={filterOptions}
              onChange={(option) => setCategoryFilter(option?.value ?? "all")}
              isSearchable={false}
            />
            <AppSelect<SelectOption<SortKey>>
              instanceId="admin-category-sort"
              value={sortOptions.find((option) => option.value === sort)}
              options={sortOptions}
              onChange={(option) => setSort(option?.value ?? "hierarchy")}
              isSearchable={false}
            />
          </div>

          <div className="overflow-x-auto">
            {paginatedCategories.length ? (
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b-2 border-[#d9ccbc]">
                    <th className="p-3 text-left text-xs font-semibold uppercase tracking-[0.25em] text-[#8a7765]">#</th>
                    <th className="p-3 text-left text-xs font-semibold uppercase tracking-[0.25em] text-[#8a7765]">Thumbnails</th>
                    <th className="p-3 text-left text-xs font-semibold uppercase tracking-[0.25em] text-[#8a7765]">Category Name</th>
                    <th className="p-3 text-left text-xs font-semibold uppercase tracking-[0.25em] text-[#8a7765]">Type</th>
                    <th className="p-3 text-left text-xs font-semibold uppercase tracking-[0.25em] text-[#8a7765]">Parent Category</th>
                    <th className="p-3 text-left text-xs font-semibold uppercase tracking-[0.25em] text-[#8a7765]">Slug</th>
                    <th className="p-3 text-left text-xs font-semibold uppercase tracking-[0.25em] text-[#8a7765]">Created Date</th>
                    <th className="p-3 text-center text-xs font-semibold uppercase tracking-[0.25em] text-[#8a7765]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedCategories.map((category, index) => {
                    const parentCategory = category.parent_category_id ? categoryById.get(category.parent_category_id) : null;
                    const isChild = !!category.parent_category_id;
                    return (
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
                        <td className="p-3 text-sm font-medium text-[#1b1511]">
                          <div className={isChild ? "pl-5" : ""}>
                            {isChild && <span className="mr-2 text-[#8a7765]">├──</span>}
                            {category.title}
                          </div>
                        </td>
                        <td className="p-3 text-sm text-[#665b4f]">
                          <span className="rounded-full bg-[#f5eee4] px-3 py-1 text-xs font-medium text-[#5f544b]">
                            {isChild ? "Child" : "Parent"}
                          </span>
                        </td>
                        <td className="p-3 text-sm text-[#665b4f]">{parentCategory?.title ?? "—"}</td>
                        <td className="p-3 text-sm text-[#665b4f]">{category.slug}</td>
                        <td className="p-3 text-sm text-[#665b4f]">{formatDate(category.created_at)}</td>
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
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="rounded-2xl border border-dashed border-[#d9ccbc] bg-[#fcfaf7] p-8 text-center text-sm leading-7 text-[#665b4f]">
                {searchQuery || categoryFilter !== "all" ? "No categories match your filters." : "No categories yet. Create the first one."}
              </div>
            )}
          </div>

          {/* Pagination */}
          {visibleCategories.length > 0 && totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between border-t border-[#e8ddd1] pt-6">
              <p className="text-sm text-[#665b4f]">
                Showing {startIndex + 1} to {Math.min(endIndex, visibleCategories.length)} of {visibleCategories.length} categories
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

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-[#352a21]">
                      Category Type
                    </label>
                    <div className="mt-2">
                      <AppSelect<SelectOption<"parent" | "child">>
                        instanceId="edit-category-type"
                        value={categoryTypeOptions.find((option) => option.value === editCategoryType)}
                        options={categoryTypeOptions}
                        onChange={(option) => {
                          const nextType = option?.value ?? "parent";
                          setEditCategoryType(nextType);
                          if (nextType === "parent") setEditParentCategoryId("");
                        }}
                        isSearchable={false}
                      />
                    </div>
                  </div>

                  {editCategoryType === "child" && (
                    <div>
                      <label className="block text-sm font-medium text-[#352a21]">
                        Parent Category
                      </label>
                      <div className="mt-2">
                        <AppSelect
                          instanceId="edit-parent-category"
                          value={parentOptions.find((option) => option.value === editParentCategoryId) ?? null}
                          options={parentOptions}
                          onChange={(option) => setEditParentCategoryId(option?.value ?? "")}
                          placeholder="Select parent category"
                          noOptionsMessage={() => "No parent categories found"}
                        />
                      </div>
                    </div>
                  )}
                </div>

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
