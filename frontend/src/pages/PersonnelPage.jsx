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
import { Users, Plus, Save, FileSpreadsheet, Coins, Check } from "lucide-react";
import { formatMAD, formatNumber, formatDate, monthLabel, todayISO } from "@/lib/format";
import { useChantier } from "@/contexts/ChantierContext";
import { useAuth } from "@/contexts/AuthContext";
import { can } from "@/lib/permissions";
import { toast } from "sonner";

function daysInMonth(year, month) { return new Date(year, month, 0).getDate(); }

export default function PersonnelPage() {
  const { user } = useAuth();
  const { selectedId, chantiers } = useChantier();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [pointages, setPointages] = useState([]);
  const [avances, setAvances] = useState([]);
  const [openEmployee, setOpenEmployee] = useState(false);
  const [openAvance, setOpenAvance] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = { chantier_id: selectedId || undefined };
      const [emp, pt, av] = await Promise.all([
        api.get("/personnel/employees", { params }),
        api.get("/personnel/pointage", { params: { ...params, year, month } }),
        api.get("/personnel/avances", { params: { ...params, date_from: `${year}-${String(month).padStart(2,'0')}-01`, date_to: `${year}-${String(month).padStart(2,'0')}-31` } }),
      ]);
      setEmployees(emp.data); setPointages(pt.data); setAvances(av.data);
    } catch (e) { toast.error("Erreur de chargement"); }
    setLoading(false);
  };
  useEffect(() => { fetchData(); /* eslint-disable-next-line */ }, [selectedId, year, month]);

  const canCreate = can(user, "personnel.create");
  const exportExcel = () => {
    const p = new URLSearchParams();
    if (selectedId) p.append("chantier_id", selectedId);
    p.append("year", year); p.append("month", month);
    api.get(`/excel/export/personnel?${p}`, { responseType: "blob" }).then((r) => {
      const url = URL.createObjectURL(r.data);
      const a = document.createElement("a"); a.href = url; a.download = `paie_${year}_${month}.xlsx`; a.click();
    });
  };

  return (
    <div data-testid="personnel-page">
      <PageHeader
        title="Personnel & Paie"
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
              <SelectContent>
                {[2024, 2025, 2026, 2027].map((y) => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={exportExcel}><FileSpreadsheet className="h-4 w-4 mr-1" />Exporter</Button>
            {canCreate && <Button onClick={() => setOpenEmployee(true)} data-testid="new-employee-btn"><Plus className="h-4 w-4 mr-1" />Nouvel employé</Button>}
          </div>
        }
      />

      <Tabs defaultValue="pointage">
        <TabsList>
          <TabsTrigger value="pointage">Pointage mensuel</TabsTrigger>
          <TabsTrigger value="employees">Employés ({employees.length})</TabsTrigger>
          <TabsTrigger value="avances">Avances ({avances.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pointage">
          {loading ? <LoadingState rows={5} /> :
            employees.length === 0 ? <EmptyState title="Aucun employé" icon={Users} /> :
            <PointageGrid employees={employees} pointages={pointages} year={year} month={month}
                          onChanged={fetchData} />}
        </TabsContent>

        <TabsContent value="employees">
          {loading ? <LoadingState /> :
            employees.length === 0 ? <EmptyState title="Aucun employé" icon={Users} /> :
            <Card><CardContent className="p-0 overflow-x-auto"><Table>
              <TableHeader><TableRow>
                <TableHead>Nom</TableHead><TableHead>Poste</TableHead>
                <TableHead>Rémunération</TableHead><TableHead>Tarif</TableHead>
                <TableHead>Téléphone</TableHead><TableHead>CIN</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {employees.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell className="font-medium">{e.name}</TableCell>
                    <TableCell>{e.poste || "—"}</TableCell>
                    <TableCell>{e.remuneration_type}</TableCell>
                    <TableCell>{formatMAD(e.salaire_mensuel || e.salaire_journalier || e.salaire_horaire)}</TableCell>
                    <TableCell className="text-xs">{e.phone || "—"}</TableCell>
                    <TableCell className="text-xs">{e.cin || "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table></CardContent></Card>}
        </TabsContent>

        <TabsContent value="avances">
          <div className="flex justify-end mb-3">
            {canCreate && <Button onClick={() => setOpenAvance(true)}><Coins className="h-4 w-4 mr-1" />Nouvelle avance</Button>}
          </div>
          {avances.length === 0 ? <EmptyState title="Aucune avance" /> :
            <Card><CardContent className="p-0"><Table>
              <TableHeader><TableRow>
                <TableHead>Date</TableHead><TableHead>Employé</TableHead>
                <TableHead>Motif</TableHead><TableHead className="text-right">Montant</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {avances.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell>{formatDate(a.date)}</TableCell>
                    <TableCell>{a.employee_name}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{a.motif || "—"}</TableCell>
                    <TableCell className="text-right font-semibold">{formatMAD(a.amount)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table></CardContent></Card>}
        </TabsContent>
      </Tabs>

      <EmployeeDialog open={openEmployee} onOpenChange={setOpenEmployee} onSaved={() => { fetchData(); setOpenEmployee(false); }}
                      defaultChantier={selectedId} chantiers={chantiers} />
      <AvanceDialog open={openAvance} onOpenChange={setOpenAvance} onSaved={() => { fetchData(); setOpenAvance(false); }}
                    employees={employees} defaultChantier={selectedId} />
    </div>
  );
}

function PointageGrid({ employees, pointages, year, month, onChanged }) {
  const numDays = daysInMonth(year, month);
  const days = Array.from({ length: numDays }, (_, i) => i + 1);
  const ptMap = useMemo(() => {
    const m = {};
    pointages.forEach((p) => { m[p.employee_id] = p; });
    return m;
  }, [pointages]);
  const [edits, setEdits] = useState({});
  const [saving, setSaving] = useState({});

  const getHours = (empId, day) => {
    if (edits[empId]?.[day] !== undefined) return edits[empId][day];
    const pt = ptMap[empId];
    const e = pt?.entries?.find((x) => x.day === day);
    return e?.hours ?? "";
  };

  const setHours = (empId, day, val) => {
    setEdits((p) => ({ ...p, [empId]: { ...(p[empId] || {}), [day]: val } }));
  };

  const saveRow = async (emp) => {
    setSaving((s) => ({ ...s, [emp.id]: true }));
    try {
      const existing = ptMap[emp.id];
      const entries = days.map((d) => {
        const editVal = edits[emp.id]?.[d];
        const existingEntry = existing?.entries?.find((x) => x.day === d);
        const hours = editVal !== undefined ? (editVal === "" ? 0 : parseFloat(editVal)) : (existingEntry?.hours || 0);
        return { day: d, hours, day_type: hours > 0 ? "NORMAL" : "ABSENT" };
      });
      await api.post("/personnel/pointage", {
        employee_id: emp.id, chantier_id: emp.chantier_id, year, month, entries,
      });
      toast.success(`Pointage ${emp.name} enregistré`);
      setEdits((p) => { const c = { ...p }; delete c[emp.id]; return c; });
      onChanged();
    } catch (e) { toast.error(e.response?.data?.detail || "Erreur"); }
    setSaving((s) => ({ ...s, [emp.id]: false }));
  };

  return (
    <Card>
      <CardContent className="p-0 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[160px] sticky left-0 bg-white">Employé</TableHead>
              {days.map((d) => {
                const isWeekend = new Date(year, month - 1, d).getDay() === 5; // Friday in Morocco often = repos
                return <TableHead key={d} className={`text-center px-1 ${isWeekend ? "bg-slate-50" : ""}`}>{d}</TableHead>;
              })}
              <TableHead className="text-right whitespace-nowrap">Jours</TableHead>
              <TableHead className="text-right whitespace-nowrap">Salaire</TableHead>
              <TableHead className="text-right whitespace-nowrap">Avances</TableHead>
              <TableHead className="text-right whitespace-nowrap">À payer</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees.map((emp) => {
              const pt = ptMap[emp.id];
              const isEdited = !!edits[emp.id];
              return (
                <TableRow key={emp.id}>
                  <TableCell className="font-medium sticky left-0 bg-white">
                    <div>{emp.name}</div>
                    <div className="text-[11px] text-muted-foreground">{emp.poste}</div>
                  </TableCell>
                  {days.map((d) => (
                    <TableCell key={d} className="p-0.5">
                      <input
                        type="number" step="0.5" min="0" max="24"
                        className="w-10 h-7 text-center text-xs border rounded"
                        value={getHours(emp.id, d)}
                        onChange={(e) => setHours(emp.id, d, e.target.value)}
                        data-testid={`pointage-${emp.id}-${d}`}
                      />
                    </TableCell>
                  ))}
                  <TableCell className="text-right text-sm">{pt?.total_days?.toFixed(1) || 0}</TableCell>
                  <TableCell className="text-right text-sm">{formatMAD(pt?.salaire_du)}</TableCell>
                  <TableCell className="text-right text-sm">{formatMAD(pt?.avances)}</TableCell>
                  <TableCell className="text-right font-semibold">{formatMAD(pt?.montant_a_payer)}</TableCell>
                  <TableCell className="whitespace-nowrap">
                    <Button size="sm" variant={isEdited ? "default" : "ghost"} disabled={saving[emp.id]}
                            onClick={() => saveRow(emp)} data-testid={`save-pointage-${emp.id}`}>
                      <Save className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function EmployeeDialog({ open, onOpenChange, onSaved, defaultChantier, chantiers }) {
  const [form, setForm] = useState({
    name: "", poste: "", chantier_id: "", remuneration_type: "JOUR",
    salaire_mensuel: "", salaire_journalier: "", salaire_horaire: "",
    phone: "", cin: "",
  });
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (open) setForm({
      name: "", poste: "", chantier_id: defaultChantier || chantiers[0]?.id || "",
      remuneration_type: "JOUR", salaire_mensuel: "", salaire_journalier: "",
      salaire_horaire: "", phone: "", cin: "",
    });
  }, [open, defaultChantier, chantiers]);

  const submit = async () => {
    if (!form.name) { toast.error("Nom requis"); return; }
    setSaving(true);
    try {
      const payload = { ...form,
        salaire_mensuel: form.salaire_mensuel ? parseFloat(form.salaire_mensuel) : null,
        salaire_journalier: form.salaire_journalier ? parseFloat(form.salaire_journalier) : null,
        salaire_horaire: form.salaire_horaire ? parseFloat(form.salaire_horaire) : null,
      };
      await api.post("/personnel/employees", payload);
      toast.success("Employé créé");
      onSaved();
    } catch (e) { toast.error(e.response?.data?.detail || "Erreur"); }
    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader><DialogTitle>Nouvel employé</DialogTitle></DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Nom *"><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} data-testid="emp-name" /></Field>
          <Field label="Poste"><Input value={form.poste} onChange={(e) => setForm({ ...form, poste: e.target.value })} /></Field>
          <Field label="Chantier">
            <Select value={form.chantier_id} onValueChange={(v) => setForm({ ...form, chantier_id: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{chantiers.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Type rémunération">
            <Select value={form.remuneration_type} onValueChange={(v) => setForm({ ...form, remuneration_type: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="HEURE">Heure</SelectItem>
                <SelectItem value="JOUR">Jour</SelectItem>
                <SelectItem value="MOIS">Mois</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          {form.remuneration_type === "MOIS" && <Field label="Salaire mensuel"><Input type="number" value={form.salaire_mensuel} onChange={(e) => setForm({ ...form, salaire_mensuel: e.target.value })} /></Field>}
          {form.remuneration_type === "JOUR" && <Field label="Salaire journalier"><Input type="number" value={form.salaire_journalier} onChange={(e) => setForm({ ...form, salaire_journalier: e.target.value })} /></Field>}
          {form.remuneration_type === "HEURE" && <Field label="Salaire horaire"><Input type="number" value={form.salaire_horaire} onChange={(e) => setForm({ ...form, salaire_horaire: e.target.value })} /></Field>}
          <Field label="Téléphone"><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field>
          <Field label="CIN"><Input value={form.cin} onChange={(e) => setForm({ ...form, cin: e.target.value })} /></Field>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
          <Button onClick={submit} disabled={saving} data-testid="emp-save">Créer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AvanceDialog({ open, onOpenChange, onSaved, employees, defaultChantier }) {
  const [form, setForm] = useState({
    employee_id: "", chantier_id: defaultChantier || "", date: todayISO(),
    amount: "", payment_mode: "ESPECES_OMOTAL", motif: "",
  });
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (open) setForm({
      employee_id: "", chantier_id: defaultChantier || "", date: todayISO(),
      amount: "", payment_mode: "ESPECES_OMOTAL", motif: "",
    });
  }, [open, defaultChantier]);

  const submit = async () => {
    if (!form.employee_id || !form.amount) { toast.error("Employé et montant requis"); return; }
    setSaving(true);
    try {
      const emp = employees.find((e) => e.id === form.employee_id);
      await api.post("/personnel/avances", {
        ...form, amount: parseFloat(form.amount),
        chantier_id: form.chantier_id || emp?.chantier_id,
      });
      toast.success("Avance enregistrée");
      onSaved();
    } catch (e) { toast.error(e.response?.data?.detail || "Erreur"); }
    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Nouvelle avance</DialogTitle></DialogHeader>
        <div className="grid grid-cols-1 gap-3">
          <Field label="Employé *">
            <Select value={form.employee_id} onValueChange={(v) => setForm({ ...form, employee_id: v })}>
              <SelectTrigger><SelectValue placeholder="Choisir" /></SelectTrigger>
              <SelectContent>{employees.map((e) => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Date"><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></Field>
          <Field label="Montant (MAD) *"><Input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} /></Field>
          <Field label="Mode">
            <Select value={form.payment_mode} onValueChange={(v) => setForm({ ...form, payment_mode: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ESPECES_OMOTAL">Espèces OMOTAL</SelectItem>
                <SelectItem value="BANQUE_OMOTAL">Banque OMOTAL</SelectItem>
                <SelectItem value="AUTRE">Autre</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Motif"><Input value={form.motif} onChange={(e) => setForm({ ...form, motif: e.target.value })} /></Field>
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
