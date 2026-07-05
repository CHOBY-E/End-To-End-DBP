import { api } from './client';
import type { AuthResponse, LoginPayload, RegisterPayload } from '../types';

export function register(payload: RegisterPayload) {
  return api.post<AuthResponse>('/auth/register', payload).then((r) => r.data);
}

export function login(payload: LoginPayload) {
  return api.post<AuthResponse>('/auth/login', payload).then((r) => r.data);
}
