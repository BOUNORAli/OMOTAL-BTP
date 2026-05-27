import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { can, canAny } from "@/lib/permissions";

export default function ProtectedRoute({ children, perms = [], anyOf }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (perms && perms.length > 0) {
    const ok = anyOf ? canAny(user, perms) : perms.every((p) => can(user, p));
    if (!ok) {
      return (
        <div className="p-8 text-center text-muted-foreground">
          <h2 className="text-xl font-semibold text-slate-800">Accès refusé</h2>
          <p className="mt-2">Vous n'avez pas la permission de voir cette page.</p>
        </div>
      );
    }
  }
  return children;
}
