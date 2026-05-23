"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FileUploader } from "react-drag-drop-files";
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
  UploadCloud,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { createClient } from "@/lib/supabase/client";
import { Blog, BlogStatus, formatBlogDate, normalizeBlogTags, slugify } from "@/lib/blog-utils";

const supabase = createClient();

type BlogsManagerProps = {
  initialUserEmail: string;
  initialBlogs: Blog[];
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
  status: BlogStatus;
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
const inputClassName =
  "mt-2 h-11 rounded-[8px] border-[#d9ccbc] bg-white text-[#1b1511] focus-visible:ring-[#d7b68b]/30";
const labelClassName = "text-xs font-semibold uppercase tracking-[0.18em] text-[#8a7765]";

const toDateTimeLocal = (value: string | null) => {
  if (!value) return "";
  const date = new Date(value);
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 16);
};

const fromDateTimeLocal = (value: string) => (value ? new Date(value).toISOString() : "");

export default function BlogsManager({ initialUserEmail, initialBlogs }: BlogsManagerProps) {
  const router = useRouter();
  const editorRef = useRef<HTMLDivElement>(null);
  const [blogs, setBlogs] = useState(initialBlogs);
  const [checkingSession, setCheckingSession] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [removeExistingImage, setRemoveExistingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [saving, setSaving] = useState(false);
  const [loadingTable, setLoadingTable] = useState(false);
  const [viewBlog, setViewBlog] = useState<Blog | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Blog | null>(null);
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
    if (!imageFile) return;
    const url = URL.createObjectURL(imageFile);
    setImagePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== form.content) {
      editorRef.current.innerHTML = form.content;
    }
  }, [form.id, form.content]);

  const categories = useMemo(
    () => Array.from(new Set(blogs.map((blog) => blog.category).filter(Boolean))).sort(),
    [blogs],
  );

  const filteredBlogs = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;

    return blogs
      .filter((blog) => {
        const text = [blog.title, blog.slug, blog.short_description, blog.category, blog.author, normalizeBlogTags(blog.tags).join(" ")]
          .join(" ")
          .toLowerCase();
        const matchesQuery = !needle || text.includes(needle);
        const matchesCategory = categoryFilter === "all" || blog.category === categoryFilter;
        const matchesStatus = statusFilter === "all" || blog.status === statusFilter;
        const createdTime = new Date(blog.created_at).getTime();
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
  }, [blogs, categoryFilter, dateFilter, query, sort, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredBlogs.length / PAGE_SIZE));
  const visibleBlogs = filteredBlogs.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const openCreateForm = () => {
    setForm(emptyForm);
    setImageFile(null);
    setImagePreview(null);
    setRemoveExistingImage(false);
    setUploadProgress(0);
    setIsFormOpen(true);
  };

  const openEditForm = (blog: Blog) => {
    setForm({
      id: blog.id,
      title: blog.title,
      slug: blog.slug,
      short_description: blog.short_description,
      content: blog.content,
      category: blog.category,
      tags: normalizeBlogTags(blog.tags).join(", "),
      author: blog.author,
      meta_title: blog.meta_title ?? "",
      meta_description: blog.meta_description ?? "",
      status: blog.status,
      published_at: toDateTimeLocal(blog.published_at),
      featured_image: blog.featured_image,
    });
    setImageFile(null);
    setImagePreview(null);
    setRemoveExistingImage(false);
    setUploadProgress(0);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setForm(emptyForm);
    setImageFile(null);
    setImagePreview(null);
    setRemoveExistingImage(false);
    setUploadProgress(0);
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
    setUploadProgress(0);
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setRemoveExistingImage(true);
    setUploadProgress(0);
  };

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.slug.trim() || !form.short_description.trim() || !form.content.trim() || !form.category.trim() || !form.author.trim()) {
      toast.error("Please fill in title, slug, description, content, category, and author.");
      return;
    }

    setSaving(true);
    setUploadProgress(imageFile ? 8 : 0);
    const toastId = toast.loading(editing ? "Updating blog..." : "Creating blog...");
    let progressTimer: number | undefined;

    if (imageFile) {
      progressTimer = window.setInterval(() => {
        setUploadProgress((value) => Math.min(value + 14, 92));
      }, 180);
    }

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

      const response = await fetch(editing ? `/api/admin/blogs/${form.id}` : "/api/admin/blogs", {
        method: editing ? "PUT" : "POST",
        body: data,
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result?.error ?? "Unable to save blog.");

      setUploadProgress(imageFile ? 100 : 0);
      setBlogs((current) =>
        editing
          ? current.map((blog) => (blog.id === result.blog.id ? result.blog : blog))
          : [result.blog, ...current],
      );
      toast.success(editing ? "Blog updated." : "Blog created.", { id: toastId });
      closeForm();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save blog.", { id: toastId });
    } finally {
      if (progressTimer) window.clearInterval(progressTimer);
      setSaving(false);
    }
  };

  const toggleStatus = async (blog: Blog) => {
    const nextStatus: BlogStatus = blog.status === "published" ? "draft" : "published";
    const toastId = toast.loading(nextStatus === "published" ? "Publishing blog..." : "Moving blog to draft...");
    try {
      const response = await fetch(`/api/admin/blogs/${blog.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: nextStatus,
          published_at: nextStatus === "published" ? blog.published_at ?? new Date().toISOString() : null,
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result?.error ?? "Unable to update status.");
      setBlogs((current) => current.map((item) => (item.id === blog.id ? result.blog : item)));
      toast.success(nextStatus === "published" ? "Blog published." : "Blog unpublished.", { id: toastId });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update status.", { id: toastId });
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const toastId = toast.loading("Deleting blog...");
    try {
      const response = await fetch(`/api/admin/blogs/${deleteTarget.id}`, { method: "DELETE" });
      const result = await response.json();
      if (!response.ok) throw new Error(result?.error ?? "Unable to delete blog.");
      setBlogs((current) => current.filter((blog) => blog.id !== deleteTarget.id));
      setDeleteTarget(null);
      toast.success("Blog deleted.", { id: toastId });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to delete blog.", { id: toastId });
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
        <section className="rounded-[8px] bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-[#8a7765]">
                Admin Dashboard
              </p>
              <h1 className="mt-2 text-4xl tracking-[-0.04em] text-[#1b1511]">
                Blog Management
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-[#665b4f]">
                Create, edit, publish, and organize journal stories for the public blog.
              </p>
            </div>
            <Button
              type="button"
              onClick={openCreateForm}
              className="h-12 rounded-full bg-[#1b1511] px-5 text-white hover:bg-[#3a2f27]"
            >
              <Plus className="h-4 w-4" />
              Create blog
            </Button>
          </div>
        </section>

        <AnimatePresence>
          {isFormOpen && (
            <motion.section
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 18 }}
              className="mt-6 rounded-[8px] bg-white p-6 shadow-sm sm:p-8"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-3xl tracking-[-0.03em] text-[#1b1511]">
                    {editing ? "Edit blog" : "Create blog"}
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
                      className="mt-2 min-h-24 w-full rounded-[8px] border border-[#d9ccbc] bg-white px-4 py-3 text-sm text-[#1b1511] outline-none transition focus:border-[#b38d67] focus:ring-4 focus:ring-[#d7b68b]/20"
                    />
                  </label>

                  <div>
                    <span className={labelClassName}>Rich Text Content</span>
                    <div className="mt-2 overflow-hidden rounded-[8px] border border-[#d9ccbc]">
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
                              className="flex h-9 w-9 items-center justify-center rounded-[8px] text-[#665b4f] transition hover:bg-[#f5eee4] hover:text-[#1b1511]"
                            >
                              <Icon className="h-4 w-4" />
                            </button>
                          );
                        })}
                        <button type="button" title="Link" onClick={insertLink} className="flex h-9 w-9 items-center justify-center rounded-[8px] text-[#665b4f] transition hover:bg-[#f5eee4] hover:text-[#1b1511]">
                          <Link2 className="h-4 w-4" />
                        </button>
                        <button type="button" title="Image" onClick={insertImage} className="flex h-9 w-9 items-center justify-center rounded-[8px] text-[#665b4f] transition hover:bg-[#f5eee4] hover:text-[#1b1511]">
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
                      <Input value={form.category} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))} className={inputClassName} list="blog-categories" />
                      <datalist id="blog-categories">
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

                <aside className="rounded-[8px] border border-[#e8ddd1] bg-[#fcfaf7] p-4">
                  <span className={labelClassName}>Featured Image Upload</span>
                  <div className="mt-2">
                    <FileUploader
                      handleChange={handleImageChange}
                      name="featured_image"
                      types={["JPG", "JPEG", "PNG", "WEBP", "AVIF"]}
                      hoverTitle="Drop image"
                    >
                      <div className="flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-[8px] border border-dashed border-[#cbb9a4] bg-white p-5 text-center transition hover:border-[#b38d67] hover:bg-[#fffaf2]">
                        <UploadCloud className="h-8 w-8 text-[#8a7765]" />
                        <p className="mt-3 text-sm font-medium text-[#1b1511]">Drop or choose featured image</p>
                        <p className="mt-1 text-xs text-[#8a7765]">JPG, PNG, WEBP, or AVIF</p>
                      </div>
                    </FileUploader>
                  </div>

                  {(imagePreview || (form.featured_image && !removeExistingImage)) && (
                    <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="mt-4 overflow-hidden rounded-[8px] border border-[#e8ddd1] bg-white">
                      <div className="relative flex aspect-[4/3] items-center justify-center">
                        <Image src={imagePreview || form.featured_image || ""} alt="Featured preview" fill className="object-contain p-2" />
                      </div>
                      <button type="button" onClick={removeImage} className="flex w-full items-center justify-center gap-2 border-t border-[#e8ddd1] px-3 py-2 text-sm text-red-600 transition hover:bg-red-50">
                        <X className="h-4 w-4" />
                        Remove image
                      </button>
                    </motion.div>
                  )}

                  {imageFile && (
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-xs text-[#665b4f]">
                        <span>Upload progress</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#e8ddd1]">
                        <div className="h-full rounded-full bg-[#1b1511] transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                      </div>
                    </div>
                  )}

                  <div className="mt-5 grid gap-4">
                    <label>
                      <span className={labelClassName}>Publish Status</span>
                      <select
                        value={form.status}
                        onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as BlogStatus }))}
                        className="mt-2 h-11 w-full rounded-[8px] border border-[#d9ccbc] bg-white px-3 text-sm text-[#1b1511] outline-none focus:ring-4 focus:ring-[#d7b68b]/20"
                      >
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                      </select>
                    </label>
                    <label>
                      <span className={labelClassName}>Published Date</span>
                      <Input type="datetime-local" value={form.published_at} onChange={(event) => setForm((current) => ({ ...current, published_at: event.target.value }))} className={inputClassName} />
                    </label>
                    <Button type="button" onClick={handleSubmit} disabled={saving} className="h-12 rounded-full bg-[#1b1511] text-white hover:bg-[#3a2f27]">
                      {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                      {editing ? "Save changes" : "Create blog"}
                    </Button>
                  </div>
                </aside>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        <section className="mt-6 rounded-[8px] bg-white p-4 shadow-sm sm:p-6">
          <div className="grid gap-3 xl:grid-cols-[1fr_180px_160px_160px_160px]">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8a7765]" />
              <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search blogs" className="h-11 rounded-[8px] border-[#d9ccbc] bg-[#fcfaf7] pl-11" />
            </label>
            <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} className="h-11 rounded-[8px] border border-[#d9ccbc] bg-[#fcfaf7] px-3 text-sm">
              <option value="all">All categories</option>
              {categories.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="h-11 rounded-[8px] border border-[#d9ccbc] bg-[#fcfaf7] px-3 text-sm">
              <option value="all">All statuses</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
            <select value={dateFilter} onChange={(event) => setDateFilter(event.target.value)} className="h-11 rounded-[8px] border border-[#d9ccbc] bg-[#fcfaf7] px-3 text-sm">
              <option value="all">Any date</option>
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
            </select>
            <select value={sort} onChange={(event) => setSort(event.target.value as "latest" | "oldest" | "title")} className="h-11 rounded-[8px] border border-[#d9ccbc] bg-[#fcfaf7] px-3 text-sm">
              <option value="latest">Latest</option>
              <option value="oldest">Oldest</option>
              <option value="title">Title A-Z</option>
            </select>
          </div>

          <div className="mt-5 max-h-[620px] overflow-auto rounded-[8px] border border-[#e8ddd1]">
            <table className="min-w-[980px] w-full border-collapse text-left text-sm">
              <thead className="sticky top-0 z-10 bg-[#f5eee4] text-xs uppercase tracking-[0.16em] text-[#8a7765]">
                <tr>
                  <th className="px-4 py-3 font-semibold">Blog</th>
                  <th className="px-4 py-3 font-semibold">Category</th>
                  <th className="px-4 py-3 font-semibold">Author</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Published</th>
                  <th className="px-4 py-3 font-semibold">Actions</th>
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
                ) : visibleBlogs.length ? (
                  visibleBlogs.map((blog) => (
                    <tr key={blog.id} className="border-t border-[#e8ddd1] align-middle transition hover:bg-[#fcfaf7]">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-[8px] bg-[#efe5d9]">
                            {blog.featured_image ? <Image src={blog.featured_image} alt={blog.title} fill className="object-cover" /> : null}
                          </div>
                          <div>
                            <p className="font-semibold text-[#1b1511]">{blog.title}</p>
                            <p className="mt-1 text-xs text-[#8a7765]">/{blog.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-[#665b4f]">{blog.category}</td>
                      <td className="px-4 py-4 text-[#665b4f]">{blog.author}</td>
                      <td className="px-4 py-4">
                        <button
                          type="button"
                          onClick={() => toggleStatus(blog)}
                          className={`rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] transition ${
                            blog.status === "published"
                              ? "bg-green-50 text-green-700 hover:bg-green-100"
                              : "bg-[#f5eee4] text-[#8a5f3b] hover:bg-[#eadcca]"
                          }`}
                        >
                          {blog.status === "published" ? "Published" : "Draft"}
                        </button>
                      </td>
                      <td className="px-4 py-4 text-[#665b4f]">
                        <span className="inline-flex items-center gap-2">
                          <CalendarDays className="h-4 w-4" />
                          {formatBlogDate(blog.published_at)}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <button type="button" title="View details" onClick={() => setViewBlog(blog)} className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f5eee4] text-[#1b1511] transition hover:bg-[#e8ddd1]">
                            <Eye className="h-4 w-4" />
                          </button>
                          <Link href={`/blog/${blog.slug}`} target="_blank" title="Open public blog" className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f5eee4] text-[#1b1511] transition hover:bg-[#e8ddd1]">
                            <Search className="h-4 w-4" />
                          </Link>
                          <button type="button" title="Edit blog" onClick={() => openEditForm(blog)} className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f5eee4] text-[#1b1511] transition hover:bg-[#e8ddd1]">
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button type="button" title="Delete blog" onClick={() => setDeleteTarget(blog)} className="flex h-9 w-9 items-center justify-center rounded-full bg-red-50 text-red-600 transition hover:bg-red-100">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-4 py-16 text-center">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#8a7765]">No blogs found</p>
                      <p className="mt-2 text-sm text-[#665b4f]">Create a blog or adjust your filters.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="mt-5">
              <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          )}
        </section>
      </div>

      <AnimatePresence>
        {viewBlog && (
          <motion.div className="fixed inset-0 z-50 bg-black/40 p-4 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 18 }} className="mx-auto mt-10 max-h-[86vh] max-w-3xl overflow-auto rounded-[8px] bg-white p-6 shadow-xl">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8a7765]">{viewBlog.category}</p>
                  <h2 className="mt-2 text-3xl tracking-[-0.03em] text-[#1b1511]">{viewBlog.title}</h2>
                  <p className="mt-2 text-sm text-[#665b4f]">/{viewBlog.slug} by {viewBlog.author}</p>
                </div>
                <button type="button" onClick={() => setViewBlog(null)} className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f5eee4]">
                  <X className="h-4 w-4" />
                </button>
              </div>
              {viewBlog.featured_image && (
                <div className="relative mt-5 aspect-[16/9] overflow-hidden rounded-[8px] bg-[#efe5d9]">
                  <Image src={viewBlog.featured_image} alt={viewBlog.title} fill className="object-contain" />
                </div>
              )}
              <p className="mt-5 text-base leading-7 text-[#665b4f]">{viewBlog.short_description}</p>
              <div className="blog-content mt-5 border-t border-[#e8ddd1] pt-5" dangerouslySetInnerHTML={{ __html: viewBlog.content }} />
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
        title="Delete blog"
        description={deleteTarget ? `Delete "${deleteTarget.title}" permanently? This cannot be undone.` : undefined}
      />
    </div>
  );
}
