"use client";

import { Database, Settings, ShieldCheck, Users } from "lucide-react";
import type { ElementType } from "react";
import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { DataTable, type DataTableColumn } from "@/components/common/data-table";
import { PageHeader } from "@/components/common/page-header";
import { LoadingState } from "@/components/common/state-blocks";
import { Badge } from "@/components/ui/badge";
import { UserForm } from "@/features/operations/forms";
import { useChantiers, useEngins, useFournisseurs, useUsers } from "@/hooks/use-app-data";
import { roleLabels } from "@/lib/domain/labels";
import { rolePermissions } from "@/lib/domain/permissions";
import type { Chantier, Equipment, Role, Supplier, User } from "@/lib/domain/types";
import { cn } from "@/utils/cn";

type AdminTab = "users" | "roles" | "referentiels";

const tabs: Array<{ id: AdminTab; label: string; icon: ElementType; description: string }> = [
  { id: "users", label: "Utilisateurs", icon: Users, description: "Comptes, roles et affectations chantier." },
  { id: "roles", label: "Roles et permissions", icon: ShieldCheck, description: "Droits visibles et protections metier." },
  { id: "referentiels", label: "Referentiels globaux", icon: Database, description: "Chantiers, fournisseurs et engins actifs." },
];

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>("users");
  const { data = [], isLoading } = useUsers();
  const { data: chantiers = [], isLoading: chantiersLoading } = useChantiers();
  const { data: fournisseurs = [], isLoading: fournisseursLoading } = useFournisseurs();
  const { data: enginsData, isLoading: enginsLoading } = useEngins();
  const engins = enginsData?.equipment ?? [];

  const chantierNames = useMemo(
    () => new Map(chantiers.map((chantier) => [chantier.id, chantier.name])),
    [chantiers],
  );

  function userChantiersLabel(user: User) {
    if (!user.chantierIds.length) {
      return user.role === "super_admin" || user.role === "directeur" ? "Tous les chantiers" : "Aucun chantier affecte";
    }

    return user.chantierIds
      .map((id) => chantierNames.get(id) ?? `Chantier inconnu (${id.slice(0, 8)})`)
      .join(", ");
  }

  const columns: DataTableColumn<User>[] = [
    { header: "Nom", cell: (row) => <strong>{row.name}</strong> },
    { header: "Email", cell: (row) => row.email },
    { header: "Role", cell: (row) => roleLabels[row.role] },
    { header: "Chantiers", cell: (row) => userChantiersLabel(row) },
    { header: "Statut", cell: (row) => <Badge tone={row.active ? "green" : "red"}>{row.active ? "Actif" : "Inactif"}</Badge> },
  ];

  const roleRows = (Object.keys(rolePermissions) as Role[]).map((role) => ({
    id: role,
    role,
    permissions: rolePermissions[role],
  }));

  const roleColumns: DataTableColumn<{ id: Role; role: Role; permissions: string[] }>[] = [
    { header: "Role", cell: (row) => <strong>{roleLabels[row.role]}</strong> },
    { header: "Nombre de droits", align: "right", cell: (row) => row.permissions.length },
    { header: "Permissions", cell: (row) => row.permissions.slice(0, 8).join(", ") + (row.permissions.length > 8 ? "..." : "") },
  ];

  const chantierColumns: DataTableColumn<Chantier>[] = [
    { header: "Nom", cell: (row) => <strong>{row.name}</strong> },
    { header: "Code", cell: (row) => row.code },
    { header: "Maitre d'ouvrage", cell: (row) => row.client },
    { header: "Statut", cell: (row) => <Badge tone={row.status === "en_cours" ? "green" : "slate"}>{row.status}</Badge> },
  ];

  const fournisseurColumns: DataTableColumn<Supplier>[] = [
    { header: "Nom", cell: (row) => <strong>{row.name}</strong> },
    { header: "Type", cell: (row) => row.type },
    { header: "Telephone", cell: (row) => row.phone ?? "-" },
    { header: "Statut", cell: (row) => <Badge tone={row.active ? "green" : "red"}>{row.active ? "Actif" : "Inactif"}</Badge> },
  ];

  const enginColumns: DataTableColumn<Equipment>[] = [
    { header: "Designation", cell: (row) => <strong>{row.designation}</strong> },
    { header: "Type", cell: (row) => row.type },
    { header: "Chantier", cell: (row) => chantierNames.get(row.chantierId) ?? `Chantier inconnu (${row.chantierId.slice(0, 8)})` },
    { header: "Statut", cell: (row) => <Badge tone={row.status === "mobilise" ? "green" : "orange"}>{row.status}</Badge> },
  ];

  return (
    <>
      <PageHeader
        description="Utilisateurs, roles, permissions, seuils alertes, imports Excel et logs."
        eyebrow="Parametres"
        title="Administration"
      />

      <section className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {tabs.map((item) => {
          const Icon = item.icon;
          return (
            <button
              className={cn(
                "flex min-h-24 items-center gap-3 rounded-lg border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-orange-200 hover:bg-orange-50/40",
                activeTab === item.id && "border-orange-200 bg-orange-50 text-orange-700",
              )}
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              type="button"
            >
              <span className={cn("rounded-lg bg-slate-100 p-2 text-slate-600", activeTab === item.id && "bg-white text-orange-700")}>
                <Icon className="size-5" />
              </span>
              <span>
                <strong className="block text-slate-950">{item.label}</strong>
                <span className="text-xs font-semibold text-slate-500">{item.description}</span>
              </span>
            </button>
          );
        })}
      </section>

      {activeTab === "users" && (
        <>
          <UserForm />

          <section className="mt-6">
            {isLoading || chantiersLoading ? <LoadingState /> : <DataTable columns={columns} rows={data} />}
          </section>
        </>
      )}

      {activeTab === "roles" && (
        <section className="grid gap-6">
          <Card className="flex items-center gap-3 p-4 text-sm text-slate-600">
            <span className="rounded-lg bg-blue-50 p-2 text-blue-700">
              <Settings className="size-5" />
            </span>
            Les permissions frontend masquent les ecrans, et les endpoints backend restent la source de verite securite.
          </Card>
          <DataTable columns={roleColumns} rows={roleRows} />
        </section>
      )}

      {activeTab === "referentiels" && (
        <section className="grid gap-6">
          <div>
            <h2 className="mb-3 text-sm font-black text-slate-950">Chantiers</h2>
            {chantiersLoading ? <LoadingState /> : <DataTable columns={chantierColumns} rows={chantiers} />}
          </div>
          <div>
            <h2 className="mb-3 text-sm font-black text-slate-950">Fournisseurs</h2>
            {fournisseursLoading ? <LoadingState /> : <DataTable columns={fournisseurColumns} rows={fournisseurs} />}
          </div>
          <div>
            <h2 className="mb-3 text-sm font-black text-slate-950">Engins</h2>
            {enginsLoading ? <LoadingState /> : <DataTable columns={enginColumns} rows={engins} />}
          </div>
        </section>
      )}
    </>
  );
}
