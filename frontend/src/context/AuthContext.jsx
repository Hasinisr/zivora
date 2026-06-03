import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import api, { tokenStore } from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = tokenStore.get();
    const storedUser = localStorage.getItem("zivora_user");
    if (storedToken && storedUser) {
      setToken(storedToken);
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.warn("Failed to parse stored user, clearing", err);
        tokenStore.clear();
      }
    }
    setLoading(false);
  }, []);

  const persistSession = useCallback((data) => {
    tokenStore.set(data.token);
    localStorage.setItem("zivora_user", JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    persistSession(data);
    return data.user;
  }, [persistSession]);

  const signup = useCallback(async (email, password, name, phone) => {
    const { data } = await api.post("/auth/signup", { email, password, name, phone });
    persistSession(data);
    return data.user;
  }, [persistSession]);

  const googleLogin = useCallback(async (googleData) => {
    const { data } = await api.post("/auth/google", googleData);
    persistSession(data);
    return data.user;
  }, [persistSession]);

  const logout = useCallback(() => {
    tokenStore.clear();
    setToken(null);
    setUser(null);
  }, []);

  const updateUser = useCallback((updates) => {
    setUser((prev) => {
      const next = { ...prev, ...updates };
      localStorage.setItem("zivora_user", JSON.stringify(next));
      return next;
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        signup,
        googleLogin,
        logout,
        updateUser,
        isAuthenticated: !!token,
        isAdmin: user?.role === "admin",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
