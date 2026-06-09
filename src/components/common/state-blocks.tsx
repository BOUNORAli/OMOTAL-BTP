import { AlertTriangle, Inbox, Loader2, ShieldX } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LoadingState({ label = "Chargement des donnees..." }: { label?: string }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-200 bg-white p-8 text-center text-slate-500">
      <Loader2 className="mx-auto mb-3 size-6 animate-spin text-orange-500" />
      {label}
    </div>
  );
}

export function EmptyState({
  action,
  message,
  title,
}: {
  action?: string;
  message: string;
  title: string;
}) {
  return (
    <div className="rounded-lg border border-dashed border-slate-200 bg-white p-8 text-center">
      <Inbox className="mx-auto mb-3 size-8 text-slate-400" />
      <h2 className="font-bold text-slate-950">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">{message}</p>
      {action ? <Button className="mt-4">{action}</Button> : null}
    </div>
  );
}

export function ErrorState({ message = "Une erreur est survenue." }: { message?: string }) {
  return (
    <div className="rounded-lg border border-red-100 bg-red-50 p-6 text-red-700">
      <AlertTriangle className="mb-2 size-5" />
      <strong>Erreur</strong>
      <p className="mt-1 text-sm">{message}</p>
    </div>
  );
}

export function NoPermissionState() {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-8 text-center">
      <ShieldX className="mx-auto mb-3 size-9 text-orange-500" />
      <h2 className="font-bold text-slate-950">Vous n&apos;avez pas acces a cette page</h2>
      <p className="mt-2 text-sm text-slate-600">Votre role actuel ne permet pas de consulter ce module.</p>
      <Button className="mt-4" variant="secondary">
        Retour dashboard
      </Button>
    </div>
  );
}
