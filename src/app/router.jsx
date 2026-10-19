/* ==========================================================================
   app/router.jsx —
   Rutas acordadas: /, /torneos, /torneos/:id, /inscripcion, /equipos,
   /perfil/:id (con /perfil como fallback).
   ========================================================================== */

import { Routes, Route } from 'react-router-dom';
import HomePage from '@pages/HomePage';
import TournamentsPage from '@pages/TournamentsPage';
import TournamentDetailPage from '@pages/TournamentDetailPage';
import RegistrationPage from '@pages/RegistrationPage';
import TeamsPage from '@pages/TeamsPage';
import ProfilePage from '@pages/ProfilePage';
import NotFoundPage from '@pages/NotFoundPage';
import OldUrlRedirect from '@components/OldUrlRedirect';
import AppLayout from '@components/AppLayout';

export default function Router() {
  return (
    <Routes>
      {/* Redirije desde URLs antiguas */}
      <Route path="/torneo-detalle.html" element={<OldUrlRedirect />} />
      <Route path="/inscripcion.html" element={<OldUrlRedirect />} />
      <Route path="/index.html" element={<OldUrlRedirect />} />
      <Route path="/torneos.html" element={<OldUrlRedirect />} />
      <Route path="/equipo.html" element={<OldUrlRedirect />} />
      <Route path="/perfil.html" element={<OldUrlRedirect />} />

      {/* Layout compartido: encabezado + main + pie de página */}
      <Route element={<AppLayout />}>
        <Route index element={<HomePage />} />
        <Route path="torneos" element={<TournamentsPage />} />
        <Route path="torneos/:id" element={<TournamentDetailPage />} />
        <Route path="inscripcion" element={<RegistrationPage />} />
        <Route path="inscripcion/:id" element={<RegistrationPage />} />
        <Route path="equipos" element={<TeamsPage />} />
        <Route path="perfil/:id" element={<ProfilePage />} />
        <Route path="perfil" element={<ProfilePage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
