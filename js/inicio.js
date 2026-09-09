/* ==========================================================================
   eSports Arena Manager - EP1
   inicio.js - Lógica de la vista de Inicio:
   - Torneos destacados (abiertos y en curso) desde arreglos JS
   - Bloque de próximos cierres de inscripción
   - Render con manipulación del DOM
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  EAM.inicializarPagina('inicio');
  renderTorneosDestacados();
  renderProximosCierres();
});

/* ---------- Torneos destacados (abiertos y en curso) ---------- */
function renderTorneosDestacados() {
  const contenedor = document.getElementById('torneos-destacados');
  if (!contenedor) return;

  // Filtrar torneos abiertos y en curso
  const destacados = Datos.TORNEOS.filter(t =>
    t.estado === 'abierto' || t.estado === 'en curso'
  );

  if (destacados.length === 0) {
    contenedor.innerHTML = `
      <div class="estado-vacio">
        <div class="estado-vacio__icono" aria-hidden="true">🏁</div>
        <p class="estado-vacio__titulo">No hay torneos destacados</p>
        <p>Vuelve pronto para nuevas competencias.</p>
      </div>
    `;
    return;
  }

  contenedor.innerHTML = '';
  destacados.forEach(torneo => {
    const juego = Datos.obtenerJuego(torneo.juegoId);
    const cuposDisp = Datos.cuposDisponibles(torneo);
    const porcentaje = ((torneo.cupoMaximo - cuposDisp) / torneo.cupoMaximo) * 100;
    const estaLleno = cuposDisp === 0;

    const tarjeta = EAM.crearElemento('article', { class: 'tarjeta tarjeta-torneo' });
    tarjeta.innerHTML = `
      <div class="tarjeta-torneo__juego">
        <span class="tarjeta-torneo__icono" style="background-color:${juego.color}22;color:${juego.color};" aria-hidden="true">${juego.icono}</span>
        <div>
          <p class="tarjeta-torneo__nombre-juego">${EAM.escaparHTML(juego.nombre)}</p>
          <span class="badge badge--${torneo.estado === 'abierto' ? 'abierto' : 'encurso'}">${Datos.estadoTorneoTexto(torneo.estado)}</span>
        </div>
      </div>
      <h3 class="tarjeta-torneo__titulo">
        <a href="torneo-detalle.html?id=${torneo.id}">${EAM.escaparHTML(torneo.nombre)}</a>
      </h3>
      <div class="tarjeta-torneo__meta">
        <span class="tarjeta-torneo__meta-item">🕹️ ${EAM.escaparHTML(torneo.formato)}</span>
        <span class="tarjeta-torneo__meta-item">👥 ${torneo.inscritos.length}/${torneo.cupoMaximo}</span>
        <span class="tarjeta-torneo__meta-item">📅 ${Datos.formatearFecha(torneo.fechaInicio)}</span>
      </div>
      <div class="tarjeta-torneo__cupos">
        <div class="flex justify-between" style="font-size:0.82rem;margin-bottom:0.3rem;">
          <span class="texto-muted">Cupos: ${cuposDisp} disponibles</span>
          <span class="${estaLleno ? 'texto-error' : 'texto-acierto'}">${Math.round(porcentaje)}% ocupado</span>
        </div>
        <div class="progreso ${estaLleno ? 'progreso--lleno' : ''}">
          <div class="progreso__barra" style="width:${porcentaje}%"></div>
        </div>
      </div>
      <div class="tarjeta-torneo__acciones">
        <a href="torneo-detalle.html?id=${torneo.id}" class="boton boton-secundario boton--sm boton--bloque">Ver detalle</a>
        <a href="inscripcion.html?id=${torneo.id}" class="boton boton-primario boton--sm boton--bloque" ${estaLleno ? 'aria-disabled="true"' : ''}>Inscribirse</a>
      </div>
    `;
    contenedor.appendChild(tarjeta);
  });
}

/* ---------- Próximos cierres de inscripción ---------- */
function renderProximosCierres() {
  const contenedor = document.getElementById('proximos-cierres');
  if (!contenedor) return;

  // Torneos abiertos ordenados por fecha de cierre ascendente
  const abiertos = Datos.TORNEOS
    .filter(t => t.estado === 'abierto')
    .sort((a, b) => a.fechaCierreInscripcion.localeCompare(b.fechaCierreInscripcion));

  if (abiertos.length === 0) {
    contenedor.innerHTML = `
      <div class="estado-vacio">
        <div class="estado-vacio__icono" aria-hidden="true">🗓️</div>
        <p class="estado-vacio__titulo">No hay inscripciones abiertas</p>
        <p>No hay cierres próximos porque todos los torneos están en curso o finalizados.</p>
      </div>
    `;
    return;
  }

  contenedor.innerHTML = '';
  abiertos.forEach(torneo => {
    const juego = Datos.obtenerJuego(torneo.juegoId);
    const dias = Datos.diasRestantes(torneo.fechaCierreInscripcion);
    let textoDias;
    let clase = 'texto-acierto';
    if (dias < 0) { textoDias = 'Cierre vencido'; clase = 'texto-error'; }
    else if (dias === 0) { textoDias = 'Cierra hoy'; clase = 'texto-error'; }
    else if (dias === 1) { textoDias = 'Cierra mañana'; clase = 'texto-adv'; }
    else { textoDias = `Cierra en ${dias} días`; clase = dias <= 5 ? 'texto-adv' : 'texto-acierto'; }

    const item = EAM.crearElemento('div', { class: 'lista__item' });
    item.innerHTML = `
      <span class="lista__avatar" style="background-color:${juego.color}" aria-hidden="true">${juego.icono}</span>
      <div class="lista__contenido">
        <p class="lista__nombre">
          <a href="torneo-detalle.html?id=${torneo.id}">${EAM.escaparHTML(torneo.nombre)}</a>
        </p>
        <p class="lista__detalle">
          ${EAM.escaparHTML(juego.nombre)} · Cierre: ${Datos.formatearFecha(torneo.fechaCierreInscripcion)}
        </p>
      </div>
      <span class="${clase}" style="font-weight:600;font-size:0.85rem;white-space:nowrap;">${textoDias}</span>
    `;
    contenedor.appendChild(item);
  });
}
