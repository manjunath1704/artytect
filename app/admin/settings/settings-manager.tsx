"use client";

import Image from "next/image";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { ImageUploader } from "@/components/ui/image-uploader";

export default function SettingsManager({ initialQrUrl }: { initialQrUrl: string }) {
  const [qrUrl, setQrUrl] = useState(initialQrUrl);
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!file) {
      toast.error("Upload a QR image first.");
      return;
    }
    setSaving(true);
    const toastId = toast.loading("Saving payment QR...");
    try {
      const formData = new FormData();
      formData.append("qr", file);
      const response = await fetch("/api/admin/settings/payment-qr", { method: "PUT", body: formData });
      const result = await response.json();
      if (!response.ok) throw new Error(result?.error ?? "Unable to save QR.");
      setQrUrl(result.url);
      setFile(null);
      toast.success("Payment QR saved.", { id: toastId });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save QR.", { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="px-6 py-8 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-[32px] bg-white p-6 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-[#8a7765]">Settings</p>
          <h1 className="mt-2 text-4xl tracking-[-0.04em] text-[#1b1511]">Payment QR</h1>
          <p className="mt-3 text-sm leading-7 text-[#665b4f]">
            This QR is shown on every checkout page and can be changed anytime.
          </p>
        </div>

        <div className="mt-6 grid gap-6 rounded-[32px] bg-white p-6 shadow-sm md:grid-cols-2">
          <div>
            <ImageUploader label="Upload payment QR" file={file} onChange={setFile} onRemove={() => setFile(null)} />
            <button disabled={saving} onClick={save} className="mt-5 inline-flex h-12 items-center gap-2 rounded-full bg-[#1b1511] px-6 text-[11px] font-semibold uppercase tracking-[0.18em] text-white disabled:opacity-60">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Save QR
            </button>
          </div>
          <div>
            <p className="text-sm font-medium text-[#352a21]">Current QR</p>
            <div className="mt-2 relative aspect-square overflow-hidden rounded-[28px] bg-[#fbf8f4]">
              {qrUrl ? (
                <Image src={qrUrl} alt="Current payment QR" fill sizes="360px" className="object-contain" />
              ) : (
                <div className="grid h-full place-items-center text-sm text-[#8a7765]">No QR uploaded</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
