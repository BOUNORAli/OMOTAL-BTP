import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import { PageHeader, KpiCard, LoadingState, EmptyState, StatusBadge } from "@/components/common";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Hammer, Plus, Check, X, MapPin, Gauge, Activity } from "lucide-react";
import { formatNumber, formatDate, todayISO } from "@/lib/format";
import { useChantier } from "@/contexts/ChantierContext";
import { useAuth } from "@/contexts/AuthContext";
import { can } from "@/lib/permissions";
import { toast } from "sonner";

const WORK_TYPES = [
  { v: "DECAPAGE", l: "Décapage" },
  { v: "REGLAGE", l: "Réglage" },
  { v: "DEBLAI", l: "Déblai" },
  { v: "REMBLAI", l: "Remblai" },
  { v: "COMPACTAGE", l: "Compactage" },
  { v: "TRANSPORT", l: "Transport" },
  { v: "AUTRE", l: "Autre" },
];

const UNITS = [
  { v: "M3", l: "m³" }, { v: "M2", l: "m²" },
  { v: "ML", l: "ml" }, { v: "U", l: "u" }, { v: "T", l: "t" },
];

export default function ProductionPage() {
  const { user } = useAuth();
  const { selectedId, chantiers } = useChantier();
  const [productions, setProductions] = useState([]);
  const [summary, setSummary] = useState(null);
  const [engins, setEngins] = useState([]);
  const [voies, setVoies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openCreate, setOpenCreate] = useState(false);

  const canCreate = can(user, "production.create");
  const canValidate = can(user, "production.validate");

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = { chantier_id: selectedId || undefined };
      const [p, s, e, v] = await Promise.all([
        api.get("/production", { params }),
        api.get("/production/summary", { params }),
        api.get("/engins", { params }),
        api.get("/production/voies", { params }),
      ]);
      setProductions(p.data); setSummary(s.data); setEngins(e.data); setVoies(v.data);
    } catch (e) { toast.error("Erreur de chargement"); }
    setLoading(false);
  };
  useEffect(() => { fetchData(); /* eslint-disable-next-line */ }, [selectedId]);

  const validate = async (id, action) => {
    let motif = null;
    if (action === "reject") { motif = prompt("Motif de rejet ?"); if (motif === null) return; }
    try {
      await api.post(`/production/${id}/status`, { status: action === "validate" ? "VALIDE" : "REJETE", motif });
      toast.success(action === "validate" ? "Production validée" : "Production rejetée");
      fetchData();
    } catch (e) { toast.error(e.response?.data?.detail || "Erreur"); }
  };

  return (
    <div data-testid="production-page">
      <PageHeader
        title="Production & Rendements"
        description="Saisie terrain et synthèses"
        actions={canCreate && (
          <Button onClick={() => setOpenCreate(true)} className="bg-orange-600 hover:bg-orange-700" data-testid="new-production-btn">
            <Plus className="h-4 w-4 mr-1" /> Nouvelle saisie
          </Button>
        )}
      />

      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <KpiCard label="Total m³" value={formatNumber(
            summary.by_unit?.find((u) => u.unit === "M3")?.total || 0, 0)} icon={Hammer} accent="primary" />
          <KpiCard label="Total m²" value={formatNumber(
            summary.by_unit?.find((u) => u.unit === "M2")?.total || 0, 0)} icon={MapPin} accent="accent" />
          <KpiCard label="Saisies validées" value={(summary.by_unit || []).reduce((s, u) => s + u.count, 0)} icon={Activity} accent="success" />
          <KpiCard label="Engins actifs (production)" value={summary.by_engin?.length || 0} icon={Gauge} accent="warn" />
        </div>
      )}

      <Tabs defaultValue="saisies">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="saisies">Saisies ({productions.length})</TabsTrigger>
          <TabsTrigger value="engins">Par engin</TabsTrigger>
          <TabsTrigger value="types">Par type de travail</TabsTrigger>
          <TabsTrigger value="voies">Par voie</TabsTrigger>
        </TabsList>
        <TabsContent value="saisies">
          {loading ? <LoadingState rows={5} /> :
            productions.length === 0 ? <EmptyState title="Aucune production" icon={Hammer} /> :
            <Card><CardContent className="p-0 overflow-x-auto"><Table>
              <TableHeader><TableRow>
                <TableHead>Date</TableHead><TableHead>Voie/Tronçon</TableHead>
                <TableHead>Type</TableHead><TableHead>Engin</TableHead>
                <TableHead className="text-right">Quantité</TableHead>
                <TableHead className="text-right">Heures</TableHead>
                <TableHead className="text-right">Rendement</TableHead>
                <TableHead>Statut</TableHead><TableHead></TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {productions.map((p) => (
                  <TableRow key={p.id} data-testid={`prod-row-${p.id}`}>
                    <TableCell className="whitespace-nowrap">{formatDate(p.date)}</TableCell>
                    <TableCell className="text-sm">
                      <div>{p.voie || "—"}</div>
                      <div className="text-xs text-muted-foreground">{p.tranche} {p.troncon}</div>
                    </TableCell>
                    <TableCell><Badge variant="outline">{p.work_type}</Badge></TableCell>
                    <TableCell>{p.engin_name || "—"}</TableCell>
                    <TableCell className="text-right font-medium">{formatNumber(p.quantity, 2)} {UNITS.find(u=>u.v===p.unit)?.l}</TableCell>
                    <TableCell className="text-right">{p.hours ? `${p.hours}h` : "—"}</TableCell>
                    <TableCell className="text-right">{p.rendement ? `${formatNumber(p.rendement, 1)}/h` : "—"}</TableCell>
                    <TableCell><StatusBadge status={p.status} /></TableCell>
                    <TableCell>
                      {p.status === "SOUMIS" && canValidate && (
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost" className="text-emerald-700" onClick={() => validate(p.id, "validate")} data-testid={`validate-prod-${p.id}`}>
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" className="text-red-600" onClick={() => validate(p.id, "reject")}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table></CardContent></Card>}
        </TabsContent>
        <TabsContent value="engins">
          <SummaryTable data={summary?.by_engin || []} cols={[
            { key: "engin_name", label: "Engin" },
            { key: "quantity", label: "Quantité", num: true },
            { key: "hours", label: "Heures", num: true },
            { key: "rendement", label: "Rendement/h", num: true },
            { key: "count", label: "Saisies", num: true },
          ]} />
        </TabsContent>
        <TabsContent value="types">
          <SummaryTable data={summary?.by_work_type || []} cols={[
            { key: "work_type", label: "Type de travail" },
            { key: "quantity", label: "Quantité", num: true },
            { key: "count", label: "Saisies", num: true },
          ]} />
        </TabsContent>
        <TabsContent value="voies">
          <SummaryTable data={summary?.by_voie || []} cols={[
            { key: "voie", label: "Voie" },
            { key: "quantity", label: "Quantité", num: true },
            { key: "count", label: "Saisies", num: true },
          ]} />
        </TabsContent>
      </Tabs>

      <ProductionDialog open={openCreate} onOpenChange={setOpenCreate}
                        onSaved={() => { fetchData(); setOpenCreate(false); }}
                        defaultChantier={selectedId} chantiers={chantiers}
                        engins={engins} voies={voies} />
    </div>
  );
}

function SummaryTable({ data, cols }) {
  if (!data?.length) return <EmptyState title="Aucune donnée" />;
  return (
    <Card><CardContent className="p-0 overflow-x-auto"><Table>
      <TableHeader><TableRow>
        {cols.map((c) => <TableHead key={c.key} className={c.num ? "text-right" : ""}>{c.label}</TableHead>)}
      </TableRow></TableHeader>
      <TableBody>
        {data.map((row, i) => (
          <TableRow key={i}>
            {cols.map((c) => (
              <TableCell key={c.key} className={c.num ? "text-right" : ""}>
                {c.num ? formatNumber(row[c.key], 2) : (row[c.key] || "—")}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table></CardContent></Card>
  );
}

export function ProductionDialog({ open, onOpenChange, onSaved, defaultChantier, chantiers, engins, voies, fullscreen }) {
  const [form, setForm] = useState({
    chantier_id: "", date: todayISO(), voie: "", tranche: "", troncon: "",
    work_type: "DECAPAGE", engin_id: "", unit: "M3",
    length: "", width: "", depth: "", quantity: "", hours: "", observation: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) setForm((f) => ({
      ...f, chantier_id: defaultChantier || (chantiers?.[0]?.id) || "", date: todayISO(),
      voie: "", tranche: "", troncon: "", engin_id: "",
      length: "", width: "", depth: "", quantity: "", hours: "", observation: "",
    }));
  }, [open, defaultChantier, chantiers]);

  const computedQty = (() => {
    if (form.quantity) return parseFloat(form.quantity);
    const L = parseFloat(form.length) || 0;
    const W = parseFloat(form.width) || 0;
    const D = parseFloat(form.depth) || 0;
    if (form.unit === "M3") return L * W * D;
    if (form.unit === "M2") return L * W;
    if (form.unit === "ML") return L;
    return 0;
  })();

  const submit = async () => {
    if (!form.chantier_id) { toast.error("Chantier requis"); return; }
    if (computedQty <= 0) { toast.error("Quantité ou dimensions requises"); return; }
    setSaving(true);
    try {
      const payload = { ...form,
        length: form.length ? parseFloat(form.length) : null,
        width: form.width ? parseFloat(form.width) : null,
        depth: form.depth ? parseFloat(form.depth) : null,
        quantity: form.quantity ? parseFloat(form.quantity) : null,
        hours: form.hours ? parseFloat(form.hours) : null,
      };
      await api.post("/production", payload);
      toast.success("Production soumise");
      onSaved();
    } catch (e) { toast.error(e.response?.data?.detail || "Erreur"); }
    setSaving(false);
  };

  const chantierEngins = (engins || []).filter((e) => !form.chantier_id || e.chantier_id === form.chantier_id);
  const chantierVoies = (voies || []).filter((v) => !form.chantier_id || v.chantier_id === form.chantier_id);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`${fullscreen ? "max-w-full h-[95vh] flex flex-col" : "max-w-2xl"} max-h-[95vh] overflow-y-auto`}>
        <DialogHeader><DialogTitle>Nouvelle saisie production</DialogTitle></DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Field label="Chantier *">
            <Select value={form.chantier_id} onValueChange={(v) => setForm({ ...form, chantier_id: v })}>
              <SelectTrigger><SelectValue placeholder="Choisir" /></SelectTrigger>
              <SelectContent>{(chantiers || []).map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Date"><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></Field>
          <Field label="Voie">
            <Input value={form.voie} onChange={(e) => setForm({ ...form, voie: e.target.value })} list="voies-list" placeholder="Ex: Voie 1" data-testid="prod-voie" />
            <datalist id="voies-list">
              {chantierVoies.map((v) => <option key={v.id} value={v.name} />)}
            </datalist>
          </Field>
          <Field label="Tranche / Tronçon">
            <div className="grid grid-cols-2 gap-2">
              <Input value={form.tranche} onChange={(e) => setForm({ ...form, tranche: e.target.value })} placeholder="Tranche" />
              <Input value={form.troncon} onChange={(e) => setForm({ ...form, troncon: e.target.value })} placeholder="Tronçon" />
            </div>
          </Field>
          <Field label="Type de travail">
            <Select value={form.work_type} onValueChange={(v) => setForm({ ...form, work_type: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{WORK_TYPES.map((w) => <SelectItem key={w.v} value={w.v}>{w.l}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Engin">
            <Select value={form.engin_id || "none"} onValueChange={(v) => setForm({ ...form, engin_id: v === "none" ? "" : v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">— Aucun —</SelectItem>
                {chantierEngins.map((e) => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Unité">
            <Select value={form.unit} onValueChange={(v) => setForm({ ...form, unit: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{UNITS.map((u) => <SelectItem key={u.v} value={u.v}>{u.l}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Heures travaillées">
            <Input type="number" step="0.5" value={form.hours} onChange={(e) => setForm({ ...form, hours: e.target.value })} />
          </Field>
          {(form.unit === "M3" || form.unit === "M2" || form.unit === "ML") && (
            <div className="md:col-span-2 p-3 bg-slate-50 rounded-lg">
              <div className="text-xs font-medium text-muted-foreground mb-2">Dimensions (calcul auto)</div>
              <div className="grid grid-cols-3 gap-2">
                <Field label="Longueur (m)"><Input type="number" step="0.01" value={form.length} onChange={(e) => setForm({ ...form, length: e.target.value })} data-testid="prod-length" /></Field>
                {form.unit !== "ML" && <Field label="Largeur (m)"><Input type="number" step="0.01" value={form.width} onChange={(e) => setForm({ ...form, width: e.target.value })} data-testid="prod-width" /></Field>}
                {form.unit === "M3" && <Field label="Profondeur (m)"><Input type="number" step="0.01" value={form.depth} onChange={(e) => setForm({ ...form, depth: e.target.value })} data-testid="prod-depth" /></Field>}
              </div>
            </div>
          )}
          <Field label="Quantité manuelle (sinon calcul auto)">
            <Input type="number" step="0.01" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} placeholder={`Calculé: ${formatNumber(computedQty, 2)}`} data-testid="prod-quantity" />
          </Field>
          <div className="md:col-span-2 p-3 bg-primary/5 rounded-lg flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Quantité à enregistrer</span>
            <span className="text-xl font-bold text-primary">{formatNumber(computedQty, 2)} {UNITS.find(u=>u.v===form.unit)?.l}</span>
          </div>
          <div className="md:col-span-2">
            <Field label="Observation"><Textarea value={form.observation} onChange={(e) => setForm({ ...form, observation: e.target.value })} rows={2} /></Field>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
          <Button onClick={submit} disabled={saving} data-testid="prod-save">Soumettre</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }) { return <div><Label className="text-xs mb-1 block">{label}</Label>{children}</div>; }
