"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

export default function Home() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (isAuthenticated) {
        router.push("/dashboard/pacientes");
      } else {
        router.push("/login");
      }
    }
  }, [isAuthenticated, loading, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
        <p className="mt-4 text-sm text-muted-foreground">Cargando...</p>
      </div>
    </div>
  );
}
