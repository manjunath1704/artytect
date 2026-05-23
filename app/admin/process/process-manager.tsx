"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Pencil, Plus, Route, Trash2, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";
import { ImageUploader } from "@/components/ui/image-uploader";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

type ProcessHeader = {
  id?: string;
  eyebrow: string;
  title: string;
};

type ProcessStepRow = {
  id: string;
  title: string;
  description: string;
  image_url: string;
  image_alt: string;
  sort_order: number;
};

type ProcessManagerProps = {
  initialUserEmail: string;
  initialHeader: ProcessHeader;
  initialSteps: ProcessStepRow[];
};

const inputClassName =
  "mt-2 w-full rounded-[32px] border border-[#d9ccbc] bg-white px-4 py-3 text-sm text-[#1b1511] outline-none transition placeholder:text-[#a69280] focus:border-[#b38d67] focus:ring-4 focus:ring-[#d7b68b]/20";

const emptyStep = {
  title: "",
  description: "",
  imageAlt: "",
  sortOrder: "1",
  imageFile: null as File | null,
};

export default function ProcessManager({
  initialUserEmail,
  initialHeader,
  initialSteps,
}: ProcessManagerProps) {
  const router = useRouter();
  const [checkingSession, setCheckingSession] = useState(true);
  const [headerEyebrow, setHeaderEyebrow] = useState(initialHeader.eyebrow);
  const [headerTitle, setHeaderTitle] = useState(initialHeader.title);
  const [savingHeader, setSavingHeader] = useState(false);
  const [steps, setSteps] = useState(initialSteps);
  const [stepForm, setStepForm] = useState(emptyStep);
  const [editingStep, setEditingStep] = useState<ProcessStepRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ProcessStepRow | null>(null);
  const [savingStep, setSavingStep] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

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

  const resetStepForm = () => {
    setStepForm({
      ...emptyStep,
      sortOrder: String(steps.length + 1),
    });
    setEditingStep(null);
  };

  const openCreateStep = () => {
    setStepForm({
      ...emptyStep,
      sortOrder: String(steps.length + 1),
    });
    setEditingStep({
      id: "",
      title: "",
      description: "",
      image_url: "",
      image_alt: "",
      sort_order: steps.length + 1,
    });
  };

  const openEditStep = (step: ProcessStepRow) => {
    setEditingStep(step);
    setStepForm({
      title: step.title,
      description: step.description,
      imageAlt: step.image_alt,
      sortOrder: String(step.sort_order),
      imageFile: null,
    });
  };

  const saveHeader = async () => {
    if (!headerEyebrow.trim() || !headerTitle.trim()) {
      toast.error("Process eyebrow and title are required.");
      return;
    }

    setSavingHeader(true);
    const toastId = toast.loading("Saving process title...");
    try {
      const response = await fetch("/api/admin/process-section", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eyebrow: headerEyebrow.trim(),
          title: headerTitle.trim(),
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result?.error ?? "Unable to save process title.");
      toast.success("Process title saved.", { id: toastId });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save process title.", { id: toastId });
    } finally {
      setSavingHeader(false);
    }
  };

  const saveStep = async () => {
    if (!editingStep) return;
    const isCreating = !editingStep.id;
    const sortOrder = Number(stepForm.sortOrder);

    if (!stepForm.title.trim() || !stepForm.description.trim() || !stepForm.imageAlt.trim() || !Number.isFinite(sortOrder)) {
      toast.error("Please fill all required process step fields.");
      return;
    }

    if (isCreating && !stepForm.imageFile) {
      toast.error("Process step image is required.");
      return;
    }

    setSavingStep(true);
    const toastId = toast.loading(isCreating ? "Creating process step..." : "Updating process step...");

    try {
      const formData = new FormData();
      formData.append("title", stepForm.title.trim());
      formData.append("description", stepForm.description.trim());
      formData.append("imageAlt", stepForm.imageAlt.trim());
      formData.append("sortOrder", String(sortOrder));
      if (stepForm.imageFile) formData.append("image", stepForm.imageFile);

      const response = await fetch(
        isCreating ? "/api/admin/process-steps" : `/api/admin/process-steps/${editingStep.id}`,
        {
          method: isCreating ? "POST" : "PUT",
          body: formData,
        },
      );
      const result = await response.json();
      if (!response.ok) throw new Error(result?.error ?? "Unable to save process step.");

      const savedStep = {
        id: String(result.step.id),
        title: result.step.title,
        description: result.step.description,
        image_url: result.step.image_url,
        image_alt: result.step.image_alt,
        sort_order: Number(result.step.sort_order),
      };

      setSteps((current) =>
        (isCreating
          ? [...current, savedStep]
          : current.map((step) => (step.id === savedStep.id ? savedStep : step))
        ).sort((a, b) => a.sort_order - b.sort_order),
      );
      toast.success(isCreating ? "Process step created." : "Process step updated.", { id: toastId });
      resetStepForm();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save process step.", { id: toastId });
    } finally {
      setSavingStep(false);
    }
  };

  const deleteStep = async () => {
    if (!deleteTarget) return;
    setDeleting(deleteTarget.id);
    try {
      const response = await fetch(`/api/admin/process-steps/${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result?.error ?? "Unable to delete process step.");
      }
      setSteps((current) => current.filter((step) => step.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to delete process step.");
    } finally {
      setDeleting(null);
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
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1b1511] text-[#f8f2e8]">
              <Route className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-3xl tracking-[-0.03em] text-[#1b1511]">Manage Process</h1>
              <p className="text-sm text-[#665b4f]">Edit section titles and manage process steps.</p>
            </div>
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
          <Button onClick={saveHeader} disabled={savingHeader} className="mt-5 h-11 rounded-full bg-[#1b1511] px-6 text-[#f8f2e8] hover:bg-[#2a211a]">
            {savingHeader ? "Saving..." : "Save Process Titles"}
          </Button>
        </section>

        <section className="mt-8 rounded-[32px] bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl tracking-[-0.03em] text-[#1b1511]">Process Steps</h2>
              <p className="mt-1 text-sm text-[#665b4f]">{steps.length} {steps.length === 1 ? "step" : "steps"} in this collection</p>
            </div>
            <Button onClick={openCreateStep} className="h-11 rounded-full bg-[#1b1511] px-6 text-[#f8f2e8] hover:bg-[#2a211a]">
              <Plus className="mr-2 h-4 w-4" />
              Create Step
            </Button>
          </div>

          <div className="mt-6 overflow-x-auto">
            {steps.length ? (
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b-2 border-[#d9ccbc]">
                    <th className="p-3 text-left text-xs font-semibold uppercase tracking-[0.25em] text-[#8a7765]">Order</th>
                    <th className="p-3 text-left text-xs font-semibold uppercase tracking-[0.25em] text-[#8a7765]">Image</th>
                    <th className="p-3 text-left text-xs font-semibold uppercase tracking-[0.25em] text-[#8a7765]">Title</th>
                    <th className="p-3 text-left text-xs font-semibold uppercase tracking-[0.25em] text-[#8a7765]">Description</th>
                    <th className="p-3 text-center text-xs font-semibold uppercase tracking-[0.25em] text-[#8a7765]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {steps.map((step) => (
                    <tr key={step.id} className="border-b border-[#e8ddd1] transition hover:bg-[#fcfaf7]">
                      <td className="p-3 text-sm text-[#665b4f]">{step.sort_order}</td>
                      <td className="p-3">
                        <div className="relative h-16 w-20 overflow-hidden rounded-2xl border border-[#e8ddd1]">
                          <Image src={step.image_url} alt={step.image_alt} fill unoptimized className="object-cover" />
                        </div>
                      </td>
                      <td className="p-3 text-sm font-medium text-[#1b1511]">{step.title}</td>
                      <td className="p-3 text-sm text-[#665b4f]"><div className="max-w-md line-clamp-2">{step.description}</div></td>
                      <td className="p-3">
                        <div className="flex justify-center gap-2">
                          <button onClick={() => openEditStep(step)} className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#d9ccbc] text-[#1b1511] transition hover:bg-[#f5eee4]">
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button onClick={() => setDeleteTarget(step)} className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#d9ccbc] text-[#7a4d1d] transition hover:bg-[#faf4ea]">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="rounded-2xl border border-dashed border-[#d9ccbc] bg-[#fcfaf7] p-8 text-center text-sm text-[#665b4f]">
                No process steps yet. Create the first step.
              </div>
            )}
          </div>
        </section>
      </div>

      {editingStep && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[32px] bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl tracking-[-0.03em] text-[#1b1511]">{editingStep.id ? "Edit" : "Create"} Process Step</h2>
              <button onClick={resetStepForm} className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#d9ccbc] text-[#1b1511] transition hover:bg-[#f5eee4]">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-6 space-y-5">
              <div className="grid gap-5 sm:grid-cols-[1fr_120px]">
                <label className="block text-sm font-medium text-[#352a21]">Title<input value={stepForm.title} onChange={(event) => setStepForm((current) => ({ ...current, title: event.target.value }))} className={inputClassName} /></label>
                <label className="block text-sm font-medium text-[#352a21]">Order<input type="number" value={stepForm.sortOrder} onChange={(event) => setStepForm((current) => ({ ...current, sortOrder: event.target.value }))} className={inputClassName} /></label>
              </div>
              <label className="block text-sm font-medium text-[#352a21]">Description<textarea value={stepForm.description} onChange={(event) => setStepForm((current) => ({ ...current, description: event.target.value }))} className={`${inputClassName} min-h-[120px] resize-y`} /></label>
              <label className="block text-sm font-medium text-[#352a21]">Image alt text<input value={stepForm.imageAlt} onChange={(event) => setStepForm((current) => ({ ...current, imageAlt: event.target.value }))} className={inputClassName} /></label>
              <ImageUploader label="Step Image" hint={editingStep.id ? "Leave empty to keep the current image" : "Required for new steps"} file={stepForm.imageFile} onChange={(file) => setStepForm((current) => ({ ...current, imageFile: file }))} onRemove={() => setStepForm((current) => ({ ...current, imageFile: null }))} required={!editingStep.id} />
              {editingStep.id && !stepForm.imageFile && (
                <div className="relative h-36 w-full overflow-hidden rounded-2xl border border-[#e8ddd1] bg-[#f5eee4]">
                  <Image src={editingStep.image_url} alt={editingStep.image_alt} fill unoptimized className="object-contain" />
                </div>
              )}
              <div className="flex gap-3">
                <Button onClick={saveStep} disabled={savingStep} className="h-12 flex-1 rounded-full bg-[#1b1511] text-[#f8f2e8] hover:bg-[#2a211a]">
                  {savingStep ? "Saving..." : editingStep.id ? "Update Step" : "Create Step"}
                </Button>
                <Button onClick={resetStepForm} variant="outline" className="h-12 rounded-full border-[#d9ccbc] bg-transparent text-[#1b1511] hover:bg-[#f5eee4]">Cancel</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <DeleteConfirmDialog
        open={!!deleteTarget}
        itemName={deleteTarget?.title}
        loading={deleting === deleteTarget?.id}
        onCancel={() => { if (!deleting) setDeleteTarget(null); }}
        onConfirm={deleteStep}
      />
    </div>
  );
}
