import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import { PageHeader, LoadingState, EmptyState } from "@/components/common";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckSquare, Check, X, Fuel, Wallet, Truck, Users } from "lucide-react";
import { formatMAD, formatDate } from "@/lib/format";
import { useChantier } from "@/contexts/ChantierContext";
import { toast } from "sonner";

const TYPE_META = {
  GASOIL_SORTIE: { label: "Sortie gasoil", icon: Fuel, color: "text-orange-600 bg-orange-50" },
  TRANSACTION: { label: "Transaction", icon: Wallet, color: "text-emerald-600 bg-emerald-50" },
  ENGIN_POINTAGE: { label: "Pointage engin", icon: Truck, color: "text-blue-600 bg-blue-50" },
  PERSONNEL_POINTAGE: { label: "Pointage paie", icon: Users, color: "text-violet-600 bg-violet-50" },
};

export default function ValidationsPage() {
  const { selectedId } = useChantier();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const r = await api.get("/validations/pending", {
        params: { chantier_id: selectedId || undefined },
      });
      setItems(r.data.items || []);
    } catch (e) { toast.error("Erreur de chargement"); }
    setLoading(false);
  };
  useEffect(() => { fetchData(); /* eslint-disable-next-line */ }, [selectedId]);

  const validate = async (item, action) => {
    const status = action === "validate" ? "VALIDE" : "REJETE";
    let motif = null;
    if (action === "reject") {
      motif = prompt("Motif de rejet ?");
      if (motif === null) return;
    }
    try {
      const endpoints = {
        GASOIL_SORTIE: `/gasoil/sorties/${item.id}/status`,
        TRANSACTION: `/caisse/${item.id}/status`,
        ENGIN_POINTAGE: `/engins/pointage/${item.id}/status`,
        PERSONNEL_POINTAGE: `/personnel/pointage/${item.id}/status`,
      };
      await api.post(endpoints[item.type], { status, motif });
      toast.success(action === "validate" ? "Opération validée" : "Opération rejetée");
      fetchData();
    } catch (e) { toast.error(e.response?.data?.detail || "Erreur"); }
  };

  const grouped = {
    GASOIL_SORTIE: items.filter((i) => i.type === "GASOIL_SORTIE"),
    TRANSACTION: items.filter((i) => i.type === "TRANSACTION"),
    ENGIN_POINTAGE: items.filter((i) => i.type === "ENGIN_POINTAGE"),
    PERSONNEL_POINTAGE: items.filter((i) => i.type === "PERSONNEL_POINTAGE"),
  };

  return (
    <div data-testid="validations-page">
      <PageHeader
        title="Validations en attente"
        description={`${items.length} opération${items.length !== 1 ? "s" : ""} à valider`}
      />

      {loading ? <LoadingState rows={5} /> :
        items.length === 0 ? (
          <EmptyState title="Aucune validation en attente" description="Toutes les opérations sont à jour." icon={CheckSquare} />
        ) : (
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">Toutes ({items.length})</TabsTrigger>
              {Object.entries(grouped).map(([k, v]) => v.length > 0 && (
                <TabsTrigger key={k} value={k}>{TYPE_META[k].label} ({v.length})</TabsTrigger>
              ))}
            </TabsList>
            <TabsContent value="all"><ItemList items={items} onAction={validate} /></TabsContent>
            {Object.entries(grouped).map(([k, v]) => v.length > 0 && (
              <TabsContent key={k} value={k}><ItemList items={v} onAction={validate} /></TabsContent>
            ))}
          </Tabs>
        )
      }
    </div>
  );
}

function ItemList({ items, onAction }) {
  return (
    <div className="space-y-2 mt-4">
      {items.map((it) => {
        const meta = TYPE_META[it.type] || {};
        const Icon = meta.icon || CheckSquare;
        return (
          <Card key={`${it.type}-${it.id}`} className="kpi-card-hover">
            <CardContent className="py-4 flex items-center gap-4">
              <div className={`h-11 w-11 rounded-lg flex items-center justify-center flex-shrink-0 ${meta.color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline">{meta.label}</Badge>
                  <span className="text-xs text-muted-foreground">{formatDate(it.date)}</span>
                  {it.chantier_name && <span className="text-xs text-slate-500">• {it.chantier_name}</span>}
                </div>
                <div className="text-sm font-medium text-slate-900 truncate">{it.summary}</div>
                {it.created_by_name && (
                  <div className="text-xs text-muted-foreground mt-0.5">Saisi par {it.created_by_name}</div>
                )}
              </div>
              <div className="text-right flex-shrink-0">
                {it.amount !== null && it.amount !== undefined && (
                  <div className="font-semibold mb-2">{formatMAD(it.amount)}</div>
                )}
                <div className="flex gap-1 justify-end">
                  <Button size="sm" variant="outline" className="border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                          onClick={() => onAction(it, "validate")} data-testid={`validate-${it.type}-${it.id}`}>
                    <Check className="h-4 w-4 mr-1" /> Valider
                  </Button>
                  <Button size="sm" variant="outline" className="border-red-300 text-red-700 hover:bg-red-50"
                          onClick={() => onAction(it, "reject")}>
                    <X className="h-4 w-4 mr-1" /> Rejeter
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
