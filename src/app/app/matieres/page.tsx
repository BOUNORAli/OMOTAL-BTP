"use client";

import { Package } from "lucide-react";
import { Card } from "@/components/ui/card";
import { DataTable, type DataTableColumn } from "@/components/common/data-table";
import { PageHeader } from "@/components/common/page-header";
import { LoadingState } from "@/components/common/state-blocks";
import { Badge } from "@/components/ui/badge";
import { FournisseurForm } from "@/features/operations/forms";
import { useFournisseurs } from "@/hooks/use-app-data";
import type { Supplier } from "@/lib/domain/types";

export default function MatieresPage() {
  const { data = [], isLoading } = useFournisseurs();

  const columns: DataTableColumn<Supplier>[] = [
    { header: "Nom", cell: (row) => <strong>{row.name}</strong> },
    { header: "Type", cell: (row) => row.type },
    { header: "Telephone", cell: (row) => row.phone ?? "-" },
    { header: "Statut", cell: (row) => <Badge tone={row.active ? "green" : "red"}>{row.active ? "Actif" : "Inactif"}</Badge> },
  ];

  return (
    <>
      <PageHeader
        description="Fournisseurs operationnels pour gasoil, matieres, transport, entretien, sous-traitance et location."
        eyebrow="Referentiel"
        title="Matieres & Fournisseurs"
      />

      <Card className="mb-6 flex items-center gap-3 p-4 text-sm text-slate-600">
        <span className="rounded-xl bg-orange-50 p-2 text-orange-600">
          <Package className="size-5" />
        </span>
        Les achats matieres complets restent prevus en phase suivante, mais le referentiel fournisseur est deja reel.
      </Card>

      <FournisseurForm />

      {isLoading ? <LoadingState /> : <DataTable columns={columns} rows={data} />}
    </>
  );
}
