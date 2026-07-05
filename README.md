# Uber Frontend — CS2031 Week 14 E2E

ALUMNOS:
RICARDO JESUS PALOMINO MEZA - 202420152
Fernando Aguirre Milla - 202420003


## 1. Levantar el backend

```bash
./mvnw spring-boot:run
```

Queda en `http://localhost:8080` (H2 en memoria, sin variables de entorno).
Puedes explorar los endpoints en `http://localhost:8080/swagger-ui.html`.

## 2. Levantar este frontend

```bash
npm install
npm run dev
```

Abre `http://localhost:5173`.

Usuarios de prueba (semilla del backend): ver tabla en el README del backend
(`ana@uber.com` / `pass123` pasajero, `carlos@uber.com` / `pass123` conductor, etc.)



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
