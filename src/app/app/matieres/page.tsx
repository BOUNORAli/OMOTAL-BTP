"use client";

import { Package } from "lucide-react";
import { Card } from "@/components/ui/card";
import { DataTable, type DataTableColumn } from "@/components/common/data-table";
import { PageHeader } from "@/components/common/page-header";
import { LoadingState } from "@/components/common/state-blocks";
import { Badge } from "@/components/ui/badge";
import { FournisseurForm } from "@/features/operations/forms";
import { useFournisseurs, useMaterialPurchases, useSupplierPayments } from "@/hooks/use-app-data";
import type { MaterialPurchase, Supplier, SupplierPayment } from "@/lib/domain/types";
import { formatDate, formatMoney, formatNumber } from "@/lib/format";
import { useAppStore } from "@/stores/app-store";

export default function MatieresPage() {
  const chantierId = useAppStore((state) => state.selectedChantierId);
  const { data = [], isLoading } = useFournisseurs();
  const { data: purchases = [], isLoading: purchasesLoading } = useMaterialPurchases(chantierId);
  const { data: payments = [] } = useSupplierPayments(chantierId);

  const columns: DataTableColumn<Supplier>[] = [
    { header: "Nom", cell: (row) => <strong>{row.name}</strong> },
    { header: "Type", cell: (row) => row.type },
    { header: "Telephone", cell: (row) => row.phone ?? "-" },
    { header: "Statut", cell: (row) => <Badge tone={row.active ? "green" : "red"}>{row.active ? "Actif" : "Inactif"}</Badge> },
  ];

  const purchaseColumns: DataTableColumn<MaterialPurchase>[] = [
    { header: "Date", cell: (row) => formatDate(row.date) },
    { header: "Designation", cell: (row) => <strong>{row.designation}</strong> },
    { header: "Quantite", align: "right", cell: (row) => formatNumber(row.quantity, row.unit) },
    { header: "Total TTC", align: "right", cell: (row) => formatMoney(row.totalTtc) },
    { header: "Reste", align: "right", cell: (row) => formatMoney(row.remainingAmount) },
    { header: "Echeance", cell: (row) => row.dueDate ? formatDate(row.dueDate) : "-" },
    { header: "Statut", cell: (row) => <Badge tone={row.status === "valide" ? "green" : "orange"}>{row.status}</Badge> },
  ];

  const paymentColumns: DataTableColumn<SupplierPayment>[] = [
    { header: "Date", cell: (row) => formatDate(row.date) },
    { header: "Montant", align: "right", cell: (row) => formatMoney(row.amount) },
    { header: "Mode", cell: (row) => row.paymentMode },
    { header: "Note", cell: (row) => row.note ?? "-" },
    { header: "Statut", cell: (row) => <Badge tone={row.status === "valide" ? "green" : "orange"}>{row.status}</Badge> },
  ];

  const totalPurchases = purchases.reduce((sum, item) => sum + item.totalTtc, 0);
  const totalRemaining = purchases.reduce((sum, item) => sum + item.remainingAmount, 0);

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
        <span>
          Achats TTC {formatMoney(totalPurchases)} · reste fournisseur {formatMoney(totalRemaining)}.
        </span>
      </Card>

      <FournisseurForm />

      <section className="mt-6 grid gap-6 xl:grid-cols-2">
        <Card className="p-4">
          <h2 className="mb-3 text-sm font-black text-slate-950">Achats matieres</h2>
          {purchasesLoading ? <LoadingState /> : <DataTable columns={purchaseColumns} rows={purchases} />}
        </Card>
        <Card className="p-4">
          <h2 className="mb-3 text-sm font-black text-slate-950">Paiements fournisseurs</h2>
          <DataTable columns={paymentColumns} rows={payments} />
        </Card>
      </section>

      <section className="mt-6">
        <h2 className="mb-3 text-sm font-black text-slate-950">Referentiel fournisseurs</h2>
        {isLoading ? <LoadingState /> : <DataTable columns={columns} rows={data} />}
      </section>
    </>
  );
}
