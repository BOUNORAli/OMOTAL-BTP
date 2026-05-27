import React, { createContext, useContext, useEffect, useState } from "react";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

const ChantierContext = createContext(null);

export function ChantierProvider({ children }) {
  const { user } = useAuth();
  const [chantiers, setChantiers] = useState([]);
  const [selectedId, setSelectedId] = useState(() => localStorage.getItem("omotal_chantier") || null);
  const [loading, setLoading] = useState(false);

  const fetchChantiers = async () => {
    setLoading(true);
    try {
      const r = await api.get("/chantiers");
      setChantiers(r.data);
      if (!selectedId && r.data.length > 0) {
        setSelectedId(r.data[0].id);
        localStorage.setItem("omotal_chantier", r.data[0].id);
      }
    } catch (e) { /* ignore */ }
    setLoading(false);
  };

  // Re-fetch whenever user changes (login/logout) and we have a token
  useEffect(() => {
    if (user && localStorage.getItem("omotal_token")) {
      fetchChantiers();
    } else if (!user) {
      setChantiers([]);
    }
    // eslint-disable-next-line
  }, [user?.id]);

  const selectChantier = (id) => {
    setSelectedId(id);
    if (id) localStorage.setItem("omotal_chantier", id);
    else localStorage.removeItem("omotal_chantier");
  };

  const selected = chantiers.find((c) => c.id === selectedId);

  return (
    <ChantierContext.Provider value={{ chantiers, selectedId, selected, selectChantier, refresh: fetchChantiers, loading }}>
      {children}
    </ChantierContext.Provider>
  );
}

export function useChantier() {
  return useContext(ChantierContext);
}
