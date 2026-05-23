"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, MessageSquareQuote, Pencil, Plus, Search, Star, Trash2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";
import { ImageUploader } from "@/components/ui/image-uploader";
import { Pagination } from "@/components/ui/pagination";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

import { AppSelect, type SelectOption } from "@/components/ui/app-select";

const supabase = createClient();

type TestimonialRow = {
  id: string;
  name: string;
  location: string;
  image_url: string;
  image_alt: string;
  rating: number;
  purchased: string;
  review: string;
};

type TestimonialsHeader = {
  id?: string;
  eyebrow: string;
  title: string;
  description: string;
};

type TestimonialsManagerProps = {
  initialUserEmail: string;
  initialHeader: TestimonialsHeader;
  initialTestimonials: TestimonialRow[];
};

const inputClassName =
  "mt-2 w-full border border-[#d9ccbc] rounded-[32px] bg-white px-4 py-3 text-sm text-[#1b1511] outline-none transition placeholder:text-[#a69280] focus:border-[#b38d67] focus:ring-4 focus:ring-[#d7b68b]/20";
const ratingOptions: SelectOption[] = [
  { value: "5", label: "5 stars" },
  { value: "4", label: "4 stars" },
  { value: "3", label: "3 stars" },
  { value: "2", label: "2 stars" },
  { value: "1", label: "1 star" },
];

export default function TestimonialsManager({
  initialUserEmail,
  initialHeader,
  initialTestimonials,
}: TestimonialsManagerProps) {
  const router = useRouter();
  const [headerEyebrow, setHeaderEyebrow] = useState(initialHeader.eyebrow);
  const [headerTitle, setHeaderTitle] = useState(initialHeader.title);
  const [headerDescription, setHeaderDescription] = useState(initialHeader.description);
  const [savingHeader, setSavingHeader] = useState(false);
  const [testimonials, setTestimonials] = useState<TestimonialRow[]>(initialTestimonials);
  const [checkingSession, setCheckingSession] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TestimonialRow | null>(null);
  const [editingTestimonial, setEditingTestimonial] = useState<TestimonialRow | null>(null);
  const [editName, setEditName] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editImageAlt, setEditImageAlt] = useState("");
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editRating, setEditRating] = useState("5");
  const [editPurchased, setEditPurchased] = useState("");
  const [editReview, setEditReview] = useState("");
  const [editError, setEditError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

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

  const handleEdit = (testimonial: TestimonialRow) => {
    setEditingTestimonial(testimonial);
    setEditName(testimonial.name);
    setEditLocation(testimonial.location);
    setEditImageAlt(testimonial.image_alt);
    setEditImageFile(null);
    setEditRating(String(testimonial.rating));
    setEditPurchased(testimonial.purchased);
    setEditReview(testimonial.review);
    setEditError(null);
  };

  const handleCloseEdit = () => {
    setEditingTestimonial(null);
    setEditName("");
    setEditLocation("");
    setEditImageAlt("");
    setEditImageFile(null);
    setEditRating("5");
    setEditPurchased("");
    setEditReview("");
    setEditError(null);
  };

  const saveHeader = async () => {
    if (!headerEyebrow.trim() || !headerTitle.trim() || !headerDescription.trim()) {
      toast.error("Testimonials eyebrow, title, and description are required.");
      return;
    }

    setSavingHeader(true);
    const toastId = toast.loading("Saving testimonials section...");
    try {
      const response = await fetch("/api/admin/testimonials-section", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eyebrow: headerEyebrow.trim(),
          title: headerTitle.trim(),
          description: headerDescription.trim(),
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result?.error ?? "Unable to save testimonials section.");
      toast.success("Testimonials section saved.", { id: toastId });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save testimonials section.", { id: toastId });
    } finally {
      setSavingHeader(false);
    }
  };

  const handleUpdateTestimonial = async () => {
    if (!editingTestimonial) return;

    const rating = Number(editRating);
    if (
      !editName.trim() ||
      !editLocation.trim() ||
      !editImageAlt.trim() ||
      !editPurchased.trim() ||
      !editReview.trim() ||
      !Number.isInteger(rating) ||
      rating < 1 ||
      rating > 5
    ) {
      setEditError("Please fill in all required fields.");
      return;
    }

    setUpdating(true);
    setEditError(null);

    try {
      const formData = new FormData();
      formData.append("name", editName.trim());
      formData.append("location", editLocation.trim());
      formData.append("imageAlt", editImageAlt.trim());
      formData.append("rating", editRating);
      formData.append("purchased", editPurchased.trim());
      formData.append("review", editReview.trim());
      if (editImageFile) {
        formData.append("image", editImageFile);
      }

      const response = await fetch(`/api/admin/testimonials/${editingTestimonial.id}`, {
        method: "PUT",
        body: formData,
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.error ?? "Unable to update testimonial.");
      }

      setTestimonials((current) =>
        current.map((testimonial) =>
          testimonial.id === editingTestimonial.id
            ? {
                ...testimonial,
                name: editName,
                location: editLocation,
                image_alt: editImageAlt,
                image_url: result.testimonial.image_url || testimonial.image_url,
                rating,
                purchased: editPurchased,
                review: editReview,
              }
            : testimonial,
        ),
      );
      handleCloseEdit();
    } catch (error) {
      setEditError(error instanceof Error ? error.message : "Unable to update testimonial.");
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(deleteTarget.id);

    try {
      const response = await fetch(`/api/admin/testimonials/${deleteTarget.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result?.error ?? "Unable to delete testimonial.");
      }

      setTestimonials((current) =>
        current.filter((testimonial) => testimonial.id !== deleteTarget.id),
      );
      setDeleteTarget(null);
    } catch (error) {
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
          <span>Checking session...</span>
        </div>
      </div>
    );
  }

  const filteredTestimonials = testimonials.filter((testimonial) => {
    const query = searchQuery.toLowerCase();
    return (
      testimonial.name.toLowerCase().includes(query) ||
      testimonial.location.toLowerCase().includes(query) ||
      testimonial.purchased.toLowerCase().includes(query) ||
      testimonial.review.toLowerCase().includes(query) ||
      testimonial.image_alt.toLowerCase().includes(query)
    );
  });

  const totalPages = Math.ceil(filteredTestimonials.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTestimonials = filteredTestimonials.slice(startIndex, endIndex);

  return (
    <div className="px-6 py-8 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <section className="mb-8 rounded-[32px] bg-white p-6 shadow-sm sm:p-8">
          <div>
            <h1 className="text-3xl tracking-[-0.03em] text-[#1b1511]">Testimonials Section Header</h1>
            <p className="mt-2 text-sm text-[#665b4f]">
              Edit the homepage testimonials section title and description.
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
            {savingHeader ? "Saving..." : "Save Testimonials Header"}
          </Button>
        </section>

        <div className="rounded-[32px] bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl tracking-[-0.03em] text-[#1b1511]">Manage Testimonials</h1>
              <p className="mt-2 text-sm text-[#665b4f]">
                {testimonials.length} {testimonials.length === 1 ? "testimonial" : "testimonials"} in database
              </p>
            </div>
            <Link href="/admin/create-testimonials" className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#1b1511] px-6 text-sm font-medium text-[#f8f2e8] transition hover:bg-[#2a211a]">
              <Plus className="h-4 w-4" />
              Create Testimonial
            </Link>
          </div>
        </div>

        <div className="mt-8 rounded-[32px] bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6 flex items-center gap-3 rounded-full border border-[#d9ccbc] bg-[#fcfaf7] px-4 py-3">
            <Search className="h-5 w-5 text-[#8a7765]" />
            <input
              type="text"
              placeholder="Search by name, location, purchased item, review, or alt text..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="flex-1 bg-transparent text-sm text-[#1b1511] outline-none placeholder:text-[#a69280]"
            />
          </div>

          <div className="overflow-x-auto">
            {paginatedTestimonials.length ? (
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b-2 border-[#d9ccbc]">
                    <th className="p-3 text-left text-xs font-semibold uppercase tracking-[0.25em] text-[#8a7765]">#</th>
                    <th className="p-3 text-left text-xs font-semibold uppercase tracking-[0.25em] text-[#8a7765]">Portrait</th>
                    <th className="p-3 text-left text-xs font-semibold uppercase tracking-[0.25em] text-[#8a7765]">Name</th>
                    <th className="p-3 text-left text-xs font-semibold uppercase tracking-[0.25em] text-[#8a7765]">Rating</th>
                    <th className="p-3 text-left text-xs font-semibold uppercase tracking-[0.25em] text-[#8a7765]">Purchased</th>
                    <th className="p-3 text-left text-xs font-semibold uppercase tracking-[0.25em] text-[#8a7765]">Review</th>
                    <th className="p-3 text-center text-xs font-semibold uppercase tracking-[0.25em] text-[#8a7765]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedTestimonials.map((testimonial, index) => (
                    <tr key={testimonial.id} className="border-b border-[#e8ddd1] transition hover:bg-[#fcfaf7]">
                      <td className="p-3 text-sm text-[#665b4f]">{String(startIndex + index + 1).padStart(2, "0")}</td>
                      <td className="p-3">
                        <div className="relative h-16 w-16 overflow-hidden rounded-full border border-[#e8ddd1]">
                          <Image src={testimonial.image_url} alt={testimonial.image_alt} fill unoptimized className="object-cover object-top" />
                        </div>
                      </td>
                      <td className="p-3">
                        <p className="text-sm font-medium text-[#1b1511]">{testimonial.name}</p>
                        <p className="mt-1 text-xs text-[#665b4f]">{testimonial.location}</p>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1 text-[#b9825e]">
                          {Array.from({ length: 5 }, (_, starIndex) => (
                            <Star key={starIndex} className="h-3.5 w-3.5" fill={starIndex < testimonial.rating ? "currentColor" : "none"} />
                          ))}
                        </div>
                      </td>
                      <td className="p-3 text-sm text-[#665b4f]"><div className="max-w-xs line-clamp-1">{testimonial.purchased}</div></td>
                      <td className="p-3 text-sm text-[#665b4f]"><div className="max-w-xs line-clamp-2">{testimonial.review}</div></td>
                      <td className="p-3">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => handleEdit(testimonial)} className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#d9ccbc] text-[#1b1511] transition hover:bg-[#f5eee4]" title="Edit testimonial">
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button onClick={() => setDeleteTarget(testimonial)} disabled={deleting === testimonial.id} className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#d9ccbc] text-[#7a4d1d] transition hover:bg-[#faf4ea] disabled:opacity-50" title="Delete testimonial">
                            {deleting === testimonial.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="rounded-2xl border border-dashed border-[#d9ccbc] bg-[#fcfaf7] p-8 text-center text-sm leading-7 text-[#665b4f]">
                {searchQuery ? "No testimonials match your search." : "No testimonials yet. Create the first one."}
              </div>
            )}
          </div>

          {filteredTestimonials.length > 0 && totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between border-t border-[#e8ddd1] pt-6">
              <p className="text-sm text-[#665b4f]">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredTestimonials.length)} of {filteredTestimonials.length} testimonials
              </p>
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>
          )}
        </div>

        {editingTestimonial && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[32px] bg-white p-6 shadow-sm sm:p-8">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl tracking-[-0.03em] text-[#1b1511]">Edit Testimonial</h2>
                <button onClick={handleCloseEdit} className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#d9ccbc] text-[#1b1511] transition hover:bg-[#f5eee4]">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-6 space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="block text-sm font-medium text-[#352a21]">
                    Name
                    <input type="text" value={editName} onChange={(event) => setEditName(event.target.value)} className={inputClassName} required />
                  </label>
                  <label className="block text-sm font-medium text-[#352a21]">
                    Location
                    <input type="text" value={editLocation} onChange={(event) => setEditLocation(event.target.value)} className={inputClassName} required />
                  </label>
                </div>

                <label className="block text-sm font-medium text-[#352a21]">
                  Purchased item or class
                  <input type="text" value={editPurchased} onChange={(event) => setEditPurchased(event.target.value)} className={inputClassName} required />
                </label>

                <label className="block text-sm font-medium text-[#352a21]">
                  Rating
                  <div className="mt-2">
                    <AppSelect
                      instanceId="edit-testimonial-rating"
                      value={ratingOptions.find((option) => option.value === editRating)}
                      options={ratingOptions}
                      onChange={(option) => setEditRating(option?.value ?? "5")}
                      isSearchable={false}
                    />
                  </div>
                </label>

                <label className="block text-sm font-medium text-[#352a21]">
                  Review
                  <textarea value={editReview} onChange={(event) => setEditReview(event.target.value)} className={`${inputClassName} min-h-[130px] resize-y`} required />
                </label>

                <label className="block text-sm font-medium text-[#352a21]">
                  Image alt text
                  <input type="text" value={editImageAlt} onChange={(event) => setEditImageAlt(event.target.value)} className={inputClassName} required />
                </label>

                <ImageUploader
                  label="Portrait Image"
                  hint="Leave empty to keep the current image"
                  file={editImageFile}
                  onChange={setEditImageFile}
                  onRemove={() => setEditImageFile(null)}
                />

                {!editImageFile && (
                  <div>
                    <p className="mb-2 text-xs text-[#8a7765]">Current portrait</p>
                    <div className="relative h-32 w-32 overflow-hidden rounded-full border border-[#e8ddd1] bg-[#f5eee4]">
                      <Image src={editingTestimonial.image_url} alt={editingTestimonial.image_alt} fill unoptimized className="object-cover object-top" />
                    </div>
                  </div>
                )}

                {editError && <p className="rounded-2xl border border-[#d7b68b] bg-[#faf4ea] px-4 py-3 text-sm text-[#7a4d1d]">{editError}</p>}

                <div className="flex gap-3">
                  <Button type="button" onClick={handleUpdateTestimonial} disabled={updating} className="h-12 flex-1 rounded-full bg-[#1b1511] text-[#f8f2e8] hover:bg-[#2a211a]">
                    {updating ? <span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" />Updating...</span> : "Update Testimonial"}
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

      <DeleteConfirmDialog
        open={!!deleteTarget}
        itemName={deleteTarget?.name}
        loading={deleting === deleteTarget?.id}
        onCancel={() => { if (!deleting) setDeleteTarget(null); }}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
