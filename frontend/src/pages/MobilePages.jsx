import React, { useEffect, useState } from "react";
import { Outlet, useNavigate, NavLink } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useChantier } from "@/contexts/ChantierContext";
import api from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Toaster } from "@/components/ui/sonner";
import {
  Hammer, Fuel, Truck, Home, ClipboardList, LogOut, Activity,
  ArrowLeft, Plus, Save,
} from "lucide-react";
import { formatNumber, formatDate, todayISO } from "@/lib/format";
import { toast } from "sonner";

export function MobileLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 max-w-md mx-auto">
      <header className="bg-primary text-primary-foreground p-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Hammer className="h-6 w-6" />
            <div>
              <div className="font-bold">OMOTAL</div>
              <div className="text-[11px] opacity-80">{user?.name}</div>
            </div>
          </div>
          <Button size="sm" variant="ghost" className="text-white hover:bg-white/10"
                  onClick={() => { logout(); navigate("/login"); }} data-testid="mobile-logout">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </header>
      <main className="flex-1 overflow-y-auto pb-20">
        <Outlet />
      </main>
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t flex justify-around py-2 z-20">
        <BottomLink to="/mobile/accueil" icon={Home} label="Accueil" />
        <BottomLink to="/mobile/gasoil" icon={Fuel} label="Gasoil" />
        <BottomLink to="/mobile/engins" icon={Truck} label="Engins" />
        <BottomLink to="/mobile/historique" icon={ClipboardList} label="Historique" />
      </nav>
      <Toaster richColors position="top-center" />
    </div>
  );
}

function BottomLink({ to, icon: Icon, label }) {
  return (
    <NavLink to={to} className={({ isActive }) =>
      `flex flex-col items-center gap-0.5 px-3 py-1 ${isActive ? "text-primary" : "text-slate-500"}`}
      data-testid={`mobile-nav-${label.toLowerCase()}`}>
      <Icon className="h-5 w-5" />
      <span className="text-[10px]">{label}</span>
    </NavLink>
  );
}

export function MobileHome() {
  const { user } = useAuth();
  const { chantiers, selectedId, selectChantier } = useChantier();
  const navigate = useNavigate();
  const [todayStats, setTodayStats] = useState({ sorties: 0, engins: 0 });

  useEffect(() => {
    if (!selectedId) return;
    const today = todayISO();
    Promise.all([
      api.get("/gasoil/sorties", { params: { chantier_id: selectedId, date_from: today, date_to: today } }),
      api.get("/engins/pointage", { params: { chantier_id: selectedId, year: new Date().getFullYear(), month: new Date().getMonth() + 1 } }),
    ]).then(([s, e]) => {
      setTodayStats({ sorties: s.data.length, engins: e.data.length });
    });
  }, [selectedId]);

  return (
    <div className="p-4 space-y-4">
      <Card>
        <CardContent className="py-4">
          <div className="text-sm text-muted-foreground">Bonjour</div>
          <div className="text-xl font-bold">{user?.name?.split(" ")[0]} 👋</div>
          <div className="text-xs text-muted-foreground mt-1">
            {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
          </div>
        </CardContent>
      </Card>

      <div>
        <Label className="text-xs mb-1 block">Chantier actif</Label>
        <Select value={selectedId || ""} onValueChange={selectChantier}>
          <SelectTrigger className="w-full bg-white" data-testid="mobile-chantier-select">
            <SelectValue placeholder="Choisir un chantier" />
          </SelectTrigger>
          <SelectContent>
            {chantiers.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => navigate("/mobile/gasoil/sortie")}
          className="p-5 bg-orange-500 text-white rounded-2xl shadow-md active:scale-95 transition"
          data-testid="mobile-action-gasoil">
          <Fuel className="h-8 w-8 mb-2" />
          <div className="font-bold text-left">Sortie gasoil</div>
          <div className="text-xs text-white/80 text-left mt-1">Saisie rapide</div>
        </button>
        <button
          onClick={() => navigate("/mobile/engins/pointage")}
          className="p-5 bg-primary text-primary-foreground rounded-2xl shadow-md active:scale-95 transition"
          data-testid="mobile-action-engin">
          <Truck className="h-8 w-8 mb-2" />
          <div className="font-bold text-left">Pointer engins</div>
          <div className="text-xs opacity-80 text-left mt-1">Heures du jour</div>
        </button>
      </div>

      <Card>
        <CardContent className="py-4">
          <div className="text-sm font-medium mb-3 flex items-center gap-2">
            <Activity className="h-4 w-4" /> Récapitulatif du jour
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Stat label="Sorties gasoil" value={todayStats.sorties} />
            <Stat label="Engins pointés" value={todayStats.engins} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="p-3 rounded-lg bg-slate-50">
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

export function MobileGasoilSortie() {
  const navigate = useNavigate();
  const { selectedId, chantiers } = useChantier();
  const [engins, setEngins] = useState([]);
  const [form, setForm] = useState({
    engin_id: "", litres: "", affectation: "PRODUCTION", observation: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (selectedId) {
      api.get("/engins", { params: { chantier_id: selectedId } }).then((r) => setEngins(r.data));
    }
  }, [selectedId]);

  const submit = async () => {
    if (!selectedId) { toast.error("Sélectionnez un chantier sur l'accueil"); return; }
    if (!form.engin_id || !form.litres) { toast.error("Engin et litres requis"); return; }
    setSaving(true);
    try {
      await api.post("/gasoil/sorties", {
        chantier_id: selectedId, date: todayISO(), engin_id: form.engin_id,
        litres: parseFloat(form.litres), affectation: form.affectation,
        observation: form.observation,
      });
      toast.success("Sortie enregistrée");
      navigate("/mobile/accueil");
    } catch (e) { toast.error(e.response?.data?.detail || "Erreur"); }
    setSaving(false);
  };

  return (
    <div className="p-4">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)}><ArrowLeft className="h-4 w-4 mr-1" /> Retour</Button>
      <h1 className="text-2xl font-bold mt-2 mb-4 flex items-center gap-2">
        <Fuel className="h-6 w-6 text-orange-500" /> Sortie gasoil
      </h1>
      <div className="space-y-4">
        <div>
          <Label className="text-sm mb-1 block">Engin *</Label>
          <Select value={form.engin_id} onValueChange={(v) => setForm({ ...form, engin_id: v })}>
            <SelectTrigger className="h-12 text-base" data-testid="mobile-engin-select"><SelectValue placeholder="Choisir un engin" /></SelectTrigger>
            <SelectContent>
              {engins.map((e) => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-sm mb-1 block">Litres *</Label>
          <Input type="number" inputMode="decimal" className="h-12 text-base text-center text-2xl font-bold"
                 placeholder="0" value={form.litres}
                 onChange={(e) => setForm({ ...form, litres: e.target.value })}
                 data-testid="mobile-litres" />
        </div>
        <div>
          <Label className="text-sm mb-1 block">Affectation</Label>
          <Select value={form.affectation} onValueChange={(v) => setForm({ ...form, affectation: v })}>
            <SelectTrigger className="h-12 text-base"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="PRODUCTION">Production</SelectItem>
              <SelectItem value="ETP">ETP</SelectItem>
              <SelectItem value="PERSONNEL">Personnel</SelectItem>
              <SelectItem value="TRANSPORT">Transport</SelectItem>
              <SelectItem value="AUTRE">Autre</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-sm mb-1 block">Observation (optionnel)</Label>
          <Input value={form.observation} onChange={(e) => setForm({ ...form, observation: e.target.value })}
                 className="h-12 text-base" placeholder="Note..." />
        </div>
        <Button onClick={submit} disabled={saving} className="w-full h-14 text-base bg-orange-500 hover:bg-orange-600"
                data-testid="mobile-sortie-submit">
          <Save className="h-5 w-5 mr-2" /> Soumettre la sortie
        </Button>
      </div>
    </div>
  );
}

export function MobileEnginsPointage() {
  const navigate = useNavigate();
  const { selectedId } = useChantier();
  const [engins, setEngins] = useState([]);
  const [hours, setHours] = useState({});
  const [saving, setSaving] = useState(false);
  const today = new Date();
  const day = today.getDate();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;

  useEffect(() => {
    if (selectedId) {
      api.get("/engins", { params: { chantier_id: selectedId } }).then((r) => setEngins(r.data));
    }
  }, [selectedId]);

  const submit = async () => {
    if (!selectedId) { toast.error("Sélectionnez un chantier sur l'accueil"); return; }
    setSaving(true);
    try {
      for (const eng of engins) {
        const h = parseFloat(hours[eng.id] || 0);
        if (h <= 0) continue;
        // fetch existing
        const existing = await api.get("/engins/pointage", { params: { chantier_id: selectedId, year, month } });
        const ep = existing.data.find((x) => x.engin_id === eng.id);
        const entries = Array.from({ length: 31 }, (_, i) => {
          const d = i + 1;
          const ex = ep?.entries?.find((y) => y.day === d);
          if (d === day) {
            return eng.facturation_mode === "JOUR"
              ? { day: d, hours: 0, days_count: 1 }
              : { day: d, hours: h, days_count: 0 };
          }
          return ex || { day: d, hours: 0, days_count: 0 };
        });
        await api.post("/engins/pointage", {
          engin_id: eng.id, chantier_id: selectedId, year, month, entries,
        });
      }
      toast.success("Pointage enregistré");
      navigate("/mobile/accueil");
    } catch (e) { toast.error(e.response?.data?.detail || "Erreur"); }
    setSaving(false);
  };

  return (
    <div className="p-4">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)}><ArrowLeft className="h-4 w-4 mr-1" /> Retour</Button>
      <h1 className="text-2xl font-bold mt-2 mb-1 flex items-center gap-2">
        <Truck className="h-6 w-6 text-primary" /> Pointage engins
      </h1>
      <p className="text-sm text-muted-foreground mb-4">Heures travaillées aujourd'hui</p>
      <div className="space-y-3">
        {engins.length === 0 && <div className="text-center text-muted-foreground py-8">Aucun engin sur ce chantier</div>}
        {engins.map((eng) => (
          <Card key={eng.id}>
            <CardContent className="py-3 flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{eng.name}</div>
                <Badge variant="outline" className="text-[10px] mt-1">{eng.facturation_mode}</Badge>
              </div>
              <Input
                type="number" inputMode="decimal" className="w-20 h-11 text-center text-lg font-bold"
                placeholder={eng.facturation_mode === "JOUR" ? "1" : "h"}
                value={hours[eng.id] || ""}
                onChange={(e) => setHours({ ...hours, [eng.id]: e.target.value })}
                data-testid={`mobile-engin-${eng.id}-hours`}
              />
            </CardContent>
          </Card>
        ))}
      </div>
      {engins.length > 0 && (
        <Button onClick={submit} disabled={saving} className="w-full h-14 text-base mt-4" data-testid="mobile-pointage-submit">
          <Save className="h-5 w-5 mr-2" /> Soumettre la journée
        </Button>
      )}
    </div>
  );
}

export function MobileHistorique() {
  const { selectedId } = useChantier();
  const [sorties, setSorties] = useState([]);
  useEffect(() => {
    if (selectedId) {
      api.get("/gasoil/sorties", { params: { chantier_id: selectedId } }).then((r) => setSorties(r.data.slice(0, 30)));
    }
  }, [selectedId]);
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-1">Historique</h1>
      <p className="text-sm text-muted-foreground mb-4">Vos dernières saisies gasoil</p>
      <div className="space-y-2">
        {sorties.length === 0 && <div className="text-center text-muted-foreground py-8">Aucune saisie</div>}
        {sorties.map((s) => (
          <Card key={s.id}>
            <CardContent className="py-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{s.engin_name}</div>
                  <div className="text-xs text-muted-foreground">{formatDate(s.date)} · {s.affectation}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold">{formatNumber(s.litres, 0)} L</div>
                  <Badge variant="outline" className="text-[10px]">{s.status}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
