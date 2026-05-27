import React from "react";
import "@/App.css";
import "@/index.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ChantierProvider } from "@/contexts/ChantierContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppLayout from "@/components/layout/AppLayout";
import { Toaster } from "@/components/ui/sonner";

import LoginPage from "@/pages/LoginPage";
import GlobalDashboard from "@/pages/GlobalDashboard";
import ChantierDashboard from "@/pages/ChantierDashboard";
import ChantiersPage from "@/pages/ChantiersPage";
import CaissePage from "@/pages/CaissePage";
import GasoilPage from "@/pages/GasoilPage";
import PersonnelPage from "@/pages/PersonnelPage";
import EnginsPage from "@/pages/EnginsPage";
import ValidationsPage from "@/pages/ValidationsPage";
import AlertesPage from "@/pages/AlertesPage";
import ExcelPage from "@/pages/ExcelPage";
import AdminPage from "@/pages/AdminPage";
import {
  MobileLayout, MobileHome, MobileGasoilSortie,
  MobileEnginsPointage, MobileHistorique,
} from "@/pages/MobilePages";

function RootRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === "POINTEUR") return <Navigate to="/mobile/accueil" replace />;
  return <Navigate to="/dashboard" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ChantierProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<RootRedirect />} />

            {/* Mobile routes */}
            <Route element={<ProtectedRoute><MobileLayout /></ProtectedRoute>}>
              <Route path="/mobile/accueil" element={<MobileHome />} />
              <Route path="/mobile/gasoil" element={<MobileGasoilSortie />} />
              <Route path="/mobile/gasoil/sortie" element={<MobileGasoilSortie />} />
              <Route path="/mobile/engins" element={<MobileEnginsPointage />} />
              <Route path="/mobile/engins/pointage" element={<MobileEnginsPointage />} />
              <Route path="/mobile/historique" element={<MobileHistorique />} />
            </Route>

            {/* Desktop routes */}
            <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
              <Route path="/dashboard" element={<GlobalDashboard />} />
              <Route path="/chantiers" element={<ChantiersPage />} />
              <Route path="/chantiers/:chantierId" element={<ChantierDashboard />} />
              <Route path="/caisse" element={<CaissePage />} />
              <Route path="/gasoil" element={<GasoilPage />} />
              <Route path="/personnel" element={<PersonnelPage />} />
              <Route path="/engins" element={<EnginsPage />} />
              <Route path="/validations" element={<ValidationsPage />} />
              <Route path="/alertes" element={<AlertesPage />} />
              <Route path="/excel" element={<ExcelPage />} />
              <Route path="/admin" element={<ProtectedRoute perms={["*"]}><AdminPage /></ProtectedRoute>} />
            </Route>

            <Route path="*" element={<RootRedirect />} />
          </Routes>
          <Toaster richColors position="top-right" />
        </ChantierProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
