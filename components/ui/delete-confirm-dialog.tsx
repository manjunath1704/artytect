"use client";

import { Loader2, TriangleAlert } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DeleteConfirmDialogProps {
  /** Controls open/close state */
  open: boolean;
  /** Called when the user closes or cancels */
  onCancel: () => void;
  /** Called when the user confirms deletion */
  onConfirm: () => void;
  /** Whether the delete request is in-flight */
  loading?: boolean;
  /** Name/label of the item being deleted — shown in the message */
  itemName?: string;
  /** Override the dialog title */
  title?: string;
  /** Override the dialog description */
  description?: string;
}

export function DeleteConfirmDialog({
  open,
  onCancel,
  onConfirm,
  loading = false,
  itemName,
  title = "Delete category",
  description,
}: DeleteConfirmDialogProps) {
  const message =
    description ??
    (itemName
      ? `Are you sure you want to delete "${itemName}"? This action cannot be undone and will permanently remove the category and all associated images.`
      : "Are you sure you want to delete this item? This action cannot be undone.");

  return (
    <AlertDialog open={open} onOpenChange={(v) => { if (!v && !loading) onCancel(); }}>
      <AlertDialogContent className="max-w-md rounded-[28px] border border-[#e8ddd1] bg-white p-0 shadow-2xl">

        {/* Header */}
        <AlertDialogHeader className="px-6 pb-0 pt-6">
          {/* Icon */}
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
            <TriangleAlert className="h-6 w-6 text-red-500" />
          </div>

          <AlertDialogTitle className="text-xl tracking-[-0.02em] text-[#1b1511]">
            {title}
          </AlertDialogTitle>

          <AlertDialogDescription className="mt-2 text-sm leading-6 text-[#665b4f]">
            {message}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* Divider */}
        <div className="mx-6 mt-5 border-t border-[#e8ddd1]" />

        {/* Footer */}
        <AlertDialogFooter className="flex flex-row items-center justify-end gap-3 px-6 py-4">
          <AlertDialogCancel
            disabled={loading}
            onClick={onCancel}
            className="h-10 rounded-full border border-[#d9ccbc] bg-transparent px-5 text-sm font-medium text-[#1b1511] transition hover:bg-[#f5eee4] focus-visible:ring-2 focus-visible:ring-[#d7b68b] disabled:opacity-50"
          >
            Cancel
          </AlertDialogCancel>

          <AlertDialogAction
            disabled={loading}
            onClick={(e) => {
              e.preventDefault(); // prevent dialog auto-close — we close after success
              onConfirm();
            }}
            className="h-10 min-w-[100px] rounded-full bg-red-600 px-5 text-sm font-medium text-white transition hover:bg-red-700 focus-visible:ring-2 focus-visible:ring-red-400 disabled:opacity-60"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Deleting…
              </span>
            ) : (
              "Delete"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
