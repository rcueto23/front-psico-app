const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export interface DashboardStats {
  totalPacientes: number;
  pacientesActivos: number;
  citasMes: number;
  citasHoy: number;
  proximasCitas: Array<{
    id: string;
    fecha: string;
    estado: string;
    motivo?: string;
    paciente: {
      id: string;
      nombres: string;
      apellidos: string;
      telefono?: string;
    };
  }>;
  citasPorEstado: Array<{
    estado: string;
    cantidad: number;
  }>;
}

const getAuthHeaders = () => {
  const token = localStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const statsService = {
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await fetch(`${API_URL}/stats/dashboard`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Error al obtener estadísticas');
    }

    return response.json();
  },
};
