# eSports Arena Manager · Frontend React (EP2)

Proyecto semestral de **Desarrollo FullStack II (DSY1104)**. Plataforma web para la gestión de torneos de videojuegos competitivos: consulta de torneos, inscripción individual o por equipos, administración de equipos y perfil de jugador.

Esta versión migra el frontend de HTML/CSS/JavaScript puro (EP1, conservado en `archivo-antiguo/`) a **React**, e incorpora **pruebas unitarias con Jasmine y Karma**. No hay backend: los datos viven en `src/data/mockData.js` y los cambios de la sesión se guardan en `sessionStorage` / `localStorage`.

## Integrantes

- Felipe Sánchez
- Felipe Alvarez
- Sebastiana Olivares

## Tecnologías

| Área | Herramienta |
|---|---|
| Framework frontend | React 19 + React Router DOM 7 |
| Bundler / dev server | Vite |
| Estilos | Bootstrap 5.3 + hoja de estilos propia (`src/styles/styles.css`) |
| Pruebas unitarias | Jasmine + Karma (Chrome / ChromeHeadless) |
| Cobertura | karma-coverage (Istanbul) |
| Lint | oxlint |

## Requisitos previos

- Node.js 18 o superior y npm
- Google Chrome o Microsoft Edge instalado (Karma ejecuta las pruebas en un navegador headless)

## Instalación y ejecución

```bash
git clone https://github.com/sanchezfeliper/esports-arena-manager.git
cd esports-arena-manager
git checkout develop
npm install
npm run dev
```

La aplicación queda disponible en `http://localhost:5173`.

## Scripts disponibles

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo con Vite |
| `npm run build` | Compila la versión de producción en `dist/` |
| `npm run preview` | Sirve localmente la compilación |
| `npm run lint` | Ejecuta oxlint |
| `npm test` | Ejecuta Karma en modo observación (re-ejecuta al guardar) |
| `npm run test:ci` | Ejecuta todas las pruebas una vez en Chrome headless y genera la cobertura |

## Rutas de la aplicación

| Ruta | Página |
|---|---|
| `/` | Inicio: torneos destacados y próximos cierres |
| `/torneos` | Listado y filtros de torneos |
| `/torneos/:id` | Detalle de un torneo |
| `/inscripcion` y `/inscripcion/:id` | Formulario de inscripción |
| `/equipos` | Gestión de equipos |
| `/perfil` y `/perfil/:id` | Perfil de jugador |
| `/*.html` (URLs del EP1) | Redirección a la ruta equivalente |

El selector **"Perfil de prueba"** de la cabecera simula el rol de sesión (Visitante, Jugador, Organizador, Administrador) mientras no exista autenticación real.

## Estructura del proyecto

```
├── src/
│   ├── app/            # App y router
│   ├── pages/          # Páginas (una por ruta)
│   ├── components/     # Componentes reutilizables (Modal, FormField, TournamentCard, Toast...)
│   ├── domain/         # Lógica de negocio pura (fechas, torneos, equipos, inscripción)
│   ├── services/       # Almacenamiento y manejo de roles
│   ├── data/           # Datos de ejemplo (mockData.js)
│   └── styles/         # Estilos globales
├── tests/              # Pruebas unitarias (*.spec.js) y fixtures (helpers.js)
├── karma.conf.cjs      # Configuración de Karma + Jasmine + cobertura
├── vite.config.js      # Configuración de Vite y alias (@domain, @components, ...)
├── public/img/         # Imágenes estáticas
└── archivo-antiguo/    # Versión HTML/CSS/JS del EP1
```

## Pruebas unitarias

Las pruebas se escriben con **Jasmine** y se ejecutan en un navegador real con **Karma**. Usan módulos ES nativos y dobles de prueba (`spyOn`, `jasmine.clock().mockDate`) para aislar el almacenamiento del navegador y controlar la fecha.

| Archivo | Qué valida |
|---|---|
| `tests/dates.spec.js` | Formato de fechas y días restantes con reloj simulado |
| `tests/tournaments.spec.js` | Estados, cupos, plazo de inscripción, ranking y puntaje |
| `tests/registration.spec.js` | Validación del formulario: correo, edad, cupo, plazo, sanciones, duplicados y equipos |
| `tests/teams.spec.js` | Equipo completo, IDs, carga y persistencia de equipos locales |
| `tests/localStorage.spec.js` | Lectura/escritura JSON y manejo de errores de `localStorage` y `sessionStorage` |
| `tests/helpers.js` | Fixtures reutilizables (torneo, equipo, estado de inscripción) |

### Ejecutar las pruebas y ver la cobertura

```bash
npm run test:ci
```

Al terminar, el resumen aparece en la consola y el reporte HTML queda en `coverage/`. Ábrelo con `coverage/<navegador>/index.html`.

En Windows, si no tienes Chrome instalado y quieres usar Edge, configura `CHROME_BIN` en PowerShell antes de ejecutar el mismo comando:

```powershell
$env:CHROME_BIN='C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'
npm run test:ci
```

La cobertura se mide sobre `src/domain/` y `src/services/localStorage.js`, que concentran la lógica del negocio.

## Documentación de la entrega

- **ERS** (Especificación de Requisitos del Software): versión final con la propuesta personalizada.
- **Documento de cobertura de testing**: alcance de los elementos cubiertos por las pruebas.

## Notas

- El proyecto no usa backend; la persistencia es solo del navegador y se pierde al limpiar el almacenamiento.
- La conexión a internet solo se usa para cargar las tipografías de Google Fonts.

### Pruebas de componentes React

Karma usa `karma-esbuild` para compilar JSX y empaquetar las importaciones de componentes; los alias configurados en `karma.conf.cjs` corresponden a los de Vite. Las pruebas de interacción usan `@testing-library/react` y se ejecutan con Jasmine en Chrome o Edge headless.

| Archivo | Qué valida |
|---|---|
| tests/components.spec.js | Tarjetas de torneos, error condicional de FormField, etiqueta y evento de Button, actualización de resultados al buscar, aplicación de filtros y error de rango de fechas |

### Archivos que deben versionarse

Incluye package.json y package-lock.json para que el equipo instale las dependencias de pruebas; karma.conf.cjs para su configuración; las pruebas de tests/; los componentes y páginas de src/ modificados; y este README. No subas node_modules/, coverage/ ni dist/: son directorios generados localmente.
