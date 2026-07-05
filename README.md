# Uber Frontend — CS2031 Week 14 E2E

Frontend React + TypeScript conectado al backend
[`cs2031-2026-1-week14-e2e-2`](https://github.com/CS2031-DBP/cs2031-2026-1-week14-e2e-2),
con tests E2E en Playwright que cubren las 7 pantallas del enunciado.

## 1. Levantar el backend

En otra carpeta, clona y corre el backend (requiere Java + Maven):

```bash
git clone https://github.com/CS2031-DBP/cs2031-2026-1-week14-e2e-2.git
cd cs2031-2026-1-week14-e2e-2
./mvnw spring-boot:run
```

Queda en `http://localhost:8080` (H2 en memoria, sin variables de entorno).
Puedes explorar los endpoints en `http://localhost:8080/swagger-ui.html`.

## 2. Levantar este frontend

```bash
npm install
cp .env.example .env      # ya apunta a http://localhost:8080
npm run dev
```

Abre `http://localhost:5173`.

Usuarios de prueba (semilla del backend): ver tabla en el README del backend
(`ana@uber.com` / `pass123` pasajero, `carlos@uber.com` / `pass123` conductor, etc.)

## 3. Correr los tests E2E

Los tests usan Playwright y requieren backend (`:8080`) y frontend (`:5173`) corriendo,
o Playwright levanta el frontend por ti si no está corriendo aún.

```bash
npx playwright install chromium   # solo la primera vez, descarga el navegador
npm run test:e2e                  # modo headless
npm run test:e2e:ui               # modo interactivo (recomendado la primera vez)
```

Los tests están en `e2e/`:

- `auth.spec.ts` — registro (pasajero y conductor), login, error de credenciales, logout.
- `trip-flow.spec.ts` — flujo completo con dos sesiones simultáneas (pasajero y conductor):
  pedir viaje → ver conductores disponibles → conductor acepta → conductor completa →
  pasajero califica → aparece en historial. Cubre los 7 endpoints principales.
- `history.spec.ts` — filtro de historial por estado, para ambos roles.

> Nota: el backend usa H2 **in-memory**, así que los datos se resetean cada vez que
> reinicias `./mvnw spring-boot:run`. Los tests generan direcciones/emails únicos por
> corrida (timestamp) para no chocar entre ejecuciones sin reiniciar el backend.

## Estructura

```
src/
  api/          cliente axios + funciones por recurso (auth, users, trips)
  context/      AuthContext (JWT + usuario actual)
  components/   Navbar, ProtectedRoute, StatusBadge, StarRating
  pages/        LoginPage, PassengerDashboard, RequestTripPage,
                DriverDashboard, TripDetailPage, HistoryPage
e2e/            tests Playwright
```

## Pantallas y endpoints cubiertos

| Pantalla | Endpoints |
|---|---|
| Login / Registro | `POST /auth/register` · `POST /auth/login` · `GET /users/me` |
| Dashboard pasajero | `GET /users/me` · `GET /trips` |
| Solicitar viaje | `GET /drivers/available` · `POST /trips` |
| Detalle de viaje (pasajero) | `GET /trips/{id}` · `POST /trips/{id}/rate` (con polling) |
| Dashboard conductor | `GET /users/me` · `GET /trips/pending` · `GET /trips/my` · `PATCH /trips/{id}/accept` |
| Detalle de viaje (conductor) | `GET /trips/{id}` · `PATCH /trips/{id}/complete` |
| Historial | `GET /trips` (pasajero) · `GET /trips/my` (conductor), con filtro por estado |
