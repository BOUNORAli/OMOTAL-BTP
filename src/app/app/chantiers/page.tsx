"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { Building2, MapPin, Plus, WalletCards } from "lucide-react";
import { DataGrid, type DataGridColumn } from "@/components/common/data-grid";
import { PageHeader } from "@/components/common/page-header";
import { LoadingState } from "@/components/common/state-blocks";
import { DetailDrawer } from "@/components/erp/detail-drawer";
import { MetricStrip } from "@/components/erp/metric-strip";
import { PageToolbar, ToolbarSelect } from "@/components/erp/page-toolbar";
import { StatusPill } from "@/components/erp/status-pill";
import { Button } from "@/components/ui/button";
import { ChantierForm } from "@/features/operations/forms";
import { useChantiers, useUsers } from "@/hooks/use-app-data";
import { can } from "@/lib/domain/permissions";
import type { Chantier } from "@/lib/domain/types";
import { formatDate, formatMoney } from "@/lib/format";
import { useAppStore } from "@/stores/app-store";

export default function ChantiersPage() {
  const currentUser = useAppStore((state) => state.currentUser);
  const { data = [], isLoading } = useChantiers();
  const { data: users = [] } = useUsers({ enabled: can(currentUser.role, "admin.users.manage") });
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [managerId, setManagerId] = useState("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [selected, setSelected] = useState<Chantier | null>(null);
  const canCreate = can(currentUser.role, "chantier.create");

  const managerNames = useMemo(() => new Map(users.map((user) => [user.id, user.name])), [users]);

  const managerName = useCallback((id?: string) => {
    if (!id) return "Non renseigne";
    if (id === currentUser.id) return currentUser.name;
    return managerNames.get(id) ?? "Responsable non charge";
  }, [currentUser.id, currentUser.name, managerNames]);

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase();
    return data.filter((chantier) => {
      const matchesSearch = !query || [chantier.name, chantier.code, chantier.client, chantier.location, managerName(chantier.managerUserId)]
        .join(" ")
        .toLowerCase()
        .includes(query);
      const matchesStatus = status === "all" || chantier.status === status;
      const matchesManager = managerId === "all" || chantier.managerUserId === managerId;
      return matchesSearch && matchesStatus && matchesManager;
    });
  }, [data, managerId, managerName, search, status]);

  const managers = useMemo(() => {
    const ids = Array.from(new Set(data.map((chantier) => chantier.managerUserId).filter(Boolean)));
    return ids.map((id) => ({ id: id as string, name: managerName(id) }));
  }, [data, managerName]);

  const totalMarket = filteredRows.reduce((sum, chantier) => sum + (chantier.marketAmountHt ?? 0), 0);

  const columns: DataGridColumn<Chantier>[] = [
    {
      header: "Chantier",
      cell: (row) => (
        <span>
          <strong className="block text-slate-950">{row.name}</strong>
          <span className="text-xs text-slate-500">{row.code}</span>
        </span>
      ),
      sortValue: (row) => row.name,
      width: "28%",
    },
    { header: "Client", cell: (row) => row.client, sortValue: (row) => row.client },
    { header: "Localisation", cell: (row) => row.location, sortValue: (row) => row.location },
    { header: "Responsable", cell: (row) => managerName(row.managerUserId), sortValue: (row) => managerName(row.managerUserId) },
    { header: "Debut", cell: (row) => formatDate(row.startedAt), sortValue: (row) => row.startedAt },
    { header: "Marche HT", align: "right", cell: (row) => formatMoney(row.marketAmountHt ?? 0), sortValue: (row) => row.marketAmountHt ?? 0 },
    {
      header: "Statut",
      cell: (row) => <StatusPill tone={row.status === "en_cours" ? "success" : row.status === "suspendu" ? "warning" : "neutral"}>{row.status}</StatusPill>,
      sortValue: (row) => row.status,
    },
  ];

  return (
    <>
      <PageHeader
        actions={canCreate ? (
          <Button onClick={() => setCreateOpen(true)} size="sm" type="button">
            <Plus className="size-4" />
            Nouveau chantier
          </Button>
        ) : null}
        description="Vue multi-chantiers avec client, statut, responsable, marche et acces au cockpit chantier."
        eyebrow="Pilotage"
        title="Chantiers"
      />

      <MetricStrip
        items={[
          { icon: Building2, label: "Chantiers", value: filteredRows.length, tone: "info" },
          { icon: MapPin, label: "En cours", value: filteredRows.filter((item) => item.status === "en_cours").length, tone: "success" },
          { icon: WalletCards, label: "Marche HT", value: formatMoney(totalMarket), tone: "warning" },
        ]}
      />

      <PageToolbar
        actions={canCreate ? (
          <Button onClick={() => setCreateOpen(true)} size="sm" type="button" variant="secondary">
            <Plus className="size-4" />
            Creer
          </Button>
        ) : null}
        onReset={() => {
          setSearch("");
          setStatus("all");
          setManagerId("all");
        }}
        search={search}
        searchPlaceholder="Nom, code, client, ville..."
        setSearch={setSearch}
      >
        <ToolbarSelect
          label="Statut"
          onChange={setStatus}
          options={[
            { label: "Tous statuts", value: "all" },
            { label: "Preparation", value: "preparation" },
            { label: "En cours", value: "en_cours" },
            { label: "Suspendu", value: "suspendu" },
            { label: "Termine", value: "termine" },
            { label: "Archive", value: "archive" },
          ]}
          value={status}
        />
        <ToolbarSelect
          label="Responsable"
          onChange={setManagerId}
          options={[{ label: "Tous responsables", value: "all" }, ...managers.map((manager) => ({ label: manager.name, value: manager.id }))]}
          value={managerId}
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
          subtitle="Selectionnez une ligne pour voir le detail"
          title="Portefeuille chantiers"
        />
      )}

      <DetailDrawer onOpenChange={setCreateOpen} open={createOpen} title="Nouveau chantier" width="lg">
        <ChantierForm />
      </DetailDrawer>

      <DetailDrawer
        onOpenChange={(open) => !open && setSelected(null)}
        open={Boolean(selected)}
        subtitle={selected ? `${selected.code} - ${selected.location}` : undefined}
        title={selected?.name ?? "Chantier"}
      >
        {selected ? (
          <div className="space-y-4">
            <MetricStrip
              items={[
                { label: "Marche HT", value: formatMoney(selected.marketAmountHt ?? 0), tone: "warning" },
                { label: "Statut", value: selected.status, tone: selected.status === "en_cours" ? "success" : "neutral" },
                { label: "Debut", value: formatDate(selected.startedAt), tone: "info" },
              ]}
            />
            <div className="rounded-lg border border-slate-200 p-4">
              <dl className="grid gap-2 text-sm">
                <div className="flex justify-between gap-3">
                  <dt className="text-slate-500">Client</dt>
                  <dd className="font-bold text-slate-950">{selected.client}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-slate-500">Responsable</dt>
                  <dd className="font-bold text-slate-950">{managerName(selected.managerUserId)}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-slate-500">Fin prevue</dt>
                  <dd className="font-bold text-slate-950">{selected.expectedEndAt ? formatDate(selected.expectedEndAt) : "-"}</dd>
                </div>
              </dl>
            </div>
            <Button asChild size="sm">
              <Link href={`/app/chantiers/${selected.id}`}>Ouvrir cockpit chantier</Link>
            </Button>
          </div>
        ) : null}
      </DetailDrawer>
    </>
  );
}
