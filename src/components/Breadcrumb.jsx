/* ==========================================================================
   components/Breadcrumb.jsx — Navegacion breadcrumb
   ========================================================================== */

import { Fragment } from 'react';
import { NavLink } from 'react-router-dom';

/**
 * @param {Array<{label: string, to?: string}>} items 
 */

export default function Breadcrumb({ items }) {
  return (
    <nav className="breadcrumb" aria-label="Ruta de navegación">
      {items.map((item, i) => (
        <Fragment key={`${item.to || item.label}-${i}`}>
          {i > 0 && (
            <span className="breadcrumb__separador" aria-hidden="true">/</span>
          )}
          {item.to ? (
            <NavLink to={item.to}>{item.label}</NavLink>
          ) : (
            <span className="breadcrumb__actual">{item.label}</span>
          )}
        </Fragment>
      ))}
    </nav>
  );
}
