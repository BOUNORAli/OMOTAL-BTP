import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import { PageHeader, LoadingState, EmptyState } from "@/components/common";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Settings, Plus, Trash2, Edit2 } from "lucide-react";
import { ROLES, ROLE_BADGES } from "@/lib/permissions";
import { toast } from "sonner";
import { useChantier } from "@/contexts/ChantierContext";

export default function AdminPage() {
  const { chantiers } = useChantier();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openCreate, setOpenCreate] = useState(false);
  const [editing, setEditing] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const r = await api.get("/users");
      setUsers(r.data);
    } catch (e) { toast.error("Erreur de chargement"); }
    setLoading(false);
  };
  useEffect(() => { fetchData(); }, []);

  const remove = async (id) => {
    if (!window.confirm("Supprimer cet utilisateur ?")) return;
    try { await api.delete(`/users/${id}`); toast.success("Supprimé"); fetchData(); }
    catch (e) { toast.error(e.response?.data?.detail || "Erreur"); }
  };

  return (
    <div data-testid="admin-page">
      <PageHeader
        title="Administration"
        description="Gérez utilisateurs et accès"
        actions={
          <Button onClick={() => { setEditing(null); setOpenCreate(true); }} data-testid="new-user-btn">
            <Plus className="h-4 w-4 mr-1" /> Nouvel utilisateur
          </Button>
        }
      />

      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users">Utilisateurs ({users.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="users">
          {loading ? <LoadingState rows={4} /> :
            users.length === 0 ? <EmptyState title="Aucun utilisateur" icon={Settings} /> :
            <Card><CardContent className="p-0 overflow-x-auto"><Table>
              <TableHeader><TableRow>
                <TableHead>Nom</TableHead><TableHead>Email</TableHead>
                <TableHead>Rôle</TableHead><TableHead>Chantiers</TableHead>
                <TableHead>Statut</TableHead><TableHead className="text-right">Actions</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id} data-testid={`user-row-${u.email}`}>
                    <TableCell className="font-medium">{u.name}</TableCell>
                    <TableCell className="text-sm">{u.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={ROLE_BADGES[u.role]}>{ROLES[u.role]}</Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{u.chantier_ids?.length || 0} chantier(s)</TableCell>
                    <TableCell>
                      <Badge variant={u.active ? "outline" : "destructive"}>
                        {u.active ? "Actif" : "Inactif"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => { setEditing(u); setOpenCreate(true); }}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => remove(u.id)} className="text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table></CardContent></Card>}
        </TabsContent>
      </Tabs>

      <UserDialog open={openCreate} onOpenChange={setOpenCreate} user={editing} chantiers={chantiers}
                  onSaved={() => { fetchData(); setOpenCreate(false); }} />
    </div>
  );
}

function UserDialog({ open, onOpenChange, user, chantiers, onSaved }) {
  const [form, setForm] = useState({
    name: "", email: "", password: "", role: "POINTEUR", chantier_ids: [], phone: "",
  });
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (user) setForm({ name: user.name, email: user.email, password: "", role: user.role,
                        chantier_ids: user.chantier_ids || [], phone: user.phone || "" });
    else if (open) setForm({ name: "", email: "", password: "", role: "POINTEUR", chantier_ids: [], phone: "" });
  }, [user, open]);

  const submit = async () => {
    if (!form.name || !form.email || (!user && !form.password)) {
      toast.error("Nom, email et mot de passe requis"); return;
    }
    setSaving(true);
    try {
      if (user) {
        const payload = { ...form };
        if (!form.password) delete payload.password;
        delete payload.email; // can't change email
        await api.patch(`/users/${user.id}`, payload);
      } else {
        await api.post("/users", form);
      }
      toast.success(user ? "Utilisateur modifié" : "Utilisateur créé");
      onSaved();
    } catch (e) { toast.error(e.response?.data?.detail || "Erreur"); }
    setSaving(false);
  };

  const toggleChantier = (id) => {
    setForm((f) => ({
      ...f,
      chantier_ids: f.chantier_ids.includes(id)
        ? f.chantier_ids.filter((x) => x !== id)
        : [...f.chantier_ids, id],
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader><DialogTitle>{user ? "Modifier utilisateur" : "Nouvel utilisateur"}</DialogTitle></DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Nom complet *"><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} data-testid="user-name" /></Field>
          <Field label="Email *"><Input type="email" value={form.email} disabled={!!user} onChange={(e) => setForm({ ...form, email: e.target.value })} data-testid="user-email" /></Field>
          <Field label="Mot de passe"><Input type="password" placeholder={user ? "(laisser vide pour ne pas changer)" : ""} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} data-testid="user-password" /></Field>
          <Field label="Téléphone"><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field>
          <Field label="Rôle">
            <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(ROLES).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <div className="col-span-2">
            <Label className="text-xs mb-2 block">Chantiers autorisés</Label>
            <div className="flex flex-wrap gap-2">
              {chantiers.map((c) => (
                <button key={c.id} type="button" onClick={() => toggleChantier(c.id)}
                        className={`px-3 py-1.5 rounded-lg border text-xs ${
                          form.chantier_ids.includes(c.id)
                            ? "bg-primary text-white border-primary"
                            : "bg-white text-slate-700 border-slate-200 hover:border-primary"
                        }`}>
                  {c.name}
                </button>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
          <Button onClick={submit} disabled={saving} data-testid="user-save">Enregistrer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }) { return <div><Label className="text-xs mb-1 block">{label}</Label>{children}</div>; }
