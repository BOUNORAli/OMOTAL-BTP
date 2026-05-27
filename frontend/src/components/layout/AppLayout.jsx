import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar, { ChantierSelector, MobileSidebarTrigger } from "./Sidebar";
import { Toaster } from "@/components/ui/sonner";

export default function AppLayout() {
  return (
    <div className="h-screen flex bg-slate-50">
      <div className="hidden lg:block">
        <Sidebar />
      </div>
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 px-4 lg:px-6 flex items-center justify-between gap-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <MobileSidebarTrigger />
            <ChantierSelector />
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="hidden md:inline">{new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</span>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
      <Toaster richColors position="top-right" />
    </div>
  );
}
