"use client";

import { BriefcaseBusiness } from "lucide-react";
import { Card } from "@/components/ui/card";
import { DataTable, type DataTableColumn } from "@/components/common/data-table";
import { PageHeader } from "@/components/common/page-header";
import { LoadingState } from "@/components/common/state-blocks";
import { Badge } from "@/components/ui/badge";
import { useEtpOverview } from "@/hooks/use-app-data";
import type { EtpImputation, EtpPrestation } from "@/lib/domain/types";
import { formatDate, formatMoney, formatNumber } from "@/lib/format";
import { useAppStore } from "@/stores/app-store";

export default function EtpPage() {
  const chantierId = useAppStore((state) => state.selectedChantierId);
  const { data, isLoading } = useEtpOverview(chantierId);
  const prestations = data?.prestations ?? [];
  const imputations = data?.imputations ?? [];

  const prestationColumns: DataTableColumn<EtpPrestation>[] = [
    { header: "Date", cell: (row) => formatDate(row.date) },
    { header: "Designation", cell: (row) => <strong>{row.designation}</strong> },
    { header: "Quantite", align: "right", cell: (row) => formatNumber(row.quantity) },
    { header: "Total TTC", align: "right", cell: (row) => formatMoney(row.amountTtc) },
    { header: "Statut", cell: (row) => <Badge tone={row.status === "valide" ? "green" : "orange"}>{row.status}</Badge> },
  ];

  const imputationColumns: DataTableColumn<EtpImputation>[] = [
    { header: "Date", cell: (row) => formatDate(row.date) },
    { header: "Type", cell: (row) => <strong>{row.imputationType}</strong> },
    { header: "Montant", align: "right", cell: (row) => formatMoney(row.amount) },
    { header: "Note", cell: (row) => row.note ?? "-" },
    { header: "Statut", cell: (row) => <Badge tone={row.status === "valide" ? "green" : "orange"}>{row.status}</Badge> },
  ];

  return (
    <>
      <PageHeader
        description="Prestations sous-traitants, imputations OMOTAL, avances, gasoil et matieres fournies."
        eyebrow="Sous-traitance"
        title="ETP / Sous-traitance"
      />
      <section className="mb-6 grid gap-4 md:grid-cols-3">
        <Card className="flex items-center gap-3 p-4 text-sm text-slate-600">
          <span className="rounded-xl bg-orange-50 p-2 text-orange-600">
            <BriefcaseBusiness className="size-5" />
          </span>
          Prestations : <strong className="text-slate-950">{formatMoney(data?.totalPrestations ?? 0)}</strong>
        </Card>
        <Card className="p-4 text-sm text-slate-600">
          Impute : <strong className="text-slate-950">{formatMoney(data?.totalImputations ?? 0)}</strong>
        </Card>
        <Card className="p-4 text-sm text-slate-600">
          Reste : <strong className="text-slate-950">{formatMoney(data?.remainingAmount ?? 0)}</strong>
        </Card>
      </section>
      <section className="grid gap-6 xl:grid-cols-2">
        <Card className="p-4">
          <h2 className="mb-3 text-sm font-black text-slate-950">Prestations</h2>
          {isLoading ? <LoadingState /> : <DataTable columns={prestationColumns} rows={prestations} />}
        </Card>
        <Card className="p-4">
          <h2 className="mb-3 text-sm font-black text-slate-950">Imputations</h2>
          {isLoading ? <LoadingState /> : <DataTable columns={imputationColumns} rows={imputations} />}
        </Card>
      </section>
    </>
  );
}
