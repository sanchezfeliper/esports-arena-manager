/* ==========================================================================
   eSports Arena Manager - EP1
   torneos.js - Lógica del listado de torneos:
   - Filtros por juego, estado y rango de fechas
   - Buscador por nombre
   - Validación de rango de fechas (inicio <= fin)
   - Estado vacío explícito
   - Tarjetas con juego, modalidad, cupos ocupados/máximo y fecha de cierre
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  EAM.inicializarPagina('torneos');
  cargarJuegosEnFiltro();
  renderTorneos();
  configurarFormulario();
});

let filtrosActivos = {
  juegoId: '',
  estado: '',
  fechaInicio: '',
  fechaFin: '',
  buscador: ''
};

/* ---------- Carga opciones de juego desde el arreglo ---------- */
function cargarJuegosEnFiltro() {
  const select = document.getElementById('filtro-juego');
  Datos.JUEGOS.forEach(j => {
    const opt = EAM.crearElemento('option', { value: String(j.id) }, EAM.escaparHTML(j.nombre));
    select.appendChild(opt);
  });
}

/* ---------- Configura el formulario de filtros ---------- */
function configurarFormulario() {
  const form = document.getElementById('form-filtros');
  const inputInicio = document.getElementById('filtro-fecha-inicio');
  const inputFin = document.getElementById('filtro-fecha-fin');
  const errorFechas = document.getElementById('error-fechas');

  // Validación de rango al cambiar fechas
  [inputInicio, inputFin].forEach(input => {
    input.addEventListener('change', () => validarRangoFechas(inputInicio, inputFin, errorFechas));
  });

  // Buscador en tiempo real
  document.getElementById('filtro-buscador').addEventListener('input', (e) => {
    filtrosActivos.buscador = e.target.value.trim().toLowerCase();
    renderTorneos();
  });

  // Aplicar filtros
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validarRangoFechas(inputInicio, inputFin, errorFechas)) return;

    filtrosActivos.juegoId = document.getElementById('filtro-juego').value;
    filtrosActivos.estado = document.getElementById('filtro-estado').value;
    filtrosActivos.fechaInicio = inputInicio.value;
    filtrosActivos.fechaFin = inputFin.value;
    renderTorneos();
  });

  // Limpiar
  document.getElementById('btn-limpiar').addEventListener('click', () => {
    filtrosActivos = { juegoId: '', estado: '', fechaInicio: '', fechaFin: '', buscador: '' };
    errorFechas.style.display = 'none';
    inputInicio.classList.remove('campo__entrada--invalido');
    inputFin.classList.remove('campo__entrada--invalido');
    setTimeout(renderTorneos, 0);
  });
}

/* ---------- Validación: fecha inicial no posterior a final ---------- */
function validarRangoFechas(inputInicio, inputFin, errorEl) {
  const ini = inputInicio.value;
  const fin = inputFin.value;

  // Si solo una está vacía, no aplicamos la validación cruzada (es opcional)
  if (ini && fin && ini > fin) {
    errorEl.textContent = '⚠ La fecha inicial no puede ser posterior a la fecha final. Ajusta el rango para aplicar el filtro.';
    errorEl.style.display = 'flex';
    inputInicio.classList.add('campo__entrada--invalido');
    inputFin.classList.add('campo__entrada--invalido');
    inputInicio.setAttribute('aria-invalid', 'true');
    inputFin.setAttribute('aria-invalid', 'true');
    return false;
  }

  errorEl.style.display = 'none';
  inputInicio.classList.remove('campo__entrada--invalido');
  inputFin.classList.remove('campo__entrada--invalido');
  inputInicio.removeAttribute('aria-invalid');
  inputFin.removeAttribute('aria-invalid');
  return true;
}

/* ---------- Filtra y renderiza los torneos ---------- */
function renderTorneos() {
  const contenedor = document.getElementById('lista-torneos');
  const contador = document.getElementById('contador-resultados');
  if (!contenedor) return;

  let resultados = Datos.TORNEOS.slice();

  // Filtro por juego
  if (filtrosActivos.juegoId) {
    resultados = resultados.filter(t => String(t.juegoId) === filtrosActivos.juegoId);
  }

  // Filtro por estado
  if (filtrosActivos.estado) {
    resultados = resultados.filter(t => t.estado === filtrosActivos.estado);
  }

  // Filtro por rango de fechas (sobre fechaInicio del torneo)
  if (filtrosActivos.fechaInicio) {
    resultados = resultados.filter(t => t.fechaInicio >= filtrosActivos.fechaInicio);
  }
  if (filtrosActivos.fechaFin) {
    resultados = resultados.filter(t => t.fechaInicio <= filtrosActivos.fechaFin);
  }

  // Buscador por nombre
  if (filtrosActivos.buscador) {
    resultados = resultados.filter(t => t.nombre.toLowerCase().includes(filtrosActivos.buscador));
  }

  // Contador
  contador.textContent = `${resultados.length} torneo${resultados.length !== 1 ? 's' : ''} encontrado${resultados.length !== 1 ? 's' : ''}`;

  // Estado vacío
  if (resultados.length === 0) {
    contenedor.innerHTML = `
      <div class="estado-vacio" style="grid-column: 1 / -1;">
        <div class="estado-vacio__icono" aria-hidden="true">🏁</div>
        <p class="estado-vacio__titulo">No hay torneos que cumplan los filtros</p>
        <p>Prueba ajustar el juego, el estado o el rango de fechas.</p>
      </div>
    `;
    return;
  }

  contenedor.innerHTML = '';
  resultados.forEach(torneo => {
    const juego = Datos.obtenerJuego(torneo.juegoId);
    const cuposDisp = Datos.cuposDisponibles(torneo);
    const ocupados = torneo.inscritos.length;
    const porcentaje = (ocupados / torneo.cupoMaximo) * 100;
    const estaLleno = cuposDisp === 0;

    const tarjeta = EAM.crearElemento('article', { class: 'tarjeta tarjeta-torneo' });
    tarjeta.innerHTML = `
      <div class="tarjeta-torneo__juego">
        <span class="tarjeta-torneo__icono" style="background-color:${juego.color}22;color:${juego.color};" aria-hidden="true">${juego.icono}</span>
        <div>
          <p class="tarjeta-torneo__nombre-juego">${EAM.escaparHTML(juego.nombre)}</p>
          <span class="badge badge--${torneo.estado === 'abierto' ? 'abierto' : torneo.estado === 'en curso' ? 'encurso' : 'finalizado'}">${Datos.estadoTorneoTexto(torneo.estado)}</span>
        </div>
      </div>
      <h3 class="tarjeta-torneo__titulo">
        <a href="torneo-detalle.html?id=${torneo.id}">${EAM.escaparHTML(torneo.nombre)}</a>
      </h3>
      <div class="tarjeta-torneo__meta">
        <span class="tarjeta-torneo__meta-item">🕹️ ${EAM.escaparHTML(torneo.formato)}</span>
        <span class="tarjeta-torneo__meta-item">🎯 ${EAM.escaparHTML(torneo.modalidad)}</span>
      </div>
      <div class="tarjeta-torneo__cupos">
        <div class="flex justify-between" style="font-size:0.82rem;margin-bottom:0.3rem;">
          <span class="texto-muted">Cupos: ${ocupados}/${torneo.cupoMaximo}</span>
          <span class="${estaLleno ? 'texto-error' : 'texto-acierto'}">${cuposDisp} libres</span>
        </div>
        <div class="progreso ${estaLleno ? 'progreso--lleno' : ''}">
          <div class="progreso__barra" style="width:${porcentaje}%"></div>
        </div>
        <p class="texto-muted" style="font-size:0.82rem;margin-top:0.4rem;">
          <span aria-hidden="true">📅</span> Cierre inscripción: ${Datos.formatearFecha(torneo.fechaCierreInscripcion)}
        </p>
      </div>
      <div class="tarjeta-torneo__acciones">
        <a href="torneo-detalle.html?id=${torneo.id}" class="boton boton-secundario boton--sm boton--bloque">Ver detalle</a>
        <a href="inscripcion.html?id=${torneo.id}" class="boton boton-primario boton--sm boton--bloque" ${estaLleno || torneo.estado !== 'abierto' ? 'aria-disabled="true"' : ''}>Inscribirse</a>
      </div>
    `;
    contenedor.appendChild(tarjeta);
  });
}
