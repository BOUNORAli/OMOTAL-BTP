import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import { PageHeader, KpiCard, LoadingState, EmptyState } from "@/components/common";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Package, Plus, Receipt, CreditCard, Users2, Wallet, AlertCircle } from "lucide-react";
import { formatMAD, formatDate, todayISO } from "@/lib/format";
import { useChantier } from "@/contexts/ChantierContext";
import { useAuth } from "@/contexts/AuthContext";
import { can } from "@/lib/permissions";
import { toast } from "sonner";

const FOURNISSEUR_TYPES = [
  { v: "MATIERE", l: "Matière" }, { v: "STATION", l: "Station" },
  { v: "TRANSPORT", l: "Transport" }, { v: "ENTRETIEN", l: "Entretien" },
  { v: "SOUS_TRAITANT", l: "Sous-traitant" }, { v: "LOUEUR", l: "Loueur" },
  { v: "AUTRE", l: "Autre" },
];

const PAY_STATUS = {
  NON_PAYE: { l: "Non payé", c: "bg-red-100 text-red-700 border-red-200" },
  PARTIEL: { l: "Partiel", c: "bg-amber-100 text-amber-700 border-amber-200" },
  PAYE: { l: "Payé", c: "bg-emerald-100 text-emerald-700 border-emerald-200" },
};

export default function MatieresPage() {
  const { user } = useAuth();
  const { selectedId } = useChantier();
  const [achats, setAchats] = useState([]);
  const [fournisseurs, setFournisseurs] = useState([]);
  const [situations, setSituations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openAchat, setOpenAchat] = useState(false);
  const [openFournisseur, setOpenFournisseur] = useState(false);
  const [openPaiement, setOpenPaiement] = useState(null); // achat object

  const canCreate = can(user, "fournisseurs.create");

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = { chantier_id: selectedId || undefined };
      const [a, f, s] = await Promise.all([
        api.get("/matieres/achats", { params }),
        api.get("/matieres/fournisseurs"),
        api.get("/matieres/situations", { params }),
      ]);
      setAchats(a.data); setFournisseurs(f.data); setSituations(s.data);
    } catch (e) { toast.error("Erreur de chargement"); }
    setLoading(false);
  };
  useEffect(() => { fetchData(); /* eslint-disable-next-line */ }, [selectedId]);

  const total = achats.reduce((s, a) => s + (a.total_ttc || 0), 0);
  const totalPaye = achats.reduce((s, a) => s + (a.montant_paye || 0), 0);
  const totalRestant = total - totalPaye;
  const today = todayISO();
  const echeancesProches = achats.filter((a) => a.echeance && a.echeance <= today && a.payment_status !== "PAYE");

  return (
    <div data-testid="matieres-page">
      <PageHeader
        title="Matières & Fournisseurs"
        description="Achats, paiements, situation fournisseurs"
        actions={canCreate && (
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" onClick={() => setOpenFournisseur(true)} data-testid="new-fournisseur-btn"><Users2 className="h-4 w-4 mr-1" />Fournisseur</Button>
            <Button onClick={() => setOpenAchat(true)} data-testid="new-achat-btn"><Plus className="h-4 w-4 mr-1" />Nouvel achat</Button>
          </div>
        )}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <KpiCard label="Total achats TTC" value={formatMAD(total)} icon={Receipt} accent="primary" />
        <KpiCard label="Payé" value={formatMAD(totalPaye)} icon={Wallet} accent="success" />
        <KpiCard label="Restant à payer" value={formatMAD(totalRestant)} icon={CreditCard} accent={totalRestant > 0 ? "warn" : "success"} />
        <KpiCard label="Échéances dépassées" value={echeancesProches.length} icon={AlertCircle} accent={echeancesProches.length > 0 ? "danger" : "primary"} />
      </div>

      <Tabs defaultValue="achats">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="achats">Achats ({achats.length})</TabsTrigger>
          <TabsTrigger value="situations">Situation fournisseurs ({situations.length})</TabsTrigger>
          <TabsTrigger value="fournisseurs">Fournisseurs ({fournisseurs.length})</TabsTrigger>
          <TabsTrigger value="echeances">Échéances ({echeancesProches.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="achats">
          {loading ? <LoadingState /> :
            achats.length === 0 ? <EmptyState title="Aucun achat" icon={Package} /> :
            <Card><CardContent className="p-0 overflow-x-auto"><Table>
              <TableHeader><TableRow>
                <TableHead>Date</TableHead><TableHead>Fournisseur</TableHead>
                <TableHead>Désignation</TableHead>
                <TableHead className="text-right">Qte</TableHead>
                <TableHead className="text-right">PU HT</TableHead>
                <TableHead className="text-right">TTC</TableHead>
                <TableHead className="text-right">Restant</TableHead>
                <TableHead>Échéance</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead></TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {achats.map((a) => {
                  const ps = PAY_STATUS[a.payment_status] || PAY_STATUS.NON_PAYE;
                  const overdue = a.echeance && a.echeance <= today && a.payment_status !== "PAYE";
                  return (
                    <TableRow key={a.id}>
                      <TableCell>{formatDate(a.date)}</TableCell>
                      <TableCell className="font-medium">{a.fournisseur_name || "—"}</TableCell>
                      <TableCell className="max-w-[260px] truncate">{a.designation}</TableCell>
                      <TableCell className="text-right">{a.quantity} {a.unit}</TableCell>
                      <TableCell className="text-right">{formatMAD(a.unit_price)}</TableCell>
                      <TableCell className="text-right font-semibold">{formatMAD(a.total_ttc)}</TableCell>
                      <TableCell className={`text-right ${a.montant_restant > 0 ? "text-red-600 font-medium" : "text-emerald-600"}`}>{formatMAD(a.montant_restant)}</TableCell>
                      <TableCell className={overdue ? "text-red-600 font-medium" : ""}>{formatDate(a.echeance)}</TableCell>
                      <TableCell><Badge variant="outline" className={ps.c}>{ps.l}</Badge></TableCell>
                      <TableCell>
                        {a.payment_status !== "PAYE" && canCreate && (
                          <Button size="sm" variant="ghost" onClick={() => setOpenPaiement(a)} data-testid={`pay-achat-${a.id}`}>
                            <CreditCard className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table></CardContent></Card>}
        </TabsContent>
        <TabsContent value="situations">
          {situations.length === 0 ? <EmptyState title="Aucune situation" /> :
          <Card><CardContent className="p-0 overflow-x-auto"><Table>
            <TableHeader><TableRow>
              <TableHead>Fournisseur</TableHead><TableHead>Type</TableHead>
              <TableHead className="text-right">Achats</TableHead>
              <TableHead className="text-right">Total TTC</TableHead>
              <TableHead className="text-right">Payé</TableHead>
              <TableHead className="text-right">Restant</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {situations.map((s) => (
                <TableRow key={s.fournisseur_id}>
                  <TableCell className="font-medium">{s.fournisseur_name}</TableCell>
                  <TableCell><Badge variant="outline">{s.type}</Badge></TableCell>
                  <TableCell className="text-right">{s.count}</TableCell>
                  <TableCell className="text-right">{formatMAD(s.total_ttc)}</TableCell>
                  <TableCell className="text-right text-emerald-700">{formatMAD(s.total_paye)}</TableCell>
                  <TableCell className={`text-right font-semibold ${s.total_restant > 0 ? "text-red-600" : "text-emerald-600"}`}>{formatMAD(s.total_restant)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table></CardContent></Card>}
        </TabsContent>
        <TabsContent value="fournisseurs">
          {fournisseurs.length === 0 ? <EmptyState title="Aucun fournisseur" icon={Users2} /> :
          <Card><CardContent className="p-0 overflow-x-auto"><Table>
            <TableHeader><TableRow>
              <TableHead>Nom</TableHead><TableHead>Type</TableHead>
              <TableHead>Contact</TableHead><TableHead>Téléphone</TableHead>
              <TableHead>ICE</TableHead><TableHead>Statut</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {fournisseurs.map((f) => (
                <TableRow key={f.id}>
                  <TableCell className="font-medium">{f.name}</TableCell>
                  <TableCell><Badge variant="outline">{f.type}</Badge></TableCell>
                  <TableCell>{f.contact || "—"}</TableCell>
                  <TableCell className="text-xs">{f.phone || "—"}</TableCell>
                  <TableCell className="font-mono text-xs">{f.ice || "—"}</TableCell>
                  <TableCell><Badge variant={f.active ? "outline" : "destructive"}>{f.active ? "Actif" : "Inactif"}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table></CardContent></Card>}
        </TabsContent>
        <TabsContent value="echeances">
          {echeancesProches.length === 0 ? <EmptyState title="Aucune échéance dépassée" /> :
          <div className="space-y-2">
            {echeancesProches.map((a) => (
              <Card key={a.id}>
                <CardContent className="py-3 flex items-center gap-3">
                  <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium">{a.fournisseur_name} — {a.designation}</div>
                    <div className="text-xs text-muted-foreground">Échéance: {formatDate(a.echeance)}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-red-600">{formatMAD(a.montant_restant)}</div>
                    {canCreate && <Button size="sm" variant="outline" className="mt-1" onClick={() => setOpenPaiement(a)}>Régler</Button>}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>}
        </TabsContent>
      </Tabs>

      <AchatDialog open={openAchat} onOpenChange={setOpenAchat}
                   onSaved={() => { fetchData(); setOpenAchat(false); }}
                   fournisseurs={fournisseurs} defaultChantier={selectedId} />
      <FournisseurDialog open={openFournisseur} onOpenChange={setOpenFournisseur}
                         onSaved={() => { fetchData(); setOpenFournisseur(false); }} />
      <PaiementDialog open={!!openPaiement} onOpenChange={(v) => !v && setOpenPaiement(null)}
                      achat={openPaiement}
                      onSaved={() => { fetchData(); setOpenPaiement(null); }} />
    </div>
  );
}

function AchatDialog({ open, onOpenChange, onSaved, fournisseurs, defaultChantier }) {
  const { chantiers } = useChantier();
  const [form, setForm] = useState({
    chantier_id: "", date: todayISO(), fournisseur_id: "", designation: "",
    unit: "U", quantity: 1, unit_price: "", transport_ht: 0, tva_rate: 20,
    br_number: "", echeance: "", observation: "",
  });
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (open) setForm((f) => ({
      ...f, chantier_id: defaultChantier || chantiers?.[0]?.id || "",
      date: todayISO(), fournisseur_id: "", designation: "", quantity: 1,
      unit_price: "", transport_ht: 0, tva_rate: 20, br_number: "", echeance: "", observation: "",
    }));
  }, [open, defaultChantier, chantiers]);

  const qty = parseFloat(form.quantity) || 0;
  const pu = parseFloat(form.unit_price) || 0;
  const transport = parseFloat(form.transport_ht) || 0;
  const tva = parseFloat(form.tva_rate) || 0;
  const totalHt = qty * pu + transport;
  const totalTtc = totalHt * (1 + tva / 100);

  const submit = async () => {
    if (!form.chantier_id || !form.fournisseur_id || !form.designation || !pu) {
      toast.error("Chantier, fournisseur, désignation et PU requis"); return;
    }
    setSaving(true);
    try {
      await api.post("/matieres/achats", { ...form,
        quantity: qty, unit_price: pu, transport_ht: transport, tva_rate: tva });
      toast.success("Achat enregistré");
      onSaved();
    } catch (e) { toast.error(e.response?.data?.detail || "Erreur"); }
    setSaving(false);
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[95vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Nouvel achat matière</DialogTitle></DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Field label="Chantier *">
            <Select value={form.chantier_id} onValueChange={(v) => setForm({ ...form, chantier_id: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{chantiers.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Date"><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></Field>
          <Field label="Fournisseur *">
            <Select value={form.fournisseur_id} onValueChange={(v) => setForm({ ...form, fournisseur_id: v })}>
              <SelectTrigger><SelectValue placeholder="Choisir" /></SelectTrigger>
              <SelectContent>{fournisseurs.map((f) => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Désignation *"><Input value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} data-testid="achat-designation" /></Field>
          <Field label="Quantité *"><Input type="number" step="0.01" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} /></Field>
          <Field label="Unité"><Input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} placeholder="u, kg, m³..." /></Field>
          <Field label="Prix unitaire HT *"><Input type="number" step="0.01" value={form.unit_price} onChange={(e) => setForm({ ...form, unit_price: e.target.value })} data-testid="achat-pu" /></Field>
          <Field label="Transport HT"><Input type="number" step="0.01" value={form.transport_ht} onChange={(e) => setForm({ ...form, transport_ht: e.target.value })} /></Field>
          <Field label="TVA (%)"><Input type="number" value={form.tva_rate} onChange={(e) => setForm({ ...form, tva_rate: e.target.value })} /></Field>
          <Field label="N° BR / BL"><Input value={form.br_number} onChange={(e) => setForm({ ...form, br_number: e.target.value })} /></Field>
          <Field label="Échéance"><Input type="date" value={form.echeance} onChange={(e) => setForm({ ...form, echeance: e.target.value })} /></Field>
          <div className="md:col-span-2 p-3 bg-primary/5 rounded-lg space-y-1">
            <div className="flex justify-between text-sm"><span>Total HT</span><span className="font-medium">{formatMAD(totalHt)}</span></div>
            <div className="flex justify-between text-sm"><span>TVA</span><span>{formatMAD(totalHt * tva / 100)}</span></div>
            <div className="flex justify-between font-bold pt-1 border-t"><span>Total TTC</span><span className="text-primary">{formatMAD(totalTtc)}</span></div>
          </div>
          <div className="md:col-span-2">
            <Field label="Observation"><Textarea value={form.observation} onChange={(e) => setForm({ ...form, observation: e.target.value })} rows={2} /></Field>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
          <Button onClick={submit} disabled={saving} data-testid="achat-save">Enregistrer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function FournisseurDialog({ open, onOpenChange, onSaved }) {
  const [form, setForm] = useState({
    name: "", type: "MATIERE", contact: "", phone: "", address: "",
    payment_conditions: "", ice: "",
  });
  const [saving, setSaving] = useState(false);
  useEffect(() => { if (open) setForm({ name: "", type: "MATIERE", contact: "", phone: "", address: "", payment_conditions: "", ice: "" }); }, [open]);
  const submit = async () => {
    if (!form.name) { toast.error("Nom requis"); return; }
    setSaving(true);
    try {
      await api.post("/matieres/fournisseurs", form);
      toast.success("Fournisseur créé");
      onSaved();
    } catch (e) { toast.error(e.response?.data?.detail || "Erreur"); }
    setSaving(false);
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader><DialogTitle>Nouveau fournisseur</DialogTitle></DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Field label="Nom *"><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} data-testid="fournisseur-name" /></Field>
          <Field label="Type">
            <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{FOURNISSEUR_TYPES.map((t) => <SelectItem key={t.v} value={t.v}>{t.l}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Contact"><Input value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} /></Field>
          <Field label="Téléphone"><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field>
          <Field label="ICE"><Input value={form.ice} onChange={(e) => setForm({ ...form, ice: e.target.value })} /></Field>
          <Field label="Conditions paiement"><Input value={form.payment_conditions} onChange={(e) => setForm({ ...form, payment_conditions: e.target.value })} placeholder="Ex: 30j fin de mois" /></Field>
          <div className="md:col-span-2">
            <Field label="Adresse"><Textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} rows={2} /></Field>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
          <Button onClick={submit} disabled={saving} data-testid="fournisseur-save">Créer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function PaiementDialog({ open, onOpenChange, achat, onSaved }) {
  const [form, setForm] = useState({
    date: todayISO(), amount: "", payment_mode: "BANQUE_OMOTAL", reference: "", observation: "",
  });
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (open && achat) setForm({
      date: todayISO(), amount: achat.montant_restant || "",
      payment_mode: "BANQUE_OMOTAL", reference: "", observation: "",
    });
  }, [open, achat]);
  const submit = async () => {
    if (!form.amount || parseFloat(form.amount) <= 0) { toast.error("Montant requis"); return; }
    setSaving(true);
    try {
      await api.post("/matieres/paiements", { ...form, achat_id: achat.id, amount: parseFloat(form.amount) });
      toast.success("Paiement enregistré");
      onSaved();
    } catch (e) { toast.error(e.response?.data?.detail || "Erreur"); }
    setSaving(false);
  };
  if (!achat) return null;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Paiement fournisseur</DialogTitle></DialogHeader>
        <div className="p-3 bg-slate-50 rounded-lg space-y-1 text-sm mb-3">
          <div className="font-medium">{achat.fournisseur_name}</div>
          <div className="text-muted-foreground">{achat.designation}</div>
          <div className="flex justify-between pt-2 border-t">
            <span>Restant à payer</span>
            <span className="font-bold text-red-600">{formatMAD(achat.montant_restant)}</span>
          </div>
        </div>
        <div className="space-y-3">
          <Field label="Date"><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></Field>
          <Field label="Montant (MAD) *"><Input type="number" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} data-testid="paiement-amount" /></Field>
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
          <Field label="Référence (chèque, virement)"><Input value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })} /></Field>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
          <Button onClick={submit} disabled={saving} data-testid="paiement-save">Payer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }) { return <div><Label className="text-xs mb-1 block">{label}</Label>{children}</div>; }
