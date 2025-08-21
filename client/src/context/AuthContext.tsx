"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { apiFetch, setAuthToken, getAuthToken } from "@/lib/api";

type User = { id: string; name: string; phone: string } | null;

type AuthContextValue = {
  user: User;
  token: string | null;
  login: (phone: string, password: string) => Promise<void>;
  register: (name: string, phone: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const t = getAuthToken();
    if (t) setToken(t);
  }, []);

  async function login(phone: string, password: string) {
    const data = await apiFetch<{ token: string; user: User }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ phone, password }),
    });
    setAuthToken(data.token);
    setToken(data.token);
    setUser(data.user);
  }

  async function register(name: string, phone: string, password: string) {
    const data = await apiFetch<{ token: string; user: User }>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, phone, password }),
    });
    setAuthToken(data.token);
    setToken(data.token);
    setUser(data.user);
  }

  function logout() {
    localStorage.removeItem("gosiri_token");
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}


