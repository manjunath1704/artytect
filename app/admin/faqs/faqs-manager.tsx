"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Eye, EyeOff, Loader2, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import type { FAQ } from "@/lib/faqs";
import { emptyFAQForm } from "@/lib/faqs";

const supabase = createClient();

const inputClassName =
  "mt-2 w-full rounded-[32px] border border-[#d9ccbc] bg-white px-4 py-3 text-sm text-[#1b1511] outline-none transition placeholder:text-[#a69280] focus:border-[#b38d67] focus:ring-4 focus:ring-[#d7b68b]/20";
const labelClassName = "text-sm font-medium text-[#352a21]";

export default function FAQsManager({ initialUserEmail }: { initialUserEmail: string }) {
  const router = useRouter();
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [checkingSession, setCheckingSession] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState({
    id: "",
    question: "",
    answer: "",
    display_order: "",
    is_active: true,
  });
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<FAQ | null>(null);
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
    void fetchFAQs();
  }, []);

  const fetchFAQs = async () => {
    try {
      const response = await fetch("/api/admin/faqs");
      if (response.ok) {
        const data = await response.json();
        setFaqs(data.faqs || []);
      }
    } catch (error) {
      console.error("Error fetching FAQs:", error);
      toast.error("Failed to load FAQs");
    }
  };

  const filteredFAQs = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return faqs.filter((faq) => {
      const text = [faq.question, faq.answer].join(" ").toLowerCase();
      return !needle || text.includes(needle);
    });
  }, [faqs, query]);

  const openCreateForm = () => {
    setForm({ ...emptyFAQForm, id: "", display_order: String((faqs.length + 1) * 10) });
    setIsFormOpen(true);
  };

  const openEditForm = (faq: FAQ) => {
    setForm({
      id: faq.id,
      question: faq.question,
      answer: faq.answer,
      display_order: String(faq.display_order),
      is_active: faq.is_active,
    });
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setForm({ ...emptyFAQForm, id: "", display_order: "" });
  };

  const handleSubmit = async () => {
    if (!form.question.trim() || !form.answer.trim()) {
      toast.error("Question and answer are required");
      return;
    }

    setSaving(true);
    const toastId = toast.loading(editing ? "Updating FAQ..." : "Creating FAQ...");

    try {
      const payload = {
        question: form.question.trim(),
        answer: form.answer.trim(),
        display_order: parseInt(form.display_order) || 0,
        is_active: form.is_active,
      };

      const response = await fetch(editing ? `/api/admin/faqs/${form.id}` : "/api/admin/faqs", {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result?.error ?? "Unable to save FAQ.");

      setFaqs((current) =>
        editing
          ? current.map((faq) => (faq.id === result.faq.id ? result.faq : faq))
          : [...current, result.faq],
      );
      toast.success(editing ? "FAQ updated." : "FAQ created.", { id: toastId });
      closeForm();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save FAQ.", { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const toastId = toast.loading("Deleting FAQ...");
    try {
      const response = await fetch(`/api/admin/faqs/${deleteTarget.id}`, { method: "DELETE" });
      const result = await response.json();
      if (!response.ok) throw new Error(result?.error ?? "Unable to delete FAQ.");
      setFaqs((current) => current.filter((faq) => faq.id !== deleteTarget.id));
      setDeleteTarget(null);
      toast.success("FAQ deleted.", { id: toastId });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to delete FAQ.", { id: toastId });
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
              <h1 className="mt-2 text-4xl tracking-[-0.04em] text-[#1b1511]">FAQs</h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-[#665b4f]">
                Create and manage frequently asked questions for your customers.
              </p>
            </div>
            <Button
              type="button"
              onClick={openCreateForm}
              className="h-12 rounded-full bg-[#1b1511] px-5 text-white hover:bg-[#3a2f27]"
            >
              <Plus className="h-4 w-4" />
              Add FAQ
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
                    {editing ? "Edit FAQ" : "Create FAQ"}
                  </h2>
                  <p className="mt-2 text-sm text-[#665b4f]">
                    {editing ? "Update the question and answer" : "Add a new frequently asked question"}
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

              <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_220px]">
                <div className="grid gap-5">
                  <label>
                    <span className={labelClassName}>Question</span>
                    <textarea
                      value={form.question}
                      onChange={(event) => setForm((current) => ({ ...current, question: event.target.value }))}
                      className="mt-2 min-h-20 w-full rounded-[32px] border border-[#d9ccbc] bg-white px-4 py-3 text-sm text-[#1b1511] outline-none transition focus:border-[#b38d67] focus:ring-4 focus:ring-[#d7b68b]/20"
                      placeholder="e.g., What materials do you use?"
                    />
                  </label>

                  <label>
                    <span className={labelClassName}>Answer</span>
                    <textarea
                      value={form.answer}
                      onChange={(event) => setForm((current) => ({ ...current, answer: event.target.value }))}
                      className="mt-2 min-h-32 w-full rounded-[32px] border border-[#d9ccbc] bg-white px-4 py-3 text-sm text-[#1b1511] outline-none transition focus:border-[#b38d67] focus:ring-4 focus:ring-[#d7b68b]/20"
                      placeholder="Provide a detailed answer..."
                    />
                  </label>

                  <label>
                    <span className={labelClassName}>Display Order</span>
                    <Input
                      type="number"
                      value={form.display_order}
                      onChange={(event) => setForm((current) => ({ ...current, display_order: event.target.value }))}
                      className={inputClassName}
                      placeholder="10"
                    />
                  </label>
                </div>

                <aside className="rounded-[32px] border border-[#e8ddd1] bg-[#fcfaf7] p-4">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={form.is_active}
                      onChange={(event) => setForm((current) => ({ ...current, is_active: event.target.checked }))}
                      className="h-5 w-5 rounded border-[#d9ccbc] text-[#b38d67] focus:ring-[#d7b68b]/20"
                    />
                    <span className={labelClassName}>Active</span>
                  </label>
                  <Button
                    type="button"
                    onClick={handleSubmit}
                    disabled={saving}
                    className="mt-6 h-12 w-full rounded-full bg-[#1b1511] text-white hover:bg-[#3a2f27]"
                  >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    {editing ? "Save changes" : "Create FAQ"}
                  </Button>
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
              placeholder="Search FAQs by question or answer..."
              className="min-w-0 flex-1 bg-transparent text-sm text-[#1b1511] outline-none placeholder:text-[#a69280]"
            />
          </div>

          <div className="max-h-[620px] overflow-auto rounded-[32px] border border-[#e8ddd1]">
            <table className="w-full min-w-[600px] border-collapse text-left text-sm">
              <thead className="sticky top-0 z-10 bg-[#fcfaf7] shadow-[0_1px_0_#e8ddd1]">
                <tr>
                  <th className="p-3 text-left text-xs font-semibold uppercase tracking-[0.22em] text-[#8a7765]">
                    Question
                  </th>
                  <th className="p-3 text-left text-xs font-semibold uppercase tracking-[0.22em] text-[#8a7765]">
                    Status
                  </th>
                  <th className="p-3 text-left text-xs font-semibold uppercase tracking-[0.22em] text-[#8a7765]">
                    Order
                  </th>
                  <th className="p-3 text-left text-xs font-semibold uppercase tracking-[0.22em] text-[#8a7765]">
                    Created
                  </th>
                  <th className="p-3 text-center text-xs font-semibold uppercase tracking-[0.22em] text-[#8a7765]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredFAQs.length ? (
                  filteredFAQs.map((faq) => (
                    <tr key={faq.id} className="border-b border-[#e8ddd1] align-middle transition hover:bg-[#fcfaf7]">
                      <td className="p-3">
                        <p className="font-semibold text-[#1b1511] line-clamp-2">{faq.question}</p>
                      </td>
                      <td className="p-3">
                        {faq.is_active ? (
                          <span className="inline-flex items-center gap-1 text-xs text-green-700">
                            <Eye className="h-3 w-3" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-[#8a7765]">
                            <EyeOff className="h-3 w-3" />
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="p-3">
                        <span className="text-[#665b4f]">{faq.display_order}</span>
                      </td>
                      <td className="p-3">
                        <span className="text-[#8a7765]">
                          {new Intl.DateTimeFormat("en", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          }).format(new Date(faq.created_at))}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => openEditForm(faq)}
                            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f5eee4] text-[#1b1511] transition hover:bg-[#e8ddd1]"
                            title="Edit"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(faq)}
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
                      {query ? "No FAQs found matching your search." : "No FAQs yet. Create your first FAQ!"}
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
        title="Delete FAQ"
        description={`Are you sure you want to delete this FAQ? This action cannot be undone.`}
        loading={deleting}
      />
    </div>
  );
}
