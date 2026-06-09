"use client";

import { useMemo, useState } from "react";
import { CreditCard, Plus, TrendingDown, TrendingUp, WalletCards } from "lucide-react";
import { DataGrid, type DataGridColumn } from "@/components/common/data-grid";
import { PageHeader } from "@/components/common/page-header";
import { LoadingState } from "@/components/common/state-blocks";
import { DetailDrawer } from "@/components/erp/detail-drawer";
import { MetricStrip } from "@/components/erp/metric-strip";
import { PageToolbar, ToolbarSelect } from "@/components/erp/page-toolbar";
import { MoneyCell, WorkflowStatus } from "@/components/erp/cells";
import { StatusPill } from "@/components/erp/status-pill";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TransactionForm } from "@/features/operations/forms";
import { useChantiers, useTransactions } from "@/hooks/use-app-data";
import { calculateCashSummary } from "@/lib/domain/calculations";
import { can } from "@/lib/domain/permissions";
import type { CaisseTransaction, TransactionCategory, TransactionType } from "@/lib/domain/types";
import { formatDate, formatMoney } from "@/lib/format";
import { useAppStore } from "@/stores/app-store";

const categoryOptions = [
  "personnel",
  "gasoil",
  "matieres",
  "location_engins",
  "entretien",
  "transport",
  "etp",
  "frais_generaux",
  "financement",
  "divers",
].map((value) => ({ label: value, value }));

export default function CaissePage() {
  const currentUser = useAppStore((state) => state.currentUser);
  const { data = [], isLoading } = useTransactions();
  const { data: chantiers = [] } = useChantiers();
  const [chantierFilter, setChantierFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState<"all" | TransactionType>("all");
  const [categoryFilter, setCategoryFilter] = useState<"all" | TransactionCategory>("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [selected, setSelected] = useState<CaisseTransaction | null>(null);

  const chantierNames = useMemo(() => new Map(chantiers.map((chantier) => [chantier.id, chantier.name])), [chantiers]);

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase();
    return data.filter((transaction) => {
      const matchesChantier = chantierFilter === "all" || transaction.chantierId === chantierFilter;
      const matchesType = typeFilter === "all" || transaction.type === typeFilter;
      const matchesCategory = categoryFilter === "all" || transaction.category === categoryFilter;
      const matchesFrom = !from || transaction.date >= from;
      const matchesTo = !to || transaction.date <= to;
      const matchesSearch = !query || [
        transaction.description,
        transaction.personOrSupplier ?? "",
        transaction.paymentMode,
        transaction.category,
        transaction.amount,
        chantierNames.get(transaction.chantierId) ?? "",
      ].join(" ").toLowerCase().includes(query);
      return matchesChantier && matchesType && matchesCategory && matchesFrom && matchesTo && matchesSearch;
    });
  }, [categoryFilter, chantierFilter, chantierNames, data, from, search, to, typeFilter]);

  const summary = calculateCashSummary(filteredRows);
  const canCreate = can(currentUser.role, "caisse.create");

  const columns: DataGridColumn<CaisseTransaction>[] = [
    { header: "Date", cell: (row) => formatDate(row.date), sortValue: (row) => row.date, width: "110px" },
    { header: "Chantier", cell: (row) => chantierNames.get(row.chantierId) ?? "Chantier non charge", sortValue: (row) => chantierNames.get(row.chantierId) ?? "" },
    { header: "Categorie", cell: (row) => <StatusPill tone="info">{row.category}</StatusPill>, sortValue: (row) => row.category },
    {
      header: "Operation",
      cell: (row) => (
        <span>
          <strong className="block text-slate-950">{row.description}</strong>
          <span className="text-xs text-slate-500">{row.personOrSupplier ?? row.paymentMode}</span>
        </span>
      ),
      sortValue: (row) => row.description,
      width: "28%",
    },
    { header: "Mode", cell: (row) => row.paymentMode, sortValue: (row) => row.paymentMode },
    { header: "Debit", align: "right", cell: (row) => row.type === "debit" ? <MoneyCell amount={row.amount} type="debit" /> : <span className="text-slate-400">-</span>, sortValue: (row) => row.type === "debit" ? row.amount : 0 },
    { header: "Credit", align: "right", cell: (row) => row.type === "credit" ? <MoneyCell amount={row.amount} type="credit" /> : <span className="text-slate-400">-</span>, sortValue: (row) => row.type === "credit" ? row.amount : 0 },
    { header: "Justif.", cell: (row) => row.hasDocument ? <StatusPill tone="success">Oui</StatusPill> : <StatusPill>Aucun</StatusPill> },
    { header: "Statut", cell: (row) => <WorkflowStatus status={row.status} />, sortValue: (row) => row.status },
  ];

  return (
    <>
      <PageHeader
        actions={canCreate ? (
          <Button onClick={() => setCreateOpen(true)} size="sm" type="button">
            <Plus className="size-4" />
            Nouvelle transaction
          </Button>
        ) : null}
        description="Ledger chantier avec debit/credit, fournisseur ou personne, justificatif, statut et validation."
        eyebrow="Finance"
        title="Caisse"
      />

      <MetricStrip
        items={[
          { icon: TrendingUp, label: "Credits valides", value: formatMoney(summary.credit), tone: "success" },
          { icon: TrendingDown, label: "Debits valides", value: formatMoney(summary.debit), tone: "danger" },
          { icon: WalletCards, label: "Solde courant", value: formatMoney(summary.balance), tone: summary.balance < 0 ? "danger" : "info" },
          { icon: CreditCard, label: "Lignes filtrees", value: filteredRows.length },
        ]}
      />

      <PageToolbar
        actions={canCreate ? (
          <Button onClick={() => setCreateOpen(true)} size="sm" type="button" variant="secondary">
            <Plus className="size-4" />
            Saisie
          </Button>
        ) : null}
        onReset={() => {
          setChantierFilter("all");
          setTypeFilter("all");
          setCategoryFilter("all");
          setFrom("");
          setTo("");
          setSearch("");
        }}
        search={search}
        searchPlaceholder="Description, fournisseur, categorie..."
        setSearch={setSearch}
      >
        <ToolbarSelect
          label="Chantier"
          onChange={setChantierFilter}
          options={[{ label: "Tous chantiers", value: "all" }, ...chantiers.map((chantier) => ({ label: chantier.name, value: chantier.id }))]}
          value={chantierFilter}
        />
        <Input aria-label="Date debut" onChange={(event) => setFrom(event.target.value)} type="date" value={from} />
        <Input aria-label="Date fin" onChange={(event) => setTo(event.target.value)} type="date" value={to} />
        <ToolbarSelect
          label="Type"
          onChange={(value) => setTypeFilter(value as "all" | TransactionType)}
          options={[
            { label: "Tous types", value: "all" },
            { label: "Debit", value: "debit" },
            { label: "Credit", value: "credit" },
          ]}
          value={typeFilter}
        />
        <ToolbarSelect
          label="Categorie"
          onChange={(value) => setCategoryFilter(value as "all" | TransactionCategory)}
          options={[{ label: "Toutes categories", value: "all" }, ...categoryOptions]}
          value={categoryFilter}
        />
      </PageToolbar>

      {isLoading ? (
        <LoadingState />
      ) : (
        <DataGrid
          columns={columns}
          onRowClick={setSelected}
          rows={filteredRows}
          selectedRowId={selected?.id}
          subtitle="Debit, credit, justificatif et validation"
          title="Ledger caisse"
        />
      )}

      <DetailDrawer onOpenChange={setCreateOpen} open={createOpen} title="Nouvelle transaction caisse" width="lg">
        <TransactionForm />
      </DetailDrawer>

      <DetailDrawer
        onOpenChange={(open) => !open && setSelected(null)}
        open={Boolean(selected)}
        subtitle={selected ? chantierNames.get(selected.chantierId) : undefined}
        title={selected?.description ?? "Transaction"}
      >
        {selected ? (
          <div className="space-y-4">
            <MetricStrip
              items={[
                { label: selected.type === "debit" ? "Debit" : "Credit", value: formatMoney(selected.amount), tone: selected.type === "debit" ? "danger" : "success" },
                { label: "Mode", value: selected.paymentMode },
                { label: "Categorie", value: selected.category, tone: "info" },
              ]}
            />
            <div className="rounded-lg border border-slate-200 p-4">
              <dl className="grid gap-2 text-sm">
                <div className="flex justify-between gap-3">
                  <dt className="text-slate-500">Date</dt>
                  <dd className="font-bold text-slate-950">{formatDate(selected.date)}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-slate-500">Personne / fournisseur</dt>
                  <dd className="font-bold text-slate-950">{selected.personOrSupplier ?? "-"}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-slate-500">Justificatif</dt>
                  <dd><StatusPill tone={selected.hasDocument ? "success" : "warning"}>{selected.hasDocument ? "Present" : "Manquant"}</StatusPill></dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-slate-500">Statut</dt>
                  <dd><WorkflowStatus status={selected.status} /></dd>
                </div>
              </dl>
            </div>
          </div>
        ) : null}
      </DetailDrawer>
    </>
  );
}
