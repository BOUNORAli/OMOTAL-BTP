"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Bell, Info } from "lucide-react";
import { DataGrid, type DataGridColumn } from "@/components/common/data-grid";
import { PageHeader } from "@/components/common/page-header";
import { LoadingState } from "@/components/common/state-blocks";
import { DetailDrawer } from "@/components/erp/detail-drawer";
import { MetricStrip } from "@/components/erp/metric-strip";
import { PageToolbar, ToolbarSelect } from "@/components/erp/page-toolbar";
import { StatusPill } from "@/components/erp/status-pill";
import { useAlerts, useChantiers } from "@/hooks/use-app-data";
import type { Alert } from "@/lib/domain/types";

export default function AlertesPage() {
  const { data = [], isLoading } = useAlerts();
  const { data: chantiers = [] } = useChantiers();
  const [severity, setSeverity] = useState("all");
  const [module, setModule] = useState("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Alert | null>(null);
  const chantierNames = useMemo(() => new Map(chantiers.map((chantier) => [chantier.id, chantier.name])), [chantiers]);
  const modules = useMemo(() => Array.from(new Set(data.map((item) => item.module))).sort(), [data]);
  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase();
    return data.filter((item) => {
      const matchesSeverity = severity === "all" || item.severity === severity;
      const matchesModule = module === "all" || item.module === module;
      const matchesSearch = !query || [item.title, item.description, item.module, chantierNames.get(item.chantierId) ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(query);
      return matchesSeverity && matchesModule && matchesSearch;
    });
  }, [chantierNames, data, module, search, severity]);

  const columns: DataGridColumn<Alert>[] = [
    {
      header: "Alerte",
      cell: (row) => (
        <span>
          <strong className="block text-slate-950">{row.title}</strong>
          <span className="line-clamp-1 text-xs text-slate-500">{row.description}</span>
        </span>
      ),
      sortValue: (row) => row.title,
      width: "40%",
    },
    { header: "Module", cell: (row) => <StatusPill tone="info">{row.module}</StatusPill>, sortValue: (row) => row.module },
    { header: "Chantier", cell: (row) => chantierNames.get(row.chantierId) ?? "Chantier non charge", sortValue: (row) => chantierNames.get(row.chantierId) ?? "" },
    {
      header: "Criticite",
      cell: (row) => <StatusPill tone={row.severity === "critical" ? "danger" : row.severity === "warning" ? "warning" : "info"}>{row.severity}</StatusPill>,
      sortValue: (row) => row.severity,
    },
  ];

  return (
    <>
      <PageHeader
        description="Alertes priorisees par criticite, module et chantier pour traiter les risques du jour."
        eyebrow="Pilotage"
        title="Alertes"
      />
      <MetricStrip
        items={[
          { icon: AlertTriangle, label: "Critiques", value: data.filter((item) => item.severity === "critical").length, tone: "danger" },
          { icon: Bell, label: "Warnings", value: data.filter((item) => item.severity === "warning").length, tone: "warning" },
          { icon: Info, label: "Infos", value: data.filter((item) => item.severity === "info").length, tone: "info" },
        ]}
      />
      <PageToolbar
        onReset={() => {
          setSeverity("all");
          setModule("all");
          setSearch("");
        }}
        search={search}
        searchPlaceholder="Titre, chantier, module..."
        setSearch={setSearch}
      >
        <ToolbarSelect
          label="Criticite"
          onChange={setSeverity}
          options={[
            { label: "Toutes criticites", value: "all" },
            { label: "Critical", value: "critical" },
            { label: "Warning", value: "warning" },
            { label: "Info", value: "info" },
          ]}
          value={severity}
        />
        <ToolbarSelect
          label="Module"
          onChange={setModule}
          options={[{ label: "Tous modules", value: "all" }, ...modules.map((item) => ({ label: item, value: item }))]}
          value={module}
        />
      </PageToolbar>
      {isLoading ? (
        <LoadingState />
      ) : (
        <DataGrid columns={columns} onRowClick={setSelected} rows={filteredRows} selectedRowId={selected?.id} title="Alertes actives" />
      )}
      <DetailDrawer
        onOpenChange={(open) => !open && setSelected(null)}
        open={Boolean(selected)}
        subtitle={selected ? chantierNames.get(selected.chantierId) : undefined}
        title={selected?.title ?? "Alerte"}
      >
        {selected ? (
          <div className="space-y-4">
            <StatusPill tone={selected.severity === "critical" ? "danger" : selected.severity === "warning" ? "warning" : "info"}>
              {selected.severity}
            </StatusPill>
            <p className="rounded-lg border border-slate-200 p-4 text-sm leading-6 text-slate-700">{selected.description}</p>
          </div>
        ) : null}
      </DetailDrawer>
    </>
  );
}
