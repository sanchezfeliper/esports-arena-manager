/* ==========================================================================
   eSports Arena Manager - EP1
   inscripcion.js - Lógica del formulario de inscripción (FORMULARIO PRINCIPAL):
   Validaciones:
   - Campos obligatorios (jugador, correo, edad, tipo, aceptar reglas)
   - Formato de correo
   - Rango numérico de edad (13-99)
   - Coherencia entre campos (tipo+equipo+torneo+jugador)
   - Plazo de inscripción (no fuera de plazo)
   - Cupo máximo (no superar)
   - Duplicidad (no dos veces al mismo participante)
   - Equipo completo (mínimo integrantes exigido por juego)
   - Sanción vigente (bloquea con mensaje explicativo)
   - El envío se bloquea mientras existan errores
   ========================================================================== */

let estado = {
  torneo: null,
  jugador: null,
  correo: '',
  edad: '',
  tipo: '',
  equipo: null,
  acepto: false
};

const inscripcionesRealizadas = []; // simulación de inscripciones nuevas en la sesión

document.addEventListener('DOMContentLoaded', () => {
  EAM.inicializarPagina('inscripcion');
  cargarTorneos();
  cargarJugadores();
  configurarEventos();
  validarTodo();
});

/* ---------- Carga datos en selects ---------- */
function cargarTorneos() {
  const select = document.getElementById('torneo');
  Datos.TORNEOS.forEach(t => {
    if (t.estado === 'abierto') {
      const opt = EAM.crearElemento('option', { value: String(t.id) }, EAM.escaparHTML(t.nombre));
      select.appendChild(opt);
    }
  });

  // Si viene ?id= en la URL, preseleccionar
  const idPreselect = EAM.obtenerParametroUrl('id');
  if (idPreselect) {
    const t = Datos.obtenerTorneo(idPreselect);
    if (t && t.estado === 'abierto') {
      select.value = String(t.id);
      onTorneoChange();
    }
  }
}

function cargarJugadores() {
  const select = document.getElementById('jugador');
  Datos.JUGADORES.forEach(j => {
    const opt = EAM.crearElemento('option', { value: String(j.id) }, `${EAM.escaparHTML(j.apodo)} (${EAM.escaparHTML(j.nombre)})`);
    select.appendChild(opt);
  });
}

/* ---------- Configura eventos ---------- */
function configurarEventos() {
  document.getElementById('torneo').addEventListener('change', onTorneoChange);
  document.getElementById('jugador').addEventListener('change', onJugadorChange);
  document.getElementById('correo').addEventListener('input', onCorreoChange);
  document.getElementById('edad').addEventListener('input', onEdadChange);

  document.querySelectorAll('input[name="tipo"]').forEach(r => r.addEventListener('change', onTipoChange));
  document.getElementById('equipo').addEventListener('change', onEquipoChange);
  document.getElementById('acepto-reglas').addEventListener('change', (e) => {
    estado.acepto = e.target.checked;
    validarTodo();
  });

  document.getElementById('form-inscripcion').addEventListener('submit', onEnviar);
  document.getElementById('btn-limpiar').addEventListener('click', onLimpiar);

  // Modal
  document.getElementById('modal-cerrar').addEventListener('click', cerrarModal);
  document.getElementById('modal-fondo').addEventListener('click', (e) => {
    if (e.target.id === 'modal-fondo') cerrarModal();
  });
}

/* ---------- Handlers ---------- */
function onTorneoChange() {
  const id = document.getElementById('torneo').value;
  estado.torneo = id ? Datos.obtenerTorneo(id) : null;
  renderResumen();
  renderAvisoDominio();
  actualizarEquiposSegunJugadorYTipo();
  validarTodo();
}

function onJugadorChange() {
  const id = document.getElementById('jugador').value;
  estado.jugador = id ? Datos.obtenerJugador(id) : null;
  // Autocompletar correo
  const correoInput = document.getElementById('correo');
  if (estado.jugador) {
    correoInput.value = estado.jugador.correo;
    estado.correo = estado.jugador.correo;
    EAM.limpiarErrorCampo(correoInput);
  }
  actualizarEquiposSegunJugadorYTipo();
  renderAvisoDominio();
  validarTodo();
}

function onCorreoChange(e) {
  estado.correo = e.target.value.trim();
  validarTodo();
}

function onEdadChange(e) {
  estado.edad = e.target.value;
  validarTodo();
}

function onTipoChange(e) {
  estado.tipo = e.target.value;
  document.getElementById('campo-equipo').style.opacity = estado.tipo === 'equipo' ? '1' : '0.5';
  actualizarEquiposSegunJugadorYTipo();
  validarTodo();
}

function onEquipoChange(e) {
  const id = e.target.value;
  estado.equipo = id ? Datos.obtenerEquipo(id) : null;
  validarTodo();
}

/* ---------- Actualiza select de equipos ---------- */
function actualizarEquiposSegunJugadorYTipo() {
  const select = document.getElementById('equipo');
  select.innerHTML = '<option value="">Selecciona tu equipo...</option>';

  if (!estado.jugador || estado.tipo !== 'equipo') {
    select.disabled = true;
    estado.equipo = null;
    return;
  }

  // Equipos donde el jugador es integrante Y están activos
  const equiposValidos = Datos.equiposDelJugador(estado.jugador.id).filter(e => e.activo);

  if (equiposValidos.length === 0) {
    const opt = EAM.crearElemento('option', { value: '', disabled: 'disabled' }, 'No perteneces a equipos activos');
    select.appendChild(opt);
    select.disabled = true;
  } else {
    equiposValidos.forEach(eq => {
      // Filtrar equipos cuyo juego coincida con el del torneo (si hay torneo)
      if (estado.torneo && eq.juegoId !== estado.torneo.juegoId) return;
      const opt = EAM.crearElemento('option', { value: String(eq.id) }, EAM.escaparHTML(eq.nombre));
      select.appendChild(opt);
    });
    select.disabled = false;
  }
  estado.equipo = null;
}

/* ---------- Renderiza aviso de dominio (plazo, cupo, sanción) ---------- */
function renderAvisoDominio() {
  const cont = document.getElementById('aviso-dominio');
  cont.innerHTML = '';

  if (!estado.torneo) return;
  const avisos = [];

  // Plazo
  if (Datos.inscripcionFueraDePlazo(estado.torneo)) {
    avisos.push({ tipo: 'error', texto: `El plazo de inscripción cerró el ${Datos.formatearFecha(estado.torneo.fechaCierreInscripcion)}. No se permiten nuevas inscripciones.` });
  }

  // Cupo
  const cuposDisp = Datos.cuposDisponibles(estado.torneo);
  if (cuposDisp === 0) {
    avisos.push({ tipo: 'error', texto: `Cupo máximo alcanzado (${estado.torneo.cupoMaximo} equipos). Inscripción no disponible.` });
  } else if (cuposDisp <= 2) {
    avisos.push({ tipo: 'advertencia', texto: `Quedan solo ${cuposDisp} cupo(s) disponible(s).` });
  }

  // Sanción
  if (estado.jugador && Datos.tieneSancionActiva(estado.jugador.id)) {
    const sancion = Datos.sancionesDelJugador(estado.jugador.id).find(s => s.estado === 'vigente');
    avisos.push({
      tipo: 'error',
      texto: `Jugador con sanción vigente: "${EAM.escaparHTML(sancion.motivo)}". Vigencia hasta ${Datos.formatearFecha(sancion.fechaFin)}. La inscripción está bloqueada.`
    });
  }

  // Equipo inactivo
  if (estado.tipo === 'equipo' && estado.equipo && !estado.equipo.activo) {
    avisos.push({ tipo: 'error', texto: `El equipo "${EAM.escaparHTML(estado.equipo.nombre)}" está inactivo. No puede inscribirse.` });
  }

  avisos.forEach(a => {
    const div = EAM.crearElemento('div', { class: `aviso aviso--${a.tipo}`, role: 'alert' });
    div.innerHTML = `<span class="aviso__icono" aria-hidden="true">${a.tipo === 'error' ? '⛔' : '⚠'}</span><span>${a.texto}</span>`;
    cont.appendChild(div);
  });
}

/* ---------- Renderiza resumen de requisitos ---------- */
function renderResumen() {
  const cont = document.getElementById('resumen-torneo');
  if (!estado.torneo) {
    cont.innerHTML = `<p class="texto-muted" style="font-size:0.9rem;">Selecciona un torneo para ver sus requisitos.</p>`;
    return;
  }
  const juego = Datos.obtenerJuego(estado.torneo.juegoId);
  const cuposDisp = Datos.cuposDisponibles(estado.torneo);

  cont.innerHTML = `
    <div class="resumen__item"><span class="resumen__clave">Torneo</span><span class="resumen__valor">${EAM.escaparHTML(estado.torneo.nombre)}</span></div>
    <div class="resumen__item"><span class="resumen__clave">Juego</span><span class="resumen__valor">${EAM.escaparHTML(juego.nombre)}</span></div>
    <div class="resumen__item"><span class="resumen__clave">Formato</span><span class="resumen__valor">${EAM.escaparHTML(estado.torneo.formato)}</span></div>
    <div class="resumen__item"><span class="resumen__clave">Modalidad</span><span class="resumen__valor">${EAM.escaparHTML(estado.torneo.modalidad)}</span></div>
    <div class="resumen__item"><span class="resumen__clave">Cierre inscripción</span><span class="resumen__valor">${Datos.formatearFecha(estado.torneo.fechaCierreInscripcion)}</span></div>
    <div class="resumen__item"><span class="resumen__clave">Cupo máximo</span><span class="resumen__valor">${estado.torneo.cupoMaximo}</span></div>
    <div class="resumen__item"><span class="resumen__clave">Cupos disponibles</span><span class="resumen__valor">${cuposDisp}</span></div>
    <div class="resumen__item"><span class="resumen__clave">Mín. integrantes</span><span class="resumen__valor">${juego.minIntegrantes} (por ${juego.modalidad})</span></div>
  `;
}

/* ---------- Validación completa ---------- */
function validarTodo() {
  const errores = [];

  // Limpiar errores previos de campos
  ['correo', 'edad', 'jugador', 'torneo'].forEach(id => EAM.limpiarErrorCampo(document.getElementById(id)));
  // Limpiar error de tipo (radiogroup)
  const tipoError = document.querySelector('fieldset .campo__error');
  if (tipoError) tipoError.remove();

  let valido = true;

  // Torneo obligatorio
  if (!estado.torneo) {
    errores.push('Selecciona un torneo.');
    valido = false;
  }

  // Jugador obligatorio
  if (!estado.jugador) {
    EAM.mostrarErrorCampo(document.getElementById('jugador'), 'Selecciona tu jugador.');
    valido = false;
  }

  // Correo obligatorio y formato
  if (!estado.correo) {
    EAM.mostrarErrorCampo(document.getElementById('correo'), 'El correo electrónico es obligatorio.');
    valido = false;
  } else if (!EAM.esCorreoValido(estado.correo)) {
    EAM.mostrarErrorCampo(document.getElementById('correo'), 'El correo no tiene un formato válido (ej: nombre@dominio.cl).');
    valido = false;
  }

  // Edad obligatoria y rango numérico
  const edadInput = document.getElementById('edad');
  if (estado.edad === '') {
    EAM.mostrarErrorCampo(edadInput, 'La edad es obligatoria.');
    valido = false;
  } else {
    const edadNum = Number(estado.edad);
    if (isNaN(edadNum)) {
      EAM.mostrarErrorCampo(edadInput, 'La edad debe ser un número.');
      valido = false;
    } else if (edadNum < 13) {
      EAM.mostrarErrorCampo(edadInput, 'La edad mínima para inscribirse es 13 años.');
      valido = false;
    } else if (edadNum > 99) {
      EAM.mostrarErrorCampo(edadInput, 'La edad no puede superar 99 años.');
      valido = false;
    }
  }

  // Tipo de participante obligatorio
  if (!estado.tipo) {
    const legend = document.querySelector('fieldset .campo__etiqueta');
    if (legend && !legend.parentElement.querySelector('.campo__error')) {
      const err = EAM.crearElemento('div', { class: 'campo__error', role: 'alert' }, 'Selecciona el tipo de participante.');
      legend.parentElement.appendChild(err);
    }
    valido = false;
  } else if (estado.tipo === 'equipo' && !estado.equipo) {
    EAM.mostrarErrorCampo(document.getElementById('equipo'), 'Selecciona el equipo con el que vas a competir.');
    valido = false;
  }

  // Aceptar reglas
  if (!estado.acepto) {
    valido = false;
  }

  // Validaciones de dominio (bloquean el envío)
  if (estado.torneo) {
    // Plazo
    if (Datos.inscripcionFueraDePlazo(estado.torneo)) {
      errores.push('El plazo de inscripción está cerrado.');
      valido = false;
    }
    // Cupo
    if (Datos.cuposDisponibles(estado.torneo) === 0) {
      errores.push('Cupo máximo alcanzado.');
      valido = false;
    }
  }

  // Sanción vigente
  if (estado.jugador && Datos.tieneSancionActiva(estado.jugador.id)) {
    errores.push('Jugador con sanción vigente.');
    valido = false;
  }

  // Equipo completo (mínimo integrantes)
  if (estado.torneo && estado.tipo === 'equipo' && estado.equipo) {
    const juego = Datos.obtenerJuego(estado.torneo.juegoId);
    if (!Datos.equipoCompleto(estado.equipo, juego)) {
      EAM.mostrarErrorCampo(document.getElementById('equipo'), `El equipo "${EAM.escaparHTML(estado.equipo.nombre)}" tiene ${estado.equipo.integrantes.length} integrante(s), pero el juego exige mínimo ${juego.minIntegrantes}.`);
      valido = false;
    }
    // Equipo inactivo
    if (!estado.equipo.activo) {
      EAM.mostrarErrorCampo(document.getElementById('equipo'), 'El equipo está inactivo y no puede inscribirse.');
      valido = false;
    }
  }

  // Duplicidad: no inscribir dos veces al mismo participante en el mismo torneo
  if (estado.torneo && (estado.tipo === 'equipo' ? estado.equipo : estado.jugador)) {
    const participanteId = estado.tipo === 'equipo' ? estado.equipo?.id : estado.jugador?.id;
    if (participanteId !== undefined && participanteId !== null) {
      const yaInscrito = estado.torneo.inscritos.includes(participanteId) ||
        inscripcionesRealizadas.some(i => i.torneoId === estado.torneo.id && i.participanteId === participanteId);
      if (yaInscrito) {
        const msg = estado.tipo === 'equipo'
          ? `El equipo ya está inscrito en este torneo.`
          : `Ya estás inscrito en este torneo.`;
        if (estado.tipo === 'equipo') {
          EAM.mostrarErrorCampo(document.getElementById('equipo'), msg);
        } else {
          EAM.mostrarErrorCampo(document.getElementById('jugador'), msg);
        }
        valido = false;
      }
    }
  }

  // Render detalle inscripción
  renderDetalleInscripcion();

  // Habilitar/deshabilitar botón
  document.getElementById('btn-enviar').disabled = !valido;

  return valido;
}

/* ---------- Renderiza detalle de lo inscrito ---------- */
function renderDetalleInscripcion() {
  const cont = document.getElementById('detalle-inscripcion');

  if (!estado.torneo || !estado.jugador) {
    cont.innerHTML = `<p class="texto-muted" style="font-size:0.9rem;">Completa el formulario para ver el resumen de tu inscripción.</p>`;
    return;
  }

  const juego = Datos.obtenerJuego(estado.torneo.juegoId);
  let participante;
  if (estado.tipo === 'equipo' && estado.equipo) {
    participante = `🛡️ ${EAM.escaparHTML(estado.equipo.nombre)} (${estado.equipo.integrantes.length} integrantes)`;
  } else if (estado.tipo === 'individual') {
    participante = `👤 ${EAM.escaparHTML(estado.jugador.apodo)}`;
  } else {
    participante = '<span class="texto-muted">Pendiente</span>';
  }

  cont.innerHTML = `
    <div class="resumen__item"><span class="resumen__clave">Torneo</span><span class="resumen__valor">${EAM.escaparHTML(estado.torneo.nombre)}</span></div>
    <div class="resumen__item"><span class="resumen__clave">Juego</span><span class="resumen__valor">${EAM.escaparHTML(juego.nombre)}</span></div>
    <div class="resumen__item"><span class="resumen__clave">Jugador</span><span class="resumen__valor">${EAM.escaparHTML(estado.jugador.apodo)}</span></div>
    <div class="resumen__item"><span class="resumen__clave">Correo</span><span class="resumen__valor">${EAM.escaparHTML(estado.correo)}</span></div>
    <div class="resumen__item"><span class="resumen__clave">Edad</span><span class="resumen__valor">${estado.edad || '—'}</span></div>
    <div class="resumen__item"><span class="resumen__clave">Participante</span><span class="resumen__valor">${participante}</span></div>
    <div class="resumen__item"><span class="resumen__clave">Acepta reglas</span><span class="resumen__valor">${estado.acepto ? 'Sí' : 'No'}</span></div>
  `;
}

/* ---------- Envío del formulario ---------- */
function onEnviar(e) {
  e.preventDefault();
  if (!validarTodo()) {
    EAM.mostrarToast('Existen errores en el formulario. Revisa los campos marcados.', 'error');
    return;
  }

  const participanteId = estado.tipo === 'equipo' ? estado.equipo.id : estado.jugador.id;
  const participanteNombre = estado.tipo === 'equipo' ? estado.equipo.nombre : estado.jugador.apodo;

  // Registrar inscripción
  inscripcionesRealizadas.push({
    torneoId: estado.torneo.id,
    participanteId,
    tipo: estado.tipo,
    fecha: new Date().toISOString()
  });

  // Modal de confirmación con detalle
  document.getElementById('modal-cuerpo').innerHTML = `
    <strong>Torneo:</strong> ${EAM.escaparHTML(estado.torneo.nombre)}<br>
    <strong>Participante:</strong> ${EAM.escaparHTML(participanteNombre)} (${estado.tipo})<br>
    <strong>Jugador:</strong> ${EAM.escaparHTML(estado.jugador.apodo)}<br>
    <strong>Correo:</strong> ${EAM.escaparHTML(estado.correo)}<br>
    <strong>Fecha de inscripción:</strong> ${Datos.formatearFecha(new Date().toISOString().slice(0,10))}
  `;
  document.getElementById('modal-ver').href = `torneo-detalle.html?id=${estado.torneo.id}`;
  abrirModal();
  EAM.mostrarToast('Inscripción registrada con éxito.', 'exito');

  // Re-validar para reflejar la nueva duplicidad y deshabilitar el envío
  validarTodo();
}

/* ---------- Limpiar ---------- */
function onLimpiar() {
  estado = { torneo: null, jugador: null, correo: '', edad: '', tipo: '', equipo: null, acepto: false };
  setTimeout(() => {
    document.getElementById('campo-equipo').style.opacity = '0.5';
    document.getElementById('equipo').disabled = true;
    ['correo', 'edad', 'jugador', 'torneo'].forEach(id => EAM.limpiarErrorCampo(document.getElementById(id)));
    renderResumen();
    renderAvisoDominio();
    renderDetalleInscripcion();
    validarTodo();
  }, 0);
}

/* ---------- Modal ---------- */
function abrirModal() {
  document.getElementById('modal-fondo').classList.add('modal-fondo--abierto');
}
function cerrarModal() {
  document.getElementById('modal-fondo').classList.remove('modal-fondo--abierto');
}
