import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../services/auth';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm]       = useState({ email: '', password: '' });
  const [errors, setErrors]   = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  function validate() {
    const e = {};
    if (!EMAIL_RE.test(form.email))      e.email    = 'Please enter a valid email';
    if (form.password.length < 6)        e.password = 'At least 6 characters';
    return e;
  }

  async function handleSubmit(ev) {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setApiError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setApiError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  }

  function field(name) {
    return {
      value: form[name],
      onChange: e => setForm(f => ({ ...f, [name]: e.target.value })),
      className: `input${errors[name] ? ' invalid' : ''}`,
    };
  }

  return (
    <div className="auth-page">
      <div className="auth-header">
        <span className="auth-brand">◆ AristoSolve</span>
        <p className="auth-tagline">AI-guided problem solving platform</p>
      </div>

      <form className="auth-card" onSubmit={handleSubmit} noValidate>
        <div className="field">
          <label className="label" htmlFor="email">Email</label>
          <input id="email" type="email" autoComplete="email" placeholder="you@example.com" {...field('email')} />
          {errors.email && <p className="error-text">⚠ {errors.email}</p>}
        </div>

        <div className="field">
          <label className="label" htmlFor="password">Password</label>
          <input id="password" type="password" autoComplete="current-password" placeholder="••••••••" {...field('password')} />
          {errors.password && <p className="error-text">⚠ {errors.password}</p>}
        </div>

        {apiError && <div className="error-banner" role="alert">✖ {apiError}</div>}

        <button className="btn btn-primary btn-block" type="submit" disabled={loading}>
          {loading ? <><span className="spinner" /> Logging in…</> : 'Log in'}
        </button>

        <p className="auth-footer-text">
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </form>
    </div>
  );
}
