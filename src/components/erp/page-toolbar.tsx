"use client";

import type { ReactNode } from "react";
import { Filter, RotateCcw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";

export function PageToolbar({
  actions,
  children,
  onReset,
  search,
  searchPlaceholder = "Rechercher",
  setSearch,
}: {
  actions?: ReactNode;
  children?: ReactNode;
  onReset?: () => void;
  search?: string;
  searchPlaceholder?: string;
  setSearch?: (value: string) => void;
}) {
  return (
    <section className="mb-4 rounded-lg border border-slate-200 bg-white px-3 py-3 shadow-sm">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="grid min-w-0 flex-1 gap-2 md:grid-cols-[minmax(220px,1.3fr)_repeat(auto-fit,minmax(150px,1fr))]">
          {setSearch ? (
            <label className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <Input
                aria-label="Recherche"
                className="pl-9"
                onChange={(event) => setSearch(event.target.value)}
                placeholder={searchPlaceholder}
                value={search ?? ""}
              />
            </label>
          ) : null}
          {children}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {onReset ? (
            <Button onClick={onReset} size="sm" type="button" variant="secondary">
              <RotateCcw className="size-4" />
              Reinitialiser
            </Button>
          ) : (
            <span className="hidden items-center gap-2 text-xs font-bold uppercase text-slate-400 xl:inline-flex">
              <Filter className="size-4" />
              Filtres
            </span>
          )}
          {actions}
        </div>
      </div>
    </section>
  );
}

export function ToolbarSelect({
  label,
  onChange,
  options,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  options: Array<{ label: string; value: string }>;
  value: string;
}) {
  return (
    <Select aria-label={label} onChange={(event) => onChange(event.target.value)} value={value}>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </Select>
  );
}
