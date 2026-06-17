import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { post } from '../services/api';
import { login } from '../services/auth';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const INIT = { firstName: '', lastName: '', email: '', password: '', userRole: 'candidate' };

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm]         = useState(INIT);
  const [errors, setErrors]     = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading]   = useState(false);

  function validate() {
    const e = {};
    if (!form.firstName.trim())      e.firstName = 'Required';
    if (!form.lastName.trim())       e.lastName  = 'Required';
    if (!EMAIL_RE.test(form.email))  e.email     = 'Please enter a valid email';
    if (form.password.length < 6)    e.password  = 'At least 6 characters';
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
      await post('/users', form);
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setApiError(err.message || 'Registration failed');
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
        <span className="auth-brand">🤖 AristoSolve</span>
      </div>

      <form className="auth-card" onSubmit={handleSubmit} noValidate>
        <div className="register-name-row">
          <div className="field">
            <label className="label" htmlFor="firstName">First name</label>
            <input id="firstName" type="text" autoComplete="given-name" placeholder="Royi" {...field('firstName')} />
            {errors.firstName && <p className="error-text">⚠ {errors.firstName}</p>}
          </div>
          <div className="field">
            <label className="label" htmlFor="lastName">Last name</label>
            <input id="lastName" type="text" autoComplete="family-name" placeholder="Aizen" {...field('lastName')} />
            {errors.lastName && <p className="error-text">⚠ {errors.lastName}</p>}
          </div>
        </div>

        <div className="field">
          <label className="label" htmlFor="email">Email</label>
          <input id="email" type="email" autoComplete="email" placeholder="you@example.com" {...field('email')} />
          {errors.email && <p className="error-text">⚠ {errors.email}</p>}
        </div>

        <div className="field">
          <label className="label" htmlFor="password">Password</label>
          <input id="password" type="password" autoComplete="new-password" placeholder="••••••••" {...field('password')} />
          {errors.password && <p className="error-text">⚠ {errors.password}</p>}
        </div>

        <div className="field">
          <label className="label">I am a…</label>
          <div className="role-toggle">
            {['candidate', 'company'].map(r => (
              <label key={r} className={`role-option${form.userRole === r ? ' selected' : ''}`}>
                <input
                  type="radio"
                  name="userRole"
                  value={r}
                  checked={form.userRole === r}
                  onChange={() => setForm(f => ({ ...f, userRole: r }))}
                />
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </label>
            ))}
          </div>
        </div>

        {apiError && <div className="error-banner" role="alert">✖ {apiError}</div>}

        <button className="btn btn-primary btn-block" type="submit" disabled={loading}>
          {loading ? <><span className="spinner" /> Creating account…</> : 'Create account'}
        </button>

        <p className="auth-footer-text">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </form>
    </div>
  );
}
