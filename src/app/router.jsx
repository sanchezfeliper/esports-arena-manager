/* ==========================================================================
   app/router.jsx —
   Rutas acordadas: /, /torneos, /torneos/:id, /inscripcion, /equipos,
   /perfil/:id (con /perfil como fallback).
   /aa
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
import AuthPage from '@pages/AuthPage';
import ProtectedRoute from '@components/ProtectedRoute';
import AdminUsersPage from '@pages/AdminUsersPage';
import TournamentManagementPage from '@pages/TournamentManagementPage';

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
            <Route path="/iniciar-sesion" element={<AuthPage />} />
            <Route path="/crear-cuenta" element={<AuthPage register />} />

            {/* Layout compartido: encabezado + main + pie de página */}
            <Route element={<AppLayout />}>
                <Route index element={<HomePage />} />
                <Route path="torneos" element={<TournamentsPage />} />
                <Route path="torneos/:id" element={<TournamentDetailPage />} />
                <Route path="inscripcion" element={<ProtectedRoute roles={['jugador', 'administrador']}><RegistrationPage /></ProtectedRoute>} />
                <Route path="inscripcion/:id" element={<ProtectedRoute roles={['jugador', 'administrador']}><RegistrationPage /></ProtectedRoute>} />
                <Route path="equipos" element={<ProtectedRoute roles={['organizador', 'administrador']}><TeamsPage /></ProtectedRoute>} />
                <Route path="perfil/:id" element={<ProtectedRoute roles={['jugador', 'organizador', 'administrador']}><ProfilePage /></ProtectedRoute>} />
                <Route path="perfil" element={<ProtectedRoute roles={['jugador', 'organizador', 'administrador']}><ProfilePage /></ProtectedRoute>} />
                <Route path="admin/usuarios" element={<ProtectedRoute roles={['administrador']}><AdminUsersPage /></ProtectedRoute>} />
                <Route path="admin/torneos" element={<ProtectedRoute roles={['organizador','administrador']}><TournamentManagementPage /></ProtectedRoute>} />
                <Route path="*" element={<NotFoundPage />} />
            </Route>
        </Routes>
    );
}
