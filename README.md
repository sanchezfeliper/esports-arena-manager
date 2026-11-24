# eSports Arena Manager

Aplicación para consultar torneos de esports, gestionar equipos e inscribir jugadores. El proyecto incluye un frontend React/Vite y una API REST con Spring Boot.

## Requisitos

- Node.js compatible con Vite 8 y npm.
- Java 21 y Maven 3.6.3 o posterior para el backend.
- Navegador Chromium para ejecutar las pruebas de frontend en modo headless.

## Iniciar el frontend

Desde la raíz del proyecto:

```powershell
npm ci
Copy-Item .env.example .env.local
npm run dev
```

El frontend queda disponible en `http://localhost:5173`. `VITE_API_URL` apunta por defecto al backend local en `http://localhost:8080/api/v1`.

## Iniciar el backend

En una segunda terminal:

```powershell
cd backend
$env:JWT_SECRET = 'REEMPLAZAR_POR_UN_SECRETO_ALEATORIO_DE_AL_MENOS_32_BYTES'
$env:ADMIN_PASSWORD = 'DEFINIR_UNA_CLAVE_LOCAL_SEGURA'
$env:FRONTEND_ORIGIN = 'http://localhost:5173'
mvn spring-boot:run
```

La API usa H2 en modo archivo para desarrollo y escucha en `http://localhost:8080`. El usuario administrador inicial utiliza `ADMIN_EMAIL` (por defecto `admin@arena.local`) y `ADMIN_PASSWORD`; define ambos fuera del repositorio. Nunca publiques secretos ni credenciales.

## Base de datos

- Desarrollo: H2 en archivo `backend/data/eam`, esquema actualizado automáticamente.
- MySQL: perfil `mysql`; configura `DATABASE_URL`, `DATABASE_USERNAME` y `DATABASE_PASSWORD`.
- Validación para producción: combina los perfiles `mysql,prod` y configura `DDL_AUTO=validate`. Prepara y versiona el esquema antes del primer despliegue.
- La consola H2 está desactivada por defecto.

Por ejemplo, para iniciar con MySQL y la validación de esquema:

```powershell
$env:SPRING_PROFILES_ACTIVE = 'mysql,prod'
$env:DATABASE_URL = 'jdbc:mysql://localhost:3306/esports_arena?serverTimezone=UTC'
$env:DATABASE_USERNAME = 'usuario_local'
$env:DATABASE_PASSWORD = 'clave_local'
$env:JWT_SECRET = 'REEMPLAZAR_POR_UN_SECRETO_ALEATORIO_DE_AL_MENOS_32_BYTES'
$env:ADMIN_PASSWORD = 'DEFINIR_UNA_CLAVE_LOCAL_SEGURA'
mvn spring-boot:run
```

## Funciones disponibles

- Registro e inicio de sesión con JWT y renovación de sesión.
- Catálogo de juegos y consulta de torneos desde la API.
- Administración de torneos para organizadores y administradores.
- Administración de equipos, capitanes e integrantes registrados.
- Inscripción individual o por equipo, con validación de plazo, cupos y duplicados en backend.
- Consulta de perfil propio e inscripciones.
- Administración de usuarios y roles por administradores.

Las páginas de partidos, resultados, estadísticas y edición de perfil no están implementadas como funciones conectadas a la API. El perfil muestra la información disponible y las inscripciones propias.

## API y roles

- Prefijo: `/api/v1`.
- OpenAPI: `http://localhost:8080/v3/api-docs`.
- Swagger UI: `http://localhost:8080/swagger-ui.html`.
- Visitantes pueden consultar juegos, torneos y equipos.
- Jugadores se inscriben a sí mismos; el servidor determina el usuario desde el token.
- Organizadores y administradores gestionan equipos y torneos.
- Administradores consultan usuarios y asignan roles.

Consulta el detalle de endpoints, reglas y ejemplos en [docs/API-e-Integracion.md](docs/API-e-Integracion.md).

## Verificación

```powershell
npm run lint
npm run test:ci
npm run build
```

Para el backend:

```powershell
cd backend
mvn test
```

Las pruebas de Karma necesitan Chrome instalado; las pruebas Java necesitan Java 21 y Maven.
