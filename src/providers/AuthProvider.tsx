import { createContext, useState, useEffect, type ReactNode } from "react";
import { api } from "@/lib/api";

/* Types  */
interface User {
  id: number;
  name: string;
  email: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

/* context */
export const AuthContext = createContext<AuthContextType | null>(null);

/* Provider  */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token"),
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const BASE_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const validateSession = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(BASE_URL + 'user', {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json'
          },
        });

        if (!res.ok) {
          throw new Error("Token inválido o expirado");
        }

        const data = await res.json();

        setUser(data);
      } catch (error) {
        localStorage.removeItem("token");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    validateSession();
  }, []);

  async function login(email: string, password: string) {
    setLoading(true);
    setError(null);
    try {
      const data = await api.post("login", { email, password });
      localStorage.setItem("token", data.token);
      setToken(data.token);
      setUser(data.user);
    } catch (err: any) {
      setError(err?.message ?? "Error al iniciar sesión");
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    setLoading(true);
    try {
      await api.post("logout", {});
    } finally {
      localStorage.removeItem("token");
      setToken(null);
      setUser(null);
      setLoading(false);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        login,
        logout,
        isAuthenticated: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
