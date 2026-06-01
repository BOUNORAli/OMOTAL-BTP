"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DataTable, type DataTableColumn } from "@/components/common/data-table";
import { PageHeader } from "@/components/common/page-header";
import { LoadingState } from "@/components/common/state-blocks";
import { Badge } from "@/components/ui/badge";
import { Input, Select } from "@/components/ui/input";
import { ChantierForm } from "@/features/operations/forms";
import { useChantiers, useUsers } from "@/hooks/use-app-data";
import { formatDate, formatMoney } from "@/lib/format";
import type { Chantier } from "@/lib/domain/types";
import { can } from "@/lib/domain/permissions";
import { useAppStore } from "@/stores/app-store";

export default function ChantiersPage() {
  const currentUser = useAppStore((state) => state.currentUser);
  const { data = [], isLoading } = useChantiers();
  const { data: users = [] } = useUsers({ enabled: can(currentUser.role, "admin.users.manage") });
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [managerId, setManagerId] = useState("all");

  const managerNames = useMemo(
    () => new Map(users.map((user) => [user.id, user.name])),
    [users],
  );

  const managerName = useCallback((id?: string) => {
    if (!id) return "Non renseigne";
    if (id === currentUser.id) return currentUser.name;
    return managerNames.get(id) ?? "Responsable non charge";
  }, [currentUser.id, currentUser.name, managerNames]);

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase();
    return data.filter((chantier) => {
      const matchesSearch = !query || [
        chantier.name,
        chantier.code,
        chantier.client,
        chantier.location,
        managerName(chantier.managerUserId),
      ].join(" ").toLowerCase().includes(query);
      const matchesStatus = status === "all" || chantier.status === status;
      const matchesManager = managerId === "all" || chantier.managerUserId === managerId;
      return matchesSearch && matchesStatus && matchesManager;
    });
  }, [data, managerId, managerName, search, status]);

  const managers = useMemo(() => {
    const ids = Array.from(new Set(data.map((chantier) => chantier.managerUserId).filter(Boolean)));
    return ids.map((id) => ({ id: id as string, name: managerName(id) }));
  }, [data, managerName]);

  const columns: DataTableColumn<Chantier>[] = [
    { header: "Nom", cell: (row) => <Link className="font-bold text-[#12355b]" href={`/app/chantiers/${row.id}`}>{row.name}</Link> },
    { header: "Code", cell: (row) => row.code },
    { header: "Maitre d'ouvrage", cell: (row) => row.client },
    { header: "Statut", cell: (row) => <Badge tone={row.status === "en_cours" ? "green" : "orange"}>{row.status}</Badge> },
    { header: "Responsable", cell: (row) => managerName(row.managerUserId) },
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
      <Card className="mb-4 grid gap-3 p-4 md:grid-cols-4">
        <Input
          aria-label="Recherche chantiers"
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Rechercher nom, code, client..."
          value={search}
        />
        <Select aria-label="Filtrer par statut" onChange={(event) => setStatus(event.target.value)} value={status}>
          <option value="all">Tous les statuts</option>
          <option value="preparation">Preparation</option>
          <option value="en_cours">En cours</option>
          <option value="suspendu">Suspendu</option>
          <option value="termine">Termine</option>
          <option value="archive">Archive</option>
        </Select>
        <Select aria-label="Filtrer par responsable" onChange={(event) => setManagerId(event.target.value)} value={managerId}>
          <option value="all">Tous les responsables</option>
          {managers.map((manager) => (
            <option key={manager.id} value={manager.id}>{manager.name}</option>
          ))}
        </Select>
        <Button onClick={() => {
          setSearch("");
          setStatus("all");
          setManagerId("all");
        }} type="button" variant="secondary">
          Reinitialiser
        </Button>
      </Card>
      {isLoading ? <LoadingState /> : <DataTable columns={columns} rows={filteredRows} />}
    </>
  );
}
