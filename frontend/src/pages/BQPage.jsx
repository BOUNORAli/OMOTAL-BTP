import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import { PageHeader, KpiCard, LoadingState, EmptyState } from "@/components/common";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ListChecks, Plus, Edit, TrendingUp, TrendingDown, Target } from "lucide-react";
import { formatMAD, formatNumber } from "@/lib/format";
import { useChantier } from "@/contexts/ChantierContext";
import { useAuth } from "@/contexts/AuthContext";
import { can } from "@/lib/permissions";
import { toast } from "sonner";

export default function BQPage() {
  const { user } = useAuth();
  const { selectedId } = useChantier();
  const [articles, setArticles] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openCreate, setOpenCreate] = useState(false);
  const [editing, setEditing] = useState(null);

  const canEdit = user?.role === "SUPER_ADMIN" || user?.role === "DIRECTEUR" || user?.role === "COMPTABLE";
  const canSeeMarge = user?.role === "SUPER_ADMIN" || user?.role === "DIRECTEUR";

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = { chantier_id: selectedId || undefined };
      const [a, s] = await Promise.all([
        api.get("/bq/articles", { params }),
        api.get("/bq/summary", { params }),
      ]);
      setArticles(a.data); setSummary(s.data);
    } catch (e) { toast.error("Erreur de chargement"); }
    setLoading(false);
  };
  useEffect(() => { fetchData(); /* eslint-disable-next-line */ }, [selectedId]);

  return (
    <div data-testid="bq-page">
      <PageHeader
        title="BQ & Rentabilité"
        description={selectedId ? "Bordereau et marge du chantier" : "Vue consolidée des chantiers"}
        actions={canEdit && selectedId && (
          <Button onClick={() => { setEditing(null); setOpenCreate(true); }} data-testid="new-bq-article-btn">
            <Plus className="h-4 w-4 mr-1" /> Nouvel article
          </Button>
        )}
      />

      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <KpiCard label="Articles BQ" value={summary.count_articles} icon={ListChecks} accent="primary" />
          <KpiCard label="Montant marché HT" value={formatMAD(summary.total_marche_ht)} icon={Target} accent="primary" />
          <KpiCard label="Réalisé HT"
                   value={formatMAD(summary.total_realise_ht)}
                   sub={`Avancement: ${summary.avancement_global}%`}
                   icon={TrendingUp} accent="success" />
          {canSeeMarge && summary.marge_reelle !== undefined ? (
            <KpiCard label="Marge réelle"
                     value={formatMAD(summary.marge_reelle)}
                     sub={`Taux: ${summary.taux_marge_reel}%`}
                     icon={summary.marge_reelle >= 0 ? TrendingUp : TrendingDown}
                     accent={summary.marge_reelle >= 0 ? "success" : "danger"}
                     dataTestId="kpi-marge-reelle" />
          ) : (
            <KpiCard label="Accès restreint" value="—" sub="Marge: directeur uniquement" icon={Target} />
          )}
        </div>
      )}

      {loading ? <LoadingState rows={5} /> :
        articles.length === 0 ? (
          <EmptyState
            title="Aucun article BQ"
            description={canEdit && selectedId ? "Créez votre premier article pour suivre le BQ." : "Sélectionnez un chantier ou créez des articles"}
            icon={ListChecks}
          />
        ) : (
          <Card>
            <CardContent className="p-0 overflow-x-auto">
              <Table>
                <TableHeader><TableRow>
                  <TableHead>N°</TableHead>
                  <TableHead>Désignation</TableHead>
                  <TableHead>Unité</TableHead>
                  <TableHead className="text-right">Qté marché</TableHead>
                  <TableHead className="text-right">Qté réalisée</TableHead>
                  <TableHead className="text-right">Avancement</TableHead>
                  <TableHead className="text-right">PU HT</TableHead>
                  <TableHead className="text-right">Montant réalisé</TableHead>
                  {canSeeMarge && <>
                    <TableHead className="text-right">PR prévu</TableHead>
                    <TableHead className="text-right">Coût réel</TableHead>
                    <TableHead className="text-right">Marge réelle</TableHead>
                  </>}
                  {canEdit && <TableHead></TableHead>}
                </TableRow></TableHeader>
                <TableBody>
                  {articles.map((a) => {
                    const avPct = a.avancement || 0;
                    return (
                      <TableRow key={a.id} data-testid={`bq-row-${a.numero}`}>
                        <TableCell className="font-mono text-xs">{a.numero}</TableCell>
                        <TableCell className="max-w-[280px]">{a.designation}</TableCell>
                        <TableCell>{a.unit}</TableCell>
                        <TableCell className="text-right">{formatNumber(a.quantity_marche, 2)}</TableCell>
                        <TableCell className="text-right font-medium">{formatNumber(a.quantity_realisee, 2)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center gap-2 justify-end">
                            <span className={`text-xs font-semibold ${avPct >= 100 ? "text-emerald-700" : avPct >= 50 ? "text-amber-700" : "text-slate-600"}`}>
                              {avPct}%
                            </span>
                            <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div className={`h-full ${avPct >= 100 ? "bg-emerald-500" : avPct >= 50 ? "bg-amber-500" : "bg-primary"}`}
                                   style={{ width: `${Math.min(avPct, 100)}%` }} />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">{formatMAD(a.pu_marche_ht)}</TableCell>
                        <TableCell className="text-right font-semibold">{formatMAD(a.montant_realise)}</TableCell>
                        {canSeeMarge && <>
                          <TableCell className="text-right">{formatMAD(a.pr_total)}</TableCell>
                          <TableCell className="text-right">{formatMAD(a.cout_reel)}</TableCell>
                          <TableCell className={`text-right font-bold ${a.marge_reelle >= 0 ? "text-emerald-700" : "text-red-600"}`}>{formatMAD(a.marge_reelle)}</TableCell>
                        </>}
                        {canEdit && (
                          <TableCell>
                            <Button size="sm" variant="ghost" onClick={() => { setEditing(a); setOpenCreate(true); }}>
                              <Edit className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

      <BQArticleDialog open={openCreate} onOpenChange={setOpenCreate}
                       article={editing} canSeeMarge={canSeeMarge}
                       defaultChantier={selectedId}
                       onSaved={() => { fetchData(); setOpenCreate(false); }} />
    </div>
  );
}

function BQArticleDialog({ open, onOpenChange, article, canSeeMarge, defaultChantier, onSaved }) {
  const [form, setForm] = useState({
    numero: "", designation: "", unit: "M3", quantity_marche: "", pu_marche_ht: "",
    pr_main_oeuvre: 0, pr_materiaux: 0, pr_engins: 0, pr_sous_traitance: 0, frais_generaux: 0,
    quantity_realisee: "", cout_reel: "",
  });
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (article) setForm({
      numero: article.numero, designation: article.designation, unit: article.unit,
      quantity_marche: article.quantity_marche, pu_marche_ht: article.pu_marche_ht,
      pr_main_oeuvre: article.pr_main_oeuvre || 0,
      pr_materiaux: article.pr_materiaux || 0,
      pr_engins: article.pr_engins || 0,
      pr_sous_traitance: article.pr_sous_traitance || 0,
      frais_generaux: article.frais_generaux || 0,
      quantity_realisee: article.quantity_realisee || 0,
      cout_reel: article.cout_reel || 0,
    });
    else if (open) setForm({ numero: "", designation: "", unit: "M3",
      quantity_marche: "", pu_marche_ht: "", pr_main_oeuvre: 0, pr_materiaux: 0,
      pr_engins: 0, pr_sous_traitance: 0, frais_generaux: 0,
      quantity_realisee: "", cout_reel: "" });
  }, [article, open]);

  const submit = async () => {
    if (!form.numero || !form.designation || !form.quantity_marche || !form.pu_marche_ht) {
      toast.error("N°, désignation, quantité et PU requis"); return;
    }
    setSaving(true);
    try {
      const payload = { ...form,
        quantity_marche: parseFloat(form.quantity_marche),
        pu_marche_ht: parseFloat(form.pu_marche_ht),
        pr_main_oeuvre: parseFloat(form.pr_main_oeuvre) || 0,
        pr_materiaux: parseFloat(form.pr_materiaux) || 0,
        pr_engins: parseFloat(form.pr_engins) || 0,
        pr_sous_traitance: parseFloat(form.pr_sous_traitance) || 0,
        frais_generaux: parseFloat(form.frais_generaux) || 0,
        quantity_realisee: form.quantity_realisee ? parseFloat(form.quantity_realisee) : undefined,
        cout_reel: form.cout_reel ? parseFloat(form.cout_reel) : undefined,
      };
      if (article) await api.patch(`/bq/articles/${article.id}`, payload);
      else await api.post("/bq/articles", { ...payload, chantier_id: defaultChantier });
      toast.success(article ? "Article modifié" : "Article créé");
      onSaved();
    } catch (e) { toast.error(e.response?.data?.detail || "Erreur"); }
    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[95vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{article ? "Modifier article BQ" : "Nouvel article BQ"}</DialogTitle></DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Field label="N° article *"><Input value={form.numero} onChange={(e) => setForm({ ...form, numero: e.target.value })} data-testid="bq-numero" /></Field>
          <Field label="Unité">
            <Select value={form.unit} onValueChange={(v) => setForm({ ...form, unit: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="M3">m³</SelectItem>
                <SelectItem value="M2">m²</SelectItem>
                <SelectItem value="ML">ml</SelectItem>
                <SelectItem value="U">u</SelectItem>
                <SelectItem value="T">tonne</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Quantité marché *"><Input type="number" step="0.01" value={form.quantity_marche} onChange={(e) => setForm({ ...form, quantity_marche: e.target.value })} /></Field>
          <div className="md:col-span-3">
            <Field label="Désignation *"><Input value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} data-testid="bq-designation" /></Field>
          </div>
          <Field label="PU marché HT *"><Input type="number" step="0.01" value={form.pu_marche_ht} onChange={(e) => setForm({ ...form, pu_marche_ht: e.target.value })} /></Field>
          <Field label="Quantité réalisée"><Input type="number" step="0.01" value={form.quantity_realisee} onChange={(e) => setForm({ ...form, quantity_realisee: e.target.value })} /></Field>
          <Field label="Coût réel"><Input type="number" step="0.01" value={form.cout_reel} onChange={(e) => setForm({ ...form, cout_reel: e.target.value })} /></Field>

          {canSeeMarge && (
            <div className="md:col-span-3 p-3 bg-slate-50 rounded-lg">
              <div className="text-xs font-medium text-muted-foreground mb-2">Prix de revient prévisionnel</div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                <Field label="Main d'œuvre"><Input type="number" value={form.pr_main_oeuvre} onChange={(e) => setForm({ ...form, pr_main_oeuvre: e.target.value })} /></Field>
                <Field label="Matériaux"><Input type="number" value={form.pr_materiaux} onChange={(e) => setForm({ ...form, pr_materiaux: e.target.value })} /></Field>
                <Field label="Engins"><Input type="number" value={form.pr_engins} onChange={(e) => setForm({ ...form, pr_engins: e.target.value })} /></Field>
                <Field label="Sous-traitance"><Input type="number" value={form.pr_sous_traitance} onChange={(e) => setForm({ ...form, pr_sous_traitance: e.target.value })} /></Field>
                <Field label="Frais généraux"><Input type="number" value={form.frais_generaux} onChange={(e) => setForm({ ...form, frais_generaux: e.target.value })} /></Field>
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
          <Button onClick={submit} disabled={saving} data-testid="bq-save">Enregistrer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }) { return <div><Label className="text-xs mb-1 block">{label}</Label>{children}</div>; }
