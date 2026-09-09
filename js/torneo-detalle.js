/* ==========================================================================
   eSports Arena Manager - EP1
   torneo-detalle.js - Lógica del detalle de torneo:
   - Datos generales, cupos disponibles
   - Listado de participantes inscritos
   - Llaves o calendario de partidas por ronda con horario y estado
   - Tabla de posiciones (ordenada por puntos y desempate por dif. puntaje)
   - Premios asociados a cada posición (solo si el torneo está finalizado)
   ========================================================================== */

let torneoActual = null;
let rondaActiva = null;

document.addEventListener('DOMContentLoaded', () => {
  EAM.inicializarPagina('torneos');
  const id = EAM.obtenerParametroUrl('id');
  torneoActual = Datos.obtenerTorneo(id || 1);

  if (!torneoActual) {
    renderNoEncontrado();
    return;
  }

  renderCabecera();
  renderResumen();
  renderInscritos();
  renderSelectorRonda();
  renderLlaves();
  renderRanking();
  renderPremios();
  renderAccion();
});

/* ---------- Torneo no encontrado ---------- */
function renderNoEncontrado() {
  const main = document.querySelector('main');
  main.innerHTML = `
    <div class="contenedor">
      <div class="estado-vacio">
        <div class="estado-vacio__icono" aria-hidden="true">❓</div>
        <p class="estado-vacio__titulo">Torneo no encontrado</p>
        <p>El identificador no corresponde a un torneo disponible.</p>
        <a href="torneos.html" class="boton boton-primario mt-2">Ver listado de torneos</a>
      </div>
    </div>
  `;
}

/* ---------- Cabecera ---------- */
function renderCabecera() {
  const juego = Datos.obtenerJuego(torneoActual.juegoId);
  document.getElementById('breadcrumb-actual').textContent = torneoActual.nombre;
  document.title = `${torneoActual.nombre} - eSports Arena Manager`;

  const cont = document.getElementById('cabecera-torneo');
  const badgeClase = torneoActual.estado === 'abierto' ? 'abierto' : torneoActual.estado === 'en curso' ? 'encurso' : 'finalizado';

  cont.innerHTML = `
    <div class="tarjeta" style="background:radial-gradient(circle at 15% 30%, ${juego.color}22, transparent 60%), var(--color-superficie);">
      <div class="flex items-center gap-2" style="flex-wrap:wrap;">
        <span class="tarjeta-torneo__icono" style="background-color:${juego.color}33;color:${juego.color};width:56px;height:56px;font-size:1.8rem;" aria-hidden="true">${juego.icono}</span>
        <div>
          <span class="badge badge--${badgeClase}">${Datos.estadoTorneoTexto(torneoActual.estado)}</span>
          <h1 class="seccion__titulo mt-1" id="torneo-titulo" style="font-size:1.75rem;">${EAM.escaparHTML(torneoActual.nombre)}</h1>
          <p class="texto-muted">${EAM.escaparHTML(juego.nombre)} · ${EAM.escaparHTML(torneoActual.formato)} · ${EAM.escaparHTML(torneoActual.modalidad)}</p>
        </div>
      </div>
      <p class="mt-2">${EAM.escaparHTML(torneoActual.descripcion)}</p>
    </div>
  `;
}

/* ---------- Resumen lateral ---------- */
function renderResumen() {
  const juego = Datos.obtenerJuego(torneoActual.juegoId);
  const cuposDisp = Datos.cuposDisponibles(torneoActual);
  const ocupados = torneoActual.inscritos.length;
  const porcentaje = (ocupados / torneoActual.cupoMaximo) * 100;
  const estaLleno = cuposDisp === 0;

  const cont = document.getElementById('resumen-torneo');
  cont.innerHTML = `
    <div class="resumen__item"><span class="resumen__clave">Juego</span><span class="resumen__valor">${EAM.escaparHTML(juego.nombre)}</span></div>
    <div class="resumen__item"><span class="resumen__clave">Modalidad</span><span class="resumen__valor">${EAM.escaparHTML(torneoActual.modalidad)}</span></div>
    <div class="resumen__item"><span class="resumen__clave">Formato</span><span class="resumen__valor">${EAM.escaparHTML(torneoActual.formato)}</span></div>
    <div class="resumen__item"><span class="resumen__clave">Fecha de inicio</span><span class="resumen__valor">${Datos.formatearFecha(torneoActual.fechaInicio)}</span></div>
    <div class="resumen__item"><span class="resumen__clave">Cierre de inscripción</span><span class="resumen__valor">${Datos.formatearFecha(torneoActual.fechaCierreInscripcion)}</span></div>
    <div class="resumen__item"><span class="resumen__clave">Cupos ocupados</span><span class="resumen__valor">${ocupados} / ${torneoActual.cupoMaximo}</span></div>
    <div class="resumen__item"><span class="resumen__clave">Cupos disponibles</span><span class="resumen__valor ${estaLleno ? 'texto-error' : 'texto-acierto'}">${cuposDisp}</span></div>
    <div class="mt-2">
      <div class="progreso ${estaLleno ? 'progreso--lleno' : ''}">
        <div class="progreso__barra" style="width:${porcentaje}%"></div>
      </div>
    </div>
    <div class="mt-2">
      <p class="texto-muted" style="font-size:0.85rem;font-weight:600;">Reglas</p>
      <p style="font-size:0.88rem;">${EAM.escaparHTML(torneoActual.reglas)}</p>
    </div>
  `;
}

/* ---------- Participantes inscritos ---------- */
function renderInscritos() {
  const cont = document.getElementById('lista-inscritos');
  if (torneoActual.inscritos.length === 0) {
    cont.innerHTML = `
      <div class="estado-vacio">
        <div class="estado-vacio__icono" aria-hidden="true">🎟️</div>
        <p class="estado-vacio__titulo">Aún no hay inscritos</p>
        <p>Los participantes aparecerán aquí a medida que se inscriban.</p>
      </div>
    `;
    return;
  }

  cont.innerHTML = '';
  torneoActual.inscritos.forEach((equipoId, idx) => {
    const equipo = Datos.obtenerEquipo(equipoId);
    if (!equipo) return;
    const juego = Datos.obtenerJuego(equipo.juegoId);
    const item = EAM.crearElemento('div', { class: 'lista__item' });
    item.innerHTML = `
      <span class="lista__avatar" style="background-color:${juego.color}" aria-hidden="true">${idx + 1}</span>
      <div class="lista__contenido">
        <p class="lista__nombre">${EAM.escaparHTML(equipo.nombre)} ${equipo.activo ? '' : '<span class="badge badge--cancelado ml-1">Inactivo</span>'}</p>
        <p class="lista__detalle">${equipo.integrantes.length} integrante(s) · Capitán: ${EAM.escaparHTML(Datos.obtenerJugador(equipo.capitanId).apodo)}</p>
      </div>
      <a href="#" class="boton boton-secundario boton--sm">Ver equipo</a>
    `;
    cont.appendChild(item);
  });
}

/* ---------- Selector de ronda ---------- */
function renderSelectorRonda() {
  const cont = document.getElementById('selector-ronda');
  const partidas = Datos.PARTIDAS.filter(p => p.torneoId === torneoActual.id);
  const rondas = [...new Set(partidas.map(p => p.ronda))];

  if (rondas.length === 0) {
    cont.innerHTML = '';
    return;
  }

  if (!rondas.includes(rondaActiva)) {
    rondaActiva = rondas[0];
  }

  cont.innerHTML = '';
  rondas.forEach((ronda, i) => {
    const btn = EAM.crearElemento('button', {
      class: `boton boton--sm ${ronda === rondaActiva ? 'boton-primario' : 'boton-secundario'}`,
      role: 'tab',
      'aria-selected': String(ronda === rondaActiva),
      id: `tab-ronda-${i}`
    }, EAM.escaparHTML(ronda));
    btn.addEventListener('click', () => {
      rondaActiva = ronda;
      renderSelectorRonda();
      renderLlaves();
    });
    cont.appendChild(btn);
  });
}

/* ---------- Llaves de partidas ---------- */
function renderLlaves() {
  const cont = document.getElementById('llave-torneo');
  const partidas = Datos.PARTIDAS.filter(p => p.torneoId === torneoActual.id && p.ronda === rondaActiva);

  if (partidas.length === 0) {
    cont.innerHTML = `
      <div class="estado-vacio">
        <div class="estado-vacio__icono" aria-hidden="true">🗓️</div>
        <p class="estado-vacio__titulo">Sin partidas programadas</p>
        <p>Las partidas de este torneo aparecerán cuando sean generadas por el organizador.</p>
      </div>
    `;
    return;
  }

  cont.innerHTML = '';
  partidas.forEach(partida => {
    const equipoA = Datos.obtenerEquipo(partida.equipoAId);
    const equipoB = Datos.obtenerEquipo(partida.equipoBId);

    const bloque = EAM.crearElemento('div', { class: 'llave__partida' });
    bloque.innerHTML = `
      <div class="flex justify-between items-center mb-1" style="font-size:0.82rem;">
        <span class="texto-muted">
          <span aria-hidden="true">🕐</span> ${Datos.formatearFechaHora(partida.fecha)}
        </span>
        <span class="badge badge--${partida.estado === 'validada' ? 'abierto' : partida.estado === 'programada' ? 'encurso' : 'finalizado'}">${EAM.escaparHTML(partida.estado)}</span>
      </div>
      <div class="llave__partida-bloque ${partida.ganadorId === partida.equipoAId ? 'llave__partida-bloque--ganador' : partida.ganadorId ? 'llave__partida-bloque--perdedor' : 'llave__partida-bloque--pendiente'}">
        <span>${equipoA ? EAM.escaparHTML(equipoA.nombre) : 'Por definir'}</span>
        <span style="font-weight:700;">${partida.puntajeA !== null ? partida.puntajeA : '-'}</span>
      </div>
      <div class="llave__partida-bloque ${partida.ganadorId === partida.equipoBId ? 'llave__partida-bloque--ganador' : partida.ganadorId ? 'llave__partida-bloque--perdedor' : 'llave__partida-bloque--pendiente'}">
        <span>${equipoB ? EAM.escaparHTML(equipoB.nombre) : 'Participante por definir'}</span>
        <span style="font-weight:700;">${partida.puntajeB !== null ? partida.puntajeB : '-'}</span>
      </div>
      <div class="llave__partida-estado">
        ${partida.estado === 'validada' ? '✓ Resultado validado · Ganador: ' + EAM.escaparHTML(Datos.obtenerEquipo(partida.ganadorId).nombre) : partida.estado === 'programada' ? '⏱ Partida programada · pendiente de jugar' : 'Cancelada'}
      </div>
    `;
    cont.appendChild(bloque);
  });
}

/* ---------- Tabla de posiciones ---------- */
function renderRanking() {
  const cuerpo = document.getElementById('ranking-cuerpo');
  const ranking = Datos.ordenarRanking(torneoActual.ranking || []);

  if (ranking.length === 0) {
    cuerpo.innerHTML = `
      <tr><td colspan="6">
        <div class="estado-vacio">
          <p class="estado-vacio__titulo">Tabla sin datos</p>
          <p>El ranking se actualiza con los resultados validados.</p>
        </div>
      </td></tr>
    `;
    return;
  }

  cuerpo.innerHTML = '';
  ranking.forEach((fila, idx) => {
    const equipo = Datos.obtenerEquipo(fila.equipoId);
    const pos = idx + 1;
    let clasePos = '';
    if (pos === 1) clasePos = 'tabla__pos--oro';
    else if (pos === 2) clasePos = 'tabla__pos--plata';
    else if (pos === 3) clasePos = 'tabla__pos--bronce';

    const tr = EAM.crearElemento('tr');
    tr.innerHTML = `
      <td class="tabla__pos ${clasePos}">${pos}°</td>
      <td>${equipo ? EAM.escaparHTML(equipo.nombre) : 'Equipo eliminado'}</td>
      <td>${fila.victorias}</td>
      <td>${fila.derrotas}</td>
      <td>${fila.diferenciaPuntaje > 0 ? '+' : ''}${fila.diferenciaPuntaje}</td>
      <td style="font-weight:700;color:var(--color-acento);">${fila.puntos}</td>
    `;
    cuerpo.appendChild(tr);
  });
}

/* ---------- Premios (solo si el torneo está finalizado) ---------- */
function renderPremios() {
  const tarjeta = document.getElementById('tarjeta-premios');
  const lista = document.getElementById('lista-premios');

  if (torneoActual.estado !== 'finalizado') {
    tarjeta.classList.add('oculto');
    tarjeta.setAttribute('aria-hidden', 'true');
    return;
  }

  tarjeta.classList.remove('oculto');
  lista.innerHTML = '';
  torneoActual.premios.forEach(premio => {
    const div = EAM.crearElemento('div', { class: 'lista__item' });
    div.innerHTML = `
      <span style="font-size:1.8rem;" aria-hidden="true">${premio.icono}</span>
      <div class="lista__contenido">
        <p class="lista__nombre">${premio.posicion}° lugar</p>
        <p class="lista__detalle">${EAM.escaparHTML(premio.descripcion)}</p>
      </div>
    `;
    lista.appendChild(div);
  });
}

/* ---------- Acción de inscripción ---------- */
function renderAccion() {
  const btn = document.getElementById('btn-inscribir');
  const msg = document.getElementById('accion-mensaje');

  if (torneoActual.estado !== 'abierto') {
    btn.classList.add('oculto');
    if (torneoActual.estado === 'en curso') {
      msg.innerHTML = '<span class="texto-adv">⚠</span> Las inscripciones están cerradas porque el torneo ya está en curso.';
    } else if (torneoActual.estado === 'finalizado') {
      msg.innerHTML = '<span class="texto-muted">🏁</span> Torneo finalizado. Revisa los resultados y premios.';
    }
    return;
  }

  const fueraPlazo = Datos.inscripcionFueraDePlazo(torneoActual);
  const cuposDisp = Datos.cuposDisponibles(torneoActual);

  if (fueraPlazo) {
    btn.classList.add('oculto');
    msg.innerHTML = '<span class="texto-adv">⚠</span> El plazo de inscripción ya cerró.';
    return;
  }
  if (cuposDisp === 0) {
    btn.classList.add('oculto');
    msg.innerHTML = '<span class="texto-error">●</span> Cupo máximo alcanzado.';
    return;
  }

  msg.textContent = `Quedan ${cuposDisp} cupo(s) disponible(s).`;
  btn.href = `inscripcion.html?id=${torneoActual.id}`;
}
