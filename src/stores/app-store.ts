"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { chantiers, users } from "@/lib/domain/mock-data";
import type { Chantier, User } from "@/lib/domain/types";

interface AppState {
  currentUser: User;
  selectedChantierId: string;
  sidebarCollapsed: boolean;
  setCurrentUser: (user: User) => void;
  setSelectedChantierId: (chantierId: string) => void;
  toggleSidebar: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      currentUser: users[0],
      selectedChantierId: chantiers[0].id,
      sidebarCollapsed: false,
      setCurrentUser: (user) =>
        set({
          currentUser: user,
          selectedChantierId: user.chantierIds[0] ?? chantiers[0].id,
        }),
      setSelectedChantierId: (selectedChantierId) => set({ selectedChantierId }),
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
    }),
    {
      name: "omotal-app-store",
      partialize: (state) => ({
        currentUser: state.currentUser,
        selectedChantierId: state.selectedChantierId,
      }),
    },
  ),
);

export function useSelectedChantier(chantiersList: Chantier[] = chantiers) {
  const selectedChantierId = useAppStore((state) => state.selectedChantierId);
  return chantiersList.find((chantier) => chantier.id === selectedChantierId) ?? chantiersList[0];
}
