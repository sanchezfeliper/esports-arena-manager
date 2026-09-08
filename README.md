# esports-arena-manager
Proyecto para fullstack destinado al fronted de una organización de torneos de esports, utilizando javascript y html principalmente
# eSports Arena Manager · Frontend (EP1)

Proyecto semestral — Desarrollo FullStack II (DSY1104). Base web de la plataforma
de gestión de torneos de esports, construida con HTML5, CSS3 y JavaScript puro,
sin framework y sin backend (los datos viven en `js/datos.js`).

## Integrantes
- Felipe Sánchez — Developer / GitHub
- Felipe Alvarez — Developer / GitHub
- Sebastiana Olivares — Developer / GitHub

## Requisitos previos
- Un navegador moderno (Chrome, Edge o Firefox actualizados).
- No se requiere Node.js ni ningún gestor de paquetes para esta entrega: es HTML/CSS/JS estático.
- Conexión a internet solo para cargar las tipografías de Google Fonts (Rajdhani, Inter, JetBrains Mono); si no hay conexión, el sitio sigue funcionando con las tipografías del sistema.

## Cómo ejecutarlo
1. Descomprime o clona el repositorio.
2. Abre `index.html` directamente en el navegador, **o** sirve la carpeta con un servidor estático simple para evitar restricciones de `file://` en algunos navegadores:
   ```bash
   # Con Python
   python3 -m http.server 5500
   # luego visita http://localhost:5500
   ```
   ```bash
   # Con la extensión "Live Server" de VS Code
   # clic derecho sobre index.html > "Open with Live Server"
   ```
3. Navega desde el menú superior: Inicio, Torneos, Equipos, Mi perfil.
4. El selector **"Perfil de prueba"** en la cabecera simula el rol de sesión (Visitante, Jugador, Organizador, Administrador) mientras no existe autenticación real; algunas acciones se muestran u ocultan según el rol elegido. Esto se reemplaza por el JWT real en EP3.

## Estructura de carpetas
```
eam-ep1/
├── index.html               Vista 1: Inicio
├── torneos.html              Vista 2: Listado de torneos (filtros + buscador)
├── detalle-torneo.html       Vista 3: Detalle de torneo (llaves, ranking, premios)
├── inscripcion.html          Vista 4: Inscripción a torneo
├── equipo.html                Vista 5: Gestión de equipo
├── perfil.html                Vista 6: Perfil de jugador
├── css/
│   └── estilos.css           Hoja de estilos externa única (variables, layout, componentes)
├── js/
│   ├── datos.js               Estructuras simuladas: juegos, jugadores, equipos, torneos
│   ├── ui.js                  Utilidades compartidas: helpers de reglas de negocio, fechas, errores de formulario, nav y selector de rol
│   ├── inicio.js
│   ├── torneos.js
│   ├── detalle-torneo.js
│   ├── inscripcion.js
│   ├── equipo.js
│   └── perfil.js
└── README.md
```

## Notas de diseño
- Paleta oficial del caso: **2. Táctico rojo** (declarada como variables CSS en `css/estilos.css`, sección 1).
- El estado de un torneo (abierto / en curso / finalizado) y el resultado de una partida nunca se comunican solo con color: siempre llevan una etiqueta de texto junto al indicador (`.chip`).
- Las reglas de negocio (`cuposDisponibles`, `inscripcionFueraDePlazo`, `tieneSancionActiva`, `equipoCompleto` en `js/ui.js`) están aisladas como funciones puras para poder reutilizarlas tal cual en las pruebas unitarias de Jasmine/Karma de EP2.

## Próximos pasos (fuera del alcance de EP1)
- EP2: migración a React + Bootstrap, mismas rutas lógicas, pruebas unitarias.
- EP3: reemplazo de `datos.js` por llamadas reales a la API REST, autenticación JWT y control de acceso por rol desde el token.

