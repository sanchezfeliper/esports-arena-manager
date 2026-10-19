/* ==========================================================================
   pages/TeamsPage.jsx — Gestión de equipos.

   ========================================================================== */

import { useState, useRef } from 'react';
import { EQUIPOS, JUEGOS, JUGADORES, obtenerJuego, obtenerJugador } from '@data/mockData';
import { cargarEquiposLocales, guardarEquiposLocales } from '@domain/teams';
import Breadcrumb from '@components/Breadcrumb';
import FormField, { Obligatorio } from '@components/FormField';
import EmptyState from '@components/EmptyState';
import { useToast } from '@components/useToast';

/**
 * Retorna una copia de los equipos mock + los equipos creados en sesión.
 * 
 */
function inicializarEquipos() {
  const session = cargarEquiposLocales();
  const mockCopia = EQUIPOS.map(e => ({
    ...e,
    integrantes: [...e.integrantes]
  }));
  return [...mockCopia, ...session];
}

export default function TeamsPage() {
  const { showToast } = useToast();
  const [equipos, setEquipos] = useState(inicializarEquipos);
  const [equipoSeleccionado, setEquipoSeleccionado] = useState(null);
  const [erroresFormulario, setErroresFormulario] = useState({});

  // Form references
  const nombreRef = useRef();
  const juegoRef = useRef();
  const capitanRef = useRef();
  const activoRef = useRef();
  const formularioRef = useRef();

  const persistirSession = (equiposActualizados) => {
    const mockIds = new Set(EQUIPOS.map(e => e.id));
    guardarEquiposLocales(equiposActualizados.filter(e => !mockIds.has(e.id)));
  };

  const validarFormulario = () => {
    const nombre = nombreRef.current?.value.trim() || '';
    const juegoId = juegoRef.current?.value || '';
    const capitanId = capitanRef.current?.value || '';
    const nuevoErrores = {};
    let valido = true;

    // Nombre obligatorio y longitud
    if (!nombre) {
      nuevoErrores.nombre = 'El nombre del equipo es obligatorio.';
      valido = false;
    } else if (nombre.length < 3) {
      nuevoErrores.nombre = 'El nombre debe tener al menos 3 caracteres.';
      valido = false;
    } else if (nombre.length > 30) {
      nuevoErrores.nombre = 'El nombre no puede superar 30 caracteres.';
      valido = false;
    } else {
      // Sin duplicados
      const existe = equipos.some(e =>
        e.nombre.toLowerCase() === nombre.toLowerCase()
      );
      if (existe) {
        nuevoErrores.nombre = `Ya existe un equipo llamado "${nombre}". Elige otro nombre.`;
        valido = false;
      }
    }

    // Juego obligatorio
    if (!juegoId) {
      nuevoErrores.juego = 'Selecciona el juego principal del equipo.';
      valido = false;
    }

    // Capitán obligatorio
    if (!capitanId) {
      nuevoErrores.capitan = 'Selecciona el capitán del equipo.';
      valido = false;
    }

    setErroresFormulario(nuevoErrores);
    return valido;
  };

  // Validar en tiempo real (escucha cambios de input)
  const handleInputChange = () => {
    validarFormulario();
  };

  const onCrear = (e) => {
    e.preventDefault();
    if (!validarFormulario()) {
      showToast('Existen errores en el formulario. Revísalos.', 'error');
      return;
    }

    const nombre = nombreRef.current.value.trim();
    const juegoId = Number(juegoRef.current.value);
    const capitanId = Number(capitanRef.current.value);
    const activo = activoRef.current.checked;

    const nuevoEquipo = {
      id: Math.max(...equipos.map(eq => eq.id), 0) + 1,
      nombre,
      juegoId,
      capitanId,
      activo,
      integrantes: [{ jugadorId: capitanId, rol: 'Capitán' }]
    };

    const actualizados = [...equipos, nuevoEquipo];
    setEquipos(actualizados);
    // Persistir solo equipos creados en sesión
    const mockIds = new Set(EQUIPOS.map(e => e.id));
    guardarEquiposLocales(actualizados.filter(e => !mockIds.has(e.id)));

    showToast(`Equipo "${nombre}" creado con éxito.`, 'exito');

    // Limpiar formulario
    e.target.reset();
    setErroresFormulario({});
  };

  const onLimpiarFormulario = () => {
    formularioRef.current?.reset();
    setErroresFormulario({});
  };

  const onEquipoSeleccionadoChange = (e) => {
    const id = Number(e.target.value);
    if (!id) {
      setEquipoSeleccionado(null);
      return;
    }
    const eq = equipos.find(t => t.id === id);
    setEquipoSeleccionado(eq || null);
  };

  // Agregar integrante
  const onAgregarIntegrante = (e) => {
    e.preventDefault();
    if (!equipoSeleccionado) return;

    const juego = obtenerJuego(equipoSeleccionado.juegoId);
    if (!juego) return;

    const jugadorId = Number(e.target.jugadorAgregar.value);
    let rol = e.target.rolAgregar.value.trim();

    if (!rol) {
      showToast('El rol es obligatorio.', 'error');
      return;
    }
    if (rol.length < 2 || rol.length > 20) {
      showToast('El rol debe tener entre 2 y 20 caracteres.', 'error');
      return;
    }

    if (equipoSeleccionado.integrantes.length >= juego.maxIntegrantes) {
      showToast('El equipo ya alcanzó el máximo de integrantes.', 'error');
      return;
    }

    const yaIntegrante = equipoSeleccionado.integrantes.some(i => i.jugadorId === jugadorId);
    if (yaIntegrante) {
      showToast('Ese jugador ya es integrante del equipo.', 'error');
      return;
    }

    const actualizados = equipos.map(eq => {
      if (eq.id === equipoSeleccionado.id) {
        return {
          ...eq,
          integrantes: [...eq.integrantes, { jugadorId, rol }]
        };
      }
      return eq;
    });

    setEquipos(actualizados);
    persistirSession(actualizados);
    const eqActualizado = actualizados.find(e => e.id === equipoSeleccionado.id);
    setEquipoSeleccionado(eqActualizado);

    showToast(`Jugador agregado al equipo con rol "${rol}".`, 'exito');
    e.target.reset();
  };

  // Quitar integrante
  const onQuitarIntegrante = (jugadorId) => {
    if (!equipoSeleccionado) return;

    if (jugadorId === equipoSeleccionado.capitanId) {
      showToast('No se puede quitar al capitán del equipo.', 'error');
      return;
    }

    const actualizados = equipos.map(eq => {
      if (eq.id === equipoSeleccionado.id) {
        return {
          ...eq,
          integrantes: eq.integrantes.filter(i => i.jugadorId !== jugadorId)
        };
      }
      return eq;
    });

    setEquipos(actualizados);
    persistirSession(actualizados);
    const eqActualizado = actualizados.find(e => e.id === equipoSeleccionado.id);
    setEquipoSeleccionado(eqActualizado);

    showToast('Integrante removido del equipo.', 'info');
  };

  // Toggle activo
  const onToggleActivo = () => {
    if (!equipoSeleccionado) return;

    const actualizados = equipos.map(eq => {
      if (eq.id === equipoSeleccionado.id) {
        return { ...eq, activo: !eq.activo };
      }
      return eq;
    });

    const nuevoEstado = !equipoSeleccionado.activo;
    setEquipos(actualizados);
    persistirSession(actualizados);
    const eqActualizado = actualizados.find(e => e.id === equipoSeleccionado.id);
    setEquipoSeleccionado(eqActualizado);

    showToast(`Equipo ${nuevoEstado ? 'reactivado' : 'desactivado'}.`, 'info');
  };

  // Render lista de equipos
  const renderListaEquipos = () => {
    if (equipos.length === 0) {
      return (
        <EmptyState
          icono="🛡️"
          titulo="No hay equipos registrados"
          mensaje="Crea un equipo usando el formulario de la izquierda."
        />
      );
    }

    return equipos.map(eq => {
      const juego = obtenerJuego(eq.juegoId);
      const capitan = obtenerJugador(eq.capitanId);
      return (
        <article key={eq.id} className="tarjeta tarjeta-torneo">
          <div className="tarjeta-torneo__juego">
            <span
              className="tarjeta-torneo__icono"
              style={{ backgroundColor: `${juego?.color || '#9146FF'}22`, color: juego?.color || '#9146FF' }}
              aria-hidden="true"
            >
              {juego?.icono || '🎮'}
            </span>
            <div>
              <p className="tarjeta-torneo__nombre-juego">{juego?.nombre || 'N/A'}</p>
              <span className={`badge ${eq.activo ? 'badge--abierto' : 'badge--cancelado'}`}>
                {eq.activo ? 'Activo' : 'Inactivo'}
              </span>
            </div>
          </div>
          <h3 className="tarjeta-torneo__titulo">{eq.nombre}</h3>
          <div className="tarjeta-torneo__meta">
            <span className="tarjeta-torneo__meta-item">👥 {eq.integrantes.length} integrantes</span>
            <span className="tarjeta-torneo__meta-item">🎖️ Cap: {capitan?.apodo || 'N/A'}</span>
          </div>
          <div className="tarjeta-torneo__acciones">
            <button
              type="button"
              className="boton boton-secundario boton--sm boton--bloque"
              onClick={() => setEquipoSeleccionado(eq)}
            >
              Gestionar integrantes
            </button>
          </div>
        </article>
      );
    });
  };

  // Render gestión de integrantes
  const renderGestionIntegrantes = () => {
    if (!equipoSeleccionado) {
      return (
        <EmptyState
          icono="🛡️"
          titulo="Selecciona un equipo"
          mensaje="Elige un equipo para ver y gestionar sus integrantes."
        />
      );
    }

    const juego = obtenerJuego(equipoSeleccionado.juegoId);
    const integrantesIds = equipoSeleccionado.integrantes.map(i => i.jugadorId);
    const disponibles = JUGADORES.filter(j => !integrantesIds.includes(j.id));
    const minIntegrantes = juego?.minIntegrantes || 1;
    const cumpleMinimo = equipoSeleccionado.integrantes.length >= minIntegrantes;
    const puedeAgregar = disponibles.length > 0 && equipoSeleccionado.integrantes.length < (juego?.maxIntegrantes || 999);

    return (
      <>
        {!equipoSeleccionado.activo && (
          <div className="aviso aviso--advertencia" role="alert">
            <span className="aviso__icono" aria-hidden="true">⚠</span>
            <span>
              Este equipo está inactivo. <strong>No puede inscribirse en torneos</strong> hasta que se reactivee.
            </span>
          </div>
        )}

        <div className="resumen__lista mb-2">
          <div className="resumen__item"><span className="resumen__clave">Equipo</span><span className="resumen__valor">{equipoSeleccionado.nombre}</span></div>
          <div className="resumen__item"><span className="resumen__clave">Juego</span><span className="resumen__valor">{juego?.nombre || 'N/A'} ({juego?.modalidad || 'N/A'})</span></div>
          <div className="resumen__item"><span className="resumen__clave">Integrantes</span><span className="resumen__valor">{equipoSeleccionado.integrantes.length} / máx. {juego?.maxIntegrantes || 'N/A'}</span></div>
          <div className="resumen__item"><span className="resumen__clave">Mínimo exigido</span><span className={`resumen__valor ${cumpleMinimo ? 'texto-acierto' : 'texto-error'}`}>{minIntegrantes} {cumpleMinimo ? '✓' : '✗'}</span></div>
        </div>

        <div className="tabla-contenedor mb-2">
          <table className="tabla">
            <caption className="sr-only">Integrantes del equipo {equipoSeleccionado.nombre}</caption>
            <thead>
              <tr>
                <th scope="col">#</th>
                <th scope="col">Apodo</th>
                <th scope="col">Nombre</th>
                <th scope="col">Rol</th>
                <th scope="col">Acción</th>
              </tr>
            </thead>
            <tbody>
              {equipoSeleccionado.integrantes.map((i, idx) => {
                const jugador = obtenerJugador(i.jugadorId);
                const esCapitan = i.jugadorId === equipoSeleccionado.capitanId;
                return (
                  <tr key={i.jugadorId}>
                    <td>{idx + 1}</td>
                    <td>{jugador?.apodo || 'N/A'}</td>
                    <td>{jugador?.nombre || 'N/A'}</td>
                    <td>
                      <span className={`badge ${esCapitan ? 'badge--primario' : 'badge--encurso'}`}>
                        {i.rol}
                      </span>
                    </td>
                    <td>
                      {esCapitan ? (
                        <span className="texto-muted" style={{ fontSize: '0.85rem' }}>No se puede quitar al capitán</span>
                      ) : (
                        <button
                          type="button"
                          className="boton boton-peligro boton--sm"
                          onClick={() => onQuitarIntegrante(i.jugadorId)}
                          aria-label={`Quitar a ${jugador?.apodo || 'jugador'} del equipo`}
                        >
                          Quitar
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {puedeAgregar && (
          <form className="formulario" id="form-agregar" aria-label="Agregar integrante al equipo" onSubmit={onAgregarIntegrante}>
            <div className="campo">
              <label className="campo__etiqueta" htmlFor="jugador-agregar">Agregar jugador</label>
              <select className="campo__select" id="jugador-agregar" name="jugadorAgregar" required>
                {disponibles.map(j => (
                  <option key={j.id} value={j.id}>
                    {j.apodo} ({j.nombre})
                  </option>
                ))}
              </select>
            </div>
            <div className="campo">
              <label className="campo__etiqueta" htmlFor="rol-agregar">
                Rol en el equipo <Obligatorio />
              </label>
              <input
                className="campo__entrada"
                type="text"
                id="rol-agregar"
                name="rolAgregar"
                required
                minLength="2"
                maxLength="20"
                placeholder="Ej: Soporte, Mid, ADC..."
                autoComplete="off"
              />
              <span className="campo__ayuda">Entre 2 y 20 caracteres.</span>
            </div>
            <button type="submit" className="boton boton-primario boton--sm">Agregar al equipo</button>
          </form>
        )}

        {!puedeAgregar && disponibles.length === 0 && (
          <div className="aviso aviso--info">
            <span className="aviso__icono" aria-hidden="true">ℹ</span>
            <span>No hay jugadores disponibles para agregar.</span>
          </div>
        )}

        {!puedeAgregar && disponibles.length > 0 && (
          <div className="aviso aviso--info">
            <span className="aviso__icono" aria-hidden="true">ℹ</span>
            <span>El equipo alcanzó el máximo de integrantes permitido.</span>
          </div>
        )}

        <div className="mt-2">
          <button
            type="button"
            className="boton boton-secundario boton--sm"
            id="btn-toggle-activo"
            data-activo={equipoSeleccionado.activo}
            onClick={onToggleActivo}
          >
            {equipoSeleccionado.activo ? 'Desactivar equipo' : 'Reactivar equipo'}
          </button>
        </div>
      </>
    );
  };

  return (
    <div className="contenedor">
      <Breadcrumb items={[
        { label: 'Inicio', to: '/' },
        { label: 'Equipos' }
      ]} />

      <section className="seccion" aria-labelledby="titulo-equipo">
        <div className="seccion__encabezado">
          <div>
            <h1 className="seccion__titulo" id="titulo-equipo">
              <span className="seccion__titulo-icono" aria-hidden="true">🛡️</span>
              Gestión de equipos
            </h1>
            <p className="seccion__subtitulo">
              Crea y mantiene equipos. Agrega y quita integrantes, asigna roles y controla el estado.
            </p>
          </div>
        </div>

        <div className="grid--dos">
          {/* Formulario de creación */}
          <div className="tarjeta">
            <h2 className="mb-2">
              <span aria-hidden="true">➕</span> Crear nuevo equipo
            </h2>

            <form
              ref={formularioRef}
              className="formulario"
              id="form-equipo"
              noValidate
              aria-label="Formulario de creación de equipo"
              onSubmit={onCrear}
            >
              <FormField
                label={<>Nombre del equipo <Obligatorio /></>}
                id="nombre-equipo"
                error={erroresFormulario.nombre}
                help="Entre 3 y 30 caracteres. No puede duplicarse con equipos existentes."
                helpId="ayuda-nombre"
              >
                <input
                  className={`campo__entrada ${erroresFormulario.nombre ? 'campo__entrada--invalido' : ''}`}
                  type="text"
                  id="nombre-equipo"
                  ref={nombreRef}
                  minLength="3"
                  maxLength="30"
                  autoComplete="organization"
                  placeholder="Ej: Phoenix Esports"
                  aria-describedby="ayuda-nombre"
                  aria-invalid={erroresFormulario.nombre ? 'true' : undefined}
                  onChange={handleInputChange}
                />
              </FormField>

              <FormField
                label={<>Juego principal <Obligatorio /></>}
                id="juego-equipo"
                error={erroresFormulario.juego}
                help="El juego define el mínimo de integrantes exigido."
                helpId="ayuda-juego"
              >
                <select
                  className={`campo__select ${erroresFormulario.juego ? 'campo__select--invalido' : ''}`}
                  id="juego-equipo"
                  ref={juegoRef}
                  required
                  aria-describedby="ayuda-juego"
                  onChange={handleInputChange}
                >
                  <option value="">Selecciona un juego...</option>
                  {JUEGOS.map(j => (
                    <option key={j.id} value={j.id}>{j.nombre}</option>
                  ))}
                </select>
              </FormField>

              <FormField
                label={<>Capitán <Obligatorio /></>}
                id="capitan-equipo"
                error={erroresFormulario.capitan}
                help="El capitán se agrega automáticamente como primer integrante."
                helpId="ayuda-capitan"
              >
                <select
                  className={`campo__select ${erroresFormulario.capitan ? 'campo__select--invalido' : ''}`}
                  id="capitan-equipo"
                  ref={capitanRef}
                  required
                  autoComplete="username"
                  aria-describedby="ayuda-capitan"
                  onChange={handleInputChange}
                >
                  <option value="">Selecciona un jugador...</option>
                  {JUGADORES.map(j => (
                    <option key={j.id} value={j.id}>
                      {j.apodo} ({j.nombre})
                    </option>
                  ))}
                </select>
              </FormField>

              <div className="campo">
                <label className="campo__checkbox" htmlFor="activo-equipo">
                  <input
                    type="checkbox"
                    id="activo-equipo"
                    ref={activoRef}
                    defaultChecked
                  />
                  <span>Equipo activo (los inactivos no pueden inscribirse en torneos)</span>
                </label>
              </div>

              <div className="flex gap-1" style={{ flexWrap: 'wrap' }}>
                <button
                  type="submit"
                  className="boton boton-primario"
                  id="btn-crear"
                  disabled={Object.keys(erroresFormulario).length > 0}
                >
                  Crear equipo
                </button>
                <button
                  type="button"
                  className="boton boton-secundario"
                  id="btn-limpiar-equipo"
                  onClick={onLimpiarFormulario}
                >
                  Limpiar
                </button>
              </div>

              <p className="texto-muted" style={{ fontSize: '0.85rem' }}>
                <span aria-hidden="true">ℹ️</span>
                El envío se bloquea mientras existan errores de validación.
              </p>
            </form>
          </div>

          {/* Gestión de integrantes */}
          <div className="tarjeta">
            <h2 className="mb-2">
              <span aria-hidden="true">👥</span> Gestión de integrantes
            </h2>

            <div className="campo mb-2">
              <label className="campo__etiqueta" htmlFor="equipo-gestionar">Selecciona un equipo</label>
              <select
                className="campo__select"
                id="equipo-gestionar"
                aria-describedby="ayuda-gestionar"
                onChange={onEquipoSeleccionadoChange}
                value={equipoSeleccionado ? equipoSeleccionado.id : ''}
              >
                <option value="">Selecciona un equipo para gestionar...</option>
                {equipos.map(e => (
                  <option key={e.id} value={e.id}>
                    {e.nombre}{e.activo ? '' : ' (inactivo)'}
                  </option>
                ))}
              </select>
              <span className="campo__ayuda" id="ayuda-gestionar">
                Podrás agregar y quitar integrantes, y asignar roles.
              </span>
            </div>

            <div id="gestion-integrantes" aria-live="polite">
              {renderGestionIntegrantes()}
            </div>
          </div>
        </div>

        {/* Listado de equipos existentes */}
        <section className="seccion mt-3" aria-labelledby="lista-titulo">
          <div className="seccion__encabezado">
            <h2 className="seccion__titulo" id="lista-titulo">
              <span className="seccion__titulo-icono" aria-hidden="true">📋</span>
              Equipos registrados
            </h2>
          </div>
          <div className="grid grid--tarjetas" id="lista-equipos" aria-live="polite">
            {renderListaEquipos()}
          </div>
        </section>
      </section>
    </div>
  );
}
