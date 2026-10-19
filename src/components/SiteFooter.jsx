/* ==========================================================================
   components/SiteFooter.jsx 
   ========================================================================== */

const anio = new Date().getFullYear();

const enlacesNav = [
  { to: '/',           label: 'Inicio' },
  { to: '/torneos',    label: 'Torneos' },
  { to: '/inscripcion', label: 'Inscripción' },
  { to: '/equipos',    label: 'Equipos' },
  { to: '/perfil',     label: 'Perfil de jugador' }
];

export default function SiteFooter() {
  return (
    <footer className="sitio-footer" role="contentinfo">
      <div className="sitio-footer__contenedor">
        <div>
          <div className="sitio-footer__marca">
            <img src="/img/logo.svg" alt="Logo de eSports Arena Manager" width="28" height="28" />
            <span>eSports Arena Manager</span>
          </div>
          <p className="sitio-footer__descripcion">
            Plataforma para organizar torneos de videojuegos competitivos: juegos habilitados,
            jugadores, equipos, torneos, inscripciones, partidas, resultados, rankings, sanciones y premios.
          </p>
        </div>
        <div>
          <h3 className="sitio-footer__col-titulo">Navegación</h3>
          <ul className="sitio-footer__lista">
            {enlacesNav.map((e) => (
              <li key={e.to}>
                <a href={e.to}>{e.label}</a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="sitio-footer__barra">
        <span>&copy; {anio} eSports Arena Manager </span>
   
      </div>
    </footer>
  );
}
