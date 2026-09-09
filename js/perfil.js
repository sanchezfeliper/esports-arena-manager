/* ==========================================================================
   eSports Arena Manager - EP1
   perfil.js - Lógica del perfil de jugador:
   - Datos de contacto y apodo
   - Equipos a los que pertenece
   - Historial de torneos
   - Estadísticas de victorias y derrotas
   - Sanciones vigentes o cumplidas
   Validaciones de los formularios:
   - Apodo: obligatorio, sin espacios, largo definido (3-20)
   - Correo: obligatorio y formato
   - Teléfono: patrón opcional
   - Contraseña: longitud mínima 8, máxima 30, confirmación coherente y distinta a la actual
   ========================================================================== */

let jugadorActual = null;

document.addEventListener('DOMContentLoaded', () => {
  EAM.inicializarPagina('perfil');
  cargarSelectorJugadores();
  configurarFormDatos();
  configurarFormPassword();

  // Cargar primer jugador por defecto
  const id = EAM.obtenerParametroUrl('id') || String(Datos.JUGADORES[0].id);
  document.getElementById('selector-jugador').value = id;
  onJugadorChange();
});

/* ---------- Carga selector de jugador ---------- */
function cargarSelectorJugadores() {
  const select = document.getElementById('selector-jugador');
  Datos.JUGADORES.forEach(j => {
    select.appendChild(EAM.crearElemento('option', { value: String(j.id) }, `${EAM.escaparHTML(j.apodo)} (${EAM.escaparHTML(j.nombre)})`));
  });
  select.addEventListener('change', onJugadorChange);
}

/* ---------- Cambio de jugador ---------- */
function onJugadorChange() {
  const id = Number(document.getElementById('selector-jugador').value);
  jugadorActual = Datos.obtenerJugador(id);
  if (!jugadorActual) return;

  renderCabecera();
  renderEstadisticas();
  renderEquipos();
  renderHistorial();
  renderSanciones();

  // Rellenar formulario de datos
  document.getElementById('apodo').value = jugadorActual.apodo;
  document.getElementById('perfil-correo').value = jugadorActual.correo;
  document.getElementById('telefono').value = jugadorActual.telefono || '';
  // Reset password form
  document.getElementById('form-password').reset();
  ['pass-actual', 'pass-nueva', 'pass-confirmar'].forEach(i => EAM.limpiarErrorCampo(document.getElementById(i)));
  validarFormDatos();
  validarFormPassword();
}

/* ---------- Cabecera del perfil ---------- */
function renderCabecera() {
  const cont = document.getElementById('cabecera-perfil');
  const sancionActiva = Datos.tieneSancionActiva(jugadorActual.id);

  cont.innerHTML = `
    <div class="flex items-center gap-2" style="flex-wrap:wrap;">
      <img src="img/avatar.svg" alt="Avatar genérico de ${EAM.escaparHTML(jugadorActual.apodo)}" width="80" height="80" style="border-radius:50%;background:var(--color-superficie-alt);padding:6px;">
      <div>
        <h2 class="seccion__titulo" style="font-size:1.5rem;margin:0;">${EAM.escaparHTML(jugadorActual.apodo)}</h2>
        <p class="texto-muted">${EAM.escaparHTML(jugadorActual.nombre)}</p>
        <p class="texto-muted" style="font-size:0.88rem;">
          <span aria-hidden="true">📧</span> ${EAM.escaparHTML(jugadorActual.correo)}
          ${jugadorActual.telefono ? `&nbsp;·&nbsp; <span aria-hidden="true">📞</span> ${EAM.escaparHTML(jugadorActual.telefono)}` : ''}
          &nbsp;·&nbsp; <span aria-hidden="true">📍</span> ${EAM.escaparHTML(jugadorActual.region)}
        </p>
        ${sancionActiva ? '<span class="badge badge--cancelado mt-1">⛔ Sanción vigente</span>' : '<span class="badge badge--abierto mt-1">✓ Sin sanciones vigentes</span>'}
      </div>
    </div>
  `;
}

/* ---------- Estadísticas ---------- */
function renderEstadisticas() {
  const cont = document.getElementById('estadisticas');
  const stats = calcularEstadisticas(jugadorActual.id);

  const tarjetas = [
    { titulo: 'Victorias', valor: stats.victorias, icono: '🏆', clase: 'texto-acierto' },
    { titulo: 'Derrotas',  valor: stats.derrotas,  icono: '💔', clase: 'texto-error' },
    { titulo: 'Torneos jugados', valor: stats.torneos, icono: '🎮', clase: '' },
    { titulo: 'Tasa de victorias', valor: stats.tasa + '%', icono: '📊', clase: 'texto-acierto' }
  ];

  cont.innerHTML = '';
  tarjetas.forEach(t => {
    const tarjeta = EAM.crearElemento('div', { class: 'tarjeta texto-centrado' });
    tarjeta.innerHTML = `
      <div style="font-size:2rem;margin-bottom:0.5rem;" aria-hidden="true">${t.icono}</div>
      <p class="${t.clase}" style="font-family:var(--fuente-titulo);font-size:1.75rem;font-weight:700;">${t.valor}</p>
      <p class="texto-muted" style="font-size:0.9rem;">${EAM.escaparHTML(t.titulo)}</p>
    `;
    cont.appendChild(tarjeta);
  });
}

/* ---------- Calcular estadísticas desde partidas/ranking ---------- */
function calcularEstadisticas(jugadorId) {
  const equipos = Datos.equiposDelJugador(jugadorId);
  const equiposIds = equipos.map(e => e.id);

  let victorias = 0, derrotas = 0;
  Datos.PARTIDAS.forEach(p => {
    if (p.ganadorId == null) return;
    if (p.ganadorId === p.equipoAId && equiposIds.includes(p.equipoAId)) victorias++;
    if (p.ganadorId === p.equipoBId && equiposIds.includes(p.equipoBId)) victorias++;
    if (p.ganadorId === p.equipoAId && equiposIds.includes(p.equipoBId)) derrotas++;
    if (p.ganadorId === p.equipoBId && equiposIds.includes(p.equipoAId)) derrotas++;
  });

  // Torneos en los que participó
  const torneos = new Set();
  Datos.TORNEOS.forEach(t => {
    const inscritosEquipos = t.inscritos.some(id => equiposIds.includes(id));
    if (inscritosEquipos) torneos.add(t.id);
  });

  const total = victorias + derrotas;
  const tasa = total > 0 ? Math.round((victorias / total) * 100) : 0;

  return { victorias, derrotas, torneos: torneos.size, tasa };
}

/* ---------- Equipos ---------- */
function renderEquipos() {
  const cont = document.getElementById('equipos-jugador');
  const equipos = Datos.equiposDelJugador(jugadorActual.id);

  if (equipos.length === 0) {
    cont.innerHTML = `
      <div class="estado-vacio" style="grid-column:1/-1;">
        <div class="estado-vacio__icono" aria-hidden="true">🛡️</div>
        <p class="estado-vacio__titulo">Sin equipos</p>
        <p>Este jugador no pertenece a ningún equipo todavía.</p>
      </div>
    `;
    return;
  }

  cont.innerHTML = '';
  equipos.forEach(eq => {
    const juego = Datos.obtenerJuego(eq.juegoId);
    const rol = eq.integrantes.find(i => i.jugadorId === jugadorActual.id)?.rol || 'Integrante';
    const cumpleMinimo = eq.integrantes.length >= juego.minIntegrantes;

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
        <span class="tarjeta-torneo__meta-item">👥 ${eq.integrantes.length}/${juego.maxIntegrantes}</span>
        <span class="tarjeta-torneo__meta-item">🎖️ Tu rol: ${EAM.escaparHTML(rol)}</span>
      </div>
      <p class="${cumpleMinimo ? 'texto-acierto' : 'texto-error'}" style="font-size:0.85rem;">
        ${cumpleMinimo ? '✓' : '⚠'} Mín. ${juego.minIntegrantes} integrantes ${cumpleMinimo ? 'cumplido' : 'no cumplido'}
      </p>
      <div class="tarjeta-torneo__acciones">
        <a href="equipo.html" class="boton boton-secundario boton--sm boton--bloque">Gestionar equipo</a>
      </div>
    `;
    cont.appendChild(tarjeta);
  });
}

/* ---------- Historial de torneos ---------- */
function renderHistorial() {
  const cuerpo = document.getElementById('historial-cuerpo');
  const equipos = Datos.equiposDelJugador(jugadorActual.id);
  const equiposIds = equipos.map(e => e.id);

  const torneosJugados = Datos.TORNEOS.filter(t => t.inscritos.some(id => equiposIds.includes(id)));

  if (torneosJugados.length === 0) {
    cuerpo.innerHTML = `
      <tr><td colspan="5">
        <div class="estado-vacio">
          <p class="estado-vacio__titulo">Sin historial</p>
          <p>El jugador no ha participado en torneos todavía.</p>
        </div>
      </td></tr>
    `;
    return;
  }

  cuerpo.innerHTML = '';
  torneosJugados.forEach(t => {
    const juego = Datos.obtenerJuego(t.juegoId);
    const ranking = Datos.ordenarRanking(t.ranking || []);
    const equipoJugador = equipos.find(e => t.inscritos.includes(e.id));
    const posicion = ranking.findIndex(r => r.equipoId === equipoJugador?.id) + 1;
    let resultado;
    if (t.estado === 'finalizado' && posicion > 0) {
      resultado = posicion === 1 ? '🏆 1° lugar' : posicion === 2 ? '🥈 2° lugar' : posicion === 3 ? '🥉 3° lugar' : `${posicion}° lugar`;
    } else if (t.estado === 'en curso') {
      resultado = 'En competencia';
    } else {
      resultado = 'Pendiente';
    }

    const tr = EAM.crearElemento('tr');
    tr.innerHTML = `
      <td><a href="torneo-detalle.html?id=${t.id}">${EAM.escaparHTML(t.nombre)}</a></td>
      <td>${EAM.escaparHTML(juego.nombre)}</td>
      <td>${Datos.formatearFecha(t.fechaInicio)}</td>
      <td><span class="badge badge--${t.estado === 'abierto' ? 'abierto' : t.estado === 'en curso' ? 'encurso' : 'finalizado'}">${Datos.estadoTorneoTexto(t.estado)}</span></td>
      <td style="font-weight:600;">${resultado}</td>
    `;
    cuerpo.appendChild(tr);
  });
}

/* ---------- Sanciones ---------- */
function renderSanciones() {
  const cont = document.getElementById('lista-sanciones');
  const sanciones = Datos.sancionesDelJugador(jugadorActual.id);

  if (sanciones.length === 0) {
    cont.innerHTML = `
      <div class="aviso aviso--exito">
        <span class="aviso__icono" aria-hidden="true">✓</span>
        <span>El jugador no tiene sanciones registradas. Estado limpio.</span>
      </div>
    `;
    return;
  }

  cont.innerHTML = '';
  sanciones.forEach(s => {
    const vigente = s.estado === 'vigente';
    const item = EAM.crearElemento('div', { class: 'lista__item' });
    item.innerHTML = `
      <span class="lista__avatar" style="background-color:${vigente ? 'var(--color-error)' : 'var(--color-borde)'}" aria-hidden="true">${vigente ? '⛔' : '✓'}</span>
      <div class="lista__contenido">
        <p class="lista__nombre">
          ${vigente ? '<span class="badge badge--cancelado">Vigente</span>' : '<span class="badge badge--finalizado">Cumplida</span>'}
          ${EAM.escaparHTML(s.motivo)}
        </p>
        <p class="lista__detalle">
          Desde ${Datos.formatearFecha(s.fechaInicio)} hasta ${Datos.formatearFecha(s.fechaFin)}
        </p>
      </div>
    `;
    cont.appendChild(item);
  });
}

/* ---------- Formulario de datos ---------- */
function configurarFormDatos() {
  const inputs = ['apodo', 'perfil-correo', 'telefono'];
  inputs.forEach(id => {
    const el = document.getElementById(id);
    el.addEventListener('input', validarFormDatos);
    el.addEventListener('change', validarFormDatos);
  });

  document.getElementById('form-datos').addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validarFormDatos()) {
      EAM.mostrarToast('Existen errores en el formulario. Revísalos.', 'error');
      return;
    }
    // Aplicar cambios al jugador (en memoria)
    jugadorActual.apodo = document.getElementById('apodo').value.trim();
    jugadorActual.correo = document.getElementById('perfil-correo').value.trim();
    jugadorActual.telefono = document.getElementById('telefono').value.trim();
    renderCabecera();
    renderEstadisticas();
    renderEquipos();
    renderHistorial();
    renderSanciones();
    EAM.mostrarToast('Datos del perfil actualizados.', 'exito');
  });

  document.getElementById('btn-limpiar-datos').addEventListener('click', () => {
    setTimeout(() => {
      if (jugadorActual) {
        document.getElementById('apodo').value = jugadorActual.apodo;
        document.getElementById('perfil-correo').value = jugadorActual.correo;
        document.getElementById('telefono').value = jugadorActual.telefono || '';
      }
      ['apodo', 'perfil-correo', 'telefono'].forEach(i => EAM.limpiarErrorCampo(document.getElementById(i)));
      validarFormDatos();
    }, 0);
  });
}

/* ---------- Validación del formulario de datos ---------- */
function validarFormDatos() {
  const apodo = document.getElementById('apodo');
  const correo = document.getElementById('perfil-correo');
  const telefono = document.getElementById('telefono');
  let valido = true;

  // Apodo: obligatorio, sin espacios, largo 3-20
  const valorApodo = apodo.value.trim();
  if (!valorApodo) {
    EAM.mostrarErrorCampo(apodo, 'El apodo es obligatorio.');
    valido = false;
  } else if (valorApodo.length < 3) {
    EAM.mostrarErrorCampo(apodo, 'El apodo debe tener al menos 3 caracteres.');
    valido = false;
  } else if (valorApodo.length > 20) {
    EAM.mostrarErrorCampo(apodo, 'El apodo no puede superar 20 caracteres.');
    valido = false;
  } else if (!EAM.noContieneEspacios(valorApodo)) {
    EAM.mostrarErrorCampo(apodo, 'El apodo no admite espacios. Usa letras, números o guiones.');
    valido = false;
  } else {
    EAM.limpiarErrorCampo(apodo);
  }

  // Correo: obligatorio y formato
  const valorCorreo = correo.value.trim();
  if (!valorCorreo) {
    EAM.mostrarErrorCampo(correo, 'El correo electrónico es obligatorio.');
    valido = false;
  } else if (!EAM.esCorreoValido(valorCorreo)) {
    EAM.mostrarErrorCampo(correo, 'El correo no tiene un formato válido (ej: nombre@dominio.cl).');
    valido = false;
  } else {
    EAM.limpiarErrorCampo(correo);
  }

  // Teléfono: opcional, pero si se ingresa, validar patrón
  const valorTel = telefono.value.trim();
  if (valorTel) {
    if (!/^\+?56?[\s9]\d{4}[\s]\d{4}$/.test(valorTel) && !/^\+56\s9\s\d{4}\s\d{4}$/.test(valorTel)) {
      EAM.mostrarErrorCampo(telefono, 'Formato inválido. Ej: +56 9 1234 5678');
      valido = false;
    } else {
      EAM.limpiarErrorCampo(telefono);
    }
  } else {
    EAM.limpiarErrorCampo(telefono);
  }

  document.getElementById('btn-guardar-datos').disabled = !valido;
  return valido;
}

/* ---------- Formulario de contraseña ---------- */
function configurarFormPassword() {
  ['pass-actual', 'pass-nueva', 'pass-confirmar'].forEach(id => {
    const el = document.getElementById(id);
    el.addEventListener('input', validarFormPassword);
    el.addEventListener('change', validarFormPassword);
  });

  document.getElementById('form-password').addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validarFormPassword()) {
      EAM.mostrarToast('Existen errores en el formulario de contraseña.', 'error');
      return;
    }
    document.getElementById('form-password').reset();
    ['pass-actual', 'pass-nueva', 'pass-confirmar'].forEach(i => EAM.limpiarErrorCampo(document.getElementById(i)));
    validarFormPassword();
    EAM.mostrarToast('Contraseña actualizada con éxito.', 'exito');
  });

  document.getElementById('btn-limpiar-pass').addEventListener('click', () => {
    setTimeout(() => {
      ['pass-actual', 'pass-nueva', 'pass-confirmar'].forEach(i => EAM.limpiarErrorCampo(document.getElementById(i)));
      validarFormPassword();
    }, 0);
  });
}

/* ---------- Validación del formulario de contraseña ---------- */
function validarFormPassword() {
  const actual = document.getElementById('pass-actual');
  const nueva = document.getElementById('pass-nueva');
  const confirmar = document.getElementById('pass-confirmar');
  let valido = true;

  // Contraseña actual: obligatoria y mínima 8
  if (!actual.value) {
    EAM.mostrarErrorCampo(actual, 'La contraseña actual es obligatoria.');
    valido = false;
  } else if (actual.value.length < 8) {
    EAM.mostrarErrorCampo(actual, 'La contraseña debe tener al menos 8 caracteres.');
    valido = false;
  } else {
    EAM.limpiarErrorCampo(actual);
  }

  // Nueva contraseña: obligatoria, mínima 8, máxima 30
  if (!nueva.value) {
    EAM.mostrarErrorCampo(nueva, 'La nueva contraseña es obligatoria.');
    valido = false;
  } else if (nueva.value.length < 8) {
    EAM.mostrarErrorCampo(nueva, 'La contraseña debe tener al menos 8 caracteres.');
    valido = false;
  } else if (nueva.value.length > 30) {
    EAM.mostrarErrorCampo(nueva, 'La contraseña no puede superar 30 caracteres.');
    valido = false;
  } else if (actual.value && nueva.value === actual.value) {
    EAM.mostrarErrorCampo(nueva, 'La nueva contraseña debe ser distinta a la actual.');
    valido = false;
  } else {
    EAM.limpiarErrorCampo(nueva);
  }

  // Confirmación: coherencia con la nueva
  if (!confirmar.value) {
    EAM.mostrarErrorCampo(confirmar, 'Debes confirmar la nueva contraseña.');
    valido = false;
  } else if (nueva.value && confirmar.value !== nueva.value) {
    EAM.mostrarErrorCampo(confirmar, 'Las contraseñas no coinciden. Verifica la confirmación.');
    valido = false;
  } else {
    EAM.limpiarErrorCampo(confirmar);
  }

  document.getElementById('btn-guardar-pass').disabled = !valido;
  return valido;
}
