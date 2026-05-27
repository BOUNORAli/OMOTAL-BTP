import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, FileX, Loader2 } from "lucide-react";

export function LoadingState({ rows = 3 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-16 w-full rounded-lg" />
      ))}
    </div>
  );
}

export function EmptyState({ title = "Aucune donnée", description, icon: Icon = FileX, action }) {
  return (
    <Card>
      <CardContent className="py-12 text-center">
        <Icon className="mx-auto h-12 w-12 text-muted-foreground/40" />
        <h3 className="mt-4 font-medium text-slate-800">{title}</h3>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
        {action && <div className="mt-4">{action}</div>}
      </CardContent>
    </Card>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <Card>
      <CardContent className="py-12 text-center">
        <AlertCircle className="mx-auto h-10 w-10 text-destructive/70" />
        <h3 className="mt-4 font-medium">Erreur</h3>
        <p className="mt-1 text-sm text-muted-foreground">{message || "Une erreur est survenue"}</p>
        {onRetry && (
          <button onClick={onRetry} className="mt-3 text-sm text-primary hover:underline">
            Réessayer
          </button>
        )}
      </CardContent>
    </Card>
  );
}

export function PageHeader({ title, description, actions }) {
  return (
    <div className="flex items-start justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">{title}</h1>
        {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
    </div>
  );
}

export function KpiCard({ label, value, sub, icon: Icon, accent = "primary", trend, dataTestId }) {
  const accents = {
    primary: "text-primary bg-primary/10",
    success: "text-emerald-600 bg-emerald-50",
    warn: "text-amber-600 bg-amber-50",
    danger: "text-red-600 bg-red-50",
    accent: "text-orange-600 bg-orange-50",
  };
  return (
    <Card className="kpi-card-hover" data-testid={dataTestId}>
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs uppercase tracking-wide text-muted-foreground font-medium">{label}</span>
          {Icon && <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${accents[accent] || accents.primary}`}>
            <Icon className="h-4 w-4" />
          </div>}
        </div>
        <div className="text-2xl lg:text-3xl font-bold tracking-tight text-slate-900">{value}</div>
        {sub && <div className="text-xs text-muted-foreground mt-1">{sub}</div>}
        {trend !== undefined && (
          <div className={`text-xs mt-2 font-medium ${trend >= 0 ? "text-emerald-600" : "text-red-600"}`}>
            {trend >= 0 ? "↑" : "↓"} {Math.abs(trend)}%
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function StatusBadge({ status }) {
  const map = {
    VALIDE: "bg-emerald-100 text-emerald-700 border-emerald-200",
    SOUMIS: "bg-amber-100 text-amber-700 border-amber-200",
    BROUILLON: "bg-slate-100 text-slate-700 border-slate-200",
    REJETE: "bg-red-100 text-red-700 border-red-200",
    ANNULE: "bg-gray-100 text-gray-600 border-gray-200",
    VERROUILLE: "bg-indigo-100 text-indigo-700 border-indigo-200",
    EN_COURS: "bg-blue-100 text-blue-700 border-blue-200",
    PREPARATION: "bg-violet-100 text-violet-700 border-violet-200",
    SUSPENDU: "bg-amber-100 text-amber-700 border-amber-200",
    TERMINE: "bg-emerald-100 text-emerald-700 border-emerald-200",
    ARCHIVE: "bg-gray-100 text-gray-600 border-gray-200",
  };
  const labels = {
    EN_COURS: "En cours", PREPARATION: "Préparation", SUSPENDU: "Suspendu",
    TERMINE: "Terminé", ARCHIVE: "Archivé",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${map[status] || "bg-slate-100 text-slate-700"}`}>
      {labels[status] || status}
    </span>
  );
}
