"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Bell, ChevronDown, LogOut, Menu, Search, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/input";
import { StatusPill } from "@/components/erp/status-pill";
import { useAlerts, useChantiers } from "@/hooks/use-app-data";
import { roleLabels } from "@/lib/domain/labels";
import { can } from "@/lib/domain/permissions";
import type { Role } from "@/lib/domain/types";
import { useAppStore } from "@/stores/app-store";
import { cn } from "@/utils/cn";
import { appNavItems } from "./sidebar";

const periodOptions = [
  { label: "Aujourd'hui", value: "today" },
  { label: "Semaine", value: "week" },
  { label: "Mois", value: "month" },
  { label: "Periode", value: "custom" },
];

export function Topbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: chantiers = [] } = useChantiers();
  const { data: alerts = [] } = useAlerts();
  const currentUser = useAppStore((state) => state.currentUser);
  const selectedChantierId = useAppStore((state) => state.selectedChantierId);
  const setSelectedChantierId = useAppStore((state) => state.setSelectedChantierId);
  const clearSession = useAppStore((state) => state.clearSession);
  const [period, setPeriod] = useState("month");
  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const availableChantiers =
    currentUser.role === "super_admin" || currentUser.role === "directeur"
      ? chantiers
      : chantiers.filter((chantier) => currentUser.chantierIds.includes(chantier.id));

  const activePage = appNavItems.find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`));
  const criticalAlerts = alerts.filter((alert) => alert.severity === "critical");
  const warningAlerts = alerts.filter((alert) => alert.severity === "warning");

  const searchResults = useMemo(() => {
    const query = search.trim().toLowerCase();
    const pages = appNavItems
      .filter((item) => can(currentUser.role as Role, item.permission))
      .map((item) => ({ label: item.label, detail: "Module", href: item.href }));
    const chantierResults = availableChantiers.map((chantier) => ({
      label: chantier.name,
      detail: `Chantier ${chantier.code}`,
      href: `/app/chantiers/${chantier.id}`,
    }));
    const all = [...pages, ...chantierResults];
    if (!query) return all.slice(0, 8);
    return all.filter((item) => `${item.label} ${item.detail}`.toLowerCase().includes(query)).slice(0, 8);
  }, [availableChantiers, currentUser.role, search]);

  function closeMenus() {
    setSearchOpen(false);
    setNotificationsOpen(false);
    setProfileOpen(false);
  }

  function goTo(href: string) {
    closeMenus();
    router.push(href);
  }

  function logout() {
    clearSession();
    closeMenus();
    router.replace("/login");
  }

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white px-4 py-3 shadow-sm lg:px-5">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <button
            aria-label="Ouvrir la navigation"
            className="grid size-10 shrink-0 place-items-center rounded-lg border border-slate-200 bg-white text-slate-900 lg:hidden"
            onClick={() => window.dispatchEvent(new Event("omotal:toggle-mobile-nav"))}
            type="button"
          >
            <Menu className="size-5" />
          </button>
          <div className="hidden min-w-0 lg:block">
            <span className="block text-xs font-black uppercase text-slate-400">Module</span>
            <strong className="block truncate text-sm text-slate-950">{activePage?.label ?? "OMOTAL"}</strong>
          </div>
          <Select
            aria-label="Chantier selectionne"
            className="min-w-0 flex-1 xl:w-80 xl:flex-none"
            onChange={(event) => setSelectedChantierId(event.target.value)}
            value={selectedChantierId}
          >
            {availableChantiers.map((chantier) => (
              <option key={chantier.id} value={chantier.id}>
                {chantier.name}
              </option>
            ))}
          </Select>
          <Select
            aria-label="Periode globale"
            className="hidden w-36 sm:block"
            onChange={(event) => setPeriod(event.target.value)}
            value={period}
          >
            {periodOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </div>

        <div className="flex min-w-0 items-center gap-2">
          <div className="relative min-w-0 flex-1 xl:w-96 xl:flex-none">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              aria-label="Recherche globale"
              className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm text-slate-700 outline-none transition focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-100"
              onChange={(event) => {
                setSearch(event.target.value);
                setSearchOpen(true);
              }}
              onFocus={() => setSearchOpen(true)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && searchResults[0]) goTo(searchResults[0].href);
                if (event.key === "Escape") setSearchOpen(false);
              }}
              placeholder="Rechercher module ou chantier"
              value={search}
            />
            {searchOpen ? (
              <div className="absolute right-0 top-11 z-50 w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl">
                {searchResults.length ? (
                  searchResults.map((item) => (
                    <button
                      className="flex w-full items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 text-left last:border-0 hover:bg-slate-50"
                      key={`${item.href}-${item.label}`}
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => goTo(item.href)}
                      type="button"
                    >
                      <span className="min-w-0">
                        <strong className="block truncate text-sm text-slate-950">{item.label}</strong>
                        <span className="text-xs text-slate-500">{item.detail}</span>
                      </span>
                      <span className="text-xs font-black uppercase text-orange-600">Ouvrir</span>
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-3 text-sm text-slate-500">Aucun resultat.</div>
                )}
              </div>
            ) : null}
          </div>

          <div className="relative hidden sm:block">
            <Button
              onClick={() => {
                setNotificationsOpen((value) => !value);
                setProfileOpen(false);
                setSearchOpen(false);
              }}
              size="sm"
              type="button"
              variant="secondary"
            >
              <Bell className="size-4" />
              {criticalAlerts.length + warningAlerts.length}
            </Button>
            {notificationsOpen ? (
              <div className="absolute right-0 top-11 z-50 w-80 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl">
                <div className="border-b border-slate-100 px-4 py-3">
                  <strong className="block text-sm text-slate-950">Alertes actives</strong>
                  <span className="text-xs text-slate-500">{alerts.length} element(s)</span>
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {alerts.length ? (
                    alerts.slice(0, 6).map((alert) => (
                      <button
                        className="w-full border-b border-slate-100 px-4 py-3 text-left last:border-0 hover:bg-slate-50"
                        key={alert.id}
                        onClick={() => goTo("/app/alertes")}
                        type="button"
                      >
                        <div className="mb-1 flex items-center justify-between gap-2">
                          <strong className="truncate text-sm text-slate-950">{alert.title}</strong>
                          <StatusPill tone={alert.severity === "critical" ? "danger" : alert.severity === "warning" ? "warning" : "info"}>
                            {alert.severity}
                          </StatusPill>
                        </div>
                        <span className="line-clamp-2 text-xs text-slate-500">{alert.description}</span>
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-4 text-sm text-slate-500">Aucune alerte.</div>
                  )}
                </div>
              </div>
            ) : null}
          </div>

          <div className="relative">
            <button
              className="flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 text-right hover:bg-slate-50"
              onClick={() => {
                setProfileOpen((value) => !value);
                setNotificationsOpen(false);
                setSearchOpen(false);
              }}
              type="button"
            >
              <UserCircle className="size-5 text-slate-500" />
              <span className="hidden sm:block">
                <strong className="block text-xs text-slate-950">{currentUser.name}</strong>
                <span className="text-xs text-slate-500">{roleLabels[currentUser.role]}</span>
              </span>
              <ChevronDown className="size-4 text-slate-400" />
            </button>
            {profileOpen ? (
              <div className="absolute right-0 top-12 z-50 w-72 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl">
                <div className="border-b border-slate-100 px-4 py-3">
                  <strong className="block text-sm text-slate-950">{currentUser.name}</strong>
                  <span className="text-xs text-slate-500">{currentUser.email}</span>
                </div>
                <button
                  className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-bold text-red-700 hover:bg-red-50"
                  onClick={logout}
                  type="button"
                >
                  <LogOut className="size-4" />
                  Se deconnecter
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
      <div className="mt-2 hidden items-center gap-2 text-xs font-bold text-slate-500 xl:flex">
        <span>{periodOptions.find((option) => option.value === period)?.label}</span>
        <span className={cn("h-1.5 w-1.5 rounded-full", criticalAlerts.length ? "bg-red-500" : "bg-emerald-500")} />
        <span>{criticalAlerts.length} critique(s), {warningAlerts.length} warning(s)</span>
      </div>
    </header>
  );
}
