"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AlertTriangle,
  BarChart3,
  BriefcaseBusiness,
  Building2,
  ClipboardCheck,
  FileSpreadsheet,
  FileText,
  Fuel,
  Hammer,
  HardHat,
  Package,
  Settings,
  Truck,
  Users,
  WalletCards,
  Wrench,
} from "lucide-react";
import { StatusPill } from "@/components/erp/status-pill";
import { roleLabels } from "@/lib/domain/labels";
import { can } from "@/lib/domain/permissions";
import type { Role } from "@/lib/domain/types";
import type { NavGroup, NavItem } from "@/lib/ui/types";
import { useAppStore } from "@/stores/app-store";
import { cn } from "@/utils/cn";

export type AppNavItem = NavItem;

export const appNavGroups: NavGroup[] = [
  {
    label: "Pilotage",
    items: [
      { href: "/app/dashboard", icon: BarChart3, label: "Cockpit global", permission: "dashboard.chantier.read" },
      { href: "/app/chantiers", icon: Building2, label: "Chantiers", permission: "chantier.read" },
      { href: "/app/alertes", icon: AlertTriangle, label: "Alertes", permission: "alertes.read" },
    ],
  },
  {
    label: "Operations",
    items: [
      { href: "/app/production", icon: HardHat, label: "Production", permission: "production.read" },
      { href: "/app/gasoil", icon: Fuel, label: "Gasoil", permission: "gasoil.read" },
      { href: "/app/engins", icon: Truck, label: "Engins", permission: "engins.read" },
      { href: "/app/personnel", icon: Users, label: "Personnel", permission: "personnel.read" },
    ],
  },
  {
    label: "Finance",
    items: [
      { href: "/app/caisse", icon: WalletCards, label: "Caisse", permission: "caisse.read" },
      { href: "/app/matieres", icon: Package, label: "Matieres / Fournisseurs", permission: "fournisseurs.read" },
      { href: "/app/etp", icon: BriefcaseBusiness, label: "ETP", permission: "fournisseurs.read" },
      { href: "/app/transport", icon: BriefcaseBusiness, label: "Transport", permission: "fournisseurs.read" },
      { href: "/app/entretien", icon: Wrench, label: "Entretien", permission: "engins.read" },
    ],
  },
  {
    label: "Controle",
    items: [
      { href: "/app/validations", icon: ClipboardCheck, label: "Validations", permission: "validations.read" },
      { href: "/app/imports", icon: FileSpreadsheet, label: "Imports Excel", permission: "rapports.export" },
      { href: "/app/rapports", icon: FileText, label: "Rapports", permission: "rapports.export" },
      { href: "/app/bq", icon: Hammer, label: "BQ / Rentabilite", permission: "rentabilite.read" },
    ],
  },
  {
    label: "Administration",
    items: [{ href: "/app/admin", icon: Settings, label: "Utilisateurs & parametres", permission: "admin.users.manage" }],
  },
];

export const appNavItems: AppNavItem[] = appNavGroups.flatMap((group) => group.items);

export function Sidebar() {
  const pathname = usePathname();
  const currentUser = useAppStore((state) => state.currentUser);
  const visibleGroups = appNavGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => can(currentUser.role as Role, item.permission)),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <aside className="hidden h-screen w-72 shrink-0 border-r border-slate-200 bg-white lg:sticky lg:top-0 lg:flex lg:flex-col">
      <div className="border-b border-slate-200 p-4">
        <Link className="flex items-center gap-3" href="/app/dashboard">
          <span className="flex size-10 items-center justify-center rounded-lg bg-[#12355b] text-sm font-black text-white">
            OT
          </span>
          <div className="min-w-0">
            <strong className="block truncate text-sm font-black text-slate-950">OMOTAL TRAVAUX</strong>
            <span className="block truncate text-xs font-bold text-slate-500">ERP multi-chantiers</span>
          </div>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-3">
        {visibleGroups.map((group) => (
          <section className="mb-4" key={group.label}>
            <p className="mb-1 px-2 text-[11px] font-black uppercase text-slate-400">{group.label}</p>
            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    className={cn(
                      "flex h-9 items-center gap-2 rounded-lg px-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950",
                      active && "bg-[#12355b] text-white hover:bg-[#12355b] hover:text-white",
                    )}
                    href={item.href}
                    key={item.href}
                  >
                    <Icon className="size-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </section>
        ))}
      </nav>

      <div className="border-t border-slate-200 p-4">
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className="text-xs font-black uppercase text-slate-400">Session</span>
          <StatusPill tone="success">Actif</StatusPill>
        </div>
        <strong className="block truncate text-sm text-slate-950">{currentUser.name}</strong>
        <span className="text-xs font-semibold text-slate-500">{roleLabels[currentUser.role]}</span>
      </div>
    </aside>
  );
}
