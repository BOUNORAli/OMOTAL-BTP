import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";
import { PageHeader, LoadingState, EmptyState, StatusBadge } from "@/components/common";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Plus, Eye, Edit, Building2 } from "lucide-react";
import { formatMAD, formatDate } from "@/lib/format";
import { useAuth } from "@/contexts/AuthContext";
import { can } from "@/lib/permissions";
import { toast } from "sonner";

export default function ChantiersPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [chantiers, setChantiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openCreate, setOpenCreate] = useState(false);
  const [editing, setEditing] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const r = await api.get("/chantiers");
      setChantiers(r.data);
    } catch (e) { toast.error("Erreur de chargement"); }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const canCreate = can(user, "*");

  return (
    <div data-testid="chantiers-page">
      <PageHeader
        title="Chantiers"
        description="Gérez l'ensemble des chantiers OMOTAL"
        actions={canCreate && (
          <Button onClick={() => { setEditing(null); setOpenCreate(true); }} data-testid="new-chantier-btn">
            <Plus className="h-4 w-4 mr-1" /> Nouveau chantier
          </Button>
        )}
      />

      {loading ? <LoadingState /> :
        chantiers.length === 0 ? (
          <EmptyState
            title="Aucun chantier"
            description="Commencez par créer votre premier chantier."
            icon={Building2}
          />
        ) : (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Maître d'ouvrage</TableHead>
                    <TableHead>Localisation</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Montant marché</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {chantiers.map((c) => (
                    <TableRow key={c.id} data-testid={`chantier-row-${c.code}`}>
                      <TableCell className="font-medium">{c.name}</TableCell>
                      <TableCell className="font-mono text-xs">{c.code}</TableCell>
                      <TableCell>{c.maitre_ouvrage || "—"}</TableCell>
                      <TableCell className="text-muted-foreground">{c.localisation || "—"}</TableCell>
                      <TableCell><StatusBadge status={c.status} /></TableCell>
                      <TableCell className="text-right font-medium">{formatMAD(c.montant_marche_ht)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" onClick={() => navigate(`/chantiers/${c.id}`)}
                                  data-testid={`view-chantier-${c.code}`}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          {canCreate && (
                            <Button variant="ghost" size="sm" onClick={() => { setEditing(c); setOpenCreate(true); }}>
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

      <ChantierFormDialog
        open={openCreate}
        onOpenChange={setOpenCreate}
        chantier={editing}
        onSaved={() => { fetchData(); setOpenCreate(false); }}
      />
    </div>
  );
}

function ChantierFormDialog({ open, onOpenChange, chantier, onSaved }) {
  const [form, setForm] = useState({
    name: "", code: "", ref_ao: "", maitre_ouvrage: "", localisation: "",
    start_date: "", expected_end_date: "", montant_marche_ht: "", tva: 20,
    status: "EN_COURS", description: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (chantier) {
      setForm({
        name: chantier.name || "", code: chantier.code || "",
        ref_ao: chantier.ref_ao || "", maitre_ouvrage: chantier.maitre_ouvrage || "",
        localisation: chantier.localisation || "", start_date: chantier.start_date || "",
        expected_end_date: chantier.expected_end_date || "",
        montant_marche_ht: chantier.montant_marche_ht || "",
        tva: chantier.tva ?? 20, status: chantier.status || "EN_COURS",
        description: chantier.description || "",
      });
    } else if (open) {
      setForm({ name: "", code: "", ref_ao: "", maitre_ouvrage: "", localisation: "",
                start_date: "", expected_end_date: "", montant_marche_ht: "", tva: 20,
                status: "EN_COURS", description: "" });
    }
  }, [chantier, open]);

  const submit = async () => {
    if (!form.name || !form.code) { toast.error("Nom et code requis"); return; }
    setSaving(true);
    try {
      const payload = { ...form,
        montant_marche_ht: form.montant_marche_ht ? parseFloat(form.montant_marche_ht) : null,
        tva: form.tva ? parseFloat(form.tva) : null };
      if (chantier) await api.patch(`/chantiers/${chantier.id}`, payload);
      else await api.post("/chantiers", payload);
      toast.success(chantier ? "Chantier modifié" : "Chantier créé");
      onSaved();
    } catch (e) {
      toast.error(e.response?.data?.detail || "Erreur");
    }
    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{chantier ? "Modifier le chantier" : "Nouveau chantier"}</DialogTitle>
          <DialogDescription>Renseignez les informations du chantier</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Nom *"><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} data-testid="chantier-name" /></Field>
          <Field label="Code *"><Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} data-testid="chantier-code" /></Field>
          <Field label="Référence AO"><Input value={form.ref_ao} onChange={(e) => setForm({ ...form, ref_ao: e.target.value })} /></Field>
          <Field label="Maître d'ouvrage"><Input value={form.maitre_ouvrage} onChange={(e) => setForm({ ...form, maitre_ouvrage: e.target.value })} /></Field>
          <Field label="Localisation"><Input value={form.localisation} onChange={(e) => setForm({ ...form, localisation: e.target.value })} /></Field>
          <Field label="Statut">
            <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="PREPARATION">Préparation</SelectItem>
                <SelectItem value="EN_COURS">En cours</SelectItem>
                <SelectItem value="SUSPENDU">Suspendu</SelectItem>
                <SelectItem value="TERMINE">Terminé</SelectItem>
                <SelectItem value="ARCHIVE">Archivé</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Date début"><Input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} /></Field>
          <Field label="Date fin prévue"><Input type="date" value={form.expected_end_date} onChange={(e) => setForm({ ...form, expected_end_date: e.target.value })} /></Field>
          <Field label="Montant marché HT (MAD)"><Input type="number" value={form.montant_marche_ht} onChange={(e) => setForm({ ...form, montant_marche_ht: e.target.value })} /></Field>
          <Field label="TVA (%)"><Input type="number" value={form.tva} onChange={(e) => setForm({ ...form, tva: e.target.value })} /></Field>
          <div className="col-span-2">
            <Label className="text-xs">Description</Label>
            <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
          <Button onClick={submit} disabled={saving} data-testid="chantier-save">
            {chantier ? "Enregistrer" : "Créer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <Label className="text-xs mb-1.5 block">{label}</Label>
      {children}
    </div>
  );
}
