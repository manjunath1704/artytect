"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, MessageSquareQuote } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ImageUploader } from "@/components/ui/image-uploader";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

type Fields = {
  name: string;
  location: string;
  imageAlt: string;
  image: File | null;
  rating: string;
  purchased: string;
  review: string;
};

type FieldErrors = Partial<Record<keyof Fields, string>>;

const inputBase =
  "mt-2 w-full rounded-2xl border bg-white px-4 py-3 text-sm text-[#1b1511] outline-none transition placeholder:text-[#a69280] focus:ring-4 focus:ring-[#d7b68b]/20";

function inputCls(hasError: boolean) {
  return `${inputBase} ${
    hasError
      ? "border-red-400 focus:border-red-400"
      : "border-[#d9ccbc] focus:border-[#b38d67]"
  }`;
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="mt-1.5 text-xs text-red-500">{msg}</p>;
}

function validate(fields: Fields): FieldErrors {
  const errors: FieldErrors = {};
  const rating = Number(fields.rating);

  if (!fields.name.trim()) errors.name = "Name is required.";
  if (!fields.location.trim()) errors.location = "Location is required.";
  if (!fields.imageAlt.trim()) errors.imageAlt = "Image alt text is required.";
  if (!fields.image) errors.image = "Portrait image is required.";
  if (!fields.rating.trim()) errors.rating = "Rating is required.";
  else if (!Number.isInteger(rating) || rating < 1 || rating > 5)
    errors.rating = "Rating must be a whole number between 1 and 5.";
  if (!fields.purchased.trim()) errors.purchased = "Purchased item or class is required.";
  if (!fields.review.trim()) errors.review = "Review is required.";

  return errors;
}

export default function CreateTestimonialsForm() {
  const router = useRouter();

  const [checkingSession, setCheckingSession] = useState(true);
  const [creating, setCreating] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [imageAlt, setImageAlt] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [rating, setRating] = useState("5");
  const [purchased, setPurchased] = useState("");
  const [review, setReview] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});

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

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!session) router.replace("/admin/login");
    });
    return () => subscription.unsubscribe();
  }, [router]);

  useEffect(() => {
    if (!submitted) return;
    setErrors(validate({ name, location, imageAlt, image: imageFile, rating, purchased, review }));
  }, [name, location, imageAlt, imageFile, rating, purchased, review, submitted]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);

    const validationErrors = validate({
      name,
      location,
      imageAlt,
      image: imageFile,
      rating,
      purchased,
      review,
    });
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      toast.error("Please fill all required testimonial fields.");
      return;
    }

    setCreating(true);
    const toastId = toast.loading("Creating testimonial...");

    try {
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("location", location.trim());
      formData.append("imageAlt", imageAlt.trim());
      formData.append("image", imageFile!);
      formData.append("rating", rating);
      formData.append("purchased", purchased.trim());
      formData.append("review", review.trim());

      const response = await fetch("/api/admin/testimonials", {
        method: "POST",
        body: formData,
      });
      const result = (await response.json().catch(() => null)) as { error?: string } | null;

      if (!response.ok) {
        throw new Error(result?.error ?? "Unable to create testimonial.");
      }

      toast.success("Testimonial created successfully.", { id: toastId });
      setName("");
      setLocation("");
      setImageAlt("");
      setImageFile(null);
      setRating("5");
      setPurchased("");
      setReview("");
      setErrors({});
      setSubmitted(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create testimonial.",
        { id: toastId },
      );
    } finally {
      setCreating(false);
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
      <div className="mx-auto max-w-4xl">
        <section className="rounded-[32px] bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1b1511] text-[#f8f2e8]">
              <MessageSquareQuote className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-3xl tracking-[-0.03em] text-[#1b1511]">Create testimonial</h1>
              <p className="text-sm text-[#665b4f]">All fields are required.</p>
            </div>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit} noValidate>
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-[#352a21]">
                  Name <span className="text-[#b38d67]">*</span>
                  <input
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    className={inputCls(!!errors.name)}
                    placeholder="Ananya Sharma"
                  />
                </label>
                <FieldError msg={errors.name} />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#352a21]">
                  Location <span className="text-[#b38d67]">*</span>
                  <input
                    type="text"
                    value={location}
                    onChange={(event) => setLocation(event.target.value)}
                    className={inputCls(!!errors.location)}
                    placeholder="Bangalore"
                  />
                </label>
                <FieldError msg={errors.location} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#352a21]">
                Purchased item or class <span className="text-[#b38d67]">*</span>
                <input
                  type="text"
                  value={purchased}
                  onChange={(event) => setPurchased(event.target.value)}
                  className={inputCls(!!errors.purchased)}
                  placeholder="Wheel Throwing Workshop"
                />
              </label>
              <FieldError msg={errors.purchased} />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#352a21]">
                Rating <span className="text-[#b38d67]">*</span>
                <select
                  value={rating}
                  onChange={(event) => setRating(event.target.value)}
                  className={inputCls(!!errors.rating)}
                >
                  <option value="5">5 stars</option>
                  <option value="4">4 stars</option>
                  <option value="3">3 stars</option>
                  <option value="2">2 stars</option>
                  <option value="1">1 star</option>
                </select>
              </label>
              <FieldError msg={errors.rating} />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#352a21]">
                Review <span className="text-[#b38d67]">*</span>
                <textarea
                  value={review}
                  onChange={(event) => setReview(event.target.value)}
                  className={`${inputCls(!!errors.review)} min-h-[140px] resize-y`}
                  placeholder="The pottery experience was incredibly calming and creative..."
                />
              </label>
              <FieldError msg={errors.review} />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#352a21]">
                Image alt text <span className="text-[#b38d67]">*</span>
                <input
                  type="text"
                  value={imageAlt}
                  onChange={(event) => setImageAlt(event.target.value)}
                  className={inputCls(!!errors.imageAlt)}
                  placeholder="Ananya Sharma portrait"
                />
              </label>
              <p className="mt-1 text-xs text-[#8a7765]">
                Describes the portrait for accessibility and SEO.
              </p>
              <FieldError msg={errors.imageAlt} />
            </div>

            <div>
              <ImageUploader
                label="Portrait Image"
                hint="Shown in the testimonial card"
                file={imageFile}
                onChange={(file) => setImageFile(file)}
                onRemove={() => setImageFile(null)}
                required
                hasError={!!errors.image}
              />
              <FieldError msg={errors.image} />
            </div>

            <Button
              type="submit"
              size="lg"
              disabled={creating}
              className="h-12 rounded-full bg-[#1b1511] px-10 text-[#f8f2e8] hover:bg-[#2a211a] disabled:opacity-60"
            >
              {creating ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating...
                </span>
              ) : (
                "Create testimonial"
              )}
            </Button>
          </form>
        </section>
      </div>
    </div>
  );
}
