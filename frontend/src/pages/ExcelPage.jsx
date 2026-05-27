import React, { useState, useEffect } from "react";
import api from "@/lib/api";
import { PageHeader, LoadingState } from "@/components/common";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Upload, Download, FileSpreadsheet, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { useChantier } from "@/contexts/ChantierContext";
import { toast } from "sonner";
import { todayISO } from "@/lib/format";

const MODULES = [
  { v: "transactions", l: "Transactions caisse" },
  { v: "gasoil_entrees", l: "Entrées gasoil" },
  { v: "gasoil_sorties", l: "Sorties gasoil" },
  { v: "employees", l: "Employés" },
  { v: "engins", l: "Engins" },
];

const EXPORTS = [
  { v: "transactions", l: "Caisse / Transactions" },
  { v: "gasoil", l: "Gasoil (entrées + sorties)" },
  { v: "personnel", l: "Paie personnel" },
  { v: "engins", l: "Pointage engins" },
];

export default function ExcelPage() {
  const { selectedId, chantiers } = useChantier();
  const [module, setModule] = useState("transactions");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [mapping, setMapping] = useState({});
  const [defaultChantier, setDefaultChantier] = useState(selectedId || "");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { setDefaultChantier(selectedId || ""); }, [selectedId]);

  const doPreview = async () => {
    if (!file) { toast.error("Sélectionnez un fichier"); return; }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("file", file); fd.append("module", module);
      const r = await api.post("/excel/import/preview", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setPreview(r.data);
      setMapping(r.data.suggested_mapping || {});
    } catch (e) { toast.error(e.response?.data?.detail || "Erreur"); }
    setLoading(false);
  };

  const doCommit = async () => {
    if (!file || !preview) return;
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("file", file); fd.append("module", module);
      fd.append("mapping_json", JSON.stringify(mapping));
      if (defaultChantier) fd.append("default_chantier_id", defaultChantier);
      const r = await api.post("/excel/import/commit", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(r.data);
      toast.success(`${r.data.inserted} ligne(s) importée(s)`);
    } catch (e) { toast.error(e.response?.data?.detail || "Erreur"); }
    setLoading(false);
  };

  const doExport = (exportType) => {
    const params = new URLSearchParams();
    if (selectedId) params.append("chantier_id", selectedId);
    api.get(`/excel/export/${exportType}?${params}`, { responseType: "blob" }).then((r) => {
      const url = URL.createObjectURL(r.data);
      const a = document.createElement("a"); a.href = url;
      a.download = `${exportType}_${todayISO()}.xlsx`; a.click();
    });
  };

  const fields = preview?.columns ? [] : [];

  return (
    <div data-testid="excel-page">
      <PageHeader title="Import / Export Excel"
                  description="Migrez vos données historiques et exportez les rapports" />

      <Tabs defaultValue="import">
        <TabsList>
          <TabsTrigger value="import"><Upload className="h-4 w-4 mr-1" /> Import</TabsTrigger>
          <TabsTrigger value="export"><Download className="h-4 w-4 mr-1" /> Export</TabsTrigger>
        </TabsList>

        <TabsContent value="import" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">1. Choisir module et fichier</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs mb-1 block">Module cible</Label>
                  <Select value={module} onValueChange={setModule}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {MODULES.map((m) => <SelectItem key={m.v} value={m.v}>{m.l}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs mb-1 block">Fichier Excel (.xlsx) ou CSV</Label>
                  <Input type="file" accept=".xlsx,.xls,.csv"
                         onChange={(e) => { setFile(e.target.files[0]); setPreview(null); setResult(null); }}
                         data-testid="import-file-input" />
                </div>
                <div>
                  <Label className="text-xs mb-1 block">Chantier par défaut (si manquant)</Label>
                  <Select value={defaultChantier || "none"} onValueChange={(v) => setDefaultChantier(v === "none" ? "" : v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Aucun</SelectItem>
                      {chantiers.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={doPreview} disabled={!file || loading} data-testid="import-preview-btn">
                <FileSpreadsheet className="h-4 w-4 mr-1" /> Analyser le fichier
              </Button>
            </CardContent>
          </Card>

          {preview && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  2. Vérifier mapping & aperçu ({preview.rows_count} ligne{preview.rows_count > 1 ? "s" : ""})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-xs mb-2 block">Correspondance des colonnes</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {Object.keys(mapping).length === 0 && (
                      <div className="text-sm text-muted-foreground col-span-2">Aucun mapping suggéré. Renommez vos colonnes Excel.</div>
                    )}
                    {Object.entries(mapping).map(([field, col]) => (
                      <div key={field} className="flex items-center gap-2 text-sm">
                        <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded">{field}</span>
                        <span>←</span>
                        <Select value={col} onValueChange={(v) => setMapping({ ...mapping, [field]: v })}>
                          <SelectTrigger className="flex-1"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {preview.columns.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-xs mb-2 block">Aperçu (10 premières lignes)</Label>
                  <div className="overflow-x-auto border rounded-lg">
                    <Table>
                      <TableHeader><TableRow>
                        {preview.columns.map((c) => <TableHead key={c}>{c}</TableHead>)}
                      </TableRow></TableHeader>
                      <TableBody>
                        {preview.sample.slice(0, 10).map((row, i) => (
                          <TableRow key={i}>
                            {preview.columns.map((c) => <TableCell key={c} className="text-xs">{String(row[c] || "")}</TableCell>)}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
                <Button onClick={doCommit} disabled={loading} className="bg-emerald-600 hover:bg-emerald-700" data-testid="import-commit-btn">
                  <Upload className="h-4 w-4 mr-1" /> Importer {preview.rows_count} ligne(s)
                </Button>
              </CardContent>
            </Card>
          )}

          {result && (
            <Card>
              <CardContent className="py-6">
                <div className="flex items-center gap-3 mb-3">
                  <CheckCircle className="h-7 w-7 text-emerald-600" />
                  <div>
                    <div className="font-semibold">Import terminé</div>
                    <div className="text-sm text-muted-foreground">
                      {result.inserted}/{result.total} lignes importées · {result.errors?.length || 0} erreur(s)
                    </div>
                  </div>
                </div>
                {result.errors?.length > 0 && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm">
                    <div className="font-medium text-red-700 mb-1 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" /> Erreurs:
                    </div>
                    <ul className="text-red-700 text-xs space-y-0.5 max-h-32 overflow-y-auto">
                      {result.errors.slice(0, 20).map((er, i) => (
                        <li key={i}>Ligne {er.row}: {er.error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="export">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {EXPORTS.map((ex) => (
              <Card key={ex.v} className="kpi-card-hover cursor-pointer" onClick={() => doExport(ex.v)} data-testid={`export-${ex.v}`}>
                <CardContent className="py-6 text-center">
                  <FileSpreadsheet className="h-10 w-10 mx-auto text-primary mb-3" />
                  <div className="font-medium">{ex.l}</div>
                  <div className="text-xs text-muted-foreground mt-1">Télécharger en Excel</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
