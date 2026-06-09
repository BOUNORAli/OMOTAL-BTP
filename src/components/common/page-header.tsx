import type { ReactNode } from "react";

export function PageHeader({
  actions,
  description,
  eyebrow,
  title,
}: {
  actions?: ReactNode;
  description?: string;
  eyebrow?: string;
  title: string;
}) {
  return (
    <div className="mb-4 flex flex-col gap-3 border-b border-slate-200 pb-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="min-w-0">
        {eyebrow ? <p className="mb-1 text-xs font-black uppercase text-orange-600">{eyebrow}</p> : null}
        <h1 className="truncate text-2xl font-black text-slate-950 md:text-3xl">{title}</h1>
        {description ? <p className="mt-1 max-w-4xl text-sm leading-6 text-slate-600">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}
