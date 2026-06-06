import { useCallback, useEffect, useState } from 'react';
import Layout from '../components/Layout';
import Toast from '../components/Toast';
import PageLoader from '../components/PageLoader';
import { getSettings, updateSettings } from '../services/settings';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Settings() {
  const [form, setForm]       = useState({ displayName: '', email: '', theme: 'dark', emailNotifications: true });
  const [original, setOriginal] = useState(null);
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [toast, setToast]     = useState(null);

  useEffect(() => {
    getSettings()
      .then(data => {
        setForm(data);
        setOriginal(data);
      })
      .catch(err => setToast({ message: err.message, type: 'error' }))
      .finally(() => setLoading(false));
  }, []);

  const isDirty = original && (
    form.displayName       !== original.displayName ||
    form.email             !== original.email       ||
    form.theme             !== original.theme       ||
    form.emailNotifications !== original.emailNotifications
  );

  function validate() {
    const e = {};
    if (!form.displayName.trim()) e.displayName = 'Display name cannot be empty';
    if (!EMAIL_RE.test(form.email)) e.email = 'Invalid email format';
    return e;
  }

  async function handleSubmit(ev) {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setSaving(true);
    try {
      const updated = await updateSettings(form);
      setOriginal(updated);
      if (updated.theme) {
        document.documentElement.setAttribute('data-theme', updated.theme);
        localStorage.setItem('aristosolve_theme', updated.theme);
      }
      setToast({ message: 'Settings saved', type: 'success' });
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    } finally {
      setSaving(false);
    }
  }

  const dismissToast = useCallback(() => setToast(null), []);

  function set(key, val) {
    setForm(f => ({ ...f, [key]: val }));
  }

  return (
    <Layout>
      <div className="settings-page">
        <div className="settings-heading">
          <h1 className="page-title">Settings</h1>
          <p className="page-sub">Manage your profile and preferences</p>
        </div>

        {loading ? (
          <PageLoader />
        ) : (
          <form className="settings-card" onSubmit={handleSubmit} noValidate>

            <div className="field">
              <label className="label" htmlFor="displayName">Display name</label>
              <input
                id="displayName"
                type="text"
                className={`input${errors.displayName ? ' invalid' : ''}`}
                value={form.displayName}
                onChange={e => set('displayName', e.target.value)}
              />
              {errors.displayName && <p className="error-text">⚠ {errors.displayName}</p>}
            </div>

            <div className="field">
              <label className="label" htmlFor="settingsEmail">Email</label>
              <input
                id="settingsEmail"
                type="email"
                className={`input${errors.email ? ' invalid' : ''}`}
                value={form.email}
                onChange={e => set('email', e.target.value)}
              />
              {errors.email && <p className="error-text">⚠ {errors.email}</p>}
            </div>

            <div className="field">
              <label className="label">Theme</label>
              <div className="role-toggle">
                {['light', 'dark'].map(t => (
                  <label key={t} className={`role-option${form.theme === t ? ' selected' : ''}`}>
                    <input
                      type="radio"
                      name="theme"
                      value={t}
                      checked={form.theme === t}
                      onChange={() => set('theme', t)}
                    />
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </label>
                ))}
              </div>
            </div>

            <div className="field">
              <label className="label">Notifications</label>
              <label className="settings-checkbox">
                <input
                  type="checkbox"
                  checked={form.emailNotifications}
                  onChange={e => set('emailNotifications', e.target.checked)}
                />
                Email me about new assigned tests
              </label>
            </div>

            <div className="settings-divider" />

            <div className="settings-actions">
              <button
                className="btn btn-primary"
                type="submit"
                disabled={saving || !isDirty}
              >
                {saving ? <><span className="spinner" /> Saving…</> : 'Save changes'}
              </button>
            </div>
          </form>
        )}
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onDismiss={dismissToast} />}
    </Layout>
  );
}
