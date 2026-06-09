"use client";

import { useState } from "react";
import { Package, Plus, ReceiptText, WalletCards } from "lucide-react";
import { DataGrid, type DataGridColumn } from "@/components/common/data-grid";
import { PageHeader } from "@/components/common/page-header";
import { DetailDrawer } from "@/components/erp/detail-drawer";
import { MetricStrip } from "@/components/erp/metric-strip";
import { MoneyCell, QuantityCell, WorkflowStatus } from "@/components/erp/cells";
import { StatusPill } from "@/components/erp/status-pill";
import { Button } from "@/components/ui/button";
import { FournisseurForm } from "@/features/operations/forms";
import { useFournisseurs, useMaterialPurchases, useSupplierPayments } from "@/hooks/use-app-data";
import type { MaterialPurchase, Supplier, SupplierPayment } from "@/lib/domain/types";
import { formatDate, formatMoney } from "@/lib/format";
import { useAppStore } from "@/stores/app-store";

type DrawerState = { mode: "create-supplier" } | { mode: "supplier"; row: Supplier } | { mode: "purchase"; row: MaterialPurchase } | { mode: "payment"; row: SupplierPayment } | null;

export default function MatieresPage() {
  const chantierId = useAppStore((state) => state.selectedChantierId);
  const { data = [], isLoading } = useFournisseurs();
  const { data: purchases = [], isLoading: purchasesLoading } = useMaterialPurchases(chantierId);
  const { data: payments = [] } = useSupplierPayments(chantierId);
  const [drawer, setDrawer] = useState<DrawerState>(null);

  const supplierName = (id: string) => data.find((supplier) => supplier.id === id)?.name ?? id;
  const totalPurchases = purchases.reduce((sum, item) => sum + item.totalTtc, 0);
  const totalRemaining = purchases.reduce((sum, item) => sum + item.remainingAmount, 0);
  const totalPaid = payments.reduce((sum, item) => sum + item.amount, 0);

  const columns: DataGridColumn<Supplier>[] = [
    { header: "Nom", cell: (row) => <strong className="text-slate-950">{row.name}</strong>, sortValue: (row) => row.name },
    { header: "Type", cell: (row) => <StatusPill tone="info">{row.type}</StatusPill>, sortValue: (row) => row.type },
    { header: "Telephone", cell: (row) => row.phone ?? "-", sortValue: (row) => row.phone ?? "" },
    { header: "Statut", cell: (row) => <StatusPill tone={row.active ? "success" : "danger"}>{row.active ? "Actif" : "Inactif"}</StatusPill>, sortValue: (row) => String(row.active) },
  ];

  const purchaseColumns: DataGridColumn<MaterialPurchase>[] = [
    { header: "Date", cell: (row) => formatDate(row.date), sortValue: (row) => row.date },
    { header: "Fournisseur", cell: (row) => supplierName(row.supplierId), sortValue: (row) => supplierName(row.supplierId) },
    { header: "Designation", cell: (row) => <strong className="text-slate-950">{row.designation}</strong>, sortValue: (row) => row.designation },
    { header: "Quantite", align: "right", cell: (row) => <QuantityCell value={row.quantity} unit={row.unit} />, sortValue: (row) => row.quantity },
    { header: "Total TTC", align: "right", cell: (row) => <MoneyCell amount={row.totalTtc} />, sortValue: (row) => row.totalTtc },
    { header: "Reste", align: "right", cell: (row) => <MoneyCell amount={row.remainingAmount} type={row.remainingAmount > 0 ? "debit" : undefined} />, sortValue: (row) => row.remainingAmount },
    { header: "Statut", cell: (row) => <WorkflowStatus status={row.status} />, sortValue: (row) => row.status },
  ];

  const paymentColumns: DataGridColumn<SupplierPayment>[] = [
    { header: "Date", cell: (row) => formatDate(row.date), sortValue: (row) => row.date },
    { header: "Fournisseur", cell: (row) => supplierName(row.supplierId), sortValue: (row) => supplierName(row.supplierId) },
    { header: "Montant", align: "right", cell: (row) => <MoneyCell amount={row.amount} type="credit" />, sortValue: (row) => row.amount },
    { header: "Mode", cell: (row) => row.paymentMode, sortValue: (row) => row.paymentMode },
    { header: "Statut", cell: (row) => <WorkflowStatus status={row.status} />, sortValue: (row) => row.status },
  ];

  return (
    <>
      <PageHeader
        actions={
          <Button onClick={() => setDrawer({ mode: "create-supplier" })} size="sm" type="button">
            <Plus className="size-4" />
            Fournisseur
          </Button>
        }
        description="Achats matieres, fournisseurs, paiements, reste a payer et documents."
        eyebrow="Finance"
        title="Matieres & Fournisseurs"
      />

      <MetricStrip
        items={[
          { icon: Package, label: "Achats TTC", value: formatMoney(totalPurchases), tone: "warning" },
          { icon: WalletCards, label: "Reste fournisseur", value: formatMoney(totalRemaining), tone: totalRemaining > 0 ? "danger" : "success" },
          { icon: ReceiptText, label: "Paiements", value: formatMoney(totalPaid), tone: "success" },
        ]}
      />

      <section className="mt-4 grid gap-4 xl:grid-cols-2">
        <DataGrid columns={purchaseColumns} isLoading={purchasesLoading} onRowClick={(row) => setDrawer({ mode: "purchase", row })} rows={purchases} title="Achats matieres" />
        <DataGrid columns={paymentColumns} onRowClick={(row) => setDrawer({ mode: "payment", row })} rows={payments} title="Paiements fournisseurs" />
      </section>

      <section className="mt-4">
        <DataGrid columns={columns} isLoading={isLoading} onRowClick={(row) => setDrawer({ mode: "supplier", row })} rows={data} title="Referentiel fournisseurs" />
      </section>

      <DetailDrawer onOpenChange={(open) => !open && setDrawer(null)} open={drawer?.mode === "create-supplier"} title="Nouveau fournisseur" width="lg">
        <FournisseurForm />
      </DetailDrawer>
      <DetailDrawer
        onOpenChange={(open) => !open && setDrawer(null)}
        open={drawer?.mode === "supplier" || drawer?.mode === "purchase" || drawer?.mode === "payment"}
        title={
          drawer?.mode === "supplier"
            ? drawer.row.name
            : drawer?.mode === "purchase"
              ? drawer.row.designation
              : drawer?.mode === "payment"
                ? "Paiement fournisseur"
                : "Detail"
        }
      >
        {drawer?.mode === "supplier" ? (
          <div className="space-y-4">
            <StatusPill tone="info">{drawer.row.type}</StatusPill>
            <p className="text-sm font-semibold text-slate-600">{drawer.row.phone ?? "Telephone non renseigne"}</p>
          </div>
        ) : null}
        {drawer?.mode === "purchase" ? (
          <MetricStrip items={[{ label: "Total TTC", value: formatMoney(drawer.row.totalTtc), tone: "warning" }, { label: "Reste", value: formatMoney(drawer.row.remainingAmount), tone: drawer.row.remainingAmount > 0 ? "danger" : "success" }]} />
        ) : null}
        {drawer?.mode === "payment" ? (
          <MetricStrip items={[{ label: "Montant", value: formatMoney(drawer.row.amount), tone: "success" }, { label: "Mode", value: drawer.row.paymentMode }]} />
        ) : null}
      </DetailDrawer>
    </>
  );
}
