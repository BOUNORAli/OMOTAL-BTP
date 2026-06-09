"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Clock3, Fuel, HardHat, Home, Truck } from "lucide-react";
import { cn } from "@/utils/cn";

const items = [
  { href: "/mobile/accueil", icon: Home, label: "Accueil" },
  { href: "/mobile/production/nouveau", icon: HardHat, label: "Production" },
  { href: "/mobile/gasoil/sortie", icon: Fuel, label: "Gasoil" },
  { href: "/mobile/engins/pointage", icon: Truck, label: "Engins" },
  { href: "/mobile/historique", icon: Clock3, label: "Historique" },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white px-2 py-2 shadow-[0_-12px_30px_rgba(15,23,42,0.08)]">
      <div className="mx-auto grid max-w-md grid-cols-5 gap-1">
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              className={cn(
                "flex flex-col items-center gap-1 rounded-lg px-2 py-2 text-[11px] font-bold text-slate-500",
                active && "bg-orange-50 text-orange-700",
              )}
              href={item.href}
              key={item.href}
            >
              <Icon className="size-5" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
