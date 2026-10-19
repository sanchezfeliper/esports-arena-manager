/* ==========================================================================
   pages/TournamentsPage.jsx — Listado de torneos con filtros.

   ========================================================================== */

import { useState } from 'react';
import { JUEGOS, TORNEOS } from '@data/mockData';
import Breadcrumb from '@components/Breadcrumb';
import TournamentCard from '@components/TournamentCard';
import EmptyState from '@components/EmptyState';

const ESTADOS_FILTRO = [
  { value: 'abierto',     label: 'Inscripción abierta' },
  { value: 'en curso',    label: 'En curso' },
  { value: 'finalizado',  label: 'Finalizado' }
];

export default function TournamentsPage() {
  const [filtros, setFiltros] = useState({
    juegoId: '',
    estado: '',
    fechaInicio: '',
    fechaFin: '',
    buscador: ''
  });
  const [filtrosAplicados, setFiltrosAplicados] = useState(filtros);

  const [errorFechas, setErrorFechas] = useState(false);

  // Aplicar filtros al listado
  const resultados = TORNEOS.filter(t => {
    if (filtrosAplicados.juegoId && String(t.juegoId) !== filtrosAplicados.juegoId) return false;
    if (filtrosAplicados.estado && t.estado !== filtrosAplicados.estado) return false;
    if (filtrosAplicados.fechaInicio && t.fechaInicio < filtrosAplicados.fechaInicio) return false;
    if (filtrosAplicados.fechaFin && t.fechaInicio > filtrosAplicados.fechaFin) return false;
    if (filtrosAplicados.buscador && !t.nombre.toLowerCase().includes(filtrosAplicados.buscador)) return false;
    return true;
  });

  const handleFiltroChange = (e) => {
    const { id, value } = e.target;
    const updated = { ...filtros, [id]: value };
    setFiltros(updated);
    if (id === 'fechaInicio' || id === 'fechaFin') {
      setErrorFechas(Boolean(updated.fechaInicio && updated.fechaFin && updated.fechaInicio > updated.fechaFin));
    }
  };

  const handleBuscadorChange = (e) => {
    const buscador = e.target.value.trim().toLowerCase();
    setFiltros(prev => ({ ...prev, buscador }));
    setFiltrosAplicados(prev => ({ ...prev, buscador }));
  };

  const handleApply = (e) => {
    e.preventDefault();
    const rangoInvalido = filtros.fechaInicio && filtros.fechaFin && filtros.fechaInicio > filtros.fechaFin;
    setErrorFechas(Boolean(rangoInvalido));
    if (rangoInvalido) return;
    setFiltrosAplicados(filtros);
  };

  const handleClear = () => {
    const vacios = { juegoId: '', estado: '', fechaInicio: '', fechaFin: '', buscador: '' };
    setFiltros(vacios);
    setFiltrosAplicados(vacios);
    setErrorFechas(false);
  };

  return (
    <div className="contenedor">
      <Breadcrumb items={[
        { label: 'Inicio', to: '/' },
        { label: 'Torneos' }
      ]} />

      <section className="seccion" aria-labelledby="titulo-torneos">
        <div className="seccion__encabezado">
          <div>
            <h1 className="seccion__titulo" id="titulo-torneos">
              <span className="seccion__titulo-icono" aria-hidden="true">🏆</span>
              Listado de torneos
            </h1>
            <p className="seccion__subtitulo">
              Explora todos los torneos con filtros por juego, estado y rango de fechas.
            </p>
          </div>
        </div>

        {/* Filtros */}
        <form className="filtros" id="form-filtros" noValidate aria-label="Filtros de torneos" onSubmit={handleApply}>
          <h2 className="filtros__titulo">
            <span aria-hidden="true">🔍</span> Filtrar torneos
          </h2>
          <div className="filtros__grid">
            <div className="campo">
              <label className="campo__etiqueta" htmlFor="juegoId">Juego</label>
              <select
                className="campo__select"
                id="juegoId"
                autoComplete="off"
                value={filtros.juegoId}
                onChange={handleFiltroChange}
              >
                <option value="">Todos los juegos</option>
                {JUEGOS.map(j => (
                  <option key={j.id} value={String(j.id)}>{j.nombre}</option>
                ))}
              </select>
            </div>

            <div className="campo">
              <label className="campo__etiqueta" htmlFor="estado">Estado</label>
              <select
                className="campo__select"
                id="estado"
                autoComplete="off"
                value={filtros.estado}
                onChange={handleFiltroChange}
              >
                <option value="">Todos los estados</option>
                {ESTADOS_FILTRO.map(e => (
                  <option key={e.value} value={e.value}>{e.label}</option>
                ))}
              </select>
            </div>

            <div className="campo">
              <label className="campo__etiqueta" htmlFor="fechaInicio">
                Fecha inicial <span className="campo__obligatorio" aria-hidden="true">*</span>
              </label>
              <input
                className={`campo__entrada ${errorFechas ? 'campo__entrada--invalido' : ''}`}
                type="date"
                id="fechaInicio"
                autoComplete="off"
                value={filtros.fechaInicio}
                onChange={handleFiltroChange}
                aria-invalid={errorFechas ? 'true' : undefined}
              />
              <span className="campo__ayuda">Desde esta fecha de inicio del torneo (inclusive).</span>
            </div>

            <div className="campo">
              <label className="campo__etiqueta" htmlFor="fechaFin">
                Fecha final <span className="campo__obligatorio" aria-hidden="true">*</span>
              </label>
              <input
                className={`campo__entrada ${errorFechas ? 'campo__entrada--invalido' : ''}`}
                type="date"
                id="fechaFin"
                autoComplete="off"
                value={filtros.fechaFin}
                onChange={handleFiltroChange}
                aria-invalid={errorFechas ? 'true' : undefined}
              />
              <span className="campo__ayuda">
                Hasta esta fecha de inicio del torneo (inclusive). No puede ser anterior a la fecha inicial.
              </span>
            </div>

            <div className="campo" style={{ gridColumn: '1 / -1' }}>
              <label className="campo__etiqueta" htmlFor="buscador">Buscar por nombre</label>
              <input
                className="campo__entrada"
                type="search"
                id="buscador"
                placeholder="Ej: Copa Arena, Valorant Winter..."
                autoComplete="off"
                value={filtros.buscador}
                onChange={handleBuscadorChange}
              />
              <span className="campo__ayuda">Filtra torneos cuyo nombre contiene el texto ingresado.</span>
            </div>
          </div>

          {errorFechas && (
            <div className="campo__error" role="alert">
              ⚠ La fecha inicial no puede ser posterior a la fecha final. Ajusta el rango para aplicar el filtro.
            </div>
          )}

          <div className="filtros__acciones">
            <button type="submit" className="boton boton-primario">Aplicar filtros</button>
            <button type="button" className="boton boton-secundario" id="btn-limpiar" onClick={handleClear}>
              Limpiar
            </button>
          </div>
        </form>

        {/* Contador de resultados */}
        <div className="flex justify-between items-center mt-2 mb-1" style={{ flexWrap: 'wrap', gap: '0.5rem' }}>
          <p className="texto-muted" aria-live="polite">
            {resultados.length} torneo{resultados.length !== 1 ? 's' : ''} encontrado{resultados.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Resultados */}
        <div className="grid grid--tarjetas" aria-live="polite">
          {resultados.length === 0 ? (
            <EmptyState
              icono="🏁"
              titulo="No hay torneos que cumplan los filtros"
              mensaje="Prueba ajustar el juego, el estado o el rango de fechas."
            />
          ) : (
            resultados.map(t => (
              <TournamentCard key={t.id} torneo={t} variant="list" />
            ))
          )}
        </div>
      </section>
    </div>
  );
}
