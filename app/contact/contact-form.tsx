"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { AppSelect, type SelectOption } from "@/components/ui/app-select";

type ContactFormState = {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
};

const initialForm: ContactFormState = {
  name: "",
  email: "",
  phone: "",
  subject: "Custom order",
  message: "",
};

const topics = ["Custom order", "Product question", "Collaboration", "Studio visit"];
const topicOptions: SelectOption[] = topics.map((topic) => ({ value: topic, label: topic }));
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^[+()\-\s\d]{7,20}$/;

const fieldClassName =
  "h-12 w-full rounded-full shadow-sm bg-[#fcfdfa] px-4 text-sm outline-none transition focus:border-[#1b1511] disabled:cursor-not-allowed disabled:opacity-60";

function validateForm(form: ContactFormState) {
  if (!form.name.trim()) return "Name is required.";
  if (form.name.trim().length < 2) return "Please enter a valid name.";
  if (!form.email.trim()) return "Email is required.";
  if (!emailPattern.test(form.email.trim())) return "Please enter a valid email address.";
  if (!form.phone.trim()) return "Phone number is required.";
  if (!phonePattern.test(form.phone.trim())) return "Please enter a valid phone number.";
  if (!form.subject.trim()) return "Topic is required.";
  if (!form.message.trim()) return "Message is required.";
  if (form.message.trim().length < 10) return "Message must be at least 10 characters.";
  return null;
}

export default function ContactForm() {
  const [form, setForm] = useState<ContactFormState>(initialForm);
  const [submitting, setSubmitting] = useState(false);

  const updateField = (field: keyof ContactFormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationError = validateForm(form);

    if (validationError) {
      toast.error(validationError);
      return;
    }

    setSubmitting(true);
    const toastId = toast.loading("Sending your inquiry...");

    try {
      const response = await fetch("/api/contact-messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          subject: form.subject.trim(),
          message: form.message.trim(),
        }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.error ?? "Unable to send inquiry.");
      }

      toast.success("Inquiry sent. We will get back to you soon.", { id: toastId });
      setForm(initialForm);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to send inquiry.", { id: toastId });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="overflow-hidden rounded-[32px] bg-[#F6EFE6] p-5 shadow-sm md:p-8">
      <div className="grid gap-5 md:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.22em] text-[#8a7765]">
            Name
          </span>
          <input
            type="text"
            name="name"
            required
            value={form.name}
            onChange={(event) => updateField("name", event.target.value)}
            className={fieldClassName}
            placeholder="Your name"
            disabled={submitting}
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.22em] text-[#8a7765]">
            Email
          </span>
          <input
            type="email"
            name="email"
            required
            value={form.email}
            onChange={(event) => updateField("email", event.target.value)}
            className={fieldClassName}
            placeholder="you@example.com"
            disabled={submitting}
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.22em] text-[#8a7765]">
            Phone Number
          </span>
          <input
            type="tel"
            name="phone"
            required
            inputMode="tel"
            value={form.phone}
            onChange={(event) => updateField("phone", event.target.value)}
            className={fieldClassName}
            placeholder="+91 98765 43210"
            disabled={submitting}
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.22em] text-[#8a7765]">
            Topic
          </span>
          <AppSelect
            instanceId="contact-topic"
            name="topic"
            value={topicOptions.find((option) => option.value === form.subject)}
            options={topicOptions}
            onChange={(option) => updateField("subject", option?.value ?? "")}
            isDisabled={submitting}
            placeholder="Choose a topic"
          />
        </label>
      </div>

      <label className="mt-5 block">
        <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.22em] text-[#8a7765]">
          Message
        </span>
        <textarea
          name="message"
          required
          rows={7}
          value={form.message}
          onChange={(event) => updateField("message", event.target.value)}
          className="w-full resize-y rounded-2xl bg-[#fcfdfa] px-4 py-3 text-sm leading-7 shadow-sm outline-none transition focus:border-[#1b1511] disabled:cursor-not-allowed disabled:opacity-60"
          placeholder="Tell us what you are looking for."
          disabled={submitting}
        />
      </label>

      <button
        type="submit"
        disabled={submitting}
        className="mt-6 inline-flex h-12 items-center justify-center rounded-full bg-[#1b1511] px-8 text-[11px] font-semibold uppercase tracking-[0.24em] text-white transition hover:bg-[#3a2f27] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? (
          <span className="inline-flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Sending
          </span>
        ) : (
          "Send inquiry"
        )}
      </button>
    </form>
  );
}
