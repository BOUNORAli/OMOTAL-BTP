import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "@/lib/api";
import { PageHeader, KpiCard, LoadingState, StatusBadge } from "@/components/common";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatMAD, formatNumber, formatDate } from "@/lib/format";
import {
  ArrowLeft, Wallet, Fuel, Users, Truck, AlertTriangle, TrendingUp,
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area,
} from "recharts";
import { useAuth } from "@/contexts/AuthContext";
import { can } from "@/lib/permissions";

export default function ChantierDashboard() {
  const { chantierId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get(`/dashboard/chantier/${chantierId}`)
      .then((r) => setData(r.data))
      .finally(() => setLoading(false));
  }, [chantierId]);

  if (loading) return <LoadingState rows={6} />;
  if (!data || data.error) return <div>Chantier introuvable</div>;

  const { chantier, caisse, gasoil, engins, personnel, monthly_trend = [], alerts = [] } = data;
  const showFinance = can(user, "caisse.read");
  const showSalary = can(user, "personnel.read_salary");

  return (
    <div data-testid="chantier-dashboard">
      <Button variant="ghost" size="sm" onClick={() => navigate("/chantiers")} className="mb-3">
        <ArrowLeft className="h-4 w-4 mr-1" /> Retour aux chantiers
      </Button>

      <PageHeader
        title={chantier.name}
        description={`${chantier.code} · ${chantier.maitre_ouvrage || ""}`}
        actions={<StatusBadge status={chantier.status} />}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {showFinance ? (
          <>
            <KpiCard label="Entrées caisse" value={formatMAD(caisse.entrees)} icon={Wallet} accent="success" />
            <KpiCard label="Sorties caisse" value={formatMAD(caisse.sorties)} icon={Wallet} accent="accent" />
          </>
        ) : null}
        <KpiCard label="Stock gasoil" value={`${formatNumber(gasoil.stock, 0)} L`}
                 sub={`Prix moyen: ${formatMAD(gasoil.prix_moyen)}`}
                 icon={Fuel} accent={gasoil.low_stock ? "danger" : "success"} />
        <KpiCard label="Engins mobilisés" value={engins.count}
                 sub={showFinance ? `Restant: ${formatMAD(engins.restant)}` : undefined}
                 icon={Truck} accent="primary" />
        <KpiCard label="Personnel actif" value={personnel.count}
                 sub={showSalary ? `Salaire dû: ${formatMAD(personnel.salaire_du)}` : undefined}
                 icon={Users} accent="warn" />
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Vue générale</TabsTrigger>
          {showFinance && <TabsTrigger value="finance">Finance</TabsTrigger>}
          <TabsTrigger value="gasoil">Gasoil</TabsTrigger>
          {showSalary && <TabsTrigger value="personnel">Personnel</TabsTrigger>}
          <TabsTrigger value="engins">Engins</TabsTrigger>
          <TabsTrigger value="alerts">Alertes ({alerts.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4" /> Évolution mensuelle des dépenses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={monthly_trend}>
                  <defs>
                    <linearGradient id="depColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.45} />
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v) => formatMAD(v)} />
                  <Area type="monotone" dataKey="sorties" stroke="#f97316" fill="url(#depColor)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle className="text-base">Informations</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm">
                <Row label="Maître d'ouvrage" value={chantier.maitre_ouvrage} />
                <Row label="Localisation" value={chantier.localisation} />
                <Row label="Date début" value={formatDate(chantier.start_date)} />
                <Row label="Date fin prévue" value={formatDate(chantier.expected_end_date)} />
                {showFinance && <Row label="Montant marché HT" value={formatMAD(chantier.montant_marche_ht)} />}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base">Synthèse gasoil</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm">
                <Row label="Litres entrés" value={`${formatNumber(gasoil.entrees_l, 0)} L`} />
                <Row label="Litres sortis" value={`${formatNumber(gasoil.sorties_l, 0)} L`} />
                <Row label="Stock théorique" value={`${formatNumber(gasoil.stock, 0)} L`} />
                <Row label="Prix moyen" value={formatMAD(gasoil.prix_moyen)} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {showFinance && (
          <TabsContent value="finance">
            <Card>
              <CardContent className="pt-6 space-y-3">
                <Row label="Total entrées" value={formatMAD(caisse.entrees)} />
                <Row label="Total sorties" value={formatMAD(caisse.sorties)} />
                <Row label="Solde" value={formatMAD(caisse.solde)} bold />
                <Button variant="outline" onClick={() => navigate(`/caisse?chantier=${chantierId}`)} className="mt-2">
                  Voir transactions
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        <TabsContent value="gasoil">
          <Card>
            <CardContent className="pt-6 space-y-3">
              <Row label="Entrées validées" value={`${formatNumber(gasoil.entrees_l, 0)} L`} />
              <Row label="Sorties validées" value={`${formatNumber(gasoil.sorties_l, 0)} L`} />
              <Row label="Stock théorique" value={`${formatNumber(gasoil.stock, 0)} L`} bold />
              <Button variant="outline" onClick={() => navigate(`/gasoil?chantier=${chantierId}`)}>
                Gérer gasoil
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {showSalary && (
          <TabsContent value="personnel">
            <Card>
              <CardContent className="pt-6 space-y-3">
                <Row label="Employés actifs" value={personnel.count} />
                <Row label="Salaire dû" value={formatMAD(personnel.salaire_du)} />
                <Row label="Avances" value={formatMAD(personnel.avances)} />
                <Row label="Restant à payer" value={formatMAD(personnel.restant)} bold />
                <Button variant="outline" onClick={() => navigate(`/personnel?chantier=${chantierId}`)}>
                  Gérer personnel
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        <TabsContent value="engins">
          <Card>
            <CardContent className="pt-6 space-y-3">
              <Row label="Engins mobilisés" value={engins.count} />
              {showFinance && (<>
                <Row label="Montant dû total" value={formatMAD(engins.du)} />
                <Row label="Payé" value={formatMAD(engins.paye)} />
                <Row label="Restant" value={formatMAD(engins.restant)} bold />
              </>)}
              <Button variant="outline" onClick={() => navigate(`/engins?chantier=${chantierId}`)}>
                Gérer engins
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts">
          {alerts.length === 0 ? (
            <Card><CardContent className="py-8 text-center text-muted-foreground">Aucune alerte active</CardContent></Card>
          ) : (
            <div className="space-y-2">
              {alerts.map((a) => (
                <Card key={a.id}>
                  <CardContent className="py-4 flex items-start gap-3">
                    <div className={`h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      a.severity === "CRITICAL" ? "bg-red-100 text-red-600" :
                      a.severity === "HIGH" ? "bg-orange-100 text-orange-600" :
                      "bg-amber-100 text-amber-600"
                    }`}>
                      <AlertTriangle className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{a.title}</div>
                      <div className="text-sm text-muted-foreground">{a.message}</div>
                    </div>
                    <Badge variant="outline">{a.severity}</Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Row({ label, value, bold }) {
  return (
    <div className="flex justify-between items-baseline border-b border-slate-100 pb-2 last:border-b-0">
      <span className="text-muted-foreground">{label}</span>
      <span className={bold ? "font-bold text-slate-900" : "font-medium"}>{value || "—"}</span>
    </div>
  );
}
