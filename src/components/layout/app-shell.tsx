"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { isBackendEnabled } from "@/services/api-client";
import { useAppStore } from "@/stores/app-store";
import { MobileAppNav } from "./mobile-app-nav";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";

export function AppShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const authToken = useAppStore((state) => state.authToken);
  const [storeHydrated, setStoreHydrated] = useState(false);

  useEffect(() => {
    const markHydrated = () => setStoreHydrated(true);
    if (useAppStore.persist?.hasHydrated?.()) {
      queueMicrotask(markHydrated);
    }
    return useAppStore.persist?.onFinishHydration?.(markHydrated);
  }, []);

  useEffect(() => {
    if (storeHydrated && isBackendEnabled() && !authToken) {
      router.replace("/login");
    }
  }, [authToken, router, storeHydrated]);

  if (!storeHydrated) {
    return <div className="min-h-screen bg-slate-50" />;
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f5f7fb]">
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="min-w-0 flex-1 overflow-x-hidden">
          <Topbar />
          <main className="w-full px-4 py-4 lg:px-5">{children}</main>
        </div>
      </div>
      <MobileAppNav />
    </div>
  );
}
