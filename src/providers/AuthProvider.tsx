import { createContext, useState, useEffect, type ReactNode } from "react";
import { api } from "@/lib/api";

/* Types  */
interface User {
  id: number;
  fullname: string;
  email: string;
  role_id: number;
  must_change_password?: boolean;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  mustChangePassword: boolean;
  setMustChangePassword: (val: boolean) => void;
}

/* context */
export const AuthContext = createContext<AuthContextType | null>(null);

/* Provider  */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token"),
  );
  const [mustChangePassword, setMustChangePasswordState] = useState<boolean>(
    localStorage.getItem("must_change_password") === "true"
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const BASE_URL = import.meta.env.VITE_API_URL;

  const setMustChangePassword = (val: boolean) => {
    setMustChangePasswordState(val);
    if (val) {
      localStorage.setItem("must_change_password", "true");
    } else {
      localStorage.removeItem("must_change_password");
    }
  };

  useEffect(() => {
    const validateSession = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(BASE_URL + '/user', {
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
        
        // Note: As specified, /user does not return must_change_password.
        // We rely on the value stored in localStorage set during login.
      } catch (error) {
        localStorage.removeItem("token");
        localStorage.removeItem("must_change_password");
        setToken(null);
        setUser(null);
        setMustChangePasswordState(false);
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
      const data = await api.post("/login", { email, password });
      
      localStorage.setItem("token", data.token);
      setToken(data.token);
      setUser(data.user);

      const mustChange = data.must_change_password || data.user?.must_change_password || false;
      setMustChangePassword(mustChange);

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
      await api.post("/logout", {});
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("must_change_password");
      setToken(null);
      setUser(null);
      setMustChangePasswordState(false);
      setLoading(false);
      window.location.href = "/";
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
        mustChangePassword,
        setMustChangePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
