import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import { PageHeader, LoadingState, EmptyState } from "@/components/common";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BellRing, AlertTriangle, AlertCircle, Info, Check } from "lucide-react";
import { useChantier } from "@/contexts/ChantierContext";
import { toast } from "sonner";

const SEV_META = {
  CRITICAL: { color: "bg-red-100 text-red-700 border-red-200", icon: AlertCircle },
  HIGH: { color: "bg-orange-100 text-orange-700 border-orange-200", icon: AlertTriangle },
  WARN: { color: "bg-amber-100 text-amber-700 border-amber-200", icon: AlertTriangle },
  INFO: { color: "bg-blue-100 text-blue-700 border-blue-200", icon: Info },
};

export default function AlertesPage() {
  const { selectedId } = useChantier();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [moduleFilter, setModuleFilter] = useState("");
  const [sevFilter, setSevFilter] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = { chantier_id: selectedId || undefined };
      if (moduleFilter) params.module = moduleFilter;
      if (sevFilter) params.severity = sevFilter;
      const r = await api.get("/alertes", { params });
      setAlerts(r.data.items || []);
    } catch (e) { toast.error("Erreur de chargement"); }
    setLoading(false);
  };
  useEffect(() => { fetchData(); /* eslint-disable-next-line */ }, [selectedId, moduleFilter, sevFilter]);

  const resolve = async (id) => {
    try { await api.post(`/alertes/${id}/resolve`); toast.success("Alerte résolue"); fetchData(); }
    catch (e) { toast.error("Erreur"); }
  };

  const active = alerts.filter((a) => a.status === "NEW");

  return (
    <div data-testid="alertes-page">
      <PageHeader
        title="Alertes"
        description={`${active.length} alerte${active.length !== 1 ? "s" : ""} active${active.length !== 1 ? "s" : ""}`}
        actions={
          <div className="flex gap-2">
            <Select value={sevFilter || "all"} onValueChange={(v) => setSevFilter(v === "all" ? "" : v)}>
              <SelectTrigger className="w-40"><SelectValue placeholder="Sévérité" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes</SelectItem>
                <SelectItem value="CRITICAL">Critique</SelectItem>
                <SelectItem value="HIGH">Élevée</SelectItem>
                <SelectItem value="WARN">Avertissement</SelectItem>
                <SelectItem value="INFO">Info</SelectItem>
              </SelectContent>
            </Select>
            <Select value={moduleFilter || "all"} onValueChange={(v) => setModuleFilter(v === "all" ? "" : v)}>
              <SelectTrigger className="w-40"><SelectValue placeholder="Module" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="GASOIL">Gasoil</SelectItem>
                <SelectItem value="CAISSE">Caisse</SelectItem>
                <SelectItem value="PERSONNEL">Personnel</SelectItem>
                <SelectItem value="ENGINS">Engins</SelectItem>
              </SelectContent>
            </Select>
          </div>
        }
      />

      {loading ? <LoadingState rows={5} /> :
        alerts.length === 0 ? (
          <EmptyState title="Aucune alerte" description="Tout est sous contrôle." icon={BellRing} />
        ) : (
          <div className="space-y-2">
            {alerts.map((a) => {
              const sev = SEV_META[a.severity] || SEV_META.INFO;
              const Icon = sev.icon;
              return (
                <Card key={a.id} data-testid={`alert-${a.id}`}>
                  <CardContent className="py-4 flex items-start gap-4">
                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${sev.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <Badge variant="outline" className={sev.color}>{a.severity}</Badge>
                        <Badge variant="outline">{a.module}</Badge>
                        {a.chantier_name && <span className="text-xs text-muted-foreground">{a.chantier_name}</span>}
                      </div>
                      <div className="font-medium text-slate-900">{a.title}</div>
                      <div className="text-sm text-muted-foreground mt-0.5">{a.message}</div>
                    </div>
                    {a.status === "NEW" && (
                      <Button size="sm" variant="outline" onClick={() => resolve(a.id)}>
                        <Check className="h-4 w-4 mr-1" /> Résolue
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )
      }
    </div>
  );
}
