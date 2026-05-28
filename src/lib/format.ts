export function formatMoney(amount: number): string {
  return new Intl.NumberFormat("fr-MA", {
    style: "currency",
    currency: "MAD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(value: number, unit?: string): string {
  const formatted = new Intl.NumberFormat("fr-MA", {
    maximumFractionDigits: 1,
  }).format(value);

  return unit ? `${formatted} ${unit}` : formatted;
}

export function formatDate(date: string): string {
  return new Intl.DateTimeFormat("fr-MA", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}
