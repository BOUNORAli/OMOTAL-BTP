"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AlertTriangle,
  BarChart3,
  BriefcaseBusiness,
  Building2,
  ClipboardCheck,
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
import { can, type Permission } from "@/lib/domain/permissions";
import { roleLabels } from "@/lib/domain/labels";
import type { Role } from "@/lib/domain/types";
import { useAppStore } from "@/stores/app-store";
import { cn } from "@/utils/cn";

export type AppNavItem = {
  href: string;
  icon: React.ElementType;
  label: string;
  permission: Permission;
};

export const appNavItems: AppNavItem[] = [
  { href: "/app/dashboard", icon: BarChart3, label: "Tableau de bord", permission: "dashboard.chantier.read" },
  { href: "/app/chantiers", icon: Building2, label: "Chantiers", permission: "chantier.read" },
  { href: "/app/caisse", icon: WalletCards, label: "Caisse", permission: "caisse.read" },
  { href: "/app/gasoil", icon: Fuel, label: "Gasoil", permission: "gasoil.read" },
  { href: "/app/personnel", icon: Users, label: "Personnel", permission: "personnel.read" },
  { href: "/app/engins", icon: Truck, label: "Engins", permission: "engins.read" },
  { href: "/app/production", icon: HardHat, label: "Production", permission: "production.read" },
  { href: "/app/matieres", icon: Package, label: "Matieres", permission: "fournisseurs.read" },
  { href: "/app/etp", icon: BriefcaseBusiness, label: "ETP / Sous-traitance", permission: "fournisseurs.read" },
  { href: "/app/transport", icon: BriefcaseBusiness, label: "Transport", permission: "fournisseurs.read" },
  { href: "/app/entretien", icon: Wrench, label: "Entretien", permission: "engins.read" },
  { href: "/app/bq", icon: Hammer, label: "BQ & Rentabilite", permission: "rentabilite.read" },
  { href: "/app/validations", icon: ClipboardCheck, label: "Validations", permission: "validations.read" },
  { href: "/app/alertes", icon: AlertTriangle, label: "Alertes", permission: "alertes.read" },
  { href: "/app/rapports", icon: FileText, label: "Rapports", permission: "rapports.export" },
  { href: "/app/admin", icon: Settings, label: "Administration", permission: "admin.users.manage" },
];

export function Sidebar() {
  const pathname = usePathname();
  const currentUser = useAppStore((state) => state.currentUser);

  const visibleItems = appNavItems.filter((item) => can(currentUser.role as Role, item.permission));

  return (
    <aside className="hidden h-screen w-72 shrink-0 border-r border-slate-200 bg-white lg:sticky lg:top-0 lg:flex lg:flex-col">
      <div className="border-b border-slate-100 p-5">
        <Link className="flex items-center gap-3" href="/app/dashboard">
          <span className="flex size-11 items-center justify-center rounded-2xl bg-[#12355b] text-sm font-black text-white">
            OT
          </span>
          <div>
            <strong className="block text-sm font-black tracking-tight text-slate-950">OMOTAL TRAVAUX</strong>
            <span className="text-xs font-semibold text-slate-500">Gestion chantiers</span>
          </div>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950",
                active && "bg-orange-50 text-orange-700",
              )}
              href={item.href}
              key={item.href}
            >
              <Icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-100 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Role actuel</p>
        <strong className="mt-1 block text-sm text-slate-950">{roleLabels[currentUser.role]}</strong>
        <span className="text-xs text-slate-500">{currentUser.name}</span>
      </div>
    </aside>
  );
}
