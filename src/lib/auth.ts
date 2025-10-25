// Servicio de autenticación para conectar con el backend
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export interface User {
  id: string;
  email: string;
  nombre: string;
  apellido: string;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  nombre: string;
  apellido: string;
}

class AuthService {
  private tokenKey = 'auth_token';
  private userKey = 'auth_user';

  // Login
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error al iniciar sesión' }));
      throw new Error(error.message || 'Credenciales inválidas');
    }

    const data: AuthResponse = await response.json();
    this.setToken(data.access_token);
    this.setUser(data.user);
    return data;
  }

  // Register
  async register(userData: RegisterData): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error al registrar usuario' }));
      throw new Error(error.message || 'Error en el registro');
    }

    const data: AuthResponse = await response.json();
    this.setToken(data.access_token);
    this.setUser(data.user);
    return data;
  }

  // Validate token
  async validateToken(): Promise<User | null> {
    const token = this.getToken();
    if (!token) return null;

    try {
      const response = await fetch(`${API_URL}/auth/validate`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        this.logout();
        return null;
      }

      const data = await response.json();
      return data.user;
    } catch (error) {
      console.error('Error al validar el token:', error);
      this.logout();
      return null;
    }
  }

  // Logout
  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem(this.userKey);
    }
  }

  // Get token
  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.tokenKey);
  }

  // Set token
  private setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.tokenKey, token);
    }
  }

  // Get user
  getUser(): User | null {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem(this.userKey);
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  // Set user
  private setUser(user: User): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.userKey, JSON.stringify(user));
    }
  }

  // Check if authenticated
  isAuthenticated(): boolean {
    return this.getToken() !== null;
  }
}

export const authService = new AuthService();
