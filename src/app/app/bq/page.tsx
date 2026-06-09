"use client";

import { TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { DataTable, type DataTableColumn } from "@/components/common/data-table";
import { PageHeader } from "@/components/common/page-header";
import { LoadingState } from "@/components/common/state-blocks";
import { Badge } from "@/components/ui/badge";
import { useBqOverview } from "@/hooks/use-app-data";
import type { BqArticle, BqRealisation } from "@/lib/domain/types";
import { formatDate, formatMoney, formatNumber } from "@/lib/format";
import { useAppStore } from "@/stores/app-store";

export default function BqPage() {
  const chantierId = useAppStore((state) => state.selectedChantierId);
  const { data, isLoading } = useBqOverview(chantierId);
  const articles = data?.articles ?? [];
  const realisations = data?.realisations ?? [];
  const realisedAmount = articles.reduce((sum, item) => sum + item.realisedAmountHt, 0);
  const margin = articles.reduce((sum, item) => sum + item.realMargin, 0);

  const articleColumns: DataTableColumn<BqArticle>[] = [
    { header: "Article", cell: (row) => <strong>{row.articleNumber}</strong> },
    { header: "Designation", cell: (row) => row.designation },
    { header: "Qte marche", align: "right", cell: (row) => formatNumber(row.marketQuantity, row.unit) },
    { header: "Qte realisee", align: "right", cell: (row) => formatNumber(row.realisedQuantity, row.unit) },
    { header: "Avancement", align: "right", cell: (row) => `${row.progressRate.toFixed(1)} %` },
    { header: "Montant realise", align: "right", cell: (row) => formatMoney(row.realisedAmountHt) },
    { header: "Marge", align: "right", cell: (row) => <span className={row.realMargin < 0 ? "text-red-600" : "text-emerald-700"}>{formatMoney(row.realMargin)}</span> },
  ];

  const realisationColumns: DataTableColumn<BqRealisation>[] = [
    { header: "Date", cell: (row) => formatDate(row.date) },
    { header: "Article", cell: (row) => row.bqArticleId.slice(0, 8) },
    { header: "Source", cell: (row) => row.source },
    { header: "Quantite", align: "right", cell: (row) => formatNumber(row.quantity) },
    { header: "Statut", cell: (row) => <Badge tone={row.status === "valide" ? "green" : "orange"}>{row.status}</Badge> },
  ];

  return (
    <>
      <PageHeader
        description="Module protege pour BQ, prix de revient, cout reel et marge."
        eyebrow="Rentabilite"
        title="BQ & Rentabilite"
      />
      <section className="mb-6 grid gap-4 md:grid-cols-2">
        <Card className="flex items-center gap-3 p-4 text-sm text-slate-600">
          <span className="rounded-lg bg-orange-50 p-2 text-orange-600">
            <TrendingUp className="size-5" />
          </span>
          Montant realise : <strong className="text-slate-950">{formatMoney(realisedAmount)}</strong>
        </Card>
        <Card className="p-4 text-sm text-slate-600">
          Marge estimee : <strong className={margin < 0 ? "text-red-600" : "text-emerald-700"}>{formatMoney(margin)}</strong>
        </Card>
      </section>
      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="p-4">
          <h2 className="mb-3 text-sm font-black text-slate-950">Articles BQ</h2>
          {isLoading ? <LoadingState /> : <DataTable columns={articleColumns} rows={articles} />}
        </Card>
        <Card className="p-4">
          <h2 className="mb-3 text-sm font-black text-slate-950">Realise</h2>
          {isLoading ? <LoadingState /> : <DataTable columns={realisationColumns} rows={realisations} />}
        </Card>
      </section>
    </>
  );
}
