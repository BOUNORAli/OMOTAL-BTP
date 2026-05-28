import { formatMoney } from "@/lib/format";
import { cn } from "@/utils/cn";

export function AmountDisplay({ amount, type }: { amount: number; type?: "debit" | "credit" }) {
  return (
    <span
      className={cn(
        "tabular-nums font-bold",
        type === "debit" && "text-red-600",
        type === "credit" && "text-emerald-700",
      )}
    >
      {formatMoney(amount)}
    </span>
  );
}
