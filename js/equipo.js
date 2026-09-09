/* ==========================================================================
   eSports Arena Manager - EP1
   equipo.js - Lógica de la gestión de equipos:
   Validaciones del formulario de creación:
   - Nombre obligatorio (3-30 caracteres) y sin duplicados en datos disponibles
   - Capitán obligatorio (se agrega como primer integrante)
   - Juego principal obligatorio
   Gestión de integrantes:
   - Un mismo jugador no puede repetirse en el equipo
   - Un equipo inactivo no puede inscribirse (aviso)
   - Acciones para agregar y quitar jugadores con su rol
   ========================================================================== */

const equiposLocales = []; // equipos creados en la sesión (sobre EQUIPOS de data.js)
const EQUIPOS_SESSION_KEY = 'eam_equipos_creados';

document.addEventListener('DOMContentLoaded', () => {
  EAM.inicializarPagina('equipo');
  cargarEquiposLocales();
  cargarJuegosEnSelect();
  cargarJugadoresEnSelect();
  cargarEquiposEnGestionYLista();
  configurarFormulario();
  validarFormulario();
});

/* ---------- Persistencia ligera (sessionStorage) ---------- */
function cargarEquiposLocales() {
  const guardados = sessionStorage.getItem(EQUIPOS_SESSION_KEY);
  if (guardados) {
    const arr = JSON.parse(guardados);
    arr.forEach(e => {
      // Generar nuevo id único
      e.id = siguienteIdEquipo();
      equiposLocales.push(e);
    });
  }
}

function guardarEquiposLocales() {
  // Guardar sin el id dinámico (se recalcula al cargar)
  const serializables = equiposLocales.map(e => ({
    nombre: e.nombre, juegoId: e.juegoId, capitanId: e.capitanId,
    activo: e.activo, integrantes: e.integrantes
  }));
  sessionStorage.setItem(EQUIPOS_SESSION_KEY, JSON.stringify(serializables));
}

function siguienteIdEquipo() {
  const todos = [...Datos.EQUIPOS, ...equiposLocales];
  return Math.max(...todos.map(e => e.id), 0) + 1;
}

/* ---------- Carga selects ---------- */
function cargarJuegosEnSelect() {
  const select = document.getElementById('juego-equipo');
  Datos.JUEGOS.forEach(j => {
    select.appendChild(EAM.crearElemento('option', { value: String(j.id) }, EAM.escaparHTML(j.nombre)));
  });
}

function cargarJugadoresEnSelect() {
  const select = document.getElementById('capitan-equipo');
  Datos.JUGADORES.forEach(j => {
    select.appendChild(EAM.crearElemento('option', { value: String(j.id) }, `${EAM.escaparHTML(j.apodo)} (${EAM.escaparHTML(j.nombre)})`));
  });
}

function obtenerTodosLosEquipos() {
  return [...Datos.EQUIPOS, ...equiposLocales];
}

function cargarEquiposEnGestionYLista() {
  // Select de gestión
  const selectG = document.getElementById('equipo-gestionar');
  const valorActual = selectG.value;
  selectG.innerHTML = '<option value="">Selecciona un equipo para gestionar...</option>';
  obtenerTodosLosEquipos().forEach(e => {
    const opt = EAM.crearElemento('option', { value: String(e.id) }, `${EAM.escaparHTML(e.nombre)}${e.activo ? '' : ' (inactivo)'}`);
    selectG.appendChild(opt);
  });
  selectG.value = valorActual;

  // Evento de cambio
  selectG.onchange = () => renderGestionIntegrantes();

  // Lista de equipos
  renderListaEquipos();
}

/* ---------- Configuración del formulario ---------- */
function configurarFormulario() {
  const inputs = ['nombre-equipo', 'juego-equipo', 'capitan-equipo'];
  inputs.forEach(id => {
    const el = document.getElementById(id);
    el.addEventListener('input', validarFormulario);
    el.addEventListener('change', validarFormulario);
  });

  document.getElementById('form-equipo').addEventListener('submit', onCrear);
  document.getElementById('btn-limpiar-equipo').addEventListener('click', () => {
    setTimeout(validarFormulario, 0);
  });
}

/* ---------- Validación del formulario ---------- */
function validarFormulario() {
  const nombre = document.getElementById('nombre-equipo');
  const juego = document.getElementById('juego-equipo');
  const capitan = document.getElementById('capitan-equipo');

  let valido = true;

  // Nombre obligatorio y longitud
  const valorNombre = nombre.value.trim();
  if (!valorNombre) {
    EAM.mostrarErrorCampo(nombre, 'El nombre del equipo es obligatorio.');
    valido = false;
  } else if (valorNombre.length < 3) {
    EAM.mostrarErrorCampo(nombre, 'El nombre debe tener al menos 3 caracteres.');
    valido = false;
  } else if (valorNombre.length > 30) {
    EAM.mostrarErrorCampo(nombre, 'El nombre no puede superar 30 caracteres.');
    valido = false;
  } else {
    // Sin duplicados en datos disponibles
    const existe = obtenerTodosLosEquipos().some(e =>
      e.nombre.toLowerCase() === valorNombre.toLowerCase()
    );
    if (existe) {
      EAM.mostrarErrorCampo(nombre, `Ya existe un equipo llamado "${EAM.escaparHTML(valorNombre)}". Elige otro nombre.`);
      valido = false;
    } else {
      EAM.limpiarErrorCampo(nombre);
    }
  }

  // Juego obligatorio
  if (!juego.value) {
    EAM.mostrarErrorCampo(juego, 'Selecciona el juego principal del equipo.');
    valido = false;
  } else {
    EAM.limpiarErrorCampo(juego);
  }

  // Capitán obligatorio
  if (!capitan.value) {
    EAM.mostrarErrorCampo(capitan, 'Selecciona el capitán del equipo.');
    valido = false;
  } else {
    EAM.limpiarErrorCampo(capitan);
  }

  document.getElementById('btn-crear').disabled = !valido;
  return valido;
}

/* ---------- Crear equipo ---------- */
function onCrear(e) {
  e.preventDefault();
  if (!validarFormulario()) {
    EAM.mostrarToast('Existen errores en el formulario. Revísalos.', 'error');
    return;
  }

  const nombre = document.getElementById('nombre-equipo').value.trim();
  const juegoId = Number(document.getElementById('juego-equipo').value);
  const capitanId = Number(document.getElementById('capitan-equipo').value);
  const activo = document.getElementById('activo-equipo').checked;

  const nuevoEquipo = {
    id: siguienteIdEquipo(),
    nombre,
    juegoId,
    capitanId,
    activo,
    integrantes: [{ jugadorId: capitanId, rol: 'Capitán' }]
  };

  equiposLocales.push(nuevoEquipo);
  guardarEquiposLocales();
  cargarEquiposEnGestionYLista();

  EAM.mostrarToast(`Equipo "${EAM.escaparHTML(nombre)}" creado con éxito.`, 'exito');

  // Limpiar formulario
  document.getElementById('form-equipo').reset();
  validarFormulario();
}

/* ---------- Renderiza lista de equipos ---------- */
function renderListaEquipos() {
  const cont = document.getElementById('lista-equipos');
  cont.innerHTML = '';

  obtenerTodosLosEquipos().forEach(eq => {
    const juego = Datos.obtenerJuego(eq.juegoId);
    const capitan = Datos.obtenerJugador(eq.capitanId);
    const tarjeta = EAM.crearElemento('article', { class: 'tarjeta tarjeta-torneo' });
    tarjeta.innerHTML = `
      <div class="tarjeta-torneo__juego">
        <span class="tarjeta-torneo__icono" style="background-color:${juego.color}22;color:${juego.color};" aria-hidden="true">${juego.icono}</span>
        <div>
          <p class="tarjeta-torneo__nombre-juego">${EAM.escaparHTML(juego.nombre)}</p>
          <span class="badge ${eq.activo ? 'badge--abierto' : 'badge--cancelado'}">${eq.activo ? 'Activo' : 'Inactivo'}</span>
        </div>
      </div>
      <h3 class="tarjeta-torneo__titulo">${EAM.escaparHTML(eq.nombre)}</h3>
      <div class="tarjeta-torneo__meta">
        <span class="tarjeta-torneo__meta-item">👥 ${eq.integrantes.length} integrantes</span>
        <span class="tarjeta-torneo__meta-item">🎖️ Cap: ${EAM.escaparHTML(capitan.apodo)}</span>
      </div>
      <div class="tarjeta-torneo__acciones">
        <button class="boton boton-secundario boton--sm boton--bloque" data-gestionar="${eq.id}">Gestionar integrantes</button>
      </div>
    `;
    cont.appendChild(tarjeta);
  });

  cont.querySelectorAll('[data-gestionar]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.getElementById('equipo-gestionar').value = btn.dataset.gestionar;
      renderGestionIntegrantes();
      document.getElementById('equipo-gestionar').scrollIntoView({ behavior: 'smooth' });
    });
  });
}

/* ---------- Gestión de integrantes ---------- */
function renderGestionIntegrantes() {
  const cont = document.getElementById('gestion-integrantes');
  const id = Number(document.getElementById('equipo-gestionar').value);

  if (!id) {
    cont.innerHTML = `
      <div class="estado-vacio">
        <div class="estado-vacio__icono" aria-hidden="true">🛡️</div>
        <p class="estado-vacio__titulo">Selecciona un equipo</p>
        <p>Elige un equipo para ver y gestionar sus integrantes.</p>
      </div>
    `;
    return;
  }

  const equipo = obtenerTodosLosEquipos().find(e => e.id === id);
  if (!equipo) return;
  const juego = Datos.obtenerJuego(equipo.juegoId);

  let avisoInactivo = '';
  if (!equipo.activo) {
    avisoInactivo = `
      <div class="aviso aviso--advertencia" role="alert">
        <span class="aviso__icono" aria-hidden="true">⚠</span>
        <span>Este equipo está inactivo. <strong>No puede inscribirse en torneos</strong> hasta que se reactivee.</span>
      </div>
    `;
  }

  // Jugadores disponibles para agregar (no ya integrantes)
  const integrantesIds = equipo.integrantes.map(i => i.jugadorId);
  const disponibles = Datos.JUGADORES.filter(j => !integrantesIds.includes(j.id));

  const filas = equipo.integrantes.map((i, idx) => {
    const jugador = Datos.obtenerJugador(i.jugadorId);
    const esCapitan = i.jugadorId === equipo.capitanId;
    return `
      <tr>
        <td>${idx + 1}</td>
        <td>${EAM.escaparHTML(jugador.apodo)}</td>
        <td>${EAM.escaparHTML(jugador.nombre)}</td>
        <td>
          <span class="badge badge--${esCapitan ? 'primario' : 'encurso'}">${EAM.escaparHTML(i.rol)}</span>
        </td>
        <td>
          ${esCapitan
            ? '<span class="texto-muted" style="font-size:0.85rem;">No se puede quitar al capitán</span>'
            : `<button class="boton boton-peligro boton--sm" data-quitar="${i.jugadorId}" aria-label="Quitar a ${EAM.escaparHTML(jugador.apodo)} del equipo">Quitar</button>`
          }
        </td>
      </tr>
    `;
  }).join('');

  const minIntegrantes = juego.minIntegrantes;
  const cumpleMinimo = equipo.integrantes.length >= minIntegrantes;

  cont.innerHTML = `
    ${avisoInactivo}
    <div class="resumen__lista mb-2">
      <div class="resumen__item"><span class="resumen__clave">Equipo</span><span class="resumen__valor">${EAM.escaparHTML(equipo.nombre)}</span></div>
      <div class="resumen__item"><span class="resumen__clave">Juego</span><span class="resumen__valor">${EAM.escaparHTML(juego.nombre)} (${juego.modalidad})</span></div>
      <div class="resumen__item"><span class="resumen__clave">Integrantes</span><span class="resumen__valor">${equipo.integrantes.length} / máx. ${juego.maxIntegrantes}</span></div>
      <div class="resumen__item"><span class="resumen__clave">Mínimo exigido</span><span class="resumen__valor ${cumpleMinimo ? 'texto-acierto' : 'texto-error'}">${minIntegrantes} ${cumpleMinimo ? '✓' : '✗'}</span></div>
    </div>

    <div class="tabla-contenedor mb-2">
      <table class="tabla">
        <caption class="sr-only">Integrantes del equipo ${EAM.escaparHTML(equipo.nombre)}</caption>
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">Apodo</th>
            <th scope="col">Nombre</th>
            <th scope="col">Rol</th>
            <th scope="col">Acción</th>
          </tr>
        </thead>
        <tbody>${filas}</tbody>
      </table>
    </div>

    ${disponibles.length > 0 && equipo.integrantes.length < juego.maxIntegrantes ? `
      <form class="formulario" id="form-agregar" aria-label="Agregar integrante al equipo">
        <div class="campo">
          <label class="campo__etiqueta" for="jugador-agregar">Agregar jugador</label>
          <select class="campo__select" id="jugador-agregar" required>
            ${disponibles.map(j => `<option value="${j.id}">${EAM.escaparHTML(j.apodo)} (${EAM.escaparHTML(j.nombre)})</option>`).join('')}
          </select>
        </div>
        <div class="campo">
          <label class="campo__etiqueta" for="rol-agregar">Rol en el equipo <span class="campo__obligatorio" aria-hidden="true">*</span></label>
          <input class="campo__entrada" type="text" id="rol-agregar" required minlength="2" maxlength="20"
                 placeholder="Ej: Soporte, Mid, ADC..." autocomplete="off">
          <span class="campo__ayuda">Entre 2 y 20 caracteres.</span>
        </div>
        <button type="submit" class="boton boton-primario boton--sm">Agregar al equipo</button>
      </form>
    ` : `
      <div class="aviso aviso--info">
        <span class="aviso__icono" aria-hidden="true">ℹ</span>
        <span>${disponibles.length === 0 ? 'No hay jugadores disponibles para agregar.' : 'El equipo alcanzó el máximo de integrantes permitido.'}</span>
      </div>
    `}

    <div class="mt-2">
      <button class="boton boton-secundario boton--sm" id="btn-toggle-activo" data-activo="${equipo.activo}">
        ${equipo.activo ? 'Desactivar equipo' : 'Reactivar equipo'}
      </button>
    </div>
  `;

  // Botones de quitar
  cont.querySelectorAll('[data-quitar]').forEach(btn => {
    btn.addEventListener('click', () => quitarIntegrante(equipo.id, Number(btn.dataset.quitar)));
  });

  // Formulario de agregar
  const formAgregar = document.getElementById('form-agregar');
  if (formAgregar) {
    formAgregar.addEventListener('submit', (e) => {
      e.preventDefault();
      agregarIntegrante(equipo.id);
    });
  }

  // Toggle activo
  const toggle = document.getElementById('btn-toggle-activo');
  if (toggle) {
    toggle.addEventListener('click', () => toggleActivo(equipo.id));
  }
}

/* ---------- Agregar integrante (valida no repetido) ---------- */
function agregarIntegrante(equipoId) {
  const equipo = obtenerTodosLosEquipos().find(e => e.id === equipoId);
  if (!equipo) return;
  const juego = Datos.obtenerJuego(equipo.juegoId);

  const jugadorId = Number(document.getElementById('jugador-agregar').value);
  const rol = document.getElementById('rol-agregar').value.trim();
  const rolInput = document.getElementById('rol-agregar');

  // Validar rol
  if (!rol) {
    EAM.mostrarErrorCampo(rolInput, 'El rol es obligatorio.');
    return;
  } else if (rol.length < 2 || rol.length > 20) {
    EAM.mostrarErrorCampo(rolInput, 'El rol debe tener entre 2 y 20 caracteres.');
    return;
  } else {
    EAM.limpiarErrorCampo(rolInput);
  }

  // Validar que el equipo no esté completo
  if (equipo.integrantes.length >= juego.maxIntegrantes) {
    EAM.mostrarToast('El equipo ya alcanzó el máximo de integrantes.', 'error');
    return;
  }

  // Validar duplicidad: un mismo jugador no puede repetirse en el equipo
  const yaIntegrante = equipo.integrantes.some(i => i.jugadorId === jugadorId);
  if (yaIntegrante) {
    EAM.mostrarToast('Ese jugador ya es integrante del equipo.', 'error');
    return;
  }

  equipo.integrantes.push({ jugadorId, rol });
  guardarEquiposLocales();
  renderListaEquipos();
  renderGestionIntegrantes();
  EAM.mostrarToast(`Jugador agregado al equipo con rol "${EAM.escaparHTML(rol)}".`, 'exito');
}

/* ---------- Quitar integrante ---------- */
function quitarIntegrante(equipoId, jugadorId) {
  const equipo = obtenerTodosLosEquipos().find(e => e.id === equipoId);
  if (!equipo) return;
  if (jugadorId === equipo.capitanId) {
    EAM.mostrarToast('No se puede quitar al capitán del equipo.', 'error');
    return;
  }
  equipo.integrantes = equipo.integrantes.filter(i => i.jugadorId !== jugadorId);
  guardarEquiposLocales();
  renderListaEquipos();
  renderGestionIntegrantes();
  EAM.mostrarToast('Integrante removido del equipo.', 'info');
}

/* ---------- Toggle activo ---------- */
function toggleActivo(equipoId) {
  const equipo = obtenerTodosLosEquipos().find(e => e.id === equipoId);
  if (!equipo) return;
  equipo.activo = !equipo.activo;
  guardarEquiposLocales();
  cargarEquiposEnGestionYLista();
  document.getElementById('equipo-gestionar').value = String(equipoId);
  renderGestionIntegrantes();
  EAM.mostrarToast(`Equipo ${equipo.activo ? 'reactivado' : 'desactivado'}.`, 'info');
}
