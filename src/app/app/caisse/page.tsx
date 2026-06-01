"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { DataTable, type DataTableColumn } from "@/components/common/data-table";
import { PageHeader } from "@/components/common/page-header";
import { LoadingState } from "@/components/common/state-blocks";
import { AmountDisplay } from "@/components/domain/amount-display";
import { DocumentUploader } from "@/components/domain/document-uploader";
import { KpiCard } from "@/components/domain/kpi-card";
import { StatusBadge } from "@/components/domain/status-badge";
import { TransactionForm } from "@/features/operations/forms";
import { useChantiers, useTransactions } from "@/hooks/use-app-data";
import { calculateCashSummary } from "@/lib/domain/calculations";
import type { CaisseTransaction, TransactionCategory, TransactionType } from "@/lib/domain/types";
import { formatDate } from "@/lib/format";
import { Input, Select } from "@/components/ui/input";

export default function CaissePage() {
  const { data = [], isLoading } = useTransactions();
  const { data: chantiers = [] } = useChantiers();
  const [chantierFilter, setChantierFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState<"all" | TransactionType>("all");
  const [categoryFilter, setCategoryFilter] = useState<"all" | TransactionCategory>("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [search, setSearch] = useState("");

  const chantierNames = useMemo(
    () => new Map(chantiers.map((chantier) => [chantier.id, chantier.name])),
    [chantiers],
  );

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

  const columns: DataTableColumn<CaisseTransaction>[] = [
    { header: "Date", cell: (row) => formatDate(row.date) },
    { header: "Chantier", cell: (row) => chantierNames.get(row.chantierId) ?? "Chantier non charge" },
    { header: "Type", cell: (row) => row.type },
    { header: "Categorie", cell: (row) => row.category },
    { header: "Description", cell: (row) => <span className="font-semibold">{row.description}</span> },
    { header: "Mode", cell: (row) => row.paymentMode },
    { header: "Debit", align: "right", cell: (row) => row.type === "debit" ? <AmountDisplay amount={row.amount} type="debit" /> : "-" },
    { header: "Credit", align: "right", cell: (row) => row.type === "credit" ? <AmountDisplay amount={row.amount} type="credit" /> : "-" },
    {
      header: "Justif.",
      cell: (row) => (
        <DocumentUploader
          chantierId={row.chantierId}
          compact
          module="caisse"
          targetId={row.id}
          targetType="CAISSE_TRANSACTION"
        />
      ),
    },
    { header: "Statut", cell: (row) => <StatusBadge status={row.status} /> },
  ];

  return (
    <>
      <PageHeader
        description="Transactions, filtres, justificatifs, statuts et validation des depenses elevees."
        eyebrow="Finance"
        title="Caisse"
      />

      <TransactionForm />

      <section className="mb-6 grid gap-4 md:grid-cols-3">
        <KpiCard label="Credits valides" tone="success" value={<AmountDisplay amount={summary.credit} type="credit" />} />
        <KpiCard label="Debits valides" tone="danger" value={<AmountDisplay amount={summary.debit} type="debit" />} />
        <KpiCard label="Solde courant" value={<AmountDisplay amount={summary.balance} />} />
      </section>

      <Card className="mb-4 grid gap-3 p-4 md:grid-cols-6">
        <Select aria-label="Filtrer par chantier" onChange={(event) => setChantierFilter(event.target.value)} value={chantierFilter}>
          <option value="all">Tous les chantiers</option>
          {chantiers.map((chantier) => (
            <option key={chantier.id} value={chantier.id}>{chantier.name}</option>
          ))}
        </Select>
        <Input aria-label="Date debut" onChange={(event) => setFrom(event.target.value)} type="date" value={from} />
        <Input aria-label="Date fin" onChange={(event) => setTo(event.target.value)} type="date" value={to} />
        <Select aria-label="Filtrer par type" onChange={(event) => setTypeFilter(event.target.value as "all" | TransactionType)} value={typeFilter}>
          <option value="all">Tous types</option>
          <option value="debit">Debit</option>
          <option value="credit">Credit</option>
        </Select>
        <Select aria-label="Filtrer par categorie" onChange={(event) => setCategoryFilter(event.target.value as "all" | TransactionCategory)} value={categoryFilter}>
          <option value="all">Toutes categories</option>
          {["personnel", "gasoil", "matieres", "location_engins", "entretien", "transport", "etp", "frais_generaux", "financement", "divers"].map((category) => (
            <option key={category} value={category}>{category}</option>
          ))}
        </Select>
        <Input
          aria-label="Recherche caisse"
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Recherche"
          value={search}
        />
      </Card>

      {isLoading ? <LoadingState /> : <DataTable columns={columns} rows={filteredRows} />}
    </>
  );
}
