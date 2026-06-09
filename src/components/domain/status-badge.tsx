import { StatusPill } from "@/components/erp/status-pill";
import { statusLabels } from "@/lib/domain/labels";
import type { OperationStatus } from "@/lib/domain/types";

const statusTone: Record<OperationStatus, "neutral" | "success" | "warning" | "danger" | "info"> = {
  brouillon: "neutral",
  soumis: "warning",
  valide: "success",
  rejete: "danger",
  annule: "neutral",
  verrouille: "info",
};

export function StatusBadge({ status }: { status: OperationStatus }) {
  return <StatusPill tone={statusTone[status]}>{statusLabels[status]}</StatusPill>;
}
