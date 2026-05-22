"use client";

import { Loader2, TriangleAlert } from "lucide-react";
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";

interface DeleteConfirmDialogProps {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  loading?: boolean;
  itemName?: string;
  title?: string;
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
      ? `Are you sure you want to delete "${itemName}"? This will permanently remove the category and all associated images.`
      : "Are you sure? This action cannot be undone.");

  return (
    <AlertDialogPrimitive.Root
      open={open}
      onOpenChange={(v) => { if (!v && !loading) onCancel(); }}
    >
      <AlertDialogPrimitive.Portal>
        {/* Backdrop */}
        <AlertDialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />

        {/* Panel */}
        <AlertDialogPrimitive.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-[28px] bg-white p-6 shadow-xl outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">

          {/* Warning icon */}
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
            <TriangleAlert className="h-6 w-6 text-red-500" />
          </div>

          {/* Title */}
          <AlertDialogPrimitive.Title className="text-xl font-semibold tracking-[-0.02em] text-[#1b1511]">
            {title}
          </AlertDialogPrimitive.Title>

          {/* Description */}
          <AlertDialogPrimitive.Description className="mt-2 text-sm leading-6 text-[#665b4f]">
            {message}
          </AlertDialogPrimitive.Description>

          {/* Divider */}
          <div className="my-5 border-t border-[#e8ddd1]" />

          {/* Actions */}
          <div className="flex items-center justify-end gap-3">
            <AlertDialogPrimitive.Cancel
              disabled={loading}
              onClick={onCancel}
              className="inline-flex h-10 items-center justify-center rounded-full border border-[#d9ccbc] bg-transparent px-5 text-sm font-medium text-[#1b1511] outline-none transition hover:bg-[#f5eee4] focus-visible:ring-2 focus-visible:ring-[#d7b68b] disabled:opacity-50"
            >
              Cancel
            </AlertDialogPrimitive.Cancel>

            <AlertDialogPrimitive.Action
              disabled={loading}
              onClick={(e) => {
                e.preventDefault();
                onConfirm();
              }}
              className="inline-flex h-10 min-w-[96px] items-center justify-center rounded-full bg-red-600 px-5 text-sm font-medium text-white outline-none transition hover:bg-red-700 focus-visible:ring-2 focus-visible:ring-red-400 disabled:opacity-60"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Deleting…
                </span>
              ) : (
                "Delete"
              )}
            </AlertDialogPrimitive.Action>
          </div>
        </AlertDialogPrimitive.Content>
      </AlertDialogPrimitive.Portal>
    </AlertDialogPrimitive.Root>
  );
}
