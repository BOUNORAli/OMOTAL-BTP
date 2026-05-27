import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import { PageHeader, KpiCard, LoadingState, EmptyState, StatusBadge } from "@/components/common";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Fuel, Plus, Check, X, FileSpreadsheet, Droplet, TrendingDown } from "lucide-react";
import { formatMAD, formatNumber, formatDate, todayISO } from "@/lib/format";
import { useAuth } from "@/contexts/AuthContext";
import { useChantier } from "@/contexts/ChantierContext";
import { can } from "@/lib/permissions";
import { toast } from "sonner";

export default function GasoilPage() {
  const { user } = useAuth();
  const { selectedId, chantiers } = useChantier();
  const [entrees, setEntrees] = useState([]);
  const [sorties, setSorties] = useState([]);
  const [stock, setStock] = useState(null);
  const [engins, setEngins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openEntree, setOpenEntree] = useState(false);
  const [openSortie, setOpenSortie] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = { chantier_id: selectedId || undefined };
      const [e, s, st, eng] = await Promise.all([
        api.get("/gasoil/entrees", { params }),
        api.get("/gasoil/sorties", { params }),
        api.get("/gasoil/stock", { params }),
        api.get("/engins", { params }),
      ]);
      setEntrees(e.data); setSorties(s.data); setStock(st.data); setEngins(eng.data);
    } catch (e) { toast.error("Erreur de chargement"); }
    setLoading(false);
  };
  useEffect(() => { fetchData(); /* eslint-disable-next-line */ }, [selectedId]);

  const validateSortie = async (id) => {
    try { await api.post(`/gasoil/sorties/${id}/status`, { status: "VALIDE" });
      toast.success("Sortie validée"); fetchData(); }
    catch (e) { toast.error(e.response?.data?.detail || "Erreur"); }
  };
  const rejectSortie = async (id) => {
    const motif = prompt("Motif de rejet ?");
    if (motif === null) return;
    try { await api.post(`/gasoil/sorties/${id}/status`, { status: "REJETE", motif });
      toast.success("Sortie rejetée"); fetchData(); }
    catch (e) { toast.error(e.response?.data?.detail || "Erreur"); }
  };

  const exportExcel = () => {
    const params = new URLSearchParams();
    if (selectedId) params.append("chantier_id", selectedId);
    api.get(`/excel/export/gasoil?${params}`, { responseType: "blob" }).then((r) => {
      const url = URL.createObjectURL(r.data);
      const a = document.createElement("a"); a.href = url; a.download = `gasoil_${todayISO()}.xlsx`; a.click();
    });
  };

  const canEntree = can(user, "gasoil.create_entree");
  const canSortie = can(user, "gasoil.create_sortie");
  const canValidate = can(user, "gasoil.validate");

  return (
    <div data-testid="gasoil-page">
      <PageHeader
        title="Gasoil"
        description="Suivi entrées, sorties et stock théorique"
        actions={
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" onClick={exportExcel}><FileSpreadsheet className="h-4 w-4 mr-1" />Exporter</Button>
            {canEntree && <Button onClick={() => setOpenEntree(true)} data-testid="new-entree-btn"><Plus className="h-4 w-4 mr-1" />Entrée gasoil</Button>}
            {canSortie && <Button onClick={() => setOpenSortie(true)} className="bg-orange-600 hover:bg-orange-700" data-testid="new-sortie-btn"><Plus className="h-4 w-4 mr-1" />Sortie gasoil</Button>}
          </div>
        }
      />

      {stock && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <KpiCard label="Stock théorique" value={`${formatNumber(stock.stock_theorique, 0)} L`}
                   icon={Droplet} accent={stock.low_stock ? "danger" : "success"}
                   sub={stock.low_stock ? "⚠ Stock bas" : "OK"} dataTestId="kpi-stock" />
          <KpiCard label="Entrées totales" value={`${formatNumber(stock.entrees_litres, 0)} L`}
                   sub={formatMAD(stock.entrees_amount)} icon={Fuel} accent="primary" />
          <KpiCard label="Sorties totales" value={`${formatNumber(stock.sorties_litres, 0)} L`}
                   sub={formatMAD(stock.sorties_amount)} icon={TrendingDown} accent="accent" />
          <KpiCard label="Prix moyen" value={formatMAD(stock.average_price)}
                   sub={`${stock.pending_sorties} sortie(s) en attente`} icon={Fuel} accent="warn" />
        </div>
      )}

      <Tabs defaultValue="sorties">
        <TabsList>
          <TabsTrigger value="sorties">Sorties ({sorties.length})</TabsTrigger>
          <TabsTrigger value="entrees">Entrées ({entrees.length})</TabsTrigger>
          <TabsTrigger value="engins">Par engin</TabsTrigger>
        </TabsList>
        <TabsContent value="sorties">
          {loading ? <LoadingState rows={4} /> :
            sorties.length === 0 ? <EmptyState title="Aucune sortie" icon={Fuel} /> :
            <Card><CardContent className="p-0 overflow-x-auto"><Table>
              <TableHeader><TableRow>
                <TableHead>Date</TableHead><TableHead>BS</TableHead>
                <TableHead>Engin</TableHead><TableHead>Affectation</TableHead>
                <TableHead className="text-right">Litres</TableHead>
                <TableHead className="text-right">Montant</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Saisi par</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {sorties.map((s) => (
                  <TableRow key={s.id} data-testid={`sortie-row-${s.id}`}>
                    <TableCell>{formatDate(s.date)}</TableCell>
                    <TableCell className="font-mono text-xs">{s.bs_number || "—"}</TableCell>
                    <TableCell>{s.engin_name || "—"}</TableCell>
                    <TableCell><span className="text-xs px-2 py-0.5 rounded bg-slate-100">{s.affectation}</span></TableCell>
                    <TableCell className="text-right font-medium">{formatNumber(s.litres, 0)} L</TableCell>
                    <TableCell className="text-right">{formatMAD(s.total_amount)}</TableCell>
                    <TableCell><StatusBadge status={s.status} /></TableCell>
                    <TableCell className="text-xs">{s.created_by_name || "—"}</TableCell>
                    <TableCell className="text-right">
                      {s.status === "SOUMIS" && canValidate && (
                        <div className="flex justify-end gap-1">
                          <Button size="sm" variant="ghost" className="text-emerald-700" onClick={() => validateSortie(s.id)} data-testid={`validate-sortie-${s.id}`}>
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" className="text-red-600" onClick={() => rejectSortie(s.id)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table></CardContent></Card>
          }
        </TabsContent>
        <TabsContent value="entrees">
          {loading ? <LoadingState rows={4} /> :
            entrees.length === 0 ? <EmptyState title="Aucune entrée" icon={Fuel} /> :
            <Card><CardContent className="p-0 overflow-x-auto"><Table>
              <TableHeader><TableRow>
                <TableHead>Date</TableHead><TableHead>Fournisseur</TableHead>
                <TableHead className="text-right">Litres</TableHead>
                <TableHead className="text-right">PU</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>BR</TableHead><TableHead>Saisi par</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {entrees.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell>{formatDate(e.date)}</TableCell>
                    <TableCell>{e.fournisseur || "—"}</TableCell>
                    <TableCell className="text-right font-medium">{formatNumber(e.litres, 0)} L</TableCell>
                    <TableCell className="text-right">{formatMAD(e.unit_price)}</TableCell>
                    <TableCell className="text-right font-semibold">{formatMAD(e.total_amount)}</TableCell>
                    <TableCell className="font-mono text-xs">{e.br_number || "—"}</TableCell>
                    <TableCell className="text-xs">{e.created_by_name || "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table></CardContent></Card>
          }
        </TabsContent>
        <TabsContent value="engins">
          <Card><CardContent className="p-0 overflow-x-auto">
            {!stock || stock.by_engin.length === 0 ? <div className="py-8 text-center text-muted-foreground">Aucune donnée</div> :
            <Table>
              <TableHeader><TableRow>
                <TableHead>Engin</TableHead>
                <TableHead className="text-right">Litres consommés</TableHead>
                <TableHead className="text-right">Coût total</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {stock.by_engin.map((b) => (
                  <TableRow key={b.engin_id}>
                    <TableCell className="font-medium">{b.engin_name}</TableCell>
                    <TableCell className="text-right">{formatNumber(b.litres, 0)} L</TableCell>
                    <TableCell className="text-right">{formatMAD(b.amount)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>}
          </CardContent></Card>
        </TabsContent>
      </Tabs>

      <EntreeDialog open={openEntree} onOpenChange={setOpenEntree} onSaved={() => { fetchData(); setOpenEntree(false); }}
                    defaultChantier={selectedId} chantiers={chantiers} />
      <SortieDialog open={openSortie} onOpenChange={setOpenSortie} onSaved={() => { fetchData(); setOpenSortie(false); }}
                    defaultChantier={selectedId} chantiers={chantiers} engins={engins} />
    </div>
  );
}

function EntreeDialog({ open, onOpenChange, onSaved, defaultChantier, chantiers }) {
  const [form, setForm] = useState({
    chantier_id: "", date: todayISO(), fournisseur: "", litres: "",
    unit_price: "", br_number: "", bon_fournisseur: "", observation: "",
  });
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (open) setForm((f) => ({ ...f, chantier_id: defaultChantier || (chantiers[0]?.id) || "", date: todayISO() }));
  }, [open, defaultChantier, chantiers]);

  const submit = async () => {
    if (!form.chantier_id || !form.litres || !form.unit_price) {
      toast.error("Chantier, litres et PU requis"); return;
    }
    setSaving(true);
    try {
      await api.post("/gasoil/entrees", {
        ...form, litres: parseFloat(form.litres), unit_price: parseFloat(form.unit_price),
      });
      toast.success("Entrée gasoil enregistrée");
      onSaved();
    } catch (e) { toast.error(e.response?.data?.detail || "Erreur"); }
    setSaving(false);
  };

  const total = (parseFloat(form.litres) || 0) * (parseFloat(form.unit_price) || 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader><DialogTitle>Nouvelle entrée gasoil</DialogTitle></DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Chantier *">
            <Select value={form.chantier_id} onValueChange={(v) => setForm({ ...form, chantier_id: v })}>
              <SelectTrigger><SelectValue placeholder="Choisir" /></SelectTrigger>
              <SelectContent>{chantiers.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Date"><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></Field>
          <Field label="Fournisseur / Station"><Input value={form.fournisseur} onChange={(e) => setForm({ ...form, fournisseur: e.target.value })} /></Field>
          <Field label="N° BR"><Input value={form.br_number} onChange={(e) => setForm({ ...form, br_number: e.target.value })} /></Field>
          <Field label="Litres *"><Input type="number" value={form.litres} onChange={(e) => setForm({ ...form, litres: e.target.value })} /></Field>
          <Field label="Prix unitaire (MAD/L) *"><Input type="number" step="0.01" value={form.unit_price} onChange={(e) => setForm({ ...form, unit_price: e.target.value })} /></Field>
          <div className="col-span-2 p-3 bg-slate-50 rounded-lg flex justify-between">
            <span className="text-sm text-muted-foreground">Total calculé</span>
            <span className="font-bold">{formatMAD(total)}</span>
          </div>
          <div className="col-span-2">
            <Field label="Observation"><Textarea value={form.observation} onChange={(e) => setForm({ ...form, observation: e.target.value })} rows={2} /></Field>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
          <Button onClick={submit} disabled={saving}>Enregistrer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SortieDialog({ open, onOpenChange, onSaved, defaultChantier, chantiers, engins }) {
  const [form, setForm] = useState({
    chantier_id: "", date: todayISO(), bs_number: "", engin_id: "",
    affectation: "PRODUCTION", litres: "", observation: "",
  });
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (open) setForm((f) => ({ ...f, chantier_id: defaultChantier || (chantiers[0]?.id) || "", date: todayISO() }));
  }, [open, defaultChantier, chantiers]);

  const submit = async () => {
    if (!form.chantier_id || !form.engin_id || !form.litres) {
      toast.error("Chantier, engin et litres requis"); return;
    }
    setSaving(true);
    try {
      await api.post("/gasoil/sorties", { ...form, litres: parseFloat(form.litres) });
      toast.success("Sortie soumise pour validation");
      onSaved();
    } catch (e) { toast.error(e.response?.data?.detail || "Erreur"); }
    setSaving(false);
  };

  const chantierEngins = engins.filter((e) => !form.chantier_id || e.chantier_id === form.chantier_id);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader><DialogTitle>Nouvelle sortie gasoil</DialogTitle></DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Chantier *">
            <Select value={form.chantier_id} onValueChange={(v) => setForm({ ...form, chantier_id: v, engin_id: "" })}>
              <SelectTrigger><SelectValue placeholder="Choisir" /></SelectTrigger>
              <SelectContent>{chantiers.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Date"><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></Field>
          <Field label="Engin *">
            <Select value={form.engin_id} onValueChange={(v) => setForm({ ...form, engin_id: v })}>
              <SelectTrigger><SelectValue placeholder="Choisir un engin" /></SelectTrigger>
              <SelectContent>{chantierEngins.map((e) => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="N° BS"><Input value={form.bs_number} onChange={(e) => setForm({ ...form, bs_number: e.target.value })} /></Field>
          <Field label="Litres *"><Input type="number" value={form.litres} onChange={(e) => setForm({ ...form, litres: e.target.value })} data-testid="sortie-litres" /></Field>
          <Field label="Affectation">
            <Select value={form.affectation} onValueChange={(v) => setForm({ ...form, affectation: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="PRODUCTION">Production</SelectItem>
                <SelectItem value="ETP">ETP</SelectItem>
                <SelectItem value="PERSONNEL">Personnel</SelectItem>
                <SelectItem value="TRANSPORT">Transport</SelectItem>
                <SelectItem value="AUTRE">Autre</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <div className="col-span-2">
            <Field label="Observation"><Textarea value={form.observation} onChange={(e) => setForm({ ...form, observation: e.target.value })} rows={2} /></Field>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
          <Button onClick={submit} disabled={saving} data-testid="sortie-save">Soumettre</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }) {
  return <div><Label className="text-xs mb-1 block">{label}</Label>{children}</div>;
}
