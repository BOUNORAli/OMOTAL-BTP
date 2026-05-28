import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useChantier } from "@/contexts/ChantierContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard, Building2, Wallet, Fuel, Users, Truck,
  CheckSquare, BellRing, FileSpreadsheet, Settings, LogOut,
  Hammer, ChevronDown, Search, Menu, X, Package, ListChecks,
} from "lucide-react";
import { ROLES, ROLE_BADGES, can, canAny } from "@/lib/permissions";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard, perm: ["dashboard.global", "dashboard.chantier"] },
  { to: "/chantiers", label: "Chantiers", icon: Building2, perm: ["chantier.read"] },
  { to: "/caisse", label: "Caisse", icon: Wallet, perm: ["caisse.read"] },
  { to: "/gasoil", label: "Gasoil", icon: Fuel, perm: ["gasoil.read"] },
  { to: "/personnel", label: "Personnel", icon: Users, perm: ["personnel.read"] },
  { to: "/engins", label: "Engins", icon: Truck, perm: ["engins.read"] },
  { to: "/production", label: "Production", icon: Hammer, perm: ["production.read", "production.create", "*"] },
  { to: "/matieres", label: "Matières & Fournisseurs", icon: Package, perm: ["fournisseurs.read", "*"] },
  { to: "/bq", label: "BQ & Rentabilité", icon: ListChecks, perm: ["rentabilite.read", "*"] },
  { to: "/validations", label: "Validations", icon: CheckSquare, perm: ["validations.operational", "validations.high", "*"] },
  { to: "/alertes", label: "Alertes", icon: BellRing, perm: ["alertes.read"] },
  { to: "/excel", label: "Import / Export", icon: FileSpreadsheet, perm: ["reports.export"] },
  { to: "/admin", label: "Administration", icon: Settings, perm: ["*"] },
];

export default function Sidebar({ onItemClick }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const visibleItems = NAV_ITEMS.filter((it) => canAny(user, it.perm));

  return (
    <aside className="flex flex-col h-full w-64 bg-white border-r border-slate-200" data-testid="sidebar">
      <div className="p-4 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-lg omotal-grad flex items-center justify-center">
            <Hammer className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="font-bold text-sm leading-tight">OMOTAL</div>
            <div className="text-[11px] text-muted-foreground leading-tight">Gestion Chantiers</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {visibleItems.map((it) => {
          const Icon = it.icon;
          return (
            <NavLink
              key={it.to}
              to={it.to}
              onClick={onItemClick}
              data-testid={`nav-${it.to.slice(1)}`}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-slate-600 hover:bg-slate-100"
                }`
              }
            >
              <Icon className="h-4 w-4" />
              {it.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-3 border-t border-slate-200">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-slate-100 transition"
                    data-testid="user-menu">
              <div className="h-9 w-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-sm">
                {user?.name?.split(" ").map((s) => s[0]).slice(0, 2).join("")}
              </div>
              <div className="flex-1 text-left min-w-0">
                <div className="text-sm font-medium truncate">{user?.name}</div>
                <div className="text-[11px] text-muted-foreground truncate">{user?.email}</div>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <Badge variant="outline" className={ROLE_BADGES[user?.role] || ""}>
                {ROLES[user?.role] || user?.role}
              </Badge>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => { logout(); navigate("/login"); }} data-testid="logout-btn">
              <LogOut className="h-4 w-4 mr-2" /> Déconnexion
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}

export function ChantierSelector() {
  const { chantiers, selectedId, selectChantier } = useChantier();
  if (!chantiers || chantiers.length === 0) {
    return <div className="text-sm text-muted-foreground">Aucun chantier</div>;
  }
  return (
    <Select value={selectedId || ""} onValueChange={(v) => selectChantier(v === "all" ? null : v)}>
      <SelectTrigger className="w-[180px] lg:w-[260px]" data-testid="chantier-selector">
        <Building2 className="h-4 w-4 mr-2 flex-shrink-0" />
        <SelectValue placeholder="Choisir un chantier" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Tous les chantiers</SelectItem>
        {chantiers.map((c) => (
          <SelectItem key={c.id} value={c.id}>
            {c.name} · <span className="text-muted-foreground text-xs">{c.code}</span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function MobileSidebarTrigger() {
  const [open, setOpen] = React.useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="lg:hidden" data-testid="mobile-menu-trigger">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 w-64">
        <Sidebar onItemClick={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  );
}
