"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bold,
  CalendarDays,
  Code2,
  Eye,
  Heading2,
  ImageIcon,
  Italic,
  Link2,
  List,
  ListOrdered,
  Loader2,
  Pencil,
  Plus,
  Quote,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { AppSelect, type SelectOption } from "@/components/ui/app-select";
import { Button } from "@/components/ui/button";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";
import { ImageUploader } from "@/components/ui/image-uploader";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { createClient } from "@/lib/supabase/client";
import { Post, PostStatus, formatPostDate, normalizePostTags, slugify } from "@/lib/post-utils";

const supabase = createClient();

type PostsManagerProps = {
  initialUserEmail: string;
  initialPosts: Post[];
};

type FormState = {
  id?: string;
  title: string;
  slug: string;
  short_description: string;
  content: string;
  category: string;
  tags: string;
  author: string;
  meta_title: string;
  meta_description: string;
  status: PostStatus;
  published_at: string;
  featured_image: string | null;
};

const emptyForm: FormState = {
  title: "",
  slug: "",
  short_description: "",
  content: "",
  category: "",
  tags: "",
  author: "",
  meta_title: "",
  meta_description: "",
  status: "draft",
  published_at: "",
  featured_image: null,
};

const PAGE_SIZE = 8;
const publishStatusOptions: SelectOption<PostStatus>[] = [
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
];
const statusFilterOptions: SelectOption[] = [
  { value: "all", label: "All statuses" },
  { value: "published", label: "Published" },
  { value: "draft", label: "Draft" },
];
const dateFilterOptions: SelectOption[] = [
  { value: "all", label: "Any date" },
  { value: "7", label: "Last 7 days" },
  { value: "30", label: "Last 30 days" },
];
const postSortOptions: SelectOption<"latest" | "oldest" | "title">[] = [
  { value: "latest", label: "Latest" },
  { value: "oldest", label: "Oldest" },
  { value: "title", label: "Title A-Z" },
];
const inputClassName =
  "mt-2 h-11 rounded-[32px] border border-[#d9ccbc] bg-white px-4 py-3 text-sm text-[#1b1511] outline-none transition placeholder:text-[#a69280] focus:border-[#b38d67] focus:ring-4 focus:ring-[#d7b68b]/20";
const labelClassName = "text-sm font-medium text-[#352a21]";

const toDateTimeLocal = (value: string | null) => {
  if (!value) return "";
  const date = new Date(value);
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 16);
};

const fromDateTimeLocal = (value: string) => (value ? new Date(value).toISOString() : "");

export default function PostsManager({ initialUserEmail, initialPosts }: PostsManagerProps) {
  const router = useRouter();
  const editorRef = useRef<HTMLDivElement>(null);
  const [posts, setPosts] = useState(initialPosts);
  const [checkingSession, setCheckingSession] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [removeExistingImage, setRemoveExistingImage] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingTable, setLoadingTable] = useState(false);
  const [viewPost, setViewPost] = useState<Post | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Post | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [sort, setSort] = useState<"latest" | "oldest" | "title">("latest");
  const [page, setPage] = useState(1);

  const editing = Boolean(form.id);

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

  useEffect(() => {
    setPage(1);
    setLoadingTable(true);
    const timer = window.setTimeout(() => setLoadingTable(false), 220);
    return () => window.clearTimeout(timer);
  }, [query, categoryFilter, statusFilter, dateFilter, sort]);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== form.content) {
      editorRef.current.innerHTML = form.content;
    }
  }, [form.id, form.content]);

  const categories = useMemo(
    () => Array.from(new Set(posts.map((post) => post.category).filter(Boolean))).sort(),
    [posts],
  );
  const categoryFilterOptions = useMemo<SelectOption[]>(
    () => [
      { value: "all", label: "All categories" },
      ...categories.map((item) => ({ value: item, label: item })),
    ],
    [categories],
  );

  const filteredPosts = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;

    return posts
      .filter((post) => {
        const text = [post.title, post.slug, post.short_description, post.category, post.author, normalizePostTags(post.tags).join(" ")]
          .join(" ")
          .toLowerCase();
        const matchesQuery = !needle || text.includes(needle);
        const matchesCategory = categoryFilter === "all" || post.category === categoryFilter;
        const matchesStatus = statusFilter === "all" || post.status === statusFilter;
        const createdTime = new Date(post.created_at).getTime();
        const matchesDate =
          dateFilter === "all" ||
          (dateFilter === "7" && now - createdTime <= 7 * day) ||
          (dateFilter === "30" && now - createdTime <= 30 * day);
        return matchesQuery && matchesCategory && matchesStatus && matchesDate;
      })
      .sort((a, b) => {
        if (sort === "title") return a.title.localeCompare(b.title);
        const left = new Date(a.published_at ?? a.created_at).getTime();
        const right = new Date(b.published_at ?? b.created_at).getTime();
        return sort === "latest" ? right - left : left - right;
      });
  }, [posts, categoryFilter, dateFilter, query, sort, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const visiblePosts = filteredPosts.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const openCreateForm = () => {
    setForm(emptyForm);
    setImageFile(null);
    setRemoveExistingImage(false);
    setIsFormOpen(true);
  };

  const openEditForm = (post: Post) => {
    setForm({
      id: post.id,
      title: post.title,
      slug: post.slug,
      short_description: post.short_description,
      content: post.content,
      category: post.category,
      tags: normalizePostTags(post.tags).join(", "),
      author: post.author,
      meta_title: post.meta_title ?? "",
      meta_description: post.meta_description ?? "",
      status: post.status,
      published_at: toDateTimeLocal(post.published_at),
      featured_image: post.featured_image,
    });
    setImageFile(null);
    setRemoveExistingImage(false);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setForm(emptyForm);
    setImageFile(null);
    setRemoveExistingImage(false);
  };

  const updateTitle = (title: string) => {
    setForm((current) => ({
      ...current,
      title,
      slug: current.id && current.slug ? current.slug : slugify(title),
      meta_title: current.meta_title || title,
    }));
  };

  const runEditorCommand = (command: string, value?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, value);
    setForm((current) => ({ ...current, content: editorRef.current?.innerHTML ?? "" }));
  };

  const insertLink = () => {
    const url = window.prompt("Enter link URL");
    if (url) runEditorCommand("createLink", url);
  };

  const insertImage = () => {
    const url = window.prompt("Enter image URL");
    if (url) runEditorCommand("insertImage", url);
  };

  const handleImageChange = (file: File | File[]) => {
    const selectedFile = Array.isArray(file) ? file[0] : file;
    if (!selectedFile) return;
    setImageFile(selectedFile);
    setRemoveExistingImage(false);
  };

  const removeImage = () => {
    setImageFile(null);
    setRemoveExistingImage(true);
  };

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.slug.trim() || !form.short_description.trim() || !form.content.trim() || !form.category.trim() || !form.author.trim()) {
      toast.error("Please fill in title, slug, description, content, category, and author.");
      return;
    }

    setSaving(true);
    const toastId = toast.loading(editing ? "Updating post..." : "Creating post...");

    try {
      const data = new FormData();
      data.append("title", form.title.trim());
      data.append("slug", form.slug.trim());
      data.append("short_description", form.short_description.trim());
      data.append("content", form.content.trim());
      data.append("category", form.category.trim());
      data.append("tags", form.tags.trim());
      data.append("author", form.author.trim());
      data.append("meta_title", form.meta_title.trim());
      data.append("meta_description", form.meta_description.trim());
      data.append("status", form.status);
      data.append("published_at", fromDateTimeLocal(form.published_at));
      data.append("remove_image", String(removeExistingImage));
      if (imageFile) data.append("featured_image", imageFile);

      const response = await fetch(editing ? `/api/admin/posts/${form.id}` : "/api/admin/posts", {
        method: editing ? "PUT" : "POST",
        body: data,
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result?.error ?? "Unable to save post.");

      setPosts((current) =>
        editing
          ? current.map((post) => (post.id === result.post.id ? result.post : post))
          : [result.post, ...current],
      );
      toast.success(editing ? "Post updated." : "Post created.", { id: toastId });
      closeForm();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save post.", { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (post: Post) => {
    const nextStatus: PostStatus = post.status === "published" ? "draft" : "published";
    const toastId = toast.loading(nextStatus === "published" ? "Publishing post..." : "Moving post to draft...");
    try {
      const response = await fetch(`/api/admin/posts/${post.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: nextStatus,
          published_at: nextStatus === "published" ? post.published_at ?? new Date().toISOString() : null,
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result?.error ?? "Unable to update status.");
      setPosts((current) => current.map((item) => (item.id === post.id ? result.post : item)));
      toast.success(nextStatus === "published" ? "Post published." : "Post unpublished.", { id: toastId });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update status.", { id: toastId });
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const toastId = toast.loading("Deleting post...");
    try {
      const response = await fetch(`/api/admin/posts/${deleteTarget.id}`, { method: "DELETE" });
      const result = await response.json();
      if (!response.ok) throw new Error(result?.error ?? "Unable to delete post.");
      setPosts((current) => current.filter((post) => post.id !== deleteTarget.id));
      setDeleteTarget(null);
      toast.success("Post deleted.", { id: toastId });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to delete post.", { id: toastId });
    } finally {
      setDeleting(false);
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
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-[#8a7765]">
                Admin Dashboard
              </p>
              <h1 className="mt-2 text-4xl tracking-[-0.04em] text-[#1b1511]">
                Posts Management
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-[#665b4f]">
                Create, edit, publish, and organize posts for the public website.
              </p>
            </div>
            <Button
              type="button"
              onClick={openCreateForm}
              className="h-12 rounded-full bg-[#1b1511] px-5 text-white hover:bg-[#3a2f27]"
            >
              <Plus className="h-4 w-4" />
              Create post
            </Button>
          </div>
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
                  <h2 className="text-3xl tracking-[-0.03em] text-[#1b1511]">
                    {editing ? "Edit post" : "Create post"}
                  </h2>
                  <p className="mt-2 text-sm text-[#665b4f]">
                    Slug is generated from the title until you edit an existing post.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeForm}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f5eee4] text-[#1b1511] transition hover:bg-[#e8ddd1]"
                  aria-label="Close form"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
                <div className="grid gap-5">
                  <div className="grid gap-4 md:grid-cols-2">
                    <label>
                      <span className={labelClassName}>Title</span>
                      <Input value={form.title} onChange={(event) => updateTitle(event.target.value)} className={inputClassName} />
                    </label>
                    <label>
                      <span className={labelClassName}>Slug</span>
                      <Input value={form.slug} onChange={(event) => setForm((current) => ({ ...current, slug: slugify(event.target.value) }))} className={inputClassName} />
                    </label>
                  </div>

                  <label>
                    <span className={labelClassName}>Short Description</span>
                    <textarea
                      value={form.short_description}
                      onChange={(event) => setForm((current) => ({ ...current, short_description: event.target.value }))}
                      className="mt-2 min-h-24 w-full rounded-[32px] border border-[#d9ccbc] bg-white px-4 py-3 text-sm text-[#1b1511] outline-none transition focus:border-[#b38d67] focus:ring-4 focus:ring-[#d7b68b]/20"
                    />
                  </label>

                  <div>
                    <span className={labelClassName}>Rich Text Content</span>
                    <div className="mt-2 overflow-hidden rounded-[32px] border border-[#d9ccbc]">
                      <div className="flex flex-wrap gap-1 border-b border-[#e8ddd1] bg-[#fcfaf7] p-2">
                        {[
                          { icon: Bold, label: "Bold", command: "bold" },
                          { icon: Italic, label: "Italic", command: "italic" },
                          { icon: Heading2, label: "Heading", command: "formatBlock", value: "h2" },
                          { icon: List, label: "Bullet list", command: "insertUnorderedList" },
                          { icon: ListOrdered, label: "Numbered list", command: "insertOrderedList" },
                          { icon: Quote, label: "Quote", command: "formatBlock", value: "blockquote" },
                          { icon: Code2, label: "Code", command: "formatBlock", value: "pre" },
                        ].map((item) => {
                          const Icon = item.icon;
                          return (
                            <button
                              key={item.label}
                              type="button"
                              title={item.label}
                              onClick={() => runEditorCommand(item.command, item.value)}
                              className="flex h-9 w-9 items-center justify-center rounded-[32px] text-[#665b4f] transition hover:bg-[#f5eee4] hover:text-[#1b1511]"
                            >
                              <Icon className="h-4 w-4" />
                            </button>
                          );
                        })}
                        <button type="button" title="Link" onClick={insertLink} className="flex h-9 w-9 items-center justify-center rounded-[32px] text-[#665b4f] transition hover:bg-[#f5eee4] hover:text-[#1b1511]">
                          <Link2 className="h-4 w-4" />
                        </button>
                        <button type="button" title="Image" onClick={insertImage} className="flex h-9 w-9 items-center justify-center rounded-[32px] text-[#665b4f] transition hover:bg-[#f5eee4] hover:text-[#1b1511]">
                          <ImageIcon className="h-4 w-4" />
                        </button>
                      </div>
                      <div
                        ref={editorRef}
                        contentEditable
                        suppressContentEditableWarning
                        onInput={() => setForm((current) => ({ ...current, content: editorRef.current?.innerHTML ?? "" }))}
                        className="blog-content min-h-72 bg-white p-4 text-sm outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <label>
                      <span className={labelClassName}>Category</span>
                      <Input value={form.category} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))} className={inputClassName} list="post-categories" />
                      <datalist id="post-categories">
                        {categories.map((item) => <option key={item} value={item} />)}
                      </datalist>
                    </label>
                    <label>
                      <span className={labelClassName}>Tags</span>
                      <Input value={form.tags} onChange={(event) => setForm((current) => ({ ...current, tags: event.target.value }))} className={inputClassName} placeholder="Clay, Glaze, Studio" />
                    </label>
                    <label>
                      <span className={labelClassName}>Author Name</span>
                      <Input value={form.author} onChange={(event) => setForm((current) => ({ ...current, author: event.target.value }))} className={inputClassName} />
                    </label>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <label>
                      <span className={labelClassName}>SEO Meta Title</span>
                      <Input value={form.meta_title} onChange={(event) => setForm((current) => ({ ...current, meta_title: event.target.value }))} className={inputClassName} />
                    </label>
                    <label>
                      <span className={labelClassName}>SEO Meta Description</span>
                      <Input value={form.meta_description} onChange={(event) => setForm((current) => ({ ...current, meta_description: event.target.value }))} className={inputClassName} />
                    </label>
                  </div>
                </div>

                <aside className="rounded-[32px] border border-[#e8ddd1] bg-[#fcfaf7] p-4">
                  <ImageUploader
                    label="Featured Image"
                    hint={form.featured_image && !removeExistingImage ? "Choose a new image to replace the current one" : "Used on post cards and the article header"}
                    file={imageFile}
                    onChange={handleImageChange}
                    onRemove={removeImage}
                  />

                  {form.featured_image && !imageFile && !removeExistingImage && (
                    <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="mt-4 overflow-hidden rounded-[32px] border border-[#e8ddd1] bg-white">
                      <div className="relative h-52 bg-[#f5eee4]">
                        <Image src={form.featured_image} alt="Current featured image" fill className="object-contain" />
                      </div>
                      <button type="button" onClick={removeImage} className="flex w-full items-center justify-center gap-2 border-t border-[#e8ddd1] px-3 py-2 text-sm text-[#7a4d1d] transition hover:bg-[#faf4ea]">
                        <X className="h-4 w-4" />
                        Remove current image
                      </button>
                    </motion.div>
                  )}

                  <div className="mt-5 grid gap-4">
                    <label>
                      <span className={labelClassName}>Publish Status</span>
                      <div className="mt-2">
                        <AppSelect<SelectOption<PostStatus>>
                          instanceId="post-publish-status"
                          value={publishStatusOptions.find((option) => option.value === form.status)}
                          options={publishStatusOptions}
                          onChange={(option) => setForm((current) => ({ ...current, status: option?.value ?? "draft" }))}
                          isSearchable={false}
                        />
                      </div>
                    </label>
                    <label>
                      <span className={labelClassName}>Published Date</span>
                      <Input type="datetime-local" value={form.published_at} onChange={(event) => setForm((current) => ({ ...current, published_at: event.target.value }))} className={inputClassName} />
                    </label>
                    <Button type="button" onClick={handleSubmit} disabled={saving} className="h-12 rounded-full bg-[#1b1511] text-white hover:bg-[#3a2f27]">
                      {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                      {editing ? "Save changes" : "Create post"}
                    </Button>
                  </div>
                </aside>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        <section className="mt-8 rounded-[32px] bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6 grid gap-3 xl:grid-cols-[1fr_180px_160px_160px_160px_150px]">
            <div className="flex items-center gap-3 rounded-full border border-[#d9ccbc] bg-[#fcfaf7] px-4 py-3">
              <Search className="h-5 w-5 text-[#8a7765]" />
              <input
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search title, slug, author, category, or tags..."
                className="min-w-0 flex-1 bg-transparent text-sm text-[#1b1511] outline-none placeholder:text-[#a69280]"
              />
            </div>
            <AppSelect
              instanceId="admin-post-category-filter"
              value={categoryFilterOptions.find((option) => option.value === categoryFilter)}
              options={categoryFilterOptions}
              onChange={(option) => setCategoryFilter(option?.value ?? "all")}
              isClearable
              placeholder="All categories"
            />
            <AppSelect
              instanceId="admin-post-status-filter"
              value={statusFilterOptions.find((option) => option.value === statusFilter)}
              options={statusFilterOptions}
              onChange={(option) => setStatusFilter(option?.value ?? "all")}
              isClearable
              placeholder="All statuses"
            />
            <AppSelect
              instanceId="admin-post-date-filter"
              value={dateFilterOptions.find((option) => option.value === dateFilter)}
              options={dateFilterOptions}
              onChange={(option) => setDateFilter(option?.value ?? "all")}
              isClearable
              placeholder="Any date"
            />
            <AppSelect<SelectOption<"latest" | "oldest" | "title">>
              instanceId="admin-post-sort"
              value={postSortOptions.find((option) => option.value === sort)}
              options={postSortOptions}
              onChange={(option) => setSort(option?.value ?? "latest")}
              isClearable
              placeholder="Latest"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setQuery("");
                setCategoryFilter("all");
                setStatusFilter("all");
                setDateFilter("all");
                setSort("latest");
              }}
              className="h-12 rounded-full border-[#d9ccbc] bg-transparent text-[#1b1511] hover:bg-[#f5eee4]"
            >
              Clear filters
            </Button>
          </div>

          <div className="max-h-[620px] overflow-auto rounded-[32px] border border-[#e8ddd1]">
            <table className="w-full min-w-[980px] border-collapse text-left text-sm">
              <thead className="sticky top-0 z-10 bg-[#fcfaf7] shadow-[0_1px_0_#e8ddd1]">
                <tr>
                  <th className="p-3 text-left text-xs font-semibold uppercase tracking-[0.22em] text-[#8a7765]">Post</th>
                  <th className="p-3 text-left text-xs font-semibold uppercase tracking-[0.22em] text-[#8a7765]">Category</th>
                  <th className="p-3 text-left text-xs font-semibold uppercase tracking-[0.22em] text-[#8a7765]">Author</th>
                  <th className="p-3 text-left text-xs font-semibold uppercase tracking-[0.22em] text-[#8a7765]">Status</th>
                  <th className="p-3 text-left text-xs font-semibold uppercase tracking-[0.22em] text-[#8a7765]">Published</th>
                  <th className="p-3 text-center text-xs font-semibold uppercase tracking-[0.22em] text-[#8a7765]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loadingTable ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <tr key={index} className="border-t border-[#e8ddd1]">
                      <td className="px-4 py-4"><Skeleton className="h-12 w-64 bg-[#eee3d6]" /></td>
                      <td className="px-4 py-4"><Skeleton className="h-5 w-24 bg-[#eee3d6]" /></td>
                      <td className="px-4 py-4"><Skeleton className="h-5 w-24 bg-[#eee3d6]" /></td>
                      <td className="px-4 py-4"><Skeleton className="h-8 w-28 bg-[#eee3d6]" /></td>
                      <td className="px-4 py-4"><Skeleton className="h-5 w-28 bg-[#eee3d6]" /></td>
                      <td className="px-4 py-4"><Skeleton className="h-9 w-40 bg-[#eee3d6]" /></td>
                    </tr>
                  ))
                ) : visiblePosts.length ? (
                  visiblePosts.map((post) => (
                    <tr key={post.id} className="border-b border-[#e8ddd1] align-middle transition hover:bg-[#fcfaf7]">
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-xl border border-[#e8ddd1] bg-[#f5eee4]">
                            {post.featured_image ? <Image src={post.featured_image} alt={post.title} fill className="object-cover" /> : null}
                          </div>
                          <div>
                            <p className="font-semibold text-[#1b1511]">{post.title}</p>
                            <p className="mt-1 text-xs text-[#8a7765]">/{post.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-[#665b4f]">{post.category}</td>
                      <td className="p-3 text-[#665b4f]">{post.author}</td>
                      <td className="p-3">
                        <button
                          type="button"
                          onClick={() => toggleStatus(post)}
                          className={`rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] transition ${
                            post.status === "published"
                              ? "bg-green-50 text-green-700 hover:bg-green-100"
                              : "bg-[#f5eee4] text-[#8a5f3b] hover:bg-[#eadcca]"
                          }`}
                        >
                          {post.status === "published" ? "Published" : "Draft"}
                        </button>
                      </td>
                      <td className="p-3 text-[#665b4f]">
                        <span className="inline-flex items-center gap-2">
                          <CalendarDays className="h-4 w-4" />
                          {formatPostDate(post.published_at)}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center justify-center gap-2">
                          <button type="button" title="View details" onClick={() => setViewPost(post)} className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#d9ccbc] text-[#1b1511] transition hover:bg-[#f5eee4]">
                            <Eye className="h-4 w-4" />
                          </button>
                          <Link href={`/posts/${post.slug}`} target="_blank" title="Open public post" className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#d9ccbc] text-[#1b1511] transition hover:bg-[#f5eee4]">
                            <Search className="h-4 w-4" />
                          </Link>
                          <button type="button" title="Edit post" onClick={() => openEditForm(post)} className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#d9ccbc] text-[#1b1511] transition hover:bg-[#f5eee4]">
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button type="button" title="Delete post" onClick={() => setDeleteTarget(post)} className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#d9ccbc] text-[#7a4d1d] transition hover:bg-[#faf4ea]">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-4 py-16 text-center">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#8a7765]">No posts found</p>
                      <p className="mt-2 text-sm text-[#665b4f]">Create a post or adjust your filters.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {filteredPosts.length > 0 && totalPages > 1 && (
            <div className="mt-6 flex flex-col gap-4 border-t border-[#e8ddd1] pt-6 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-[#665b4f]">
                Showing {(currentPage - 1) * PAGE_SIZE + 1} to {Math.min(currentPage * PAGE_SIZE, filteredPosts.length)} of {filteredPosts.length} posts
              </p>
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setPage} />
            </div>
          )}
        </section>
      </div>

      <AnimatePresence>
        {viewPost && (
          <motion.div className="fixed inset-0 z-50 bg-black/40 p-4 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 18 }} className="mx-auto mt-10 max-h-[86vh] max-w-3xl overflow-auto rounded-[32px] bg-white p-6 shadow-xl">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8a7765]">{viewPost.category}</p>
                  <h2 className="mt-2 text-3xl tracking-[-0.03em] text-[#1b1511]">{viewPost.title}</h2>
                  <p className="mt-2 text-sm text-[#665b4f]">/{viewPost.slug} by {viewPost.author}</p>
                </div>
                <button type="button" onClick={() => setViewPost(null)} className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f5eee4]">
                  <X className="h-4 w-4" />
                </button>
              </div>
              {viewPost.featured_image && (
                <div className="relative mt-5 aspect-[16/9] overflow-hidden rounded-[32px] bg-[#efe5d9]">
                  <Image src={viewPost.featured_image} alt={viewPost.title} fill className="object-contain" />
                </div>
              )}
              <p className="mt-5 text-base leading-7 text-[#665b4f]">{viewPost.short_description}</p>
              <div className="blog-content mt-5 border-t border-[#e8ddd1] pt-5" dangerouslySetInnerHTML={{ __html: viewPost.content }} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <DeleteConfirmDialog
        open={Boolean(deleteTarget)}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        loading={deleting}
        itemName={deleteTarget?.title}
        title="Delete post"
        description={deleteTarget ? `Delete "${deleteTarget.title}" permanently? This cannot be undone.` : undefined}
      />
    </div>
  );
}
