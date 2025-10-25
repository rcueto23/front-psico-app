const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export interface Paciente {
  id: string;
  nombres: string;
  apellidos: string;
  tipoDocumento: string;
  documento: string;
  email?: string;
  telefono?: string;
  nacimiento?: Date | string;
  sexo: string;
  direccion?: string;
  notas?: string;
  estado: string;
  etiquetas?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface CreatePacienteDto {
  nombres: string;
  apellidos: string;
  tipoDocumento: string;
  documento: string;
  email?: string;
  telefono?: string;
  nacimiento?: string;
  sexo?: string;
  direccion?: string;
  notas?: string;
  estado?: string;
  etiquetas?: string;
}

export interface UpdatePacienteDto {
  nombres?: string;
  apellidos?: string;
  tipoDocumento?: string;
  documento?: string;
  email?: string;
  telefono?: string;
  nacimiento?: string;
  sexo?: string;
  direccion?: string;
  notas?: string;
  estado?: string;
  etiquetas?: string;
}

const getAuthHeaders = () => {
  const token = localStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const pacientesService = {
  async getAll(): Promise<Paciente[]> {
    const response = await fetch(`${API_URL}/pacientes`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Error al obtener pacientes');
    }

    return response.json();
  },

  async getOne(id: string): Promise<Paciente> {
    const response = await fetch(`${API_URL}/pacientes/${id}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Error al obtener el paciente');
    }

    return response.json();
  },

  async create(data: CreatePacienteDto): Promise<Paciente> {
    const response = await fetch(`${API_URL}/pacientes`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al crear el paciente');
    }

    return response.json();
  },

  async update(id: string, data: UpdatePacienteDto): Promise<Paciente> {
    const response = await fetch(`${API_URL}/pacientes/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al actualizar el paciente');
    }

    return response.json();
  },

  async delete(id: string): Promise<void> {
    const response = await fetch(`${API_URL}/pacientes/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Error al eliminar el paciente');
    }
  },
};
