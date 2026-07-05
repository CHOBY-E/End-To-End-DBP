import { api } from './client';
import type { Trip } from '../types';

export function createTrip(pickupAddress: string, dropoffAddress: string) {
  return api.post<Trip>('/trips', { pickupAddress, dropoffAddress }).then((r) => r.data);
}

/** Historial del pasajero autenticado. */
export function getMyTrips() {
  return api.get<Trip[]>('/trips').then((r) => r.data);
}

/** Viajes PENDING disponibles para aceptar (rol DRIVER). */
export function getPendingTrips() {
  return api.get<Trip[]>('/trips/pending').then((r) => r.data);
}

/** Historial del conductor autenticado (aceptados y completados). */
export function getDriverTrips() {
  return api.get<Trip[]>('/trips/my').then((r) => r.data);
}

export function getTrip(id: number) {
  return api.get<Trip>(`/trips/${id}`).then((r) => r.data);
}

export function acceptTrip(id: number) {
  return api.patch<Trip>(`/trips/${id}/accept`).then((r) => r.data);
}

export function completeTrip(id: number) {
  return api.patch<Trip>(`/trips/${id}/complete`).then((r) => r.data);
}

export function rateTrip(id: number, rating: number, comment?: string) {
  return api.post<Trip>(`/trips/${id}/rate`, { rating, comment }).then((r) => r.data);
}
