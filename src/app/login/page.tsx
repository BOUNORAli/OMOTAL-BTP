"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Building2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { StatusPill } from "@/components/erp/status-pill";
import { roleLabels } from "@/lib/domain/labels";
import { users } from "@/lib/domain/mock-data";
import { isBackendEnabled } from "@/services/api-client";
import { dataSource } from "@/services/data-source";
import { useAppStore } from "@/stores/app-store";

export default function LoginPage() {
  const router = useRouter();
  const setCurrentUser = useAppStore((state) => state.setCurrentUser);
  const [email, setEmail] = useState("ali@omotal.ma");
  const [password, setPassword] = useState("password");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function submitLogin(targetEmail = email) {
    setPending(true);
    setError(null);
    try {
      const session = await dataSource.authService.login(targetEmail, password);
      setCurrentUser(session.user, session.token);
      router.push(session.user.role === "pointeur" ? "/mobile/accueil" : "/app/dashboard");
    } catch (exception) {
      setError(exception instanceof Error ? exception.message : "Connexion impossible.");
    } finally {
      setPending(false);
    }
  }

  function loginAs(userId: string) {
    const user = users.find((item) => item.id === userId);
    if (!user) return;

    setCurrentUser(user, "mock-token");
    router.push(user.role === "pointeur" ? "/mobile/accueil" : "/app/dashboard");
  }

  return (
    <main className="grid min-h-screen bg-[#f5f7fb] lg:grid-cols-[0.8fr_1.2fr]">
      <section className="flex items-center justify-center border-r border-slate-200 bg-white p-5">
        <Card className="w-full max-w-md p-6 shadow-xl">
          <div className="mb-6">
            <div className="mb-4 flex size-12 items-center justify-center rounded-lg bg-[#12355b] text-white">
              <Building2 className="size-6" />
            </div>
            <h1 className="text-2xl font-black text-slate-950">OMOTAL TRAVAUX</h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Connexion ERP multi-chantiers.
            </p>
          </div>

          <form
            className="space-y-3"
            onSubmit={(event) => {
              event.preventDefault();
              void submitLogin();
            }}
          >
            <Input onChange={(event) => setEmail(event.target.value)} placeholder="Email" type="email" value={email} />
            <Input onChange={(event) => setPassword(event.target.value)} placeholder="Mot de passe" type="password" value={password} />
            {error ? <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{error}</p> : null}
            <Button className="w-full" disabled={pending} type="submit">
              Connexion
              <ArrowRight className="size-4" />
            </Button>
          </form>
        </Card>
      </section>

      <section className="flex items-center justify-center p-5">
        <div className="w-full max-w-3xl">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase text-orange-600">Profils rapides</p>
              <h2 className="mt-1 text-2xl font-black text-slate-950">Choisir un role</h2>
            </div>
            <StatusPill tone={isBackendEnabled() ? "success" : "info"}>{isBackendEnabled() ? "Backend" : "Demo"}</StatusPill>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {users.map((user) => (
              <button
                className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-4 text-left text-sm shadow-sm transition hover:border-orange-300 hover:bg-orange-50"
                key={user.id}
                onClick={() => {
                  if (isBackendEnabled()) {
                    setEmail(user.email);
                    void submitLogin(user.email);
                  } else {
                    loginAs(user.id);
                  }
                }}
                type="button"
              >
                <span className="min-w-0">
                  <strong className="block truncate text-slate-950">{user.name}</strong>
                  <span className="text-xs text-slate-500">{roleLabels[user.role]}</span>
                </span>
                <ArrowRight className="size-4 text-slate-400" />
              </button>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
            <ShieldCheck className="size-4 text-slate-500" />
            <span>Les permissions backend restent la source de verite.</span>
          </div>
        </div>
      </section>
    </main>
  );
}
