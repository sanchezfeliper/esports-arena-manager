/* ==========================================================================
   eSports Arena Manager - EP1
   main.js - Lógica compartida: render de header, navegación, selector de rol,
   footer, helpers de DOM y toast. Se carga en TODAS las vistas.
   ========================================================================== */

/* ---------- Configuración de roles ---------- */
const ROLES = [
  { id: 'visitante',     nombre: 'Visitante',     icono: '👁️' },
  { id: 'jugador',       nombre: 'Jugador',       icono: '🎮' },
  { id: 'organizador',   nombre: 'Organizador',   icono: '📋' },
  { id: 'administrador', nombre: 'Administrador', icono: '⚙️' }
];

const ROL_KEY = 'eam_rol_actual';

function obtenerRolActual() {
  return localStorage.getItem(ROL_KEY) || 'visitante';
}

function guardarRol(rolId) {
  localStorage.setItem(ROL_KEY, rolId);
}

/* ---------- Inicialización de la página ---------- */
function inicializarPagina(paginaActiva) {
  renderHeader(paginaActiva);
  renderFooter();
  configurarSelectorRol();
  configurarNavegacionMovil();
  actualizarVisibilidadPorRol();
}

/* ---------- Header ---------- */
function renderHeader(paginaActiva) {
  const header = document.getElementById('sitio-header');
  if (!header) return;

  const rolActual = obtenerRolActual();

  const enlaces = [
    { href: 'index.html',            id: 'inicio',     texto: 'Inicio' },
    { href: 'torneos.html',           id: 'torneos',    texto: 'Torneos' },
    { href: 'inscripcion.html',       id: 'inscripcion', texto: 'Inscripción' },
    { href: 'equipo.html',            id: 'equipo',     texto: 'Equipos' },
    { href: 'perfil.html',            id: 'perfil',     texto: 'Perfil' }
  ];

  const navItems = enlaces.map(e => `
    <a href="${e.href}" class="navegacion__enlace ${e.id === paginaActiva ? 'navegacion__enlace--activo' : ''}">${e.texto}</a>
  `).join('');

  const opcionesRol = ROLES.map(r => `
    <option value="${r.id}" ${r.id === rolActual ? 'selected' : ''}>${r.icono}  ${r.nombre}</option>
  `).join('');

  header.innerHTML = `
    <div class="sitio-header__contenedor">
      <a href="index.html" class="sitio-header__marca" aria-label="Ir al inicio de eSports Arena Manager">
        <img src="img/logo.svg" alt="Logo de eSports Arena Manager" class="sitio-header__logo" width="36" height="36">
        <span>Arena Manager</span>
      </a>
      <button class="sitio-header__toggle" id="nav-toggle" aria-label="Abrir menú de navegación" aria-expanded="false">☰</button>
      <nav class="navegacion" id="navegacion" aria-label="Navegación principal">
        ${navItems}
      </nav>
      <div class="sitio-header__acciones">
        <div class="selector-rol" role="group" aria-label="Selector de perfil de prueba">
          <span class="selector-rol__etiqueta selector-rol__icono" aria-hidden="true">👤</span>
          <label for="selector-rol-select" class="selector-rol__etiqueta sr-only">Perfil de prueba</label>
          <select id="selector-rol-select" class="selector-rol__select" aria-describedby="ayuda-rol">
            ${opcionesRol}
          </select>
        </div>
      </div>
    </div>
  `;

  // Añadir ayuda accesible
  const ayuda = document.createElement('span');
  ayuda.id = 'ayuda-rol';
  ayuda.className = 'sr-only';
  ayuda.textContent = 'En EP1 los roles se simulan seleccionando un perfil de prueba.';
  header.appendChild(ayuda);
}

/* ---------- Footer ---------- */
function renderFooter() {
  const footer = document.getElementById('sitio-footer');
  if (!footer) return;

  const anio = new Date().getFullYear();

  footer.innerHTML = `
    <div class="sitio-footer__contenedor">
      <div>
        <div class="sitio-footer__marca">
          <img src="img/logo.svg" alt="Logo de eSports Arena Manager" width="28" height="28">
          <span>eSports Arena Manager</span>
        </div>
        <p class="sitio-footer__descripcion">
          Plataforma para organizar torneos de videojuegos competitivos: juegos habilitados,
          jugadores, equipos, torneos, inscripciones, partidas, resultados, rankings, sanciones y premios.
        </p>
      </div>
      <div>
        <h3 class="sitio-footer__col-titulo">Navegación</h3>
        <ul class="sitio-footer__lista">
          <li><a href="index.html">Inicio</a></li>
          <li><a href="torneos.html">Torneos</a></li>
          <li><a href="inscripcion.html">Inscripción</a></li>
          <li><a href="equipo.html">Equipos</a></li>
          <li><a href="perfil.html">Perfil de jugador</a></li>
        </ul>
      </div>
      <div>
        <h3 class="sitio-footer__col-titulo">Información</h3>
        <ul class="sitio-footer__lista">
          <li>Asignatura: Desarrollo FullStack II</li>
          <li>Evaluación Parcial 1 (30%)</li>
          <li>Tecnología: HTML5, CSS3 y JavaScript</li>
          <li>Datos simulados en arreglos JS</li>
        </ul>
      </div>
    </div>
    <div class="sitio-footer__barra">
      <span>&copy; ${anio} eSports Arena Manager - Proyecto académico DSY1104</span>
      <span>Paleta 1: Arena púrpura</span>
    </div>
  `;
}

/* ---------- Selector de rol ---------- */
function configurarSelectorRol() {
  const select = document.getElementById('selector-rol-select');
  if (!select) return;
  select.addEventListener('change', (e) => {
    guardarRol(e.target.value);
    mostrarToast(`Perfil cambiado a "${ROLES.find(r => r.id === e.target.value).nombre}". Las acciones se ajustan al rol.`, 'info');
    actualizarVisibilidadPorRol();
  });
}

/* ---------- Visibilidad de acciones según rol ---------- */
function actualizarVisibilidadPorRol() {
  const rol = obtenerRolActual();
  document.querySelectorAll('[data-rol]').forEach(el => {
    const rolesPermitidos = el.dataset.rol.split(',').map(s => s.trim());
    if (rolesPermitidos.includes(rol)) {
      el.classList.remove('oculto');
      el.setAttribute('aria-hidden', 'false');
    } else {
      el.classList.add('oculto');
      el.setAttribute('aria-hidden', 'true');
    }
  });
}

/* ---------- Navegación móvil ---------- */
function configurarNavegacionMovil() {
  const toggle = document.getElementById('nav-toggle');
  const nav = document.getElementById('navegacion');
  if (!toggle || !nav) return;
  toggle.addEventListener('click', () => {
    const abierto = nav.classList.toggle('navegacion--abierto');
    toggle.setAttribute('aria-expanded', String(abierto));
    toggle.textContent = abierto ? '✕' : '☰';
  });
}

/* ---------- Helpers de DOM ---------- */

// Crea un elemento con atributos y contenido
function crearElemento(tag, attrs = {}, contenido = '') {
  const el = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => {
    if (k === 'class') el.className = v;
    else if (k === 'dataset') Object.entries(v).forEach(([dk, dv]) => el.dataset[dk] = dv);
    else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2).toLowerCase(), v);
    else if (v !== null && v !== undefined) el.setAttribute(k, v);
  });
  if (contenido) el.innerHTML = contenido;
  return el;
}

// Devuelve texto seguro (escape de HTML)
function escaparHTML(texto) {
  if (texto == null) return '';
  const div = document.createElement('div');
  div.textContent = String(texto);
  return div.innerHTML;
}

// Obtiene parámetro de la URL
function obtenerParametroUrl(nombre) {
  const params = new URLSearchParams(window.location.search);
  return params.get(nombre);
}

/* ---------- Toast ---------- */
let toastTimeout = null;

function mostrarToast(mensaje, tipo = 'exito') {
  const existente = document.querySelector('.toast');
  if (existente) existente.remove();
  if (toastTimeout) clearTimeout(toastTimeout);

  const iconos = { exito: '✓', error: '⚠', info: 'ℹ' };
  const toast = crearElemento('div', {
    class: `toast toast--${tipo}`,
    role: 'status',
    'aria-live': 'polite'
  });
  toast.innerHTML = `<span class="aviso__icono" aria-hidden="true">${iconos[tipo] || '✓'}</span><span>${escaparHTML(mensaje)}</span>`;
  document.body.appendChild(toast);

  toastTimeout = setTimeout(() => toast.remove(), 4000);
  toast.addEventListener('click', () => toast.remove());
}

/* ---------- Helpers de formulario ---------- */

// Muestra mensaje de error junto a un campo
function mostrarErrorCampo(input, mensaje) {
  const campo = input.closest('.campo');
  if (!campo) return;
  let contenedor = campo.querySelector('.campo__error');
  if (!contenedor) {
    contenedor = crearElemento('div', { class: 'campo__error', role: 'alert' });
    campo.appendChild(contenedor);
  }
  contenedor.textContent = mensaje;
  contenedor.style.display = 'flex';
  input.classList.add('campo__entrada--invalido');
  input.setAttribute('aria-invalid', 'true');
}

// Limpia el mensaje de error de un campo
function limpiarErrorCampo(input) {
  const campo = input.closest('.campo');
  if (!campo) return;
  const contenedor = campo.querySelector('.campo__error');
  if (contenedor) contenedor.textContent = '';
  input.classList.remove('campo__entrada--invalido');
  input.removeAttribute('aria-invalid');
}

// Valida correo electrónico
function esCorreoValido(correo) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(correo);
}

// Valida que un texto no tenga espacios
function noContieneEspacios(texto) {
  return !/\s/.test(texto);
}

// Exponer helpers globalmente
window.EAM = {
  ROLES, obtenerRolActual, guardarRol, inicializarPagina,
  actualizarVisibilidadPorRol, crearElemento, escaparHTML,
  obtenerParametroUrl, mostrarToast,
  mostrarErrorCampo, limpiarErrorCampo, esCorreoValido, noContieneEspacios
};
