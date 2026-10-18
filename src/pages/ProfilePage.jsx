/* ==========================================================================
   pages/ProfilePage.jsx — Perfil de jugador: datos, equipos, historial, estadísticas y sanciones.
  
   ========================================================================== */

import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  JUGADORES, PARTIDAS, TORNEOS,
  obtenerJugador, obtenerJuego
} from '@data/mockData';
import {
  equiposDelJugador
} from '@domain/teams';
import {
  sancionesDelJugador, tieneSancionActiva,
  esCorreoValido, noContieneEspacios
} from '@domain/registration';
import { formatearFecha } from '@domain/dates';
import { estadoTorneoTexto, ordenarRanking, estadoBadgeClase } from '@domain/tournaments';
import Breadcrumb from '@components/Breadcrumb';
import FormField, { Obligatorio } from '@components/FormField';
import { useToast } from '@components/useToast';

/** Calcula estadísticas de victorias/derrotas para un jugador. */
function calcularEstadisticas(jugadorId) {
  const equipos = equiposDelJugador(jugadorId);
  const equiposIds = equipos.map(e => e.id);

  let victorias = 0, derrotas = 0;
  PARTIDAS.forEach(p => {
    if (p.ganadorId == null) return;
    if (p.ganadorId === p.equipoAId && equiposIds.includes(p.equipoAId)) victorias++;
    if (p.ganadorId === p.equipoBId && equiposIds.includes(p.equipoBId)) victorias++;
    if (p.ganadorId === p.equipoAId && equiposIds.includes(p.equipoBId)) derrotas++;
    if (p.ganadorId === p.equipoBId && equiposIds.includes(p.equipoAId)) derrotas++;
  });

  const torneosSet = new Set();
  TORNEOS.forEach(t => {
    if (t.inscritos.some(id => equiposIds.includes(id))) torneosSet.add(t.id);
  });

  const total = victorias + derrotas;
  const tasa = total > 0 ? Math.round((victorias / total) * 100) : 0;
  return { victorias, derrotas, torneos: torneosSet.size, tasa };
}

export default function ProfilePage() {
  const { id } = useParams();
  const parsedId = Number(id);
  const jugadorActual = obtenerJugador(parsedId) || JUGADORES[0];
  return <ProfileContent key={jugadorActual.id} jugadorActual={jugadorActual} />;
}

function ProfileContent({ jugadorActual }) {
  const navigate = useNavigate();
  const { showToast } = useToast();

  // Form field state (in-memory, like original perfil.js)
  const [formData, setFormData] = useState(() => ({
    apodo: jugadorActual.apodo,
    correo: jugadorActual.correo,
    telefono: jugadorActual.telefono || ''
  }));
  const [passwordData, setPasswordData] = useState({
    actual: '',
    nueva: '',
    confirmar: ''
  });
  const [erroresDatos, setErroresDatos] = useState({});
  const [erroresPassword, setErroresPassword] = useState({});

  // --- Form validation: datos ---
  const validarFormDatos = (vals = formData) => {
    const errores = {};
    let valido = true;

    if (!vals.apodo) {
      errores.apodo = 'El apodo es obligatorio.';
      valido = false;
    } else if (vals.apodo.length < 3) {
      errores.apodo = 'El apodo debe tener al menos 3 caracteres.';
      valido = false;
    } else if (vals.apodo.length > 20) {
      errores.apodo = 'El apodo no puede superar 20 caracteres.';
      valido = false;
    } else if (!noContieneEspacios(vals.apodo)) {
      errores.apodo = 'El apodo no admite espacios. Usa letras, números o guiones.';
      valido = false;
    }

    if (!vals.correo) {
      errores.correo = 'El correo electrónico es obligatorio.';
      valido = false;
    } else if (!esCorreoValido(vals.correo)) {
      errores.correo = 'El correo no tiene un formato válido (ej: nombre@dominio.cl).';
      valido = false;
    }

    if (vals.telefono) {
      const telefonoPattern = /^(\+?56)?[\s9]?\d{4}[\s]\d{4}$/;
      const telefonoPattern2 = /^\+56\s9\s\d{4}\s\d{4}$/;
      if (!telefonoPattern.test(vals.telefono) && !telefonoPattern2.test(vals.telefono)) {
        errores.telefono = 'Formato inválido. Ej: +56 9 1234 5678';
        valido = false;
      }
    }

    setErroresDatos(errores);
    return valido;
  };

  // --- Form validation: password ---
  const validarFormPassword = (vals = passwordData) => {
    const errores = {};
    let valido = true;

    if (!vals.actual) {
      errores.actual = 'La contraseña actual es obligatoria.';
      valido = false;
    } else if (vals.actual.length < 8) {
      errores.actual = 'La contraseña debe tener al menos 8 caracteres.';
      valido = false;
    }

    if (!vals.nueva) {
      errores.nueva = 'La nueva contraseña es obligatoria.';
      valido = false;
    } else if (vals.nueva.length < 8) {
      errores.nueva = 'La contraseña debe tener al menos 8 caracteres.';
      valido = false;
    } else if (vals.nueva.length > 30) {
      errores.nueva = 'La contraseña no puede superar 30 caracteres.';
      valido = false;
    } else if (vals.actual && vals.nueva === vals.actual) {
      errores.nueva = 'La nueva contraseña debe ser distinta a la actual.';
      valido = false;
    }

    if (!vals.confirmar) {
      errores.confirmar = 'Debes confirmar la nueva contraseña.';
      valido = false;
    } else if (vals.nueva && vals.confirmar !== vals.nueva) {
      errores.confirmar = 'Las contraseñas no coinciden. Verifica la confirmación.';
      valido = false;
    }

    setErroresPassword(errores);
    return valido;
  };

  const handleDatosChange = (e) => {
    const { name, value } = e.target;
    const newVals = { ...formData, [name]: value };
    setFormData(newVals);
    validarFormDatos(newVals);
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    const newVals = { ...passwordData, [name]: value };
    setPasswordData(newVals);
    validarFormPassword(newVals);
  };

  const onGuardarDatos = (e) => {
    e.preventDefault();
    if (!validarFormDatos()) {
      showToast('Existen errores en el formulario. Revísalos.', 'error');
      return;
    }
    showToast('Datos del perfil actualizados.', 'exito');
  };

  const onGuardarPassword = (e) => {
    e.preventDefault();
    if (!validarFormPassword()) {
      showToast('Existen errores en el formulario de contraseña.', 'error');
      return;
    }
    setPasswordData({ actual: '', nueva: '', confirmar: '' });
    setErroresPassword({});
    showToast('Contraseña actualizada con éxito.', 'exito');
  };

  const onLimpiarDatos = () => {
    setFormData({
      apodo: jugadorActual?.apodo || '',
      correo: jugadorActual?.correo || '',
      telefono: jugadorActual?.telefono || ''
    });
    validarFormDatos({
      apodo: jugadorActual?.apodo || '',
      correo: jugadorActual?.correo || '',
      telefono: jugadorActual?.telefono || ''
    });
    setErroresDatos({});
  };

  const onLimpiarPassword = () => {
    setPasswordData({ actual: '', nueva: '', confirmar: '' });
    validarFormPassword({ actual: '', nueva: '', confirmar: '' });
    setErroresPassword({});
  };

  const onJugadorChange = (e) => {
    const newId = Number(e.target.value);
    navigate(`/perfil/${newId}`);
  };

  // --- Render helpers ---
  const stats = useMemo(
    () => jugadorActual ? calcularEstadisticas(jugadorActual.id) : { victorias: 0, derrotas: 0, torneos: 0, tasa: 0 },
    [jugadorActual]
  );

  const equiposDelPlayer = useMemo(
    () => jugadorActual ? equiposDelJugador(jugadorActual.id) : [],
    [jugadorActual]
  );

  const sanciones = useMemo(
    () => jugadorActual ? sancionesDelJugador(jugadorActual.id) : [],
    [jugadorActual]
  );

  const sancionActiva = useMemo(
    () => jugadorActual ? tieneSancionActiva(jugadorActual.id) : false,
    [jugadorActual]
  );

  // Historial de torneos
  const torneosJugados = useMemo(() => {
    if (!jugadorActual) return [];
    const equiposIds = equiposDelPlayer.map(e => e.id);
    return TORNEOS.filter(t => t.inscritos.some(id => equiposIds.includes(id)));
  }, [jugadorActual, equiposDelPlayer]);

  const renderEstadisticas = () => {
    const tarjetas = [
      { titulo: 'Victorias', valor: stats.victorias, icono: '🏆', clase: 'texto-acierto' },
      { titulo: 'Derrotas',  valor: stats.derrotas,  icono: '💔', clase: 'texto-error' },
      { titulo: 'Torneos jugados', valor: stats.torneos, icono: '🎮', clase: '' },
      { titulo: 'Tasa de victorias', valor: `${stats.tasa}%`, icono: '📊', clase: 'texto-acierto' }
    ];

    return tarjetas.map(t => (
      <div key={t.titulo} className="tarjeta texto-centrado">
        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }} aria-hidden="true">{t.icono}</div>
        <p className={t.clase} style={{ fontFamily: 'var(--fuente-titulo)', fontSize: '1.75rem', fontWeight: 700 }}>{t.valor}</p>
        <p className="texto-muted" style={{ fontSize: '0.9rem' }}>{t.titulo}</p>
      </div>
    ));
  };

  const renderEquipos = () => {
    if (equiposDelPlayer.length === 0) {
      return (
        <div className="estado-vacio" style={{ gridColumn: '1/-1' }}>
          <div className="estado-vacio__icono" aria-hidden="true">🛡️</div>
          <p className="estado-vacio__titulo">Sin equipos</p>
          <p>Este jugador no pertenece a ningún equipo todavía.</p>
        </div>
      );
    }

    return equiposDelPlayer.map(eq => {
      const juego = obtenerJuego(eq.juegoId);
      const rol = eq.integrantes.find(i => i.jugadorId === jugadorActual?.id)?.rol || 'Integrante';
      const cumpleMinimo = juego ? eq.integrantes.length >= juego.minIntegrantes : false;

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
            <span className="tarjeta-torneo__meta-item">👥 {eq.integrantes.length}/{juego?.maxIntegrantes}</span>
            <span className="tarjeta-torneo__meta-item">🎖️ Tu rol: {rol}</span>
          </div>
          <p className={cumpleMinimo ? 'texto-acierto' : 'texto-error'} style={{ fontSize: '0.85rem' }}>
            {cumpleMinimo ? '✓' : '⚠'} Mín. {juego?.minIntegrantes} integrantes {cumpleMinimo ? 'cumplido' : 'no cumplido'}
          </p>
          <div className="tarjeta-torneo__acciones">
            <button
              type="button"
              className="boton boton-secundario boton--sm boton--bloque"
              onClick={() => navigate('/equipos')}
              aria-label={`Ver gestión del equipo ${eq.nombre}`}
            >
              Gestionar equipo
            </button>
          </div>
        </article>
      );
    });
  };

  const renderHistorial = () => {
    if (torneosJugados.length === 0) {
      return (
        <tr>
          <td colSpan="5">
            <div className="estado-vacio">
              <div className="estado-vacio__icono" aria-hidden="true">📜</div>
              <p className="estado-vacio__titulo">Sin historial</p>
              <p>El jugador no ha participado en torneos todavía.</p>
            </div>
          </td>
        </tr>
      );
    }

    return torneosJugados.map(t => {
      const juego = obtenerJuego(t.juegoId);
      const ranking = ordenarRanking(t.ranking || []);
      const equipoJugador = equiposDelPlayer.find(e => t.inscritos.includes(e.id));
      const posicion = ranking.findIndex(r => r.equipoId === equipoJugador?.id) + 1;

      let resultado;
      if (t.estado === 'finalizado' && posicion > 0) {
        resultado =
          posicion === 1 ? '🏆 1° lugar' :
          posicion === 2 ? '🥈 2° lugar' :
          posicion === 3 ? '🥉 3° lugar' :
          `${posicion}° lugar`;
      } else if (t.estado === 'en curso') {
        resultado = 'En competencia';
      } else {
        resultado = 'Pendiente';
      }

      return (
        <tr key={t.id}>
          <td>
            <button
              type="button"
              className="enlace-boton"
              onClick={() => navigate(`/torneos/${t.id}`)}
              aria-label={`Ver detalle del torneo ${t.nombre}`}
            >
              {t.nombre}
            </button>
          </td>
          <td>{juego?.nombre || 'N/A'}</td>
          <td>{formatearFecha(t.fechaInicio)}</td>
          <td>
            <span className={`badge badge--${estadoBadgeClase(t.estado)}`}>
              {estadoTorneoTexto(t.estado)}
            </span>
          </td>
          <td style={{ fontWeight: 600 }}>{resultado}</td>
        </tr>
      );
    });
  };

  const renderSanciones = () => {
    if (sanciones.length === 0) {
      return (
        <div className="aviso aviso--exito">
          <span className="aviso__icono" aria-hidden="true">✓</span>
          <span>El jugador no tiene sanciones registradas. Estado limpio.</span>
        </div>
      );
    }

    return sanciones.map(s => {
      const vigente = s.estado === 'vigente';
      return (
        <div key={s.id} className="lista__item">
          <span
            className="lista__avatar"
            style={{ backgroundColor: vigente ? 'var(--color-error)' : 'var(--color-borde)' }}
            aria-hidden="true"
          >
            {vigente ? '⛔' : '✓'}
          </span>
          <div className="lista__contenido">
            <p className="lista__nombre">
              <span className={`badge ${vigente ? 'badge--cancelado' : 'badge--finalizado'}`}>
                {vigente ? 'Vigente' : 'Cumplida'}
              </span>
              {s.motivo}
            </p>
            <p className="lista__detalle">
              Desde {formatearFecha(s.fechaInicio)} hasta {formatearFecha(s.fechaFin)}
            </p>
          </div>
        </div>
      );
    });
  };

  if (!jugadorActual) {
    return (
      <div className="contenedor">
        <Breadcrumb items={[{ label: 'Inicio', to: '/' }, { label: 'Perfil' }]} />
        <p className="texto-error">Jugador no encontrado.</p>
      </div>
    );
  }

  const canSaveDatos = Object.keys(erroresDatos).length === 0;
  const canSavePass = Object.keys(erroresPassword).length === 0;

  return (
    <div className="contenedor">
      <Breadcrumb items={[
        { label: 'Inicio', to: '/' },
        { label: 'Perfil de jugador' }
      ]} />

      <section className="seccion" aria-labelledby="titulo-perfil">
        <div className="seccion__encabezado">
          <div>
            <h1 className="seccion__titulo" id="titulo-perfil">
              <span className="seccion__titulo-icono" aria-hidden="true">🎮</span>
              Perfil de jugador
            </h1>
            <p className="seccion__subtitulo">
              Ficha competitiva de un participante: contacto, apodo, equipos, historial, estadísticas y sanciones.
            </p>
          </div>
          <div className="campo" style={{ margin: 0 }}>
            <label className="campo__etiqueta" htmlFor="selector-jugador">Ver perfil de</label>
            <select
              className="campo__select"
              id="selector-jugador"
              value={jugadorActual.id}
              onChange={onJugadorChange}
              autoComplete="off"
              aria-describedby="ayuda-selector"
            >
              {JUGADORES.map(j => (
                <option key={j.id} value={j.id}>
                  {j.apodo} ({j.nombre})
                </option>
              ))}
            </select>
            <span className="campo__ayuda" id="ayuda-selector">Cambia de jugador para ver su ficha completa.</span>
          </div>
        </div>

        {/* Perfil header */}
        <article className="tarjeta mb-2" id="cabecera-perfil">
          <div className="flex items-center gap-2" style={{ flexWrap: 'wrap' }}>
            <img
              src="/img/avatar.svg"
              alt={`Avatar genérico de ${jugadorActual.apodo}`}
              width="80"
              height="80"
              style={{ borderRadius: '50%', background: 'var(--color-superficie-alt)', padding: '6px' }}
            />
            <div>
              <h2 className="seccion__titulo" style={{ fontSize: '1.5rem', margin: 0 }}>{jugadorActual.apodo}</h2>
              <p className="texto-muted">{jugadorActual.nombre}</p>
              <p className="texto-muted" style={{ fontSize: '0.88rem' }}>
                <span aria-hidden="true">📧</span> {jugadorActual.correo}
                {jugadorActual.telefono && (
                  <>
                    {' '}·{' '}
                    <span aria-hidden="true">📞</span> {jugadorActual.telefono}
                  </>
                )}
                {' '}·{' '}
                <span aria-hidden="true">📍</span> {jugadorActual.region}
              </p>
              <span className={`badge mt-1 ${sancionActiva ? 'badge--cancelado' : 'badge--abierto'}`}>
                {sancionActiva ? '⛔ Sanción vigente' : '✓ Sin sanciones vigentes'}
              </span>
            </div>
          </div>
        </article>

        {/* Formularios: datos + password */}
        <div className="grid--dos">
          {/* Editar datos */}
          <section className="tarjeta" aria-labelledby="form-datos-titulo">
            <h2 className="mb-2" id="form-datos-titulo">
              <span aria-hidden="true">✏️</span> Editar datos del perfil
            </h2>
            <form
              className="formulario"
              id="form-datos"
              noValidate
              aria-label="Formulario de edición de datos del perfil"
              onSubmit={onGuardarDatos}
            >
              <FormField
                label={<>Apodo (gamertag) <Obligatorio /></>}
                id="apodo"
                error={erroresDatos.apodo}
                help="Obligatorio. Entre 3 y 20 caracteres. No admite espacios (se usa para identificación pública)."
                helpId="ayuda-apodo"
              >
                <input
                  className={`campo__entrada ${erroresDatos.apodo ? 'campo__entrada--invalido' : ''}`}
                  type="text"
                  id="apodo"
                  name="apodo"
                  value={formData.apodo}
                  onChange={handleDatosChange}
                  minLength="3"
                  maxLength="20"
                  autoComplete="username"
                  placeholder="Ej: ShadowKnight"
                  aria-describedby="ayuda-apodo"
                  aria-invalid={erroresDatos.apodo ? 'true' : undefined}
                />
              </FormField>

              <FormField
                label={<>Correo electrónico <Obligatorio /></>}
                id="perfil-correo"
                error={erroresDatos.correo}
                help="Se usa para notificaciones de torneos. Formato válido."
                helpId="ayuda-perfil-correo"
              >
                <input
                  className={`campo__entrada ${erroresDatos.correo ? 'campo__entrada--invalido' : ''}`}
                  type="email"
                  id="perfil-correo"
                  name="correo"
                  value={formData.correo}
                  onChange={handleDatosChange}
                  autoComplete="email"
                  placeholder="ej: jugador@arena.cl"
                  aria-describedby="ayuda-perfil-correo"
                  aria-invalid={erroresDatos.correo ? 'true' : undefined}
                />
              </FormField>

              <FormField
                label="Teléfono"
                id="telefono"
                error={erroresDatos.telefono}
                help="Formato chileno: +56 9 XXXX XXXX. Opcional."
                helpId="ayuda-telefono"
              >
                <input
                  className={`campo__entrada ${erroresDatos.telefono ? 'campo__entrada--invalido' : ''}`}
                  type="tel"
                  id="telefono"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleDatosChange}
                  autoComplete="tel"
                  placeholder="Ej: +56 9 1234 5678"
                  aria-describedby="ayuda-telefono"
                  aria-invalid={erroresDatos.telefono ? 'true' : undefined}
                />
              </FormField>

              <div className="flex gap-1" style={{ flexWrap: 'wrap' }}>
                <button
                  type="submit"
                  className="boton boton-primario"
                  id="btn-guardar-datos"
                  disabled={!canSaveDatos}
                >
                  Guardar cambios
                </button>
                <button
                  type="button"
                  className="boton boton-secundario"
                  id="btn-limpiar-datos"
                  onClick={onLimpiarDatos}
                >
                  Restablecer
                </button>
              </div>
            </form>
          </section>

          {/* Cambiar contraseña */}
          <section className="tarjeta" aria-labelledby="form-pass-titulo">
            <h2 className="mb-2" id="form-pass-titulo">
              <span aria-hidden="true">🔑</span> Cambiar contraseña
            </h2>
            <form
              className="formulario"
              id="form-password"
              noValidate
              aria-label="Formulario de cambio de contraseña"
              onSubmit={onGuardarPassword}
            >
              <FormField
                label={<>Contraseña actual <Obligatorio /></>}
                id="pass-actual"
                error={erroresPassword.actual}
                help="Mínimo 8 caracteres. En EP1 cualquier valor es aceptado."
                helpId="ayuda-pass-actual"
              >
                <input
                  className={`campo__entrada ${erroresPassword.actual ? 'campo__entrada--invalido' : ''}`}
                  type="password"
                  id="pass-actual"
                  name="actual"
                  value={passwordData.actual}
                  onChange={handlePasswordChange}
                  minLength="8"
                  maxLength="30"
                  autoComplete="current-password"
                  aria-describedby="ayuda-pass-actual"
                  aria-invalid={erroresPassword.actual ? 'true' : undefined}
                />
              </FormField>

              <FormField
                label={<>Nueva contraseña <Obligatorio /></>}
                id="pass-nueva"
                error={erroresPassword.nueva}
                help="Mínimo 8 y máximo 30 caracteres. Debe ser distinta a la actual."
                helpId="ayuda-pass-nueva"
              >
                <input
                  className={`campo__entrada ${erroresPassword.nueva ? 'campo__entrada--invalido' : ''}`}
                  type="password"
                  id="pass-nueva"
                  name="nueva"
                  value={passwordData.nueva}
                  onChange={handlePasswordChange}
                  minLength="8"
                  maxLength="30"
                  autoComplete="new-password"
                  aria-describedby="ayuda-pass-nueva"
                  aria-invalid={erroresPassword.nueva ? 'true' : undefined}
                />
              </FormField>

              <FormField
                label={<>Confirmar nueva contraseña <Obligatorio /></>}
                id="pass-confirmar"
                error={erroresPassword.confirmar}
                help="Debe ser idéntica a la nueva contraseña."
                helpId="ayuda-pass-confirmar"
              >
                <input
                  className={`campo__entrada ${erroresPassword.confirmar ? 'campo__entrada--invalido' : ''}`}
                  type="password"
                  id="pass-confirmar"
                  name="confirmar"
                  value={passwordData.confirmar}
                  onChange={handlePasswordChange}
                  minLength="8"
                  maxLength="30"
                  autoComplete="new-password"
                  aria-describedby="ayuda-pass-confirmar"
                  aria-invalid={erroresPassword.confirmar ? 'true' : undefined}
                />
              </FormField>

              <div className="flex gap-1" style={{ flexWrap: 'wrap' }}>
                <button
                  type="submit"
                  className="boton boton-primario"
                  id="btn-guardar-pass"
                  disabled={!canSavePass}
                >
                  Actualizar contraseña
                </button>
                <button
                  type="button"
                  className="boton boton-secundario"
                  id="btn-limpiar-pass"
                  onClick={onLimpiarPassword}
                >
                  Limpiar
                </button>
              </div>
            </form>
          </section>
        </div>

        {/* Estadísticas */}
        <section className="seccion mt-3" aria-labelledby="stats-titulo">
          <h2 className="seccion__titulo" id="stats-titulo">
            <span className="seccion__titulo-icono" aria-hidden="true">📈</span>
            Estadísticas competitivas
          </h2>
          <div className="grid grid--tarjetas" id="estadisticas">
            {renderEstadisticas()}
          </div>
        </section>

        {/* Equipos */}
        <section className="seccion" aria-labelledby="equipos-titulo">
          <h2 className="seccion__titulo" id="equipos-titulo">
            <span className="seccion__titulo-icono" aria-hidden="true">🛡️</span>
            Equipos a los que pertenece
          </h2>
          <div className="grid grid--tarjetas" id="equipos-jugador" aria-live="polite">
            {renderEquipos()}
          </div>
        </section>

        {/* Historial */}
        <section className="seccion" aria-labelledby="historial-titulo">
          <h2 className="seccion__titulo" id="historial-titulo">
            <span className="seccion__titulo-icono" aria-hidden="true">📜</span>
            Historial de torneos
          </h2>
          <div className="tabla-contenedor">
            <table className="tabla" id="tabla-historial">
              <caption className="sr-only">Historial de torneos disputados por el jugador</caption>
              <thead>
                <tr>
                  <th scope="col">Torneo</th>
                  <th scope="col">Juego</th>
                  <th scope="col">Fecha</th>
                  <th scope="col">Estado</th>
                  <th scope="col">Resultado</th>
                </tr>
              </thead>
              <tbody id="historial-cuerpo">
                {renderHistorial()}
              </tbody>
            </table>
          </div>
        </section>

        {/* Sanciones */}
        <section className="seccion" aria-labelledby="sanciones-titulo">
          <h2 className="seccion__titulo" id="sanciones-titulo">
            <span className="seccion__titulo-icono" aria-hidden="true">⚠️</span>
            Sanciones
          </h2>
          <div className="lista" id="lista-sanciones" aria-live="polite">
            {renderSanciones()}
          </div>
        </section>
      </section>
    </div>
  );
}
