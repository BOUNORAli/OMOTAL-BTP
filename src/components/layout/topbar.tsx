"use client";

import { Bell, HelpCircle, Menu, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/input";
import { useChantiers } from "@/hooks/use-app-data";
import { roleLabels } from "@/lib/domain/labels";
import { useAppStore } from "@/stores/app-store";

export function Topbar() {
  const { data: chantiers = [] } = useChantiers();
  const currentUser = useAppStore((state) => state.currentUser);
  const selectedChantierId = useAppStore((state) => state.selectedChantierId);
  const setSelectedChantierId = useAppStore((state) => state.setSelectedChantierId);

  const availableChantiers =
    currentUser.role === "super_admin" || currentUser.role === "directeur"
      ? chantiers
      : chantiers.filter((chantier) => currentUser.chantierIds.includes(chantier.id));

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur lg:px-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <button
            aria-label="Ouvrir la navigation"
            className="grid size-11 shrink-0 place-items-center rounded-xl border border-slate-200 bg-white text-slate-900 shadow-sm lg:hidden"
            onClick={() => {
              window.dispatchEvent(new Event("omotal:toggle-mobile-nav"));
            }}
            type="button"
          >
            <Menu className="size-5" />
          </button>
          <Select
            aria-label="Chantier selectionne"
            className="min-w-0 flex-1 lg:max-w-xs"
            onChange={(event) => setSelectedChantierId(event.target.value)}
            value={selectedChantierId}
          >
            {availableChantiers.map((chantier) => (
              <option key={chantier.id} value={chantier.id}>
                {chantier.name}
              </option>
            ))}
          </Select>
          <div className="hidden min-w-72 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500 md:flex">
            <Search className="size-4" />
            Rechercher transaction, engin, bon...
          </div>
        </div>

        <div className="hidden items-center gap-2 sm:flex">
          <Button size="sm" variant="secondary">
            <Bell className="size-4" />
            Notifications
          </Button>
          <Button size="sm" variant="ghost">
            <HelpCircle className="size-4" />
            Aide
          </Button>
          <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-right">
            <strong className="block text-xs text-slate-950">{currentUser.name}</strong>
            <span className="text-xs text-slate-500">{roleLabels[currentUser.role]}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
