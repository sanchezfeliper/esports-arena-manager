/* ==========================================================================
   pages/RegistrationPage.jsx — Inscripción a torneo.
   ========================================================================== */

import { useState, useMemo } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { TORNEOS, JUGADORES, obtenerTorneo, obtenerJugador, obtenerJuego } from '@data/mockData';
import { cuposDisponibles, inscripcionFueraDePlazo } from '@domain/tournaments';
import { sancionesDelJugador, tieneSancionActiva, validarInscripcion } from '@domain/registration';
import { equiposDelJugador } from '@domain/teams';
import { fechaLocalISO, formatearFecha } from '@domain/dates';
import Breadcrumb from '@components/Breadcrumb';
import FormField, { Obligatorio } from '@components/FormField';
import Modal from '@components/Modal';
import { useToast } from '@components/useToast';

export default function RegistrationPage() {
  const { id: routeId } = useParams();
  const [searchParams] = useSearchParams();
  const tournamentId = routeId || searchParams.get('id');
  return <RegistrationForm key={tournamentId || 'unselected'} preselectedTournamentId={tournamentId} />;
}

function RegistrationForm({ preselectedTournamentId }) {
  const { showToast } = useToast();

  const [estado, setEstado] = useState(() => {
    const torneo = preselectedTournamentId ? obtenerTorneo(preselectedTournamentId) : null;
    return {
      torneo: torneo?.estado === 'abierto' ? torneo : null,
      jugador: null,
      correo: '',
      edad: '',
      tipo: '',
      equipo: null,
      acepto: false
    };
  });

  const [inscripcionesRealizadas, setInscripcionesRealizadas] = useState([]);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modalDetalle, setModalDetalle] = useState(null);

  // Torneos abiertos para el select
  const torneosAbiertos = TORNEOS.filter(t => t.estado === 'abierto');

  // Jugadores para el select (actualizado cuando cambia el jugador)
  const jugadores = JUGADORES;

  // Equipos disponibles para el select (filtrados por jugador, tipo y juego del torneo)
  const equiposDisponibles = useMemo(() => {
    if (!estado.jugador || estado.tipo !== 'equipo') return [];
    const equipos = equiposDelJugador(estado.jugador.id).filter(e => e.activo);
    if (estado.torneo) {
      return equipos.filter(e => e.juegoId === estado.torneo.juegoId);
    }
    return equipos;
  }, [estado.jugador, estado.tipo, estado.torneo]);

  // Dominio de avisos (plazo, cupo, sanción, equipo inactivo)
  const avisosDominio = useMemo(() => {
    const avisos = [];
    if (!estado.torneo) return avisos;

    if (inscripcionFueraDePlazo(estado.torneo)) {
      avisos.push({
        tipo: 'error',
        texto: `El plazo de inscripción cerró el ${formatearFecha(estado.torneo.fechaCierreInscripcion)}. No se permiten nuevas inscripciones.`
      });
    }

    const inscripcionesPrevias = inscripcionesRealizadas.filter(i => i.torneoId === estado.torneo.id).length;
    const cuposDisp = cuposDisponibles(estado.torneo, inscripcionesPrevias);
    if (cuposDisp === 0) {
      avisos.push({
        tipo: 'error',
        texto: `Cupo máximo alcanzado (${estado.torneo.cupoMaximo} equipos). Inscripción no disponible.`
      });
    } else if (cuposDisp <= 2) {
      avisos.push({
        tipo: 'advertencia',
        texto: `Quedan solo ${cuposDisp} cupo(s) disponible(s).`
      });
    }

    if (estado.jugador && tieneSancionActiva(estado.jugador.id)) {
      const sancion = sancionesDelJugador(estado.jugador.id).find(s => s.estado === 'vigente');
      if (sancion) {
        avisos.push({
          tipo: 'error',
          texto: `Jugador con sanción vigente: "${sancion.motivo}". Vigencia hasta ${formatearFecha(sancion.fechaFin)}. La inscripción está bloqueada.`
        });
      }
    }

    if (estado.tipo === 'equipo' && estado.equipo && !estado.equipo.activo) {
      avisos.push({
        tipo: 'error',
        texto: `El equipo "${estado.equipo.nombre}" está inactivo. No puede inscribirse.`
      });
    }

    return avisos;
  }, [estado, inscripcionesRealizadas]);

  // Resumen de requisitos del torneo
  const resumenRequisitos = useMemo(() => {
    if (!estado.torneo) return null;
    const juego = obtenerJuego(estado.torneo.juegoId);
    const inscripcionesPrevias = inscripcionesRealizadas.filter(i => i.torneoId === estado.torneo.id).length;
    const cuposDisp = cuposDisponibles(estado.torneo, inscripcionesPrevias);
    return (
      <>
        <div className="resumen__item"><span className="resumen__clave">Torneo</span><span className="resumen__valor">{estado.torneo.nombre}</span></div>
        <div className="resumen__item"><span className="resumen__clave">Juego</span><span className="resumen__valor">{juego?.nombre}</span></div>
        <div className="resumen__item"><span className="resumen__clave">Formato</span><span className="resumen__valor">{estado.torneo.formato}</span></div>
        <div className="resumen__item"><span className="resumen__clave">Modalidad</span><span className="resumen__valor">{estado.torneo.modalidad}</span></div>
        <div className="resumen__item"><span className="resumen__clave">Cierre inscripción</span><span className="resumen__valor">{formatearFecha(estado.torneo.fechaCierreInscripcion)}</span></div>
        <div className="resumen__item"><span className="resumen__clave">Cupo máximo</span><span className="resumen__valor">{estado.torneo.cupoMaximo}</span></div>
        <div className="resumen__item"><span className="resumen__clave">Cupos disponibles</span><span className="resumen__valor">{cuposDisp}</span></div>
        <div className="resumen__item"><span className="resumen__clave">Mín. integrantes</span><span className="resumen__valor">{juego?.minIntegrantes} (por {juego?.modalidad})</span></div>
      </>
    );
  }, [estado.torneo, inscripcionesRealizadas]);

  const { valido, erroresCampo, errores: erroresGenerales } = useMemo(
    () => validarInscripcion(estado, inscripcionesRealizadas),
    [estado, inscripcionesRealizadas]
  );

  // Detalle de lo inscrito (sidebar derecho)
  const detalleInscripcion = useMemo(() => {
    const { torneo, jugador, correo, edad, tipo, equipo, acepto } = estado;
    if (!torneo || !jugador) {
      return (
        <p className="texto-muted" style={{ fontSize: '0.9rem' }}>
          Completa el formulario para ver el resumen de tu inscripción.
        </p>
      );
    }
    const juego = obtenerJuego(torneo.juegoId);
    let participante;
    if (tipo === 'equipo' && equipo) {
      participante = `🛡️ ${equipo.nombre} (${equipo.integrantes.length} integrantes)`;
    } else if (tipo === 'individual') {
      participante = `👤 ${jugador.apodo}`;
    } else {
      participante = '<span class="texto-muted">Pendiente</span>';
    }

    return (
      <>
        <div className="resumen__item"><span className="resumen__clave">Torneo</span><span className="resumen__valor">{torneo.nombre}</span></div>
        <div className="resumen__item"><span className="resumen__clave">Juego</span><span className="resumen__valor">{juego?.nombre}</span></div>
        <div className="resumen__item"><span className="resumen__clave">Jugador</span><span className="resumen__valor">{jugador.apodo}</span></div>
        <div className="resumen__item"><span className="resumen__clave">Correo</span><span className="resumen__valor">{correo}</span></div>
        <div className="resumen__item"><span className="resumen__clave">Edad</span><span className="resumen__valor">{edad || '—'}</span></div>
        <div className="resumen__item"><span className="resumen__clave">Participante</span><span className="resumen__valor">{participante}</span></div>
        <div className="resumen__item"><span className="resumen__clave">Acepta reglas</span><span className="resumen__valor">{acepto ? 'Sí' : 'No'}</span></div>
      </>
    );
  }, [estado]);

  // Handlers
  const onTorneoChange = (e) => {
    const t = obtenerTorneo(e.target.value);
    setEstado(prev => ({ ...prev, torneo: t }));
  };

  const onJugadorChange = (e) => {
    const j = obtenerJugador(e.target.value);
    setEstado(prev => ({
      ...prev,
      jugador: j,
      correo: j ? j.correo : ''
    }));
  };

  const onCorreoChange = (e) => {
    setEstado(prev => ({ ...prev, correo: e.target.value.trim() }));
  };

  const onEdadChange = (e) => {
    setEstado(prev => ({ ...prev, edad: e.target.value }));
  };

  const onTipoChange = (e) => {
    setEstado(prev => ({ ...prev, tipo: e.target.value, equipo: null }));
  };

  const onEquipoChange = (e) => {
    const eq = obtenerEquipoSeleccionado(e.target.value);
    setEstado(prev => ({ ...prev, equipo: eq }));
  };

  const obtenerEquipoSeleccionado = (id) => {
    if (!id) return null;
    // Buscar en equipos del jugador + equipos mock
    const eq = equiposDelJugador(estado.jugador?.id || 0).find(e => e.id === Number(id));
    return eq || null;
  };

  const onAceptoChange = (e) => {
    setEstado(prev => ({ ...prev, acepto: e.target.checked }));
  };

  const onEnviar = (e) => {
    e.preventDefault();
    if (!valido) {
      showToast('Existen errores en el formulario. Revisa los campos marcados.', 'error');
      return;
    }

    const participanteId = estado.tipo === 'equipo' ? estado.equipo.id : estado.jugador.id;
    const participanteNombre = estado.tipo === 'equipo' ? estado.equipo.nombre : estado.jugador.apodo;

    // Registrar inscripción (session-only)
    setInscripcionesRealizadas(prev => [...prev, {
      torneoId: estado.torneo.id,
      participanteId,
      tipo: estado.tipo,
      fecha: new Date().toISOString()
    }]);

    setModalDetalle({
      torneoNombre: estado.torneo.nombre,
      torneoId: estado.torneo.id,
      participanteNombre,
      tipo: estado.tipo,
      jugadorApodo: estado.jugador.apodo,
      correo: estado.correo,
      fecha: formatearFecha(fechaLocalISO())
    });
    setModalAbierto(true);
    showToast('Inscripción registrada con éxito.', 'exito');
  };

  const onLimpiar = () => {
    setEstado({
      torneo: null,
      jugador: null,
      correo: '',
      edad: '',
      tipo: '',
      equipo: null,
      acepto: false
    });
    // Re-validate after clear
  };

  const cerrarModal = () => setModalAbierto(false);

  return (
    <div className="container py-4">
      <Breadcrumb items={[
        { label: 'Inicio', to: '/' },
        { label: 'Torneos', to: '/torneos' },
        { label: 'Inscripción' }
      ]} />

      <section className="seccion" aria-labelledby="titulo-inscripcion">
        <div className="seccion__encabezado">
          <div>
            <h1 className="seccion__titulo" id="titulo-inscripcion">
              <span className="seccion__titulo-icono" aria-hidden="true">🎟️</span>
              Inscripción a torneo
            </h1>
            <p className="seccion__subtitulo">
              Selecciona el tipo de participante y completa tus datos. La inscripción se bloquea si hay errores.
            </p>
          </div>
        </div>

        <div className="row g-3">
          {/* Columna principal: formulario */}
          <div className="col-lg-8">
            {/* Aviso dinámico de bloqueos de dominio */}
            <div id="aviso-dominio">
              {avisosDominio.map((a, i) => (
                <div key={i} className={`aviso aviso--${a.tipo}`} role="alert">
                  <span className="aviso__icono" aria-hidden="true">
                    {a.tipo === 'error' ? '⛔' : '⚠'}
                  </span>
                  <span>{a.texto}</span>
                </div>
              ))}
            </div>

            <form className="d-flex flex-column gap-3 card" id="form-inscripcion" noValidate aria-label="Formulario de inscripción a torneo" onSubmit={onEnviar}>
              {/* Selector de torneo */}
              <FormField
                label={<>Torneo <Obligatorio /></>}
                id="torneo"
                error={erroresGenerales.find(e => e.includes('torneo'))}
              >
                <select
                  className="form-select"
                  id="torneo"
                  required
                  autoComplete="off"
                  aria-describedby="ayuda-torneo"
                  value={estado.torneo ? estado.torneo.id : ''}
                  onChange={onTorneoChange}
                >
                  <option value="">Selecciona un torneo...</option>
                  {torneosAbiertos.map(t => (
                    <option key={t.id} value={t.id}>{t.nombre}</option>
                  ))}
                </select>
                <span className="form-text" id="ayuda-torneo">Solo aparecen torneos con inscripción abierta.</span>
              </FormField>

              <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
                <legend className="form-label">
                  Datos del participante <Obligatorio />
                </legend>

                {/* Jugador */}
                <FormField
                  label={<>Jugador (perfil de prueba) <Obligatorio /></>}
                  id="jugador"
                  error={erroresCampo.jugador}
                >
                  <select
                    className="form-select"
                    id="jugador"
                    required
                    autoComplete="username"
                    aria-describedby="ayuda-jugador"
                    value={estado.jugador ? estado.jugador.id : ''}
                    onChange={onJugadorChange}
                  >
                    <option value="">Selecciona tu jugador...</option>
                    {jugadores.map(j => (
                      <option key={j.id} value={j.id}>
                        {j.apodo} ({j.nombre})
                      </option>
                    ))}
                  </select>
                  <span className="form-text" id="ayuda-jugador">En EP1 los roles se simulan seleccionando un perfil.</span>
                </FormField>

                {/* Correo */}
                <FormField
                  label={<>Correo electrónico <Obligatorio /></>}
                  id="correo"
                  error={erroresCampo.correo}
                  help="Se completa con el correo del jugador. Formato válido requerido."
                  helpId="ayuda-correo"
                >
                  <input
                    className={`form-control ${erroresCampo.correo ? 'form-control is-invalid' : ''}`}
                    type="email"
                    id="correo"
                    required
                    autoComplete="email"
                    placeholder="ej: jugador@arena.cl"
                    aria-describedby="ayuda-correo"
                    value={estado.correo}
                    onChange={onCorreoChange}
                    aria-invalid={erroresCampo.correo ? 'true' : undefined}
                  />
                </FormField>

                {/* Edad */}
                <FormField
                  label={<>Edad <Obligatorio /></>}
                  id="edad"
                  error={erroresCampo.edad}
                  help="Mínimo 13 años para participar en torneos competitivos."
                  helpId="ayuda-edad"
                >
                  <input
                    className={`form-control ${erroresCampo.edad ? 'form-control is-invalid' : ''}`}
                    type="number"
                    id="edad"
                    required
                    min="13"
                    max="99"
                    autoComplete="age"
                    placeholder="Entre 13 y 99 años"
                    aria-describedby="ayuda-edad"
                    value={estado.edad}
                    onChange={onEdadChange}
                    aria-invalid={erroresCampo.edad ? 'true' : undefined}
                  />
                </FormField>
              </fieldset>

              {/* Tipo de participante */}
              <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
                <legend className="form-label">
                  Tipo de participante <Obligatorio />
                </legend>
                <div className="d-flex flex-wrap gap-3" role="radiogroup" aria-label="Tipo de participante">
                  <label className="opcion-radio">
                    <input
                      type="radio"
                      name="tipo"
                      value="individual"
                      id="tipo-individual"
                      checked={estado.tipo === 'individual'}
                      onChange={onTipoChange}
                    />
                    <span>👤 Individual</span>
                  </label>
                  <label className="opcion-radio">
                    <input
                      type="radio"
                      name="tipo"
                      value="equipo"
                      id="tipo-equipo"
                      checked={estado.tipo === 'equipo'}
                      onChange={onTipoChange}
                    />
                    <span>🛡️ Equipo</span>
                  </label>
                </div>
                <span className="form-text mt-2">
                  Los torneos 5v5 y 3v3 exigen inscripción por equipo; los 1v1 aceptan individual.
                </span>
                {erroresGenerales.find(e => e.includes('tipo')) && (
                  <div className="invalid-feedback d-block" role="alert">
                    {erroresGenerales.find(e => e.includes('tipo'))}
                  </div>
                )}
              </fieldset>

              {/* Equipo (solo si tipo = equipo) */}
              <div className="mb-3" id="campo-equipo" style={{ opacity: estado.tipo === 'equipo' ? 1 : 0.5 }}>
                <FormField
                  label={<>Equipo <Obligatorio /></>}
                  id="equipo"
                  error={erroresCampo.equipo}
                  help="Solo equipos donde eres integrante y que estén activos."
                  helpId="ayuda-equipo"
                >
                  <select
                    className="form-select"
                    id="equipo"
                    disabled={estado.tipo !== 'equipo' || !estado.jugador}
                    aria-describedby="ayuda-equipo"
                    value={estado.equipo ? estado.equipo.id : ''}
                    onChange={onEquipoChange}
                    aria-invalid={erroresCampo.equipo ? 'true' : undefined}
                  >
                    <option value="">Selecciona tu equipo...</option>
                    {estado.tipo === 'equipo' && !estado.jugador && (
                      <option value="" disabled>No perteneces a equipos activos</option>
                    )}
                    {estado.tipo === 'equipo' && estado.jugador && equiposDisponibles.length === 0 && (
                      <option value="" disabled>No perteneces a equipos activos</option>
                    )}
                    {equiposDisponibles.map(eq => (
                      <option key={eq.id} value={eq.id}>{eq.nombre}</option>
                    ))}
                  </select>
                </FormField>
              </div>

              {/* Aceptación de reglas */}
              <div className="mb-3">
                <label className="campo__checkbox" htmlFor="acepto-reglas">
                  <input
                    type="checkbox"
                    id="acepto-reglas"
                    required
                    checked={estado.acepto}
                    onChange={onAceptoChange}
                  />
                  <span>He leído y acepto las reglas del torneo. Confirmo que los datos son verídicos.</span>
                </label>
              </div>

              {erroresGenerales.filter(e => !e.includes('tipo') && !e.includes('torneo')).length > 0 && (
                <div className="invalid-feedback d-block" role="alert">
                  {erroresGenerales.filter(e => !e.includes('tipo') && !e.includes('torneo')).map((e, i) => (
                    <div key={i}>⚠ {e}</div>
                  ))}
                </div>
              )}

              <div className="d-flex gap-2" style={{ flexWrap: 'wrap' }}>
                <button type="submit" className="btn btn-primary" id="btn-enviar" disabled={!valido}>
                  Confirmar inscripción
                </button>
                <button type="button" className="btn btn-outline-secondary" id="btn-limpiar" onClick={onLimpiar}>
                  Limpiar formulario
                </button>
              </div>

              <p className="texto-muted" style={{ fontSize: '0.85rem' }}>
                <span aria-hidden="true">ℹ️</span>
                El botón de envío se mantiene deshabilitado mientras existan errores de validación.
              </p>
            </form>
          </div>

          {/* Columna lateral: resúmenes */}
          <aside className="d-flex flex-column gap-3 col-lg-4">
            <section className="card" aria-labelledby="resumen-titulo">
              <h2 className="resumen__titulo" id="resumen-titulo">
                <span aria-hidden="true">📋</span> Resumen de requisitos
              </h2>
              <div className="resumen__lista" id="resumen-torneo">
                {resumenRequisitos || (
                  <p className="texto-muted" style={{ fontSize: '0.9rem' }}>
                    Selecciona un torneo para ver sus requisitos.
                  </p>
                )}
              </div>
            </section>

            <section className="card" aria-labelledby="detalle-titulo">
              <h2 className="resumen__titulo" id="detalle-titulo">
                <span aria-hidden="true">✅</span> Detalle de lo inscrito
              </h2>
              <div className="resumen__lista" id="detalle-inscripcion">
                {detalleInscripcion}
              </div>
            </section>
          </aside>
        </div>
      </section>

      {/* Modal de confirmación */}
      <Modal abierto={modalAbierto} onClose={cerrarModal} titulo="✓ Inscripción confirmada">
        {modalDetalle && (
          <>
            <strong>Torneo:</strong> {modalDetalle.torneoNombre}<br />
            <strong>Participante:</strong> {modalDetalle.participanteNombre} ({modalDetalle.tipo})<br />
            <strong>Jugador:</strong> {modalDetalle.jugadorApodo}<br />
            <strong>Correo:</strong> {modalDetalle.correo}<br />
            <strong>Fecha de inscripción:</strong> {modalDetalle.fecha}
            <div className="modal__acciones">
              <button className="btn btn-outline-secondary" id="modal-cerrar" onClick={cerrarModal}>
                Cerrar
              </button>
              <Link to={`/torneos/${modalDetalle.torneoId}`} className="btn btn-primary" id="modal-ver">
                Ver torneo
              </Link>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}
