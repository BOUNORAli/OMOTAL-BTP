import type { ReactNode } from "react";
import { FileText } from "lucide-react";
import { StatusPill } from "@/components/erp/status-pill";
import type { OperationStatus } from "@/lib/domain/types";
import { statusLabels } from "@/lib/domain/labels";
import { formatMoney, formatNumber } from "@/lib/format";
import { cn } from "@/utils/cn";

const operationTone: Record<OperationStatus, "neutral" | "success" | "warning" | "danger" | "info"> = {
  brouillon: "neutral",
  soumis: "warning",
  valide: "success",
  rejete: "danger",
  annule: "neutral",
  verrouille: "info",
};

export function MoneyCell({ amount, muted = false, type }: { amount: number; muted?: boolean; type?: "debit" | "credit" }) {
  return (
    <span
      className={cn(
        "tabular-nums font-bold",
        muted && "text-slate-400",
        type === "debit" && "text-red-700",
        type === "credit" && "text-emerald-700",
        !muted && !type && "text-slate-950",
      )}
    >
      {formatMoney(amount)}
    </span>
  );
}

export function QuantityCell({ unit, value }: { unit?: string; value: number }) {
  return <span className="tabular-nums font-bold text-slate-950">{formatNumber(value, unit)}</span>;
}

export function WorkflowStatus({ status }: { status: OperationStatus }) {
  return <StatusPill tone={operationTone[status]}>{statusLabels[status]}</StatusPill>;
}

export function DocumentCell({ available, children }: { available?: boolean; children?: ReactNode }) {
  if (children) return <>{children}</>;

  return (
    <span className={cn("inline-flex items-center gap-1 text-xs font-bold", available ? "text-emerald-700" : "text-slate-400")}>
      <FileText className="size-3.5" />
      {available ? "Justif." : "Aucun"}
    </span>
  );
}
