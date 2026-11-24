import { useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '@services/api';
import { useRoles } from '@services/useRoles';
import { useToast } from '@components/useToast';
import { safeReturnTo } from '@domain/routes';

export default function AuthPage({ register = false }) {
  const { autenticado, iniciarSesion, cargando } = useRoles();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ nombre: '', email: '', password: '' });
  if (!cargando && autenticado) return <Navigate to="/" replace />;
  const submit = async (event) => {
    event.preventDefault(); setError(''); setEnviando(true);
    try {
      const session = register ? await api.register(form) : await api.login({ email: form.email, password: form.password });
      iniciarSesion(session);
      showToast(register ? 'Cuenta creada. Ya iniciaste sesión.' : 'Sesión iniciada.', 'exito');
      navigate(safeReturnTo(params.get('returnTo')), { replace: true });
    } catch (cause) { setError(cause.message || 'No fue posible iniciar sesión.'); }
    finally { setEnviando(false); }
  };
  return <div className="container py-5" style={{ maxWidth: 560 }}>
    <section className="card p-4 p-md-5 shadow-sm" aria-labelledby="auth-title">
      <h1 className="h3 mb-2" id="auth-title">{register ? 'Crear cuenta de jugador' : 'Iniciar sesión'}</h1>
      <p className="text-secondary">{register ? 'Regístrate para inscribirte en torneos.' : 'Ingresa con tu cuenta de eSports Arena Manager.'}</p>
      <form onSubmit={submit} noValidate>
        {register && <div className="mb-3"><label className="form-label" htmlFor="auth-name">Nombre</label><input id="auth-name" className="form-control" autoComplete="name" required minLength={2} maxLength={80} value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} /></div>}
        <div className="mb-3"><label className="form-label" htmlFor="auth-email">Correo electrónico</label><input id="auth-email" type="email" className="form-control" autoComplete="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
        <div className="mb-3"><label className="form-label" htmlFor="auth-password">Contraseña</label><input id="auth-password" type="password" className="form-control" autoComplete={register ? 'new-password' : 'current-password'} required minLength={register ? 10 : 1} maxLength={72} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />{register && <div className="form-text">Usa entre 10 y 72 caracteres.</div>}</div>
        {error && <div className="alert alert-danger" role="alert">{error}</div>}
        <button className="btn btn-primary w-100" disabled={enviando}>{enviando ? 'Procesando…' : register ? 'Crear cuenta' : 'Iniciar sesión'}</button>
      </form>
      <p className="mt-4 mb-0 text-center">{register ? <>¿Ya tienes cuenta? <Link to="/iniciar-sesion">Inicia sesión</Link></> : <>¿Primera vez? <Link to="/crear-cuenta">Crea una cuenta de jugador</Link></>}</p>
    </section>
  </div>;
}
