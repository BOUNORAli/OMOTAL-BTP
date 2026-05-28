"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DataTable, type DataTableColumn } from "@/components/common/data-table";
import { PageHeader } from "@/components/common/page-header";
import { LoadingState } from "@/components/common/state-blocks";
import { AmountDisplay } from "@/components/domain/amount-display";
import { KpiCard } from "@/components/domain/kpi-card";
import { StatusBadge } from "@/components/domain/status-badge";
import { useTransactions } from "@/hooks/use-app-data";
import { calculateCashSummary } from "@/lib/domain/calculations";
import type { CaisseTransaction } from "@/lib/domain/types";
import { formatDate } from "@/lib/format";

export default function CaissePage() {
  const { data = [], isLoading } = useTransactions();
  const summary = calculateCashSummary(data);

  const columns: DataTableColumn<CaisseTransaction>[] = [
    { header: "Date", cell: (row) => formatDate(row.date) },
    { header: "Type", cell: (row) => row.type },
    { header: "Categorie", cell: (row) => row.category },
    { header: "Description", cell: (row) => <span className="font-semibold">{row.description}</span> },
    { header: "Mode", cell: (row) => row.paymentMode },
    { header: "Debit", align: "right", cell: (row) => row.type === "debit" ? <AmountDisplay amount={row.amount} type="debit" /> : "-" },
    { header: "Credit", align: "right", cell: (row) => row.type === "credit" ? <AmountDisplay amount={row.amount} type="credit" /> : "-" },
    { header: "Statut", cell: (row) => <StatusBadge status={row.status} /> },
  ];

  return (
    <>
      <PageHeader
        actions={<Button><Plus className="size-4" /> Ajouter transaction</Button>}
        description="Transactions, filtres, justificatifs, statuts et validation des depenses elevees."
        eyebrow="Finance"
        title="Caisse"
      />

      <section className="mb-6 grid gap-4 md:grid-cols-3">
        <KpiCard label="Credits valides" tone="success" value={<AmountDisplay amount={summary.credit} type="credit" />} />
        <KpiCard label="Debits valides" tone="danger" value={<AmountDisplay amount={summary.debit} type="debit" />} />
        <KpiCard label="Solde courant" value={<AmountDisplay amount={summary.balance} />} />
      </section>

      <Card className="mb-4 grid gap-3 p-4 md:grid-cols-5">
        {["Chantier", "Periode", "Type", "Categorie", "Recherche"].map((filter) => (
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-500" key={filter}>
            {filter}
          </div>
        ))}
      </Card>

      {isLoading ? <LoadingState /> : <DataTable columns={columns} rows={data} />}
    </>
  );
}
