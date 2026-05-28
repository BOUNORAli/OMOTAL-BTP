import { Badge } from "@/components/ui/badge";
import { statusLabels } from "@/lib/domain/labels";
import type { OperationStatus } from "@/lib/domain/types";

const statusTone: Record<OperationStatus, "slate" | "green" | "orange" | "red" | "blue" | "yellow"> = {
  brouillon: "slate",
  soumis: "yellow",
  valide: "green",
  rejete: "red",
  annule: "orange",
  verrouille: "blue",
};

export function StatusBadge({ status }: { status: OperationStatus }) {
  return <Badge tone={statusTone[status]}>{statusLabels[status]}</Badge>;
}
