"use client";

import type { ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ConfirmDialog({
  cancelLabel = "Annuler",
  confirmLabel = "Confirmer",
  message,
  onCancel,
  onConfirm,
  open,
  title,
}: {
  cancelLabel?: string;
  confirmLabel?: string;
  message: ReactNode;
  onCancel: () => void;
  onConfirm: () => void;
  open: boolean;
  title: string;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-slate-950/35 p-4">
      <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-5 shadow-2xl">
        <div className="flex gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-amber-50 text-amber-700">
            <AlertTriangle className="size-5" />
          </span>
          <div>
            <h2 className="font-black text-slate-950">{title}</h2>
            <div className="mt-2 text-sm leading-6 text-slate-600">{message}</div>
          </div>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button onClick={onCancel} type="button" variant="secondary">
            {cancelLabel}
          </Button>
          <Button onClick={onConfirm} type="button">
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
