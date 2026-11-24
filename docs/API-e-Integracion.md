# Documentación de API e integración

## Datos generales

- Base local: `http://localhost:8080`
- Prefijo REST: `/api/v1`
- Swagger UI: `http://localhost:8080/swagger-ui.html`
- OpenAPI JSON: `http://localhost:8080/v3/api-docs`
- Autenticación: cabecera `Authorization: Bearer <access-token>`.

## Endpoints

| Método | Ruta | Acceso | Función |
|---|---|---|---|
| POST | `/auth/register` | Público | Crear usuario `JUGADOR`. |
| POST | `/auth/login` | Público | Validar credenciales y emitir access/refresh token. |
| POST | `/auth/refresh` | Refresh token | Consumir el refresh token y emitir un par renovado. |
| POST | `/auth/logout` | Público, con refresh token | Revocar la sesión actual; la operación es idempotente. |
| GET | `/auth/me` | Autenticado | Consultar el usuario del access token. |
| GET | `/juegos` | Público | Consultar catálogo de juegos. |
| GET | `/torneos`, `/torneos/{id}` | Público | Consultar torneos y detalle. |
| POST, PUT, DELETE | `/torneos[/{id}]` | Organizador, administrador | CRUD de torneos. |
| GET | `/equipos`, `/equipos/{id}` | Público | Consultar equipos activos y su información pública. |
| POST, PUT, DELETE | `/equipos[/{id}]` | Organizador, administrador | Gestionar equipos y validar capitanes/integrantes registrados. No se elimina un equipo con inscripciones asociadas. |
| GET | `/inscripciones` | Jugador, administrador | Consultar inscripciones del usuario autenticado. |
| POST | `/inscripciones` | Jugador, administrador | Inscribir al usuario del token, individualmente o con un equipo elegible, en un torneo abierto. |
| GET | `/usuarios/jugadores` | Organizador, administrador | Consultar identificadores y nombres de jugadores para armar equipos. |
| GET | `/usuarios` | Administrador | Consultar usuarios sin exponer contraseñas. |
| PATCH | `/usuarios/{id}/role` | Administrador | Cambiar rol. Valores: `JUGADOR`, `ORGANIZADOR`, `ADMINISTRADOR`. |

Los torneos con inscripciones no se pueden eliminar: deben cerrarse o actualizarse para conservar el historial. El servidor vuelve a validar permisos y reglas aunque el cliente oculte controles.

## Ejemplos de integración

Registro:

```http
POST /api/v1/auth/register
Content-Type: application/json

{"nombre":"Ana Pérez","email":"ana@example.com","password":"UnaClaveSegura2026"}
```

Respuesta: `201 Created` con `token`, `refreshToken` y objeto `user` (`id`, `nombre`, `email`, `role`). El frontend guarda los tokens en `sessionStorage`, adjunta el access token a las peticiones y solicita `/auth/refresh` ante un `401`. El refresh token anterior se invalida en el servidor.

Crear torneo como organizador/administrador:

```http
POST /api/v1/torneos
Authorization: Bearer <access-token>
Content-Type: application/json

{"nombre":"Copa Arena","juegoId":3,"modalidad":"Eliminación directa","cupoMaximo":16,"fechaInicio":"2027-02-15","fechaCierreInscripcion":"2027-02-10","estado":"ABIERTO","descripcion":"Copa de Rocket League","reglas":"Mejor de tres mapas"}
```

Inscripción individual:

```http
POST /api/v1/inscripciones
Authorization: Bearer <access-token>
Content-Type: application/json

{"torneoId":3,"tipo":"individual"}
```

## Flujo frontend-backend

1. El navegador carga la aplicación desde Vite (puerto 5173).
2. Registro/login envía credenciales al backend. El servidor verifica BCrypt y entrega tokens JWT.
3. El proveedor de sesión valida el access token al recargar mediante `GET /auth/me`.
4. La portada y el listado/detalle de torneos consumen `GET /torneos`; el listado de equipos y sus cambios consumen `/equipos`.
5. La pantalla de inscripción envía `POST /inscripciones`; el servidor valida rol, estado, plazo, cupos, tipo de participación, juego, roster y duplicados. La reserva de cupo se protege con bloqueo del torneo.
6. Los guards del cliente ocultan rutas según el rol; Spring Security vuelve a validar cada operación protegida.

## Validación visual pendiente

Las siguientes comprobaciones quedan pendientes de ejecutar en un equipo con Java 21, Maven, dependencias npm y Chrome instalados:

1. Listado de torneos y juegos cargados desde la API.
2. Inicio de sesión y renovación al recargar la página.
3. Acceso denegado para un rol insuficiente.
4. Inscripción aceptada y persistida.
5. Endpoints descritos en Swagger.
