/* ==========================================================================
   components/Breadcrumb.jsx — Navegacion breadcrumb (Bootstrap 5).
   ========================================================================== */

import { NavLink } from "react-router-dom";

/**
 * @param {Array<{label: string, to?: string}>} items 
 */
export default function Breadcrumb({ items }) {
  return (
    <nav aria-label="breadcrumb">
      <ol className="breadcrumb">
        {items.map((item, i) => (
          <li key={item.to || item.label + "-" + i} className="breadcrumb-item">
            {item.to ? (
              <NavLink to={item.to} end>{item.label}</NavLink>
            ) : (
              <span className="breadcrumb-item active" aria-current="page">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
