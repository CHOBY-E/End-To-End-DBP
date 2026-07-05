import axios from 'axios';

// La URL del backend se lee de una variable de entorno de Vite.
// Ver .env.example — por defecto apunta a http://localhost:8080
export const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8081';

export const api = axios.create({
  baseURL: API_BASE_URL,
});

// Adjunta el JWT guardado en localStorage a cada request saliente.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Si el backend responde 401 (token vencido / inválido), limpiamos sesión
// y mandamos al usuario de vuelta al login.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.assign('/login');
      }
    }
    return Promise.reject(error);
  }
);

/** Extrae un mensaje de error legible de una respuesta de la API del backend. */
export function extractErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data;
    if (data?.error) return data.error as string;
    if (data && typeof data === 'object') {
      const firstKey = Object.keys(data)[0];
      if (firstKey) return `${firstKey}: ${data[firstKey]}`;
    }
    if (err.message) return err.message;
  }
  return 'Ocurrió un error inesperado';
}
