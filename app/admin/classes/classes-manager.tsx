"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bold,
  CalendarDays,
  Code2,
  Eye,
  EyeOff,
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

import { Button } from "@/components/ui/button";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";
import { Input } from "@/components/ui/input";
import { ImageUploader } from "@/components/ui/image-uploader";
import Select from "react-select";
import { createClient } from "@/lib/supabase/client";
import type { PotteryClass } from "@/lib/classes";
import { formatPrice } from "@/lib/whatsapp";

const supabase = createClient();

const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

type ClassFormState = {
  id?: string;
  title: string;
  slug: string;
  short_description: string;
  content: string;
  duration: string;
  price: string;
  level: string;
  is_featured: boolean;
  is_published: boolean;
  thumbnail_url: string | null;
};

const emptyForm: ClassFormState = {
  title: "",
  slug: "",
  short_description: "",
  content: "",
  duration: "",
  price: "",
  level: "Beginner",
  is_featured: false,
  is_published: false,
  thumbnail_url: null,
};

const inputClassName =
  "mt-2 h-11 rounded-[32px] border border-[#d9ccbc] bg-white px-4 py-3 text-sm text-[#1b1511] outline-none transition placeholder:text-[#a69280] focus:border-[#b38d67] focus:ring-4 focus:ring-[#d7b68b]/20";
const labelClassName = "text-sm font-medium text-[#352a21]";

export default function ClassesManager({ initialUserEmail }: { initialUserEmail: string }) {
  const router = useRouter();
  const editorRef = useRef<HTMLDivElement>(null);
  const [classes, setClasses] = useState<PotteryClass[]>([]);
  const [checkingSession, setCheckingSession] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState<ClassFormState>(emptyForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<PotteryClass | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [query, setQuery] = useState("");

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
    void fetchClasses();
  }, []);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== form.content) {
      editorRef.current.innerHTML = form.content;
    }
  }, [form.id, form.content]);

  const fetchClasses = async () => {
    try {
      const response = await fetch("/api/admin/classes");
      if (response.ok) {
        const data = await response.json();
        setClasses(data.classes || []);
      }
    } catch (error) {
      console.error("Error fetching classes:", error);
      toast.error("Failed to load classes");
    }
  };

  const filteredClasses = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return classes.filter((c) => {
      const text = [c.title, c.instructor_name, c.level].join(" ").toLowerCase();
      return !needle || text.includes(needle);
    });
  }, [classes, query]);

  const openCreateForm = () => {
    setForm(emptyForm);
    setImageFile(null);
    setIsFormOpen(true);
  };

  const openEditForm = (classItem: PotteryClass) => {
    setForm({
      id: classItem.id,
      title: classItem.title,
      slug: classItem.slug,
      short_description: classItem.short_description,
      content: classItem.content,
      duration: classItem.duration,
      price: (classItem.price).toFixed(2),
      level: classItem.level,
      is_featured: classItem.is_featured,
      is_published: classItem.is_published,
      thumbnail_url: classItem.thumbnail_url,
    });
    setImageFile(null);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setForm(emptyForm);
    setImageFile(null);
  };

  const updateTitle = (title: string) => {
    setForm((current) => ({
      ...current,
      title,
      slug: current.id && current.slug ? current.slug : slugify(title),
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

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setImageFile(file);
  };

  const handleSubmit = async () => {
    // Validate all required fields
    if (!form.title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!form.slug.trim()) {
      toast.error("Slug is required");
      return;
    }
    if (!form.short_description.trim()) {
      toast.error("Short description is required");
      return;
    }
    if (!form.content.trim()) {
      toast.error("Rich text content is required");
      return;
    }
    if (!form.duration.trim()) {
      toast.error("Duration is required");
      return;
    }
    if (!form.price || parseFloat(form.price) <= 0) {
      toast.error("Valid price is required");
      return;
    }
    if (!form.thumbnail_url && !imageFile) {
      toast.error("Thumbnail image is required");
      return;
    }

    setSaving(true);
    const toastId = toast.loading(editing ? "Updating class..." : "Creating class...");

    try {
      const data = new FormData();
      data.append("title", form.title.trim());
      data.append("slug", form.slug.trim());
      data.append("short_description", form.short_description.trim());
      data.append("content", form.content.trim());
      data.append("duration", form.duration.trim());
      data.append("price", form.price);
      data.append("level", form.level);
      data.append("is_featured", String(form.is_featured));
      data.append("is_published", String(form.is_published));
      if (form.thumbnail_url) data.append("existing_thumbnail_url", form.thumbnail_url);
      if (imageFile) data.append("thumbnail", imageFile);

      const response = await fetch(editing ? `/api/admin/classes/${form.id}` : "/api/admin/classes", {
        method: editing ? "PUT" : "POST",
        body: data,
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result?.error ?? "Unable to save class.");

      setClasses((current) =>
        editing
          ? current.map((cls) => (cls.id === result.class.id ? result.class : cls))
          : [result.class, ...current],
      );
      toast.success(editing ? "Class updated." : "Class created.", { id: toastId });
      closeForm();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save class.", { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const toastId = toast.loading("Deleting class...");
    try {
      const response = await fetch(`/api/admin/classes/${deleteTarget.id}`, { method: "DELETE" });
      const result = await response.json();
      if (!response.ok) throw new Error(result?.error ?? "Unable to delete class.");
      setClasses((current) => current.filter((cls) => cls.id !== deleteTarget.id));
      setDeleteTarget(null);
      toast.success("Class deleted.", { id: toastId });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to delete class.", { id: toastId });
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
                Classes Management
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-[#665b4f]">
                Create, edit, and manage pottery classes for students.
              </p>
            </div>
            <Button
              type="button"
              onClick={openCreateForm}
              className="h-12 rounded-full bg-[#1b1511] px-5 text-white hover:bg-[#3a2f27]"
            >
              <Plus className="h-4 w-4" />
              Create class
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
                    {editing ? "Edit class" : "Create class"}
                  </h2>
                  <p className="mt-2 text-sm text-[#665b4f]">
                    Slug is generated from the title until you edit an existing class.
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

                  <div className="grid gap-4 md:grid-cols-2">
                    <label>
                      <span className={labelClassName}>Level</span>
                      <Select
                        options={[
                          { value: "Beginner", label: "Beginner" },
                          { value: "Intermediate", label: "Intermediate" },
                          { value: "Advanced", label: "Advanced" },
                        ]}
                        value={{ value: form.level, label: form.level }}
                        onChange={(option) => {
                          if (option) setForm((current) => ({ ...current, level: option.value }));
                        }}
                        classNamePrefix="react-select"
                        styles={{
                          control: (base) => ({
                            ...base,
                            borderRadius: "32px",
                            border: "1px solid #d9ccbc",
                            backgroundColor: "white",
                            padding: "6px 12px",
                            fontSize: "14px",
                            outline: "none",
                            transition: "all 0.2s",
                            boxShadow: "none",
                            "&:hover": {
                              borderColor: "#b38d67",
                            },
                            "&:focus": {
                              borderColor: "#b38d67",
                              boxShadow: "0 0 0 4px rgba(215, 182, 139, 0.2)",
                            },
                          }),
                          option: (base, state) => ({
                            ...base,
                            backgroundColor: state.isSelected ? "#1b1511" : state.isFocused ? "#f5eee4" : "white",
                            color: state.isSelected ? "white" : "#1b1511",
                            padding: "10px 12px",
                            cursor: "pointer",
                          }),
                          menu: (base) => ({
                            ...base,
                            borderRadius: "12px",
                            backgroundColor: "white",
                            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                          }),
                        }}
                      />
                    </label>
                    <label>
                      <span className={labelClassName}>Duration</span>
                      <Input value={form.duration} onChange={(event) => setForm((current) => ({ ...current, duration: event.target.value }))} className={inputClassName} placeholder="e.g., 2 hours" />
                    </label>
                  </div>

                  <label>
                    <span className={labelClassName}>Price (₹)</span>
                    <Input type="number" step="0.01" value={form.price} onChange={(event) => setForm((current) => ({ ...current, price: event.target.value }))} className={inputClassName} placeholder="0.00" />
                  </label>
                </div>

                <aside className="rounded-[32px] border border-[#e8ddd1] bg-[#fcfaf7] p-4">
                  <ImageUploader
                    label="Thumbnail Image"
                    hint="Drag & drop or click to upload"
                    file={imageFile}
                    onChange={setImageFile}
                    onRemove={() => setImageFile(null)}
                  />

                  <div className="mt-5 grid gap-4">
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={form.is_featured}
                        onChange={(event) => setForm((current) => ({ ...current, is_featured: event.target.checked }))}
                        className="h-5 w-5 rounded border-[#d9ccbc] text-[#b38d67] focus:ring-[#d7b68b]/20"
                      />
                      <span className={labelClassName}>Featured Class</span>
                    </label>
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={form.is_published}
                        onChange={(event) => setForm((current) => ({ ...current, is_published: event.target.checked }))}
                        className="h-5 w-5 rounded border-[#d9ccbc] text-[#b38d67] focus:ring-[#d7b68b]/20"
                      />
                      <span className={labelClassName}>Published</span>
                    </label>
                    <Button type="button" onClick={handleSubmit} disabled={saving} className="h-12 rounded-full bg-[#1b1511] text-white hover:bg-[#3a2f27]">
                      {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                      {editing ? "Save changes" : "Create class"}
                    </Button>
                  </div>
                </aside>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        <section className="mt-8 rounded-[32px] bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6 flex items-center gap-3 rounded-full border border-[#d9ccbc] bg-[#fcfaf7] px-4 py-3">
            <Search className="h-5 w-5 text-[#8a7765]" />
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search classes by title, instructor, or level..."
              className="min-w-0 flex-1 bg-transparent text-sm text-[#1b1511] outline-none placeholder:text-[#a69280]"
            />
          </div>

          <div className="max-h-[620px] overflow-auto rounded-[32px] border border-[#e8ddd1]">
            <table className="w-full min-w-[980px] border-collapse text-left text-sm">
              <thead className="sticky top-0 z-10 bg-[#fcfaf7] shadow-[0_1px_0_#e8ddd1]">
                <tr>
                  <th className="p-3 text-left text-xs font-semibold uppercase tracking-[0.22em] text-[#8a7765]">Class</th>
                  <th className="p-3 text-left text-xs font-semibold uppercase tracking-[0.22em] text-[#8a7765]">Duration</th>
                  <th className="p-3 text-left text-xs font-semibold uppercase tracking-[0.22em] text-[#8a7765]">Price</th>
                  <th className="p-3 text-left text-xs font-semibold uppercase tracking-[0.22em] text-[#8a7765]">Status</th>
                  <th className="p-3 text-center text-xs font-semibold uppercase tracking-[0.22em] text-[#8a7765]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredClasses.length ? (
                  filteredClasses.map((classItem) => (
                    <tr key={classItem.id} className="border-b border-[#e8ddd1] align-middle transition hover:bg-[#fcfaf7]">
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-xl border border-[#e8ddd1] bg-[#f5eee4]">
                            {classItem.thumbnail_url ? <Image src={classItem.thumbnail_url} alt={classItem.title} fill className="object-cover" /> : null}
                          </div>
                          <div>
                            <p className="font-semibold text-[#1b1511]">{classItem.title}</p>
                            <p className="mt-1 text-xs text-[#8a7765]">{classItem.level}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="text-[#665b4f]">{classItem.duration}</span>
                      </td>
                      <td className="p-3">
                        <span className="text-[#665b4f]">{formatPrice(classItem.price)}</span>
                      </td>
                      <td className="p-3">
                        <div className="flex flex-col gap-1">
                          {classItem.is_published ? (
                            <span className="inline-flex items-center gap-1 text-xs text-green-700">
                              <Eye className="h-3 w-3" />
                              Published
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs text-[#8a7765]">
                              <EyeOff className="h-3 w-3" />
                              Draft
                            </span>
                          )}
                          {classItem.is_featured && (
                            <span className="text-xs text-[#b38d67]">Featured</span>
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => openEditForm(classItem)}
                            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f5eee4] text-[#1b1511] transition hover:bg-[#e8ddd1]"
                            title="Edit"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(classItem)}
                            className="flex h-9 w-9 items-center justify-center rounded-full bg-red-50 text-red-600 transition hover:bg-red-100"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-12 text-center text-[#8a7765]">
                      {query ? "No classes found matching your search." : "No classes yet. Create your first class!"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <DeleteConfirmDialog
        open={Boolean(deleteTarget)}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Delete class"
        description={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
        loading={deleting}
      />
    </div>
  );
}
