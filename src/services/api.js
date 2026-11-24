const API_BASE = import.meta.env?.VITE_API_URL || 'http://localhost:8080/api/v1';
const TOKEN_KEY = 'eam_access_token';
const REFRESH_KEY = 'eam_refresh_token';

export const getAccessToken = () => window.sessionStorage.getItem(TOKEN_KEY);
export const saveAccessToken = (token) => window.sessionStorage.setItem(TOKEN_KEY, token);
export const saveTokens = ({ token, refreshToken }) => { saveAccessToken(token); window.sessionStorage.setItem(REFRESH_KEY, refreshToken); };
export const clearAccessToken = () => { window.sessionStorage.removeItem(TOKEN_KEY); window.sessionStorage.removeItem(REFRESH_KEY); };

let refreshInProgress;
async function refreshSession() {
  const refreshToken=window.sessionStorage.getItem(REFRESH_KEY);
  if (!refreshToken) return false;
  refreshInProgress ||= fetch(`${API_BASE}/auth/refresh`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ refreshToken }) })
    .then(async response => { if (!response.ok) throw new Error('Sesión expirada'); const session=await response.json(); saveTokens(session); return true; })
    .catch(() => { clearAccessToken(); return false; })
    .finally(() => { refreshInProgress=null; });
  return refreshInProgress;
}

export async function apiRequest(path, options = {}) {
  const headers = new Headers(options.headers || {});
  if (options.body && !(options.body instanceof FormData)) headers.set('Content-Type', 'application/json');
  const token = getAccessToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);
  let response = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const isAuthEntry=['/auth/login','/auth/register','/auth/refresh'].includes(path);
  if (response.status === 401 && !isAuthEntry) {
    const renewed=await refreshSession();
    if (renewed) {
      headers.set('Authorization', `Bearer ${getAccessToken()}`);
      const retryOptions=path==='/auth/logout'?{...options,body:JSON.stringify({refreshToken:window.sessionStorage.getItem(REFRESH_KEY)})}:options;
      response=await fetch(`${API_BASE}${path}`,{...retryOptions,headers});
    }
  }
  if (response.status === 204) return null;
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.detail || body.message || body.error || `Error ${response.status}: no se pudo completar la solicitud.`);
  return body;
}

export const api = {
  login: (credentials) => apiRequest('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  register: (data) => apiRequest('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  refresh: (refreshToken) => apiRequest('/auth/refresh', { method: 'POST', body: JSON.stringify({ refreshToken }) }),
  logout: (refreshToken) => apiRequest('/auth/logout', { method: 'POST', body: JSON.stringify({ refreshToken }) }),
  me: () => apiRequest('/auth/me'),
  games: () => apiRequest('/juegos'),
  tournaments: () => apiRequest('/torneos'),
  tournament: (id) => apiRequest(`/torneos/${id}`),
  createTournament: (data) => apiRequest('/torneos', { method: 'POST', body: JSON.stringify(data) }),
  updateTournament: (id, data) => apiRequest(`/torneos/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteTournament: (id) => apiRequest(`/torneos/${id}`, { method: 'DELETE' }),
  teams: () => apiRequest('/equipos'),
  players: () => apiRequest('/usuarios/jugadores'),
  createTeam: (data) => apiRequest('/equipos', { method: 'POST', body: JSON.stringify(data) }),
  updateTeam: (id, data) => apiRequest(`/equipos/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteTeam: (id) => apiRequest(`/equipos/${id}`, { method: 'DELETE' }),
  myRegistrations: () => apiRequest('/inscripciones'),
  registerTournament: (data) => apiRequest('/inscripciones', { method: 'POST', body: JSON.stringify(data) }),
  users: () => apiRequest('/usuarios'),
  updateUserRole: (id, role) => apiRequest(`/usuarios/${id}/role`, { method: 'PATCH', body: JSON.stringify({ role }) }),
};

export function normalizarEstadoTorneo(estado) {
  return String(estado || '').toLowerCase().replace('_', ' ');
}
