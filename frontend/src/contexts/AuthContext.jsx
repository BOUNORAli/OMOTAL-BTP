import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import api from "@/lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("omotal_user");
    return raw ? JSON.parse(raw) : null;
  });
  const [loading, setLoading] = useState(false);

  const login = useCallback(async (email, password) => {
    const resp = await api.post("/auth/login", { email, password });
    const { access_token, user: u } = resp.data;
    localStorage.setItem("omotal_token", access_token);
    localStorage.setItem("omotal_user", JSON.stringify(u));
    setUser(u);
    return u;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("omotal_token");
    localStorage.removeItem("omotal_user");
    setUser(null);
  }, []);

  const refreshMe = useCallback(async () => {
    try {
      const r = await api.get("/auth/me");
      setUser(r.data);
      localStorage.setItem("omotal_user", JSON.stringify(r.data));
    } catch (e) {}
  }, []);

  useEffect(() => {
    if (user) refreshMe();
    // eslint-disable-next-line
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, refreshMe }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
