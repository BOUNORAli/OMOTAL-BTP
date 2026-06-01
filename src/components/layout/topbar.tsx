"use client";

import { Bell, ChevronDown, HelpCircle, LogOut, Menu, Search, UserCircle } from "lucide-react";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/input";
import {
  useAlerts,
  useChantiers,
  useEngins,
  useFournisseurs,
  useGasoilOverview,
  usePersonnel,
  useProductions,
  useTransactions,
} from "@/hooks/use-app-data";
import { roleLabels } from "@/lib/domain/labels";
import { can, type Permission } from "@/lib/domain/permissions";
import { useAppStore } from "@/stores/app-store";
import { cn } from "@/utils/cn";
import { appNavItems } from "./sidebar";

export function Topbar() {
  const router = useRouter();
  const { data: chantiers = [] } = useChantiers();
  const { data: alerts = [] } = useAlerts();
  const currentUser = useAppStore((state) => state.currentUser);
  const selectedChantierId = useAppStore((state) => state.selectedChantierId);
  const setSelectedChantierId = useAppStore((state) => state.setSelectedChantierId);
  const clearSession = useAppStore((state) => state.clearSession);
  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const searchActive = searchOpen || search.trim().length > 0;
  const canReadCaisse = can(currentUser.role, "caisse.read");
  const canReadEngins = can(currentUser.role, "engins.read");
  const canReadPersonnel = can(currentUser.role, "personnel.read");
  const canReadFournisseurs = can(currentUser.role, "fournisseurs.read");
  const canReadGasoil = can(currentUser.role, "gasoil.read");
  const canReadProduction = can(currentUser.role, "production.read");
  const { data: transactions = [] } = useTransactions({ enabled: searchActive && canReadCaisse });
  const { data: engins } = useEngins({ enabled: searchActive && canReadEngins });
  const { data: personnel } = usePersonnel({ enabled: searchActive && canReadPersonnel });
  const { data: fournisseurs = [] } = useFournisseurs({ enabled: searchActive && canReadFournisseurs });
  const { data: gasoil } = useGasoilOverview(selectedChantierId, { enabled: searchActive && canReadGasoil });
  const { data: productions = [] } = useProductions({ enabled: searchActive && canReadProduction });

  const availableChantiers =
    currentUser.role === "super_admin" || currentUser.role === "directeur"
      ? chantiers
      : chantiers.filter((chantier) => currentUser.chantierIds.includes(chantier.id));

  const chantierNames = useMemo(
    () => new Map(chantiers.map((chantier) => [chantier.id, chantier.name])),
    [chantiers],
  );

  const equipmentNames = useMemo(
    () => new Map((engins?.equipment ?? []).map((item) => [item.id, item.designation])),
    [engins?.equipment],
  );

  const employeeNames = useMemo(
    () => new Map((personnel?.employees ?? []).map((item) => [item.id, `${item.firstName} ${item.lastName}`])),
    [personnel?.employees],
  );

  const supplierNames = useMemo(
    () => new Map(fournisseurs.map((item) => [item.id, item.name])),
    [fournisseurs],
  );

  const searchResults = useMemo(() => {
    const query = search.trim().toLowerCase();
    const pages = appNavItems
      .filter((item) => can(currentUser.role, item.permission as Permission))
      .map((item) => ({ label: item.label, detail: "Page", href: item.href }));
    const chantierResults = availableChantiers.map((chantier) => ({
      label: chantier.name,
      detail: `Chantier ${chantier.code}`,
      href: `/app/chantiers/${chantier.id}`,
    }));
    const dataResults = query
      ? [
          ...transactions.map((item) => ({
            label: item.description,
            detail: `Caisse • ${item.category} • ${item.amount.toLocaleString("fr-MA")} MAD • ${chantierNames.get(item.chantierId) ?? "Chantier"}`,
            href: "/app/caisse",
            searchText: `${item.description} ${item.personOrSupplier ?? ""} ${item.category} ${item.paymentMode} ${item.amount} ${chantierNames.get(item.chantierId) ?? ""}`,
          })),
          ...(engins?.equipment ?? []).map((item) => ({
            label: item.designation,
            detail: `Engin • ${item.type} • ${item.owner} • ${chantierNames.get(item.chantierId) ?? "Chantier"}`,
            href: "/app/engins",
            searchText: `${item.designation} ${item.type} ${item.owner} ${item.usualDriver ?? ""} ${chantierNames.get(item.chantierId) ?? ""}`,
          })),
          ...(engins?.timesheets ?? []).map((item) => ({
            label: `Pointage ${equipmentNames.get(item.equipmentId) ?? item.driver}`,
            detail: `Engins • ${item.driver} • ${item.hoursWorked ?? item.daysBilled ?? 0} ${item.hoursWorked ? "h" : "j"}`,
            href: "/app/engins",
            searchText: `${equipmentNames.get(item.equipmentId) ?? ""} ${item.driver} ${item.activityType} ${item.date}`,
          })),
          ...(personnel?.employees ?? []).map((item) => ({
            label: `${item.firstName} ${item.lastName}`,
            detail: `Personnel • ${item.position} • ${chantierNames.get(item.chantierId) ?? "Chantier"}`,
            href: "/app/personnel",
            searchText: `${item.firstName} ${item.lastName} ${item.position} ${chantierNames.get(item.chantierId) ?? ""}`,
          })),
          ...(personnel?.timesheets ?? []).map((item) => ({
            label: `Pointage ${employeeNames.get(item.employeeId) ?? "employe"}`,
            detail: `Personnel • ${item.hoursWorked} h • ${item.dayType}`,
            href: "/app/personnel",
            searchText: `${employeeNames.get(item.employeeId) ?? ""} ${item.dayType} ${item.date}`,
          })),
          ...fournisseurs.map((item) => ({
            label: item.name,
            detail: `Fournisseur • ${item.type}${item.phone ? ` • ${item.phone}` : ""}`,
            href: "/app/matieres",
            searchText: `${item.name} ${item.type} ${item.phone ?? ""}`,
          })),
          ...(gasoil?.entries ?? []).map((item) => ({
            label: item.receiptNumber ? `Entree gasoil ${item.receiptNumber}` : "Entree gasoil",
            detail: `${supplierNames.get(item.supplierId) ?? "Fournisseur"} • ${item.liters} L • ${item.status}`,
            href: "/app/gasoil",
            searchText: `${item.receiptNumber ?? ""} ${supplierNames.get(item.supplierId) ?? ""} ${item.liters} ${item.status}`,
          })),
          ...(gasoil?.exits ?? []).map((item) => ({
            label: item.exitNumber ? `Sortie gasoil ${item.exitNumber}` : "Sortie gasoil",
            detail: `${equipmentNames.get(item.equipmentId ?? "") ?? item.responsible} • ${item.liters} L • ${item.status}`,
            href: "/app/gasoil",
            searchText: `${item.exitNumber ?? ""} ${item.responsible} ${equipmentNames.get(item.equipmentId ?? "") ?? ""} ${item.liters} ${item.status}`,
          })),
          ...productions.map((item) => ({
            label: `${item.workType} - ${item.voie}`,
            detail: `Production • ${item.quantity} ${item.unit} • ${item.troncon ?? item.date}`,
            href: "/app/production",
            searchText: `${item.workType} ${item.voie} ${item.tranche ?? ""} ${item.troncon ?? ""} ${item.driver ?? ""} ${item.quantity} ${item.unit}`,
          })),
        ]
      : [];
    const all = [...pages, ...chantierResults, ...dataResults];
    if (!query) return all.slice(0, 7);
    return all
      .filter((item) => `${item.label} ${item.detail} ${"searchText" in item ? item.searchText : ""}`.toLowerCase().includes(query))
      .slice(0, 10);
  }, [
    availableChantiers,
    chantierNames,
    currentUser.role,
    employeeNames,
    engins?.equipment,
    engins?.timesheets,
    equipmentNames,
    fournisseurs,
    gasoil?.entries,
    gasoil?.exits,
    personnel?.employees,
    personnel?.timesheets,
    productions,
    search,
    supplierNames,
    transactions,
  ]);

  const unreadAlerts = alerts.filter((alert) => alert.severity === "critical" || alert.severity === "warning").length;

  function closeMenus() {
    setSearchOpen(false);
    setNotificationsOpen(false);
    setHelpOpen(false);
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
            <Search className="size-4 shrink-0" />
            <div className="relative min-w-0 flex-1">
              <input
                aria-label="Recherche globale"
                className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-500"
                onChange={(event) => {
                  setSearch(event.target.value);
                  setSearchOpen(true);
                }}
                onFocus={() => setSearchOpen(true)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && searchResults[0]) {
                    goTo(searchResults[0].href);
                  }
                  if (event.key === "Escape") {
                    setSearchOpen(false);
                  }
                }}
                placeholder="Rechercher page, transaction, engin, bon..."
                value={search}
              />
              {searchOpen && (
                <div className="absolute left-[-34px] top-9 z-50 w-[390px] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
                  {searchResults.length ? (
                    searchResults.map((item) => (
                      <button
                        className="flex w-full items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 text-left last:border-0 hover:bg-slate-50"
                        key={`${item.href}-${item.label}`}
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => goTo(item.href)}
                        type="button"
                      >
                        <span>
                          <strong className="block text-sm text-slate-950">{item.label}</strong>
                          <span className="text-xs text-slate-500">{item.detail}</span>
                        </span>
                        <span className="text-xs font-black uppercase text-orange-600">Ouvrir</span>
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-sm text-slate-500">Aucun resultat.</div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="hidden items-center gap-2 sm:flex">
          <div className="relative">
            <Button
              onClick={() => {
                setNotificationsOpen((value) => !value);
                setHelpOpen(false);
                setProfileOpen(false);
              }}
              size="sm"
              variant="secondary"
            >
            <Bell className="size-4" />
            Notifications
              {unreadAlerts > 0 && (
                <span className="ml-1 rounded-full bg-red-600 px-1.5 py-0.5 text-[10px] font-black text-white">{unreadAlerts}</span>
              )}
            </Button>
            {notificationsOpen && (
              <div className="absolute right-0 top-12 z-50 w-80 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
                <div className="border-b border-slate-100 px-4 py-3">
                  <strong className="block text-sm text-slate-950">Notifications</strong>
                  <span className="text-xs text-slate-500">{alerts.length} alerte(s) actives</span>
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {alerts.length ? alerts.slice(0, 5).map((alert) => (
                    <button
                      className="w-full border-b border-slate-100 px-4 py-3 text-left last:border-0 hover:bg-slate-50"
                      key={alert.id}
                      onClick={() => goTo("/app/alertes")}
                      type="button"
                    >
                      <strong className={cn("block text-sm", alert.severity === "critical" ? "text-red-700" : "text-slate-950")}>
                        {alert.title}
                      </strong>
                      <span className="line-clamp-2 text-xs text-slate-500">{alert.description}</span>
                    </button>
                  )) : (
                    <div className="px-4 py-4 text-sm text-slate-500">Aucune alerte pour le moment.</div>
                  )}
                </div>
                <button
                  className="w-full bg-slate-50 px-4 py-3 text-left text-sm font-bold text-orange-700"
                  onClick={() => goTo("/app/alertes")}
                  type="button"
                >
                  Voir toutes les alertes
                </button>
              </div>
            )}
          </div>

          <div className="relative">
            <Button
              onClick={() => {
                setHelpOpen((value) => !value);
                setNotificationsOpen(false);
                setProfileOpen(false);
              }}
              size="sm"
              variant="ghost"
            >
              <HelpCircle className="size-4" />
              Aide
            </Button>
            {helpOpen && (
              <div className="absolute right-0 top-12 z-50 w-80 rounded-xl border border-slate-200 bg-white p-4 shadow-xl">
                <strong className="block text-sm text-slate-950">Aide rapide</strong>
                <div className="mt-3 space-y-3 text-sm text-slate-600">
                  <p>Choisis un chantier en haut, puis utilise le menu gauche pour ouvrir caisse, gasoil, pointages ou validations.</p>
                  <p>Sur mobile, utilise le bouton menu en haut a gauche pour changer de page.</p>
                  <p>Pour un souci de connexion Railway/Vercel, verifie `NEXT_PUBLIC_API_BASE_URL` cote Vercel et `OMOTAL_FRONTEND_ORIGIN` cote Railway.</p>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button onClick={() => goTo("/app/rapports")} size="sm" variant="secondary">Rapports</Button>
                  <Button onClick={() => goTo("/app/validations")} size="sm" variant="ghost">Validations</Button>
                </div>
              </div>
            )}
          </div>

          <div className="relative">
            <button
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-right hover:bg-slate-50"
              onClick={() => {
                setProfileOpen((value) => !value);
                setNotificationsOpen(false);
                setHelpOpen(false);
              }}
              type="button"
            >
              <UserCircle className="size-5 text-slate-500" />
              <span>
                <strong className="block text-xs text-slate-950">{currentUser.name}</strong>
                <span className="text-xs text-slate-500">{roleLabels[currentUser.role]}</span>
              </span>
              <ChevronDown className="size-4 text-slate-400" />
            </button>
            {profileOpen && (
              <div className="absolute right-0 top-14 z-50 w-72 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
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
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
