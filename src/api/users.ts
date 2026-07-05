import { api } from './client';
import type { User } from '../types';

export function getMe() {
  return api.get<User>('/users/me').then((r) => r.data);
}

export function getAvailableDrivers() {
  return api.get<User[]>('/drivers/available').then((r) => r.data);
}
