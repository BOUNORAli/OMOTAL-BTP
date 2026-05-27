import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import { PageHeader, KpiCard, LoadingState, EmptyState, StatusBadge } from "@/components/common";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Plus, Wallet, ArrowDownCircle, ArrowUpCircle, Search,
  Check, X, AlertTriangle, FileSpreadsheet,
} from "lucide-react";
import { formatMAD, formatDate, todayISO } from "@/lib/format";
import { useAuth } from "@/contexts/AuthContext";
import { useChantier } from "@/contexts/ChantierContext";
import { can } from "@/lib/permissions";
import { toast } from "sonner";

const PAYMENT_MODES = [
  { v: "ESPECES_OMOTAL", l: "Espèces OMOTAL" },
  { v: "BANQUE_OMOTAL", l: "Banque OMOTAL" },
  { v: "ESPECES_ETP", l: "Espèces ETP" },
  { v: "AUTRE", l: "Autre" },
];
const CATEGORIES = [
  "personnel", "gasoil", "matieres", "location_engins", "entretien",
  "transport", "etp", "frais_generaux", "financement", "divers",
];

export default function CaissePage() {
  const { user } = useAuth();
  const { selectedId } = useChantier();
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    type: "", category: "", payment_mode: "", status: "", q: "",
  });
  const [openCreate, setOpenCreate] = useState(false);
  const canCreate = can(user, "caisse.create");
  const canValidate = can(user, "caisse.validate_high") || user?.role === "SUPER_ADMIN";

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = { chantier_id: selectedId || undefined };
      Object.entries(filters).forEach(([k, v]) => { if (v) params[k] = v; });
      const [t, s] = await Promise.all([
        api.get("/caisse", { params }),
        api.get("/caisse/summary", { params: { chantier_id: selectedId || undefined } }),
      ]);
      setTransactions(t.data);
      setSummary(s.data);
    } catch (e) { toast.error("Erreur de chargement"); }
    setLoading(false);
  };

  useEffect(() => { fetchData(); /* eslint-disable-next-line */ }, [selectedId, filters]);

  const validate = async (id) => {
    try {
      await api.post(`/caisse/${id}/status`, { status: "VALIDE" });
      toast.success("Transaction validée");
      fetchData();
    } catch (e) { toast.error(e.response?.data?.detail || "Erreur"); }
  };
  const reject = async (id) => {
    const motif = prompt("Motif de rejet ?");
    if (motif === null) return;
    try {
      await api.post(`/caisse/${id}/status`, { status: "REJETE", motif });
      toast.success("Transaction rejetée");
      fetchData();
    } catch (e) { toast.error(e.response?.data?.detail || "Erreur"); }
  };

  const exportExcel = () => {
    const params = new URLSearchParams();
    if (selectedId) params.append("chantier_id", selectedId);
    const token = localStorage.getItem("omotal_token");
    // Fetch with auth header by creating link via blob
    api.get(`/excel/export/transactions?${params}`, { responseType: "blob" })
      .then((r) => {
        const url = URL.createObjectURL(r.data);
        const a = document.createElement("a"); a.href = url; a.download = `caisse_${todayISO()}.xlsx`; a.click();
        URL.revokeObjectURL(url);
      });
  };

  return (
    <div data-testid="caisse-page">
      <PageHeader
        title="Caisse & Transactions"
        description={selectedId ? "Transactions du chantier sélectionné" : "Toutes les transactions"}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportExcel} data-testid="caisse-export">
              <FileSpreadsheet className="h-4 w-4 mr-1" /> Exporter
            </Button>
            {canCreate && (
              <Button onClick={() => setOpenCreate(true)} data-testid="caisse-new-btn">
                <Plus className="h-4 w-4 mr-1" /> Nouvelle transaction
              </Button>
            )}
          </div>
        }
      />

      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <KpiCard label="Entrées" value={formatMAD(summary.entrees)} icon={ArrowDownCircle} accent="success" />
          <KpiCard label="Sorties" value={formatMAD(summary.sorties)} icon={ArrowUpCircle} accent="accent" />
          <KpiCard label="Solde" value={formatMAD(summary.solde)} icon={Wallet} accent={summary.solde >= 0 ? "primary" : "danger"} />
          <KpiCard label="En attente" value={summary.pending_validation} sub="transactions à valider" icon={AlertTriangle} accent="warn" />
        </div>
      )}

      <Card className="mb-4">
        <CardContent className="py-4">
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
            <div className="col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Rechercher description / fournisseur…"
                       className="pl-9" value={filters.q}
                       onChange={(e) => setFilters({ ...filters, q: e.target.value })}
                       data-testid="caisse-search" />
              </div>
            </div>
            <Select value={filters.type || "all"} onValueChange={(v) => setFilters({ ...filters, type: v === "all" ? "" : v })}>
              <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous types</SelectItem>
                <SelectItem value="DEBIT">Débit</SelectItem>
                <SelectItem value="CREDIT">Crédit</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filters.category || "all"} onValueChange={(v) => setFilters({ ...filters, category: v === "all" ? "" : v })}>
              <SelectTrigger><SelectValue placeholder="Catégorie" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes catégories</SelectItem>
                {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filters.payment_mode || "all"} onValueChange={(v) => setFilters({ ...filters, payment_mode: v === "all" ? "" : v })}>
              <SelectTrigger><SelectValue placeholder="Mode" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous modes</SelectItem>
                {PAYMENT_MODES.map((m) => <SelectItem key={m.v} value={m.v}>{m.l}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filters.status || "all"} onValueChange={(v) => setFilters({ ...filters, status: v === "all" ? "" : v })}>
              <SelectTrigger><SelectValue placeholder="Statut" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous statuts</SelectItem>
                <SelectItem value="VALIDE">Validé</SelectItem>
                <SelectItem value="SOUMIS">Soumis</SelectItem>
                <SelectItem value="REJETE">Rejeté</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {loading ? <LoadingState rows={5} /> :
        transactions.length === 0 ? (
          <EmptyState title="Aucune transaction" description="Créez votre première transaction." icon={Wallet} />
        ) : (
          <Card>
            <CardContent className="p-0 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Catégorie</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Mode</TableHead>
                    <TableHead className="text-right">Montant</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Saisi par</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((t) => (
                    <TableRow key={t.id} data-testid={`txn-row-${t.id}`}>
                      <TableCell className="whitespace-nowrap">{formatDate(t.date)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={t.type === "CREDIT" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-orange-50 text-orange-700 border-orange-200"}>
                          {t.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="capitalize">{t.category}</TableCell>
                      <TableCell className="max-w-[280px] truncate">{t.description}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{PAYMENT_MODES.find(m=>m.v===t.payment_mode)?.l || t.payment_mode}</TableCell>
                      <TableCell className={`text-right font-semibold ${t.type === "CREDIT" ? "text-emerald-700" : "text-orange-700"}`}>
                        {t.type === "CREDIT" ? "+" : "−"}{formatMAD(t.amount)}
                      </TableCell>
                      <TableCell><StatusBadge status={t.status} /></TableCell>
                      <TableCell className="text-xs">{t.created_by_name || "—"}</TableCell>
                      <TableCell className="text-right">
                        {t.status === "SOUMIS" && canValidate && (
                          <div className="flex gap-1 justify-end">
                            <Button size="sm" variant="ghost" onClick={() => validate(t.id)} className="text-emerald-700" data-testid={`validate-${t.id}`}>
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => reject(t.id)} className="text-red-600">
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

      <TransactionDialog
        open={openCreate}
        onOpenChange={setOpenCreate}
        onSaved={() => { fetchData(); setOpenCreate(false); }}
        defaultChantier={selectedId}
      />
    </div>
  );
}

function TransactionDialog({ open, onOpenChange, onSaved, defaultChantier }) {
  const { chantiers } = useChantier();
  const [form, setForm] = useState({
    chantier_id: defaultChantier || "", date: todayISO(), type: "DEBIT",
    amount: "", payment_mode: "ESPECES_OMOTAL", category: "divers",
    description: "", fournisseur: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) setForm({
      chantier_id: defaultChantier || (chantiers[0]?.id) || "", date: todayISO(), type: "DEBIT",
      amount: "", payment_mode: "ESPECES_OMOTAL", category: "divers",
      description: "", fournisseur: "",
    });
  }, [open, defaultChantier, chantiers]);

  const submit = async () => {
    if (!form.chantier_id || !form.amount) { toast.error("Chantier et montant requis"); return; }
    setSaving(true);
    try {
      await api.post("/caisse", { ...form, amount: parseFloat(form.amount) });
      toast.success("Transaction créée");
      onSaved();
    } catch (e) {
      toast.error(e.response?.data?.detail || "Erreur");
    }
    setSaving(false);
  };

  const highAmount = parseFloat(form.amount || 0) >= 10000 && form.type === "DEBIT";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Nouvelle transaction</DialogTitle>
          <DialogDescription>Enregistrer une opération de caisse</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Chantier *">
            <Select value={form.chantier_id} onValueChange={(v) => setForm({ ...form, chantier_id: v })}>
              <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
              <SelectContent>
                {chantiers.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Date">
            <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </Field>
          <Field label="Type">
            <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="DEBIT">Débit (sortie)</SelectItem>
                <SelectItem value="CREDIT">Crédit (entrée)</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Montant (MAD) *">
            <Input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} data-testid="txn-amount" />
          </Field>
          <Field label="Mode de paiement">
            <Select value={form.payment_mode} onValueChange={(v) => setForm({ ...form, payment_mode: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {PAYMENT_MODES.map((m) => <SelectItem key={m.v} value={m.v}>{m.l}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Catégorie">
            <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <div className="col-span-2">
            <Field label="Description">
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} />
            </Field>
          </div>
          <div className="col-span-2">
            <Field label="Fournisseur / Personne">
              <Input value={form.fournisseur} onChange={(e) => setForm({ ...form, fournisseur: e.target.value })} />
            </Field>
          </div>
          {highAmount && (
            <div className="col-span-2 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2 text-sm text-amber-800">
              <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div>Montant élevé (≥ 10&nbsp;000 MAD) : validation directeur requise après soumission.</div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
          <Button onClick={submit} disabled={saving} data-testid="txn-save">Enregistrer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <Label className="text-xs mb-1 block">{label}</Label>
      {children}
    </div>
  );
}
