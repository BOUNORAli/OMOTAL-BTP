"use client";

import { useState, type ReactNode } from "react";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ActionMenu({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative inline-flex">
      <Button aria-label="Actions" onClick={() => setOpen((value) => !value)} size="sm" type="button" variant="ghost">
        <MoreHorizontal className="size-4" />
      </Button>
      {open ? (
        <div className="absolute right-0 top-9 z-20 min-w-44 overflow-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-xl">
          {children}
        </div>
      ) : null}
    </div>
  );
}

export function ActionMenuItem({ children, onClick }: { children: ReactNode; onClick?: () => void }) {
  return (
    <button
      className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-bold text-slate-700 hover:bg-slate-50"
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}
