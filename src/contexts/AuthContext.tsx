"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { authService, User, LoginCredentials, RegisterData } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Verificar si hay un usuario autenticado al cargar
    const checkAuth = async () => {
      try {
        const storedUser = authService.getUser();
        if (storedUser) {
          // Validar token con el backend
          const validatedUser = await authService.validateToken();
          if (validatedUser) {
            setUser(validatedUser);
          } else {
            setUser(null);
          }
        }
      } catch (error) {
        console.error("Error al verificar autenticación:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      const response = await authService.login(credentials);
      setUser(response.user);
      toast.success("Inicio de sesión exitoso");
      router.push("/dashboard/pacientes");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error al iniciar sesión";
      toast.error(message);
      throw error;
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      const response = await authService.register(userData);
      setUser(response.user);
      toast.success("Registro exitoso");
      router.push("/dashboard/pacientes");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error al registrar usuario";
      toast.error(message);
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    toast.info("Sesión cerrada");
    router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: user !== null,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  }
  return context;
}
