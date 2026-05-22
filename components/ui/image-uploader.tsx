"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { FileUploader } from "react-drag-drop-files";
import { motion, AnimatePresence } from "framer-motion";
import { ImageIcon, X, UploadCloud } from "lucide-react";

// ─── types ────────────────────────────────────────────────────────────────────
interface ImageUploaderProps {
  /** Label shown above the drop zone */
  label: string;
  /** Optional helper text below the label */
  hint?: string;
  /** Controlled file value */
  file: File | null;
  /** Called when user picks / drops a file */
  onChange: (file: File) => void;
  /** Called when user removes the selected file */
  onRemove: () => void;
  /** Whether the field is required */
  required?: boolean;
  /** Show error border on the drop zone */
  hasError?: boolean;
}

// ─── helpers ──────────────────────────────────────────────────────────────────
const FILE_TYPES = ["JPG", "JPEG", "PNG", "WEBP", "AVIF", "GIF"];

/** Simulates upload progress from 0 → 100 over ~1.2 s */
function useUploadProgress(file: File | null) {
  const [progress, setProgress] = useState(0);
  const rafRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!file) {
      setProgress(0);
      return;
    }

    setProgress(0);
    const start = performance.now();
    const duration = 1200; // ms

    const tick = () => {
      const elapsed = performance.now() - start;
      const pct = Math.min(100, Math.round((elapsed / duration) * 100));
      setProgress(pct);
      if (pct < 100) {
        rafRef.current = setTimeout(tick, 16);
      }
    };

    rafRef.current = setTimeout(tick, 16);
    return () => {
      if (rafRef.current) clearTimeout(rafRef.current);
    };
  }, [file]);

  return progress;
}

// ─── component ────────────────────────────────────────────────────────────────
export function ImageUploader({
  label,
  hint,
  file,
  onChange,
  onRemove,
  required,
  hasError = false,
}: ImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const progress = useUploadProgress(file);

  // Generate / revoke object URL
  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const handleRemove = () => {
    onRemove();
    setIsDragging(false);
  };

  return (
    <div className="space-y-2">
      {/* Label */}
      <div>
        <p className="text-sm font-medium text-[#352a21]">
          {label}
          {required && <span className="ml-0.5 text-[#b38d67]">*</span>}
        </p>
        {hint && <p className="mt-0.5 text-xs text-[#8a7765]">{hint}</p>}
      </div>

      {/* Drop zone — hidden once a file is selected */}
      <AnimatePresence initial={false}>
        {!file && (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18 }}
          >
            {/* FileUploader renders its own wrapper; we style via className on the child */}
            <FileUploader
              handleChange={onChange}
              name={label}
              types={FILE_TYPES}
              onDraggingStateChange={setIsDragging}
              // Disable the default label so we render our own UI
              label=""
              // Remove default styles
              classes="w-full"
            >
              <motion.div
                animate={
                  isDragging
                    ? { borderColor: "#b38d67", backgroundColor: "#faf4ea", scale: 1.01 }
                    : hasError
                    ? { borderColor: "#f87171", backgroundColor: "#fff5f5", scale: 1 }
                    : { borderColor: "#d9ccbc", backgroundColor: "#fcfaf7", scale: 1 }
                }
                transition={{ duration: 0.15 }}
                className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-shadow hover:shadow-sm"
              >
                <motion.div
                  animate={isDragging ? { scale: 1.15, rotate: -6 } : { scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f5eee4] text-[#b38d67]"
                >
                  <UploadCloud className="h-6 w-6" />
                </motion.div>

                <div>
                  <p className="text-sm font-medium text-[#1b1511]">
                    {isDragging ? "Drop to upload" : "Drag & drop or click to upload"}
                  </p>
                  <p className="mt-1 text-xs text-[#8a7765]">
                    JPG, PNG, WEBP, AVIF, GIF — any size
                  </p>
                </div>
              </motion.div>
            </FileUploader>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preview + progress — shown once a file is selected */}
      <AnimatePresence initial={false}>
        {file && (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden rounded-2xl border border-[#e8ddd1] bg-[#fcfaf7]"
          >
            {/* Image preview */}
            <div className="relative h-52 w-full bg-[#f5eee4]">
              {preview ? (
                <Image
                  src={preview}
                  alt="Preview"
                  fill
                  unoptimized
                  className="object-contain"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <ImageIcon className="h-8 w-8 text-[#d9ccbc]" />
                </div>
              )}

              {/* Remove button */}
              <motion.button
                type="button"
                onClick={handleRemove}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-[#665b4f] shadow-sm backdrop-blur-sm transition hover:bg-white hover:text-[#1b1511]"
                aria-label="Remove image"
              >
                <X className="h-3.5 w-3.5" />
              </motion.button>
            </div>

            {/* File info + progress bar */}
            <div className="px-4 py-3">
              <div className="flex items-center justify-between gap-2">
                <p className="max-w-[70%] truncate text-xs font-medium text-[#1b1511]">
                  {file.name}
                </p>
                <motion.span
                  key={progress}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="shrink-0 text-xs tabular-nums text-[#8a7765]"
                >
                  {progress < 100
                    ? `${progress}%`
                    : <span className="text-[#5a8a5a]">Ready</span>}
                </motion.span>
              </div>

              {/* Animated progress bar */}
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[#e8ddd1]">
                <motion.div
                  className="h-full rounded-full bg-[#b38d67]"
                  initial={{ width: "0%" }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.1, ease: "linear" }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
