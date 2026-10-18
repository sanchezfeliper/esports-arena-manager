/* ==========================================================================
   components/AppLayout.jsx — Layout de la aplicación: encabezado, contenido y pie de página.
   ========================================================================== */

import { Outlet } from 'react-router-dom';
import SiteHeader from '@components/SiteHeader';
import SiteFooter from '@components/SiteFooter';

export default function AppLayout() {
  return (
    <>
      <SiteHeader />
      <main className="main">
        <Outlet />
      </main>
      <SiteFooter />
    </>
  );
}
