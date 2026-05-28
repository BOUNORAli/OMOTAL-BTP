"use client";

import type { ReactNode } from "react";
import { Wifi } from "lucide-react";
import { MobileBottomNav } from "./mobile-bottom-nav";
import { useChantiers } from "@/hooks/use-app-data";
import { useAppStore } from "@/stores/app-store";

export function MobileShell({ children }: { children: ReactNode }) {
  const currentUser = useAppStore((state) => state.currentUser);
  const selectedChantierId = useAppStore((state) => state.selectedChantierId);
  const { data: chantiers = [] } = useChantiers();
  const chantier = chantiers.find((item) => item.id === selectedChantierId);

  return (
    <div className="min-h-screen bg-slate-100 pb-24">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white px-4 py-3">
        <div className="mx-auto flex max-w-md items-center justify-between gap-3">
          <div>
            <span className="text-xs font-bold uppercase tracking-wide text-orange-600">Bonjour {currentUser.name}</span>
            <h1 className="text-lg font-black text-slate-950">{chantier?.name ?? "Chantier"}</h1>
          </div>
          <div className="flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
            <Wifi className="size-3.5" />
            Sync
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-md p-4">{children}</main>
      <MobileBottomNav />
    </div>
  );
}
