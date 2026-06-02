"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { FileUploader } from "react-drag-drop-files";
import { motion, AnimatePresence } from "framer-motion";
import { Images, UploadCloud, X } from "lucide-react";

// ─── types ────────────────────────────────────────────────────────────────────
interface GalleryUploaderProps {
  /** New files the user has picked */
  files: File[];
  onChange: (files: File[]) => void;
  /** Existing URLs already saved in the DB — shown as current images */
  existingUrls?: string[];
  onRemoveExisting?: (url: string) => void;
  label?: string;
  hint?: string;
}

const FILE_TYPES = ["JPG", "JPEG", "PNG", "WEBP", "AVIF", "GIF"];

// ─── preview item ─────────────────────────────────────────────────────────────
function PreviewItem({
  src,
  onRemove,
  label,
}: {
  src: string;
  onRemove: () => void;
  label?: string;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.18 }}
      className="group relative"
    >
      <div className="relative h-24 w-24 overflow-hidden rounded-2xl border border-[#e8ddd1] bg-[#f5eee4]">
        <Image src={src} alt={label ?? "gallery image"} fill unoptimized className="object-cover" />
      </div>

      {/* Remove button — floats top-right */}
      <motion.button
        type="button"
        onClick={onRemove}
        whileHover={{ scale: 1.15 }}
        whileTap={{ scale: 0.9 }}
        className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full border border-[#e8ddd1] bg-white text-[#665b4f] shadow-sm transition hover:bg-white hover:text-red-500"
        aria-label="Remove image"
      >
        <X className="h-3 w-3" />
      </motion.button>
    </motion.div>
  );
}

// ─── component ────────────────────────────────────────────────────────────────
export function GalleryUploader({
  files,
  onChange,
  existingUrls = [],
  onRemoveExisting,
  label = "Gallery Images",
  hint,
}: GalleryUploaderProps) {
  const [previews, setPreviews] = useState<{ file: File; url: string }[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  // Regenerate previews when files change
  useEffect(() => {
    // Guard: ensure every item is a real File before calling createObjectURL
    const validFiles = files.filter((f): f is File => f instanceof File);
    const created = validFiles.map((file) => ({ file, url: URL.createObjectURL(file) }));
    setPreviews(created);
    return () => created.forEach((p) => URL.revokeObjectURL(p.url));
  }, [files]);

  const handleAdd = (incoming: File | FileList | File[]) => {
    let newFiles: File[];
    if (incoming instanceof FileList) {
      newFiles = Array.from(incoming).filter((f): f is File => f instanceof File);
    } else if (Array.isArray(incoming)) {
      newFiles = incoming.filter((f): f is File => f instanceof File);
    } else if (incoming instanceof File) {
      newFiles = [incoming];
    } else {
      newFiles = [];
    }
    onChange([...files, ...newFiles]);
  };

  const handleRemoveNew = (index: number) => {
    onChange(files.filter((_, i) => i !== index));
  };

  const totalCount = existingUrls.length + files.length;

  return (
    <div className="space-y-3">
      {/* Label */}
      <div>
        <p className="text-sm font-medium text-[#352a21]">{label}</p>
        {hint && <p className="mt-0.5 text-xs text-[#8a7765]">{hint}</p>}
      </div>

      {/* Drop zone */}
      <FileUploader
        handleChange={handleAdd}
        name="gallery"
        types={FILE_TYPES}
        multiple
        onDraggingStateChange={setIsDragging}
        label=""
        classes="w-full"
      >
        <motion.div
          animate={
            isDragging
              ? { borderColor: "#b38d67", backgroundColor: "#faf4ea", scale: 1.01 }
              : { borderColor: "#d9ccbc", backgroundColor: "#fcfaf7", scale: 1 }
          }
          transition={{ duration: 0.15 }}
          className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-6 py-6 text-center"
        >
          <motion.div
            animate={isDragging ? { scale: 1.15, rotate: -6 } : { scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f5eee4] text-[#b38d67]"
          >
            <UploadCloud className="h-5 w-5" />
          </motion.div>
          <p className="text-sm font-medium text-[#1b1511]">
            {isDragging ? "Drop to add" : "Drag & drop or click to add images"}
          </p>
          <p className="text-xs text-[#8a7765]">
            {totalCount > 0
              ? `${totalCount} image${totalCount !== 1 ? "s" : ""} total`
              : "JPG, PNG, WEBP — multiple allowed"}
          </p>
        </motion.div>
      </FileUploader>

      {/* Preview grid */}
      <AnimatePresence mode="popLayout">
        {(existingUrls.length > 0 || previews.length > 0) && (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-wrap gap-3 pt-1"
          >
            {/* Existing saved images */}
            {existingUrls.map((url) => (
              <PreviewItem
                key={url}
                src={url}
                label="Existing"
                onRemove={() => onRemoveExisting?.(url)}
              />
            ))}

            {/* Newly picked files */}
            {previews.map((preview, index) => (
              <PreviewItem
                key={preview.url}
                src={preview.url}
                label={preview.file.name}
                onRemove={() => handleRemoveNew(index)}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty state hint */}
      {totalCount === 0 && (
        <div className="flex items-center gap-2 text-xs text-[#a69280]">
          <Images className="h-4 w-4" />
          <span>No gallery images yet</span>
        </div>
      )}
    </div>
  );
}
