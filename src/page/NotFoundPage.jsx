import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="contenedor">
      <section className="estado-vacio" aria-labelledby="not-found-title">
        <p className="estado-vacio__icono" aria-hidden="true">🔎</p>
        <h1 className="estado-vacio__titulo" id="not-found-title">Página no encontrada</h1>
        <p>La dirección que buscas no corresponde a una sección disponible.</p>
        <Link to="/" className="boton boton-primario mt-2">Volver al inicio</Link>
      </section>
    </div>
  );
}
