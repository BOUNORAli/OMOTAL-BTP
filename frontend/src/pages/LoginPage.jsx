import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";
import { ROLES, ROLE_BADGES } from "@/lib/permissions";
import { Hammer, LogIn, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("omotal123");
  const [demoUsers, setDemoUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/auth/demo-users").then((r) => setDemoUsers(r.data.users || [])).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const u = await login(email, password);
      toast.success(`Bienvenue, ${u.name}`);
      navigate(u.role === "POINTEUR" ? "/mobile/accueil" : "/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Erreur de connexion");
    }
    setLoading(false);
  };

  const quickLogin = (e) => { setEmail(e); setPassword("omotal123"); };

  return (
    <div className="min-h-screen w-full flex items-stretch bg-slate-50" data-testid="login-page">
      {/* Left visual panel */}
      <div className="hidden lg:flex flex-col justify-between p-12 w-1/2 omotal-grad text-white">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center">
            <Hammer className="h-7 w-7" />
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight">OMOTAL TRAVAUX</div>
            <div className="text-white/80 text-sm">Gestion centralisée de chantiers</div>
          </div>
        </div>
        <div>
          <h1 className="text-4xl font-bold leading-tight mb-4">
            Une seule plateforme pour tous vos chantiers.
          </h1>
          <p className="text-white/85 text-lg max-w-md">
            Caisse, gasoil, personnel, engins, validations… fiabilisés, mobiles, en temps réel.
          </p>
          <div className="mt-8 grid grid-cols-3 gap-4 text-sm">
            <Stat label="Multi-chantiers" value="✓" />
            <Stat label="Mobile terrain" value="✓" />
            <Stat label="Exports Excel" value="✓" />
          </div>
        </div>
        <div className="text-white/60 text-xs">
          © {new Date().getFullYear()} OMOTAL TRAVAUX — v1.0
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <Card className="w-full max-w-md shadow-xl border-slate-200">
          <CardHeader className="text-center">
            <div className="mx-auto h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-2 lg:hidden">
              <Hammer className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl">Connexion</CardTitle>
            <CardDescription>Accédez à votre tableau de bord OMOTAL</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4" data-testid="login-form">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" required value={email}
                       onChange={(e) => setEmail(e.target.value)} placeholder="prenom@omotal.ma"
                       data-testid="email-input" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <Input id="password" type="password" required value={password}
                       onChange={(e) => setPassword(e.target.value)} placeholder="••••••••"
                       data-testid="password-input" />
              </div>
              <Button type="submit" className="w-full h-11" disabled={loading} data-testid="login-submit">
                {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <LogIn className="h-4 w-4 mr-2" />}
                Se connecter
              </Button>
            </form>

            {demoUsers.length > 0 && (
              <div className="mt-6 pt-6 border-t">
                <p className="text-xs text-muted-foreground mb-3 text-center">
                  Comptes de démonstration (mot de passe: <code className="font-mono">omotal123</code>)
                </p>
                <div className="grid gap-2">
                  {demoUsers.map((u) => (
                    <button
                      key={u.email}
                      onClick={() => quickLogin(u.email)}
                      data-testid={`demo-user-${u.role}`}
                      className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 hover:border-primary hover:bg-slate-50 text-left transition-colors"
                    >
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{u.name}</span>
                        <span className="text-xs text-muted-foreground">{u.email}</span>
                      </div>
                      <Badge variant="outline" className={ROLE_BADGES[u.role] || ""}>
                        {ROLES[u.role] || u.role}
                      </Badge>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-lg bg-white/10 backdrop-blur px-3 py-2.5">
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-white/75 text-xs">{label}</div>
    </div>
  );
}
