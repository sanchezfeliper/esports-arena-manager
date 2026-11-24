

import { useState, useCallback, useEffect } from 'react';
import { clearAccessToken, getAccessToken, saveTokens, api } from '@services/api';
import { RoleContext } from '@services/roleContext';
import { ROLES } from '@services/roleData';

export default function RoleProvider({ children }) {
  const [sesion, setSesion] = useState(() => {
    const token = getAccessToken();
    return { token, usuario: null, cargando: Boolean(token) };
  });

  useEffect(() => {
    const token = getAccessToken();
    if (!token) return;
    let activa = true;
    api.me().then(usuario => { if (activa) setSesion(current => ({ ...current, usuario, cargando: false })); })
      .catch(() => { clearAccessToken(); if (activa) setSesion({ token: null, usuario: null, cargando: false }); });
    return () => { activa = false; };
  }, []);

  const iniciarSesion = useCallback((respuesta) => {
    saveTokens(respuesta);
    setSesion({ token: respuesta.token, usuario: respuesta.user, cargando: false });
  }, []);
  const cerrarSesion = useCallback(() => {
    const refreshToken=window.sessionStorage.getItem('eam_refresh_token');
    const terminar=()=>{clearAccessToken();setSesion({token:null,usuario:null,cargando:false});};
    if(!refreshToken){terminar();return;}
    api.logout(refreshToken).catch(()=>{}).finally(terminar);
  }, []);
  const rol = sesion.usuario?.role?.toLowerCase() || 'visitante';

  const tieneRol = useCallback((rolRequerido) => {
    const requeridos = Array.isArray(rolRequerido) ? rolRequerido : [rolRequerido];
    return requeridos.includes(rol);
  }, [rol]);

  return (
    <RoleContext.Provider value={{ rol, usuario: sesion.usuario, cargando: sesion.cargando, autenticado: Boolean(sesion.usuario), iniciarSesion, cerrarSesion, tieneRol, ROLES }}>
      {children}
    </RoleContext.Provider>
  );
}

