"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, Building2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { roleLabels } from "@/lib/domain/labels";
import { users } from "@/lib/domain/mock-data";
import { useAppStore } from "@/stores/app-store";

export default function LoginPage() {
  const router = useRouter();
  const setCurrentUser = useAppStore((state) => state.setCurrentUser);

  function loginAs(userId: string) {
    const user = users.find((item) => item.id === userId);
    if (!user) return;

    setCurrentUser(user);
    router.push(user.role === "pointeur" ? "/mobile/accueil" : "/app/dashboard");
  }

  return (
    <main className="grid min-h-screen bg-slate-950 lg:grid-cols-[1.1fr_0.9fr]">
      <section className="relative hidden overflow-hidden p-10 text-white lg:block">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(242,140,40,0.35),transparent_28rem),radial-gradient(circle_at_80%_40%,rgba(59,130,246,0.25),transparent_24rem)]" />
        <div className="relative z-10 flex h-full flex-col justify-between rounded-[2rem] border border-white/10 bg-white/5 p-10 backdrop-blur">
          <div className="flex items-center gap-3">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-orange-500 font-black">OT</span>
            <div>
              <strong className="block">OMOTAL TRAVAUX</strong>
              <span className="text-sm text-slate-300">Gestion de chantiers</span>
            </div>
          </div>
          <div>
            <p className="mb-3 text-sm font-black uppercase tracking-[0.28em] text-orange-300">Frontend MVP</p>
            <h1 className="max-w-2xl text-6xl font-black tracking-tight text-balance">
              Un ERP chantier clair avant meme de brancher le backend.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-slate-300">
              Valider les roles, workflows, tableaux de bord et parcours terrain avec des donnees mockees realistes.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3 text-sm">
            <span className="rounded-2xl bg-white/10 p-4">Caisse</span>
            <span className="rounded-2xl bg-white/10 p-4">Gasoil</span>
            <span className="rounded-2xl bg-white/10 p-4">Pointage</span>
          </div>
        </div>
      </section>

      <section className="flex items-center justify-center bg-slate-50 p-5">
        <Card className="w-full max-w-md p-6 shadow-xl">
          <div className="mb-6">
            <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-[#12355b] text-white">
              <Building2 className="size-6" />
            </div>
            <h2 className="text-3xl font-black tracking-tight text-slate-950">Connexion</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Simulation frontend : choisissez un profil pour tester les menus, permissions et redirections.
            </p>
          </div>

          <form className="space-y-3" onSubmit={(event) => event.preventDefault()}>
            <Input defaultValue="ali@omotal.ma" placeholder="Email" type="email" />
            <Input defaultValue="********" placeholder="Mot de passe" type="password" />
            <Button className="w-full" onClick={() => loginAs("user-ali")} type="button">
              Connexion Ali
              <ArrowRight className="size-4" />
            </Button>
          </form>

          <div className="mt-6 border-t border-slate-100 pt-5">
            <p className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-wide text-slate-500">
              <ShieldCheck className="size-4" />
              Profils rapides
            </p>
            <div className="grid gap-2">
              {users.map((user) => (
                <button
                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-3 text-left text-sm transition hover:border-orange-200 hover:bg-orange-50"
                  key={user.id}
                  onClick={() => loginAs(user.id)}
                  type="button"
                >
                  <span>
                    <strong className="block text-slate-950">{user.name}</strong>
                    <span className="text-xs text-slate-500">{roleLabels[user.role]}</span>
                  </span>
                  <ArrowRight className="size-4 text-slate-400" />
                </button>
              ))}
            </div>
          </div>
        </Card>
      </section>
    </main>
  );
}
