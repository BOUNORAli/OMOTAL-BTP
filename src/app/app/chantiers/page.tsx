"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DataTable, type DataTableColumn } from "@/components/common/data-table";
import { PageHeader } from "@/components/common/page-header";
import { LoadingState } from "@/components/common/state-blocks";
import { Badge } from "@/components/ui/badge";
import { ChantierForm } from "@/features/operations/forms";
import { useChantiers } from "@/hooks/use-app-data";
import { formatDate, formatMoney } from "@/lib/format";
import type { Chantier } from "@/lib/domain/types";

export default function ChantiersPage() {
  const { data = [], isLoading } = useChantiers();

  const columns: DataTableColumn<Chantier>[] = [
    { header: "Nom", cell: (row) => <Link className="font-bold text-[#12355b]" href={`/app/chantiers/${row.id}`}>{row.name}</Link> },
    { header: "Code", cell: (row) => row.code },
    { header: "Maitre d'ouvrage", cell: (row) => row.client },
    { header: "Statut", cell: (row) => <Badge tone={row.status === "en_cours" ? "green" : "orange"}>{row.status}</Badge> },
    { header: "Responsable", cell: (row) => row.managerUserId },
    { header: "Date debut", cell: (row) => formatDate(row.startedAt) },
    { header: "Marche HT", align: "right", cell: (row) => formatMoney(row.marketAmountHt ?? 0) },
    { header: "Actions", cell: (row) => <Button asChild size="sm" variant="secondary"><Link href={`/app/chantiers/${row.id}`}>Voir</Link></Button> },
  ];

  return (
    <>
      <PageHeader
        description="Lister, ouvrir et administrer les chantiers autorises."
        eyebrow="Administration chantier"
        title="Chantiers"
      />
      <ChantierForm />
      {isLoading ? <LoadingState /> : <DataTable columns={columns} rows={data} />}
    </>
  );
}
