import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "../types";
import { loginApi, registerCitizenApi, getMeApi } from "../api/auth";

export const TOKEN_KEY = "infravision_token";

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  login: (credentials: { email: string; password: string }) => Promise<User>;
  register: (data: { name: string; email: string; password: string }) => Promise<User>;
  logout: () => void;
  clearError: () => void;
  switchDemoRole?: (roleUser: User, token: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize session on startup
  useEffect(() => {
    async function restoreSession() {
      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await getMeApi();
        if (response && response.user) {
          setUser(response.user);
        } else {
          localStorage.removeItem(TOKEN_KEY);
          setUser(null);
        }
      } catch (err) {
        console.warn("Session restore failed, clearing token:", err);
        localStorage.removeItem(TOKEN_KEY);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    restoreSession();
  }, []);

  const login = async (credentials: { email: string; password: string }): Promise<User> => {
    setError(null);
    try {
      const response = await loginApi(credentials);
      localStorage.setItem(TOKEN_KEY, response.token);
      setUser(response.user);
      return response.user;
    } catch (err: any) {
      const message = err.message || "Invalid email or password.";
      setError(message);
      throw err;
    }
  };

  const register = async (data: { name: string; email: string; password: string }): Promise<User> => {
    setError(null);
    try {
      const response = await registerCitizenApi(data);
      localStorage.setItem(TOKEN_KEY, response.token);
      setUser(response.user);
      return response.user;
    } catch (err: any) {
      const message = err.message || "Failed to register account.";
      setError(message);
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
    setError(null);
  };

  const clearError = () => {
    setError(null);
  };

  const switchDemoRole = (roleUser: User, token: string) => {
    localStorage.setItem(TOKEN_KEY, token);
    setUser(roleUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        error,
        login,
        register,
        logout,
        clearError,
        switchDemoRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
