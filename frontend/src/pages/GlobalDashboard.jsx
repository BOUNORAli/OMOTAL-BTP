import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { PageHeader, KpiCard, LoadingState, StatusBadge } from "@/components/common";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatMAD, formatNumber } from "@/lib/format";
import {
  Building2, Wallet, Fuel, AlertTriangle, ArrowRight,
  TrendingUp, CheckSquare, FileSpreadsheet,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { can } from "@/lib/permissions";

const CHART_COLORS = ["#1e3a8a", "#f97316", "#10b981", "#f59e0b", "#0ea5e9", "#8b5cf6", "#ec4899", "#14b8a6"];

export default function GlobalDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/dashboard/global").then((r) => setData(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="space-y-4"><LoadingState rows={2} /><LoadingState rows={4} /></div>;
  if (!data) return <div>Erreur de chargement</div>;

  const { kpis, chantier_cards = [], categories = [] } = data;
  const showFinance = can(user, "caisse.read");

  return (
    <div data-testid="global-dashboard">
      <PageHeader
        title={`Bienvenue, ${user?.name?.split(" ")[0]} 👋`}
        description="Vue d'ensemble des chantiers OMOTAL"
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard label="Chantiers actifs" value={kpis.active_chantiers}
                 sub={`/ ${kpis.total_chantiers} total`} icon={Building2} accent="primary"
                 dataTestId="kpi-active-chantiers" />
        {showFinance ? (
          <KpiCard label="Dépenses totales" value={formatMAD(kpis.sorties)}
                   sub={`Entrées: ${formatMAD(kpis.entrees)}`} icon={Wallet} accent="accent"
                   dataTestId="kpi-sorties" />
        ) : (
          <KpiCard label="Engins mobilisés" value="—" icon={Wallet} accent="accent" />
        )}
        <KpiCard label="Stock gasoil total" value={`${formatNumber(kpis.stock_gasoil_total, 0)} L`}
                 sub={kpis.stock_gasoil_total < 200 ? "Stock faible" : "OK"}
                 icon={Fuel} accent={kpis.stock_gasoil_total < 200 ? "danger" : "success"}
                 dataTestId="kpi-gasoil" />
        <KpiCard label="Alertes & Validations" value={kpis.alerts_critical + kpis.pending_validations}
                 sub={`${kpis.alerts_critical} critiques · ${kpis.pending_validations} à valider`}
                 icon={AlertTriangle} accent="warn"
                 dataTestId="kpi-alerts" />
      </div>

      {/* Chantiers grid */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-slate-900">Chantiers</h2>
          <Button variant="ghost" size="sm" onClick={() => navigate("/chantiers")} data-testid="see-all-chantiers">
            Voir tous <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {chantier_cards.map((c) => (
            <Card key={c.id} className="kpi-card-hover cursor-pointer"
                  onClick={() => navigate(`/chantiers/${c.id}`)}
                  data-testid={`chantier-card-${c.code}`}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="font-semibold text-slate-900">{c.name}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{c.code}</div>
                  </div>
                  <StatusBadge status={c.status} />
                </div>
                <div className="space-y-2 text-sm">
                  {showFinance && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Dépenses</span>
                      <span className="font-semibold">{formatMAD(c.sorties)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Stock gasoil</span>
                    <span className={`font-semibold ${c.low_stock ? "text-red-600" : "text-emerald-600"}`}>
                      {formatNumber(c.stock_gasoil, 0)} L
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Alertes</span>
                    <Badge variant={c.alerts > 0 ? "destructive" : "outline"} className="font-normal">
                      {c.alerts} alerte{c.alerts !== 1 ? "s" : ""}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Charts: categories + chantier comparison */}
      {showFinance && categories.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Dépenses par catégorie</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={categories} dataKey="total" nameKey="category" cx="50%" cy="50%"
                       innerRadius={50} outerRadius={100} paddingAngle={2}>
                    {categories.map((entry, idx) => (
                      <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => formatMAD(v)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Comparaison chantiers (dépenses)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={chantier_cards}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v) => formatMAD(v)} />
                  <Bar dataKey="sorties" fill="#f97316" name="Dépenses" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
