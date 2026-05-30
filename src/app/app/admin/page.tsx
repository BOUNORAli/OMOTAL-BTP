"use client";

import { Settings } from "lucide-react";
import { Card } from "@/components/ui/card";
import { DataTable, type DataTableColumn } from "@/components/common/data-table";
import { PageHeader } from "@/components/common/page-header";
import { LoadingState } from "@/components/common/state-blocks";
import { Badge } from "@/components/ui/badge";
import { UserForm } from "@/features/operations/forms";
import { useUsers } from "@/hooks/use-app-data";
import type { User } from "@/lib/domain/types";

export default function AdminPage() {
  const { data = [], isLoading } = useUsers();

  const columns: DataTableColumn<User>[] = [
    { header: "Nom", cell: (row) => <strong>{row.name}</strong> },
    { header: "Email", cell: (row) => row.email },
    { header: "Role", cell: (row) => row.role },
    { header: "Chantiers", cell: (row) => row.chantierIds.length ? row.chantierIds.join(", ") : "Tous / aucun" },
    { header: "Statut", cell: (row) => <Badge tone={row.active ? "green" : "red"}>{row.active ? "Actif" : "Inactif"}</Badge> },
  ];

  return (
    <>
      <PageHeader
        description="Utilisateurs, roles, permissions, seuils alertes, imports Excel et logs."
        eyebrow="Parametres"
        title="Administration"
      />

      <section className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {["Utilisateurs", "Roles et permissions", "Referentiels globaux"].map((item) => (
          <Card className="flex items-center gap-3 p-5" key={item}>
            <span className="rounded-xl bg-slate-100 p-2 text-slate-600">
              <Settings className="size-5" />
            </span>
            <strong>{item}</strong>
          </Card>
        ))}
      </section>

      <UserForm />

      <section className="mt-6">
        {isLoading ? <LoadingState /> : <DataTable columns={columns} rows={data} />}
      </section>
    </>
  );
}
