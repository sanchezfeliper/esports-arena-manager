/* ==========================================================================
   app/App.jsx — Root application component.
   ========================================================================== */

import { ToastProvider } from '@components/Toast';
import RoleProvider from '@services/roles';
import Router from '@app/router';

export default function App() {
    return (
        <RoleProvider>
            <ToastProvider>
                <Router />
            </ToastProvider>
        </RoleProvider>
    );
}