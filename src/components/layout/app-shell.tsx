"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { isBackendEnabled } from "@/services/api-client";
import { useAppStore } from "@/stores/app-store";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";

export function AppShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const authToken = useAppStore((state) => state.authToken);

  useEffect(() => {
    if (isBackendEnabled() && !authToken) {
      router.replace("/login");
    }
  }, [authToken, router]);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="min-w-0 flex-1">
          <Topbar />
          <main className="mx-auto w-full max-w-[1500px] p-4 lg:p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
