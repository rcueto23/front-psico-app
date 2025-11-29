const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export interface Cita {
  id: string;
  pacienteId: string;
  fecha: Date | string;
  duracion: number;
  estado: string;
  motivo?: string;
  notas?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  paciente?: {
    id: string;
    nombres: string;
    apellidos: string;
    documento: string;
    telefono?: string;
    email?: string;
  };
}

export interface CreateCitaDto {
  pacienteId: string;
  fecha: string;
  duracion?: number;
  motivo?: string;
  estado?: string;
  notas?: string;
}

export interface UpdateCitaDto {
  pacienteId?: string;
  fecha?: string;
  duracion?: number;
  motivo?: string;
  estado?: string;
  notas?: string;
}

const getAuthHeaders = () => {
  const token = localStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const citasService = {
  async getAll(): Promise<Cita[]> {
    const response = await fetch(`${API_URL}/citas`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Error al obtener citas');
    }

    return response.json();
  },

  async getByDateRange(startDate: string, endDate: string): Promise<Cita[]> {
    const response = await fetch(
      `${API_URL}/citas?startDate=${startDate}&endDate=${endDate}`,
      {
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error('Error al obtener citas');
    }

    return response.json();
  },

  async getByPaciente(pacienteId: string): Promise<Cita[]> {
    const response = await fetch(`${API_URL}/citas/paciente/${pacienteId}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Error al obtener citas del paciente');
    }

    return response.json();
  },

  async getOne(id: string): Promise<Cita> {
    const response = await fetch(`${API_URL}/citas/${id}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Error al obtener la cita');
    }

    return response.json();
  },

  async create(data: CreateCitaDto): Promise<Cita> {
    const response = await fetch(`${API_URL}/citas`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al crear la cita');
    }

    return response.json();
  },

  async update(id: string, data: UpdateCitaDto): Promise<Cita> {
    const response = await fetch(`${API_URL}/citas/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al actualizar la cita');
    }

    return response.json();
  },

  async updateEstado(id: string, estado: string): Promise<Cita> {
    const response = await fetch(`${API_URL}/citas/${id}/estado`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ estado }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al actualizar el estado');
    }

    return response.json();
  },

  async delete(id: string): Promise<void> {
    const response = await fetch(`${API_URL}/citas/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Error al eliminar la cita');
    }
  },
};
