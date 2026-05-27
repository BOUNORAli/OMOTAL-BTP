import React, { useEffect, useState, useMemo } from "react";
import api from "@/lib/api";
import { PageHeader, LoadingState, EmptyState, StatusBadge } from "@/components/common";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Truck, Plus, Save, FileSpreadsheet, CreditCard } from "lucide-react";
import { formatMAD, formatNumber, monthLabel, todayISO, formatDate } from "@/lib/format";
import { useChantier } from "@/contexts/ChantierContext";
import { useAuth } from "@/contexts/AuthContext";
import { can } from "@/lib/permissions";
import { toast } from "sonner";

function daysInMonth(y, m) { return new Date(y, m, 0).getDate(); }

export default function EnginsPage() {
  const { user } = useAuth();
  const { selectedId, chantiers } = useChantier();
  const [engins, setEngins] = useState([]);
  const [pointages, setPointages] = useState([]);
  const [paiements, setPaiements] = useState([]);
  const [loading, setLoading] = useState(true);
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [openEngin, setOpenEngin] = useState(false);
  const [openPayment, setOpenPayment] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = { chantier_id: selectedId || undefined };
      const [e, p, pay] = await Promise.all([
        api.get("/engins", { params }),
        api.get("/engins/pointage", { params: { ...params, year, month } }),
        api.get("/engins/paiements", { params }),
      ]);
      setEngins(e.data); setPointages(p.data); setPaiements(pay.data);
    } catch (e) { toast.error("Erreur de chargement"); }
    setLoading(false);
  };
  useEffect(() => { fetchData(); /* eslint-disable-next-line */ }, [selectedId, year, month]);

  const canCreate = user?.role === "SUPER_ADMIN" || user?.role === "RESPONSABLE_CHANTIER";
  const canPay = can(user, "engins.pay");
  const exportExcel = () => {
    const p = new URLSearchParams();
    if (selectedId) p.append("chantier_id", selectedId);
    p.append("year", year); p.append("month", month);
    api.get(`/excel/export/engins?${p}`, { responseType: "blob" }).then((r) => {
      const url = URL.createObjectURL(r.data);
      const a = document.createElement("a"); a.href = url; a.download = `engins_${year}_${month}.xlsx`; a.click();
    });
  };

  return (
    <div data-testid="engins-page">
      <PageHeader
        title="Engins"
        description={`Période : ${monthLabel(year, month)}`}
        actions={
          <div className="flex gap-2 flex-wrap">
            <Select value={String(month)} onValueChange={(v) => setMonth(parseInt(v))}>
              <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
              <SelectContent>
                {Array.from({ length: 12 }).map((_, i) => (
                  <SelectItem key={i + 1} value={String(i + 1)}>{monthLabel(year, i + 1).split(" ")[0]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={String(year)} onValueChange={(v) => setYear(parseInt(v))}>
              <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
              <SelectContent>{[2024, 2025, 2026, 2027].map((y) => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}</SelectContent>
            </Select>
            <Button variant="outline" onClick={exportExcel}><FileSpreadsheet className="h-4 w-4 mr-1" />Exporter</Button>
            {canCreate && <Button onClick={() => setOpenEngin(true)} data-testid="new-engin-btn"><Plus className="h-4 w-4 mr-1" />Nouvel engin</Button>}
          </div>
        }
      />

      <Tabs defaultValue="pointage">
        <TabsList>
          <TabsTrigger value="pointage">Pointage mensuel</TabsTrigger>
          <TabsTrigger value="engins">Engins ({engins.length})</TabsTrigger>
          <TabsTrigger value="paiements">Paiements ({paiements.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="pointage">
          {loading ? <LoadingState rows={3} /> :
            engins.length === 0 ? <EmptyState title="Aucun engin" icon={Truck} /> :
            <EnginPointageGrid engins={engins} pointages={pointages} year={year} month={month} onChanged={fetchData} />}
        </TabsContent>
        <TabsContent value="engins">
          {engins.length === 0 ? <EmptyState title="Aucun engin" icon={Truck} /> :
          <Card><CardContent className="p-0 overflow-x-auto"><Table>
            <TableHeader><TableRow>
              <TableHead>Désignation</TableHead><TableHead>Type</TableHead><TableHead>Mode fact.</TableHead>
              <TableHead className="text-right">Tarif</TableHead><TableHead>Statut</TableHead>
              <TableHead>Matricule</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {engins.map((e) => (
                <TableRow key={e.id}>
                  <TableCell className="font-medium">{e.name}</TableCell>
                  <TableCell><span className="text-xs px-2 py-0.5 rounded bg-slate-100">{e.type}</span></TableCell>
                  <TableCell>{e.facturation_mode}</TableCell>
                  <TableCell className="text-right">{formatMAD(e.tarif_horaire || e.tarif_journalier)}</TableCell>
                  <TableCell><StatusBadge status={e.status} /></TableCell>
                  <TableCell className="font-mono text-xs">{e.matricule || "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table></CardContent></Card>}
        </TabsContent>
        <TabsContent value="paiements">
          <div className="flex justify-end mb-3">
            {canPay && <Button onClick={() => setOpenPayment(true)}><CreditCard className="h-4 w-4 mr-1" />Nouveau paiement</Button>}
          </div>
          {paiements.length === 0 ? <EmptyState title="Aucun paiement" /> :
          <Card><CardContent className="p-0"><Table>
            <TableHeader><TableRow>
              <TableHead>Date</TableHead><TableHead>Engin</TableHead><TableHead>Période</TableHead>
              <TableHead className="text-right">Montant</TableHead><TableHead>Observation</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {paiements.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>{formatDate(p.date)}</TableCell>
                  <TableCell>{p.engin_name}</TableCell>
                  <TableCell className="text-xs">{p.period_ref || "—"}</TableCell>
                  <TableCell className="text-right font-semibold">{formatMAD(p.amount)}</TableCell>
                  <TableCell className="text-sm">{p.observation || "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table></CardContent></Card>}
        </TabsContent>
      </Tabs>

      <EnginDialog open={openEngin} onOpenChange={setOpenEngin} onSaved={() => { fetchData(); setOpenEngin(false); }}
                   defaultChantier={selectedId} chantiers={chantiers} />
      <PaymentDialog open={openPayment} onOpenChange={setOpenPayment} onSaved={() => { fetchData(); setOpenPayment(false); }}
                     engins={engins} defaultChantier={selectedId} />
    </div>
  );
}

function EnginPointageGrid({ engins, pointages, year, month, onChanged }) {
  const numDays = daysInMonth(year, month);
  const days = Array.from({ length: numDays }, (_, i) => i + 1);
  const ptMap = useMemo(() => { const m = {}; pointages.forEach((p) => m[p.engin_id] = p); return m; }, [pointages]);
  const [edits, setEdits] = useState({});
  const [saving, setSaving] = useState({});

  const getVal = (eid, day, mode) => {
    if (edits[eid]?.[day] !== undefined) return edits[eid][day];
    const pt = ptMap[eid];
    const e = pt?.entries?.find((x) => x.day === day);
    return mode === "JOUR" ? (e?.days_count ?? "") : (e?.hours ?? "");
  };
  const setVal = (eid, day, v) => {
    setEdits((p) => ({ ...p, [eid]: { ...(p[eid] || {}), [day]: v } }));
  };

  const saveRow = async (eng) => {
    setSaving((s) => ({ ...s, [eng.id]: true }));
    try {
      const existing = ptMap[eng.id];
      const entries = days.map((d) => {
        const editVal = edits[eng.id]?.[d];
        const existingEntry = existing?.entries?.find((x) => x.day === d);
        const val = editVal !== undefined ? (editVal === "" ? 0 : parseFloat(editVal)) :
                    (eng.facturation_mode === "JOUR" ? (existingEntry?.days_count || 0) : (existingEntry?.hours || 0));
        return eng.facturation_mode === "JOUR"
          ? { day: d, hours: 0, days_count: val }
          : { day: d, hours: val, days_count: 0 };
      });
      await api.post("/engins/pointage", {
        engin_id: eng.id, chantier_id: eng.chantier_id, year, month, entries,
      });
      toast.success(`Pointage ${eng.name} enregistré`);
      setEdits((p) => { const c = { ...p }; delete c[eng.id]; return c; });
      onChanged();
    } catch (e) { toast.error(e.response?.data?.detail || "Erreur"); }
    setSaving((s) => ({ ...s, [eng.id]: false }));
  };

  return (
    <Card><CardContent className="p-0 overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-[180px] sticky left-0 bg-white">Engin</TableHead>
            {days.map((d) => <TableHead key={d} className="text-center px-1">{d}</TableHead>)}
            <TableHead className="text-right whitespace-nowrap">Total</TableHead>
            <TableHead className="text-right whitespace-nowrap">Montant dû</TableHead>
            <TableHead className="text-right whitespace-nowrap">Restant</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {engins.map((eng) => {
            const pt = ptMap[eng.id];
            const isEdited = !!edits[eng.id];
            const totalLabel = eng.facturation_mode === "JOUR" ? `${pt?.total_days || 0}j` : `${pt?.total_hours || 0}h`;
            return (
              <TableRow key={eng.id}>
                <TableCell className="font-medium sticky left-0 bg-white">
                  <div>{eng.name}</div>
                  <div className="text-[11px] text-muted-foreground">{eng.facturation_mode}</div>
                </TableCell>
                {days.map((d) => (
                  <TableCell key={d} className="p-0.5">
                    <input
                      type="number" step="0.5" min="0" max={eng.facturation_mode === "JOUR" ? 1 : 24}
                      className="w-10 h-7 text-center text-xs border rounded"
                      value={getVal(eng.id, d, eng.facturation_mode)}
                      onChange={(e) => setVal(eng.id, d, e.target.value)}
                      data-testid={`engin-pointage-${eng.id}-${d}`}
                    />
                  </TableCell>
                ))}
                <TableCell className="text-right text-sm whitespace-nowrap">{totalLabel}</TableCell>
                <TableCell className="text-right text-sm">{formatMAD(pt?.montant_du)}</TableCell>
                <TableCell className="text-right font-semibold">{formatMAD(pt?.montant_restant)}</TableCell>
                <TableCell>
                  <Button size="sm" variant={isEdited ? "default" : "ghost"} disabled={saving[eng.id]}
                          onClick={() => saveRow(eng)}>
                    <Save className="h-3.5 w-3.5" />
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </CardContent></Card>
  );
}

function EnginDialog({ open, onOpenChange, onSaved, defaultChantier, chantiers }) {
  const [form, setForm] = useState({
    name: "", type: "PELLE", proprietaire: "", chantier_id: "",
    facturation_mode: "HEURE", tarif_horaire: "", tarif_journalier: "",
    matricule: "", status: "MOBILISE",
  });
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (open) setForm({
      name: "", type: "PELLE", proprietaire: "",
      chantier_id: defaultChantier || chantiers[0]?.id || "",
      facturation_mode: "HEURE", tarif_horaire: "", tarif_journalier: "",
      matricule: "", status: "MOBILISE",
    });
  }, [open, defaultChantier, chantiers]);
  const submit = async () => {
    if (!form.name) { toast.error("Désignation requise"); return; }
    setSaving(true);
    try {
      await api.post("/engins", { ...form,
        tarif_horaire: form.tarif_horaire ? parseFloat(form.tarif_horaire) : null,
        tarif_journalier: form.tarif_journalier ? parseFloat(form.tarif_journalier) : null,
      });
      toast.success("Engin créé");
      onSaved();
    } catch (e) { toast.error(e.response?.data?.detail || "Erreur"); }
    setSaving(false);
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader><DialogTitle>Nouvel engin</DialogTitle></DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Désignation *"><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} data-testid="engin-name" /></Field>
          <Field label="Type">
            <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {["PELLE","NIVELEUSE","TRACTOPELLE","CAMION","TOMBEREAU","VEHICULE","COMPACTEUR","BULLDOZER","AUTRE"].map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Chantier">
            <Select value={form.chantier_id} onValueChange={(v) => setForm({ ...form, chantier_id: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{chantiers.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Propriétaire / Loueur"><Input value={form.proprietaire} onChange={(e) => setForm({ ...form, proprietaire: e.target.value })} /></Field>
          <Field label="Mode facturation">
            <Select value={form.facturation_mode} onValueChange={(v) => setForm({ ...form, facturation_mode: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="HEURE">Heure</SelectItem>
                <SelectItem value="JOUR">Jour</SelectItem>
                <SelectItem value="FORFAIT">Forfait</SelectItem>
                <SelectItem value="INTERNE">Interne</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Matricule"><Input value={form.matricule} onChange={(e) => setForm({ ...form, matricule: e.target.value })} /></Field>
          {form.facturation_mode === "HEURE" && <Field label="Tarif horaire (MAD)"><Input type="number" value={form.tarif_horaire} onChange={(e) => setForm({ ...form, tarif_horaire: e.target.value })} /></Field>}
          {form.facturation_mode === "JOUR" && <Field label="Tarif journalier (MAD)"><Input type="number" value={form.tarif_journalier} onChange={(e) => setForm({ ...form, tarif_journalier: e.target.value })} /></Field>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
          <Button onClick={submit} disabled={saving}>Créer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function PaymentDialog({ open, onOpenChange, onSaved, engins, defaultChantier }) {
  const [form, setForm] = useState({
    engin_id: "", chantier_id: defaultChantier || "", date: todayISO(),
    amount: "", payment_mode: "BANQUE_OMOTAL", period_ref: "", observation: "",
  });
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (open) setForm({ engin_id: "", chantier_id: defaultChantier || "", date: todayISO(),
                        amount: "", payment_mode: "BANQUE_OMOTAL", period_ref: "", observation: "" });
  }, [open, defaultChantier]);
  const submit = async () => {
    if (!form.engin_id || !form.amount) { toast.error("Engin et montant requis"); return; }
    setSaving(true);
    try {
      const eng = engins.find((e) => e.id === form.engin_id);
      await api.post("/engins/paiements", { ...form,
        chantier_id: form.chantier_id || eng?.chantier_id,
        amount: parseFloat(form.amount),
      });
      toast.success("Paiement enregistré");
      onSaved();
    } catch (e) { toast.error(e.response?.data?.detail || "Erreur"); }
    setSaving(false);
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Nouveau paiement engin</DialogTitle></DialogHeader>
        <div className="grid grid-cols-1 gap-3">
          <Field label="Engin *">
            <Select value={form.engin_id} onValueChange={(v) => setForm({ ...form, engin_id: v })}>
              <SelectTrigger><SelectValue placeholder="Choisir" /></SelectTrigger>
              <SelectContent>{engins.map((e) => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Date"><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></Field>
          <Field label="Montant (MAD) *"><Input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} /></Field>
          <Field label="Période (ex: 2026-05)"><Input value={form.period_ref} onChange={(e) => setForm({ ...form, period_ref: e.target.value })} /></Field>
          <Field label="Mode">
            <Select value={form.payment_mode} onValueChange={(v) => setForm({ ...form, payment_mode: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="BANQUE_OMOTAL">Banque OMOTAL</SelectItem>
                <SelectItem value="ESPECES_OMOTAL">Espèces OMOTAL</SelectItem>
                <SelectItem value="AUTRE">Autre</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Observation"><Input value={form.observation} onChange={(e) => setForm({ ...form, observation: e.target.value })} /></Field>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
          <Button onClick={submit} disabled={saving}>Enregistrer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }) { return <div><Label className="text-xs mb-1 block">{label}</Label>{children}</div>; }
