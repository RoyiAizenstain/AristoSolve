import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import PageLoader from '../components/PageLoader';
import { getProblem, updateProblem } from '../services/problems';
import { getStoredUser } from '../services/api';

const DIFFICULTIES = ['easy', 'medium', 'hard'];
const TOPICS       = ['arrays', 'trees', 'graphs', 'dp', 'strings', 'math', 'other'];
const TYPES        = ['algorithm', 'system-design', 'debugging'];
const LANGUAGES    = ['python', 'javascript', 'java'];

export default function EditProblem() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const user     = getStoredUser();

  const [form, setForm]             = useState(null);
  const [starterCode, setStarterCode] = useState({ python: '', javascript: '', java: '' });
  const [activeLang, setActiveLang] = useState('python');
  const [errors, setErrors]         = useState({});
  const [saving, setSaving]         = useState(false);
  const [apiError, setApiError]     = useState('');
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    getProblem(id)
      .then(p => {
        setForm({
          title: p.title, difficulty: p.difficulty, topic: p.topic,
          type: p.type, description: p.description,
          constraints: p.constraints || '', isPublic: p.isPublic,
        });
        setStarterCode(p.starterCode || { python: '', javascript: '', java: '' });
      })
      .catch(err => setApiError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  function set(key, val) { setForm(f => ({ ...f, [key]: val })); }

  function validate() {
    const e = {};
    if (!form.title.trim())       e.title       = 'Title is required';
    if (!form.description.trim()) e.description = 'Description is required';
    return e;
  }

  async function handleSubmit(ev) {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setApiError('');
    setSaving(true);
    try {
      await updateProblem(id, { ...form, starterCode });
      navigate('/dashboard');
    } catch (err) {
      setApiError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <Layout><PageLoader /></Layout>;

  return (
    <Layout>
      <div className="settings-page">
        <div className="settings-heading">
          <h1 className="page-title">Edit Problem</h1>
          <p className="page-sub">Update the problem details.</p>
        </div>

        <form className="settings-card" onSubmit={handleSubmit} noValidate>

          <div className="field">
            <label className="label">Title</label>
            <input
              id="problem-title"
              type="text"
              className={`input${errors.title ? ' invalid' : ''}`}
              value={form.title}
              onChange={e => set('title', e.target.value)}
            />
            {errors.title && <p className="error-text">⚠ {errors.title}</p>}
          </div>

          <div style={{ display: 'flex', gap: 16 }}>
            <div className="field" style={{ flex: 1 }}>
              <label className="label">Difficulty</label>
              <select className="input" value={form.difficulty} onChange={e => set('difficulty', e.target.value)}>
                {DIFFICULTIES.map(d => <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>)}
              </select>
            </div>
            <div className="field" style={{ flex: 1 }}>
              <label className="label">Topic</label>
              <select className="input" value={form.topic} onChange={e => set('topic', e.target.value)}>
                {TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="field" style={{ flex: 1 }}>
              <label className="label">Type</label>
              <select className="input" value={form.type} onChange={e => set('type', e.target.value)}>
                {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div className="field">
            <label className="label">Description</label>
            <textarea
              className={`input${errors.description ? ' invalid' : ''}`}
              rows={5}
              style={{ resize: 'vertical', fontFamily: 'inherit' }}
              value={form.description}
              onChange={e => set('description', e.target.value)}
            />
            {errors.description && <p className="error-text">⚠ {errors.description}</p>}
          </div>

          <div className="field">
            <label className="label">Constraints <span className="muted">(optional)</span></label>
            <textarea
              className="input"
              rows={3}
              style={{ resize: 'vertical', fontFamily: 'inherit' }}
              value={form.constraints}
              onChange={e => set('constraints', e.target.value)}
            />
          </div>

          <div className="field">
            <label className="label">Starter Code</label>
            <div className="pd-tabs" style={{ borderBottom: '1px solid var(--border)', marginBottom: 0 }}>
              {LANGUAGES.map(lang => (
                <button
                  key={lang}
                  type="button"
                  className={`pd-tab${activeLang === lang ? ' active' : ''}`}
                  onClick={() => setActiveLang(lang)}
                >
                  {lang.charAt(0).toUpperCase() + lang.slice(1)}
                </button>
              ))}
            </div>
            <textarea
              className="pd-code-area"
              style={{ borderTopLeftRadius: 0, borderTopRightRadius: 0, minHeight: 160, resize: 'vertical' }}
              value={starterCode[activeLang] || ''}
              onChange={e => setStarterCode(s => ({ ...s, [activeLang]: e.target.value }))}
              spellCheck={false}
              onKeyDown={e => {
                if (e.key === 'Tab') {
                  e.preventDefault();
                  const el = e.target;
                  const start = el.selectionStart;
                  const end = el.selectionEnd;
                  const next = (starterCode[activeLang] || '').substring(0, start) + '    ' + (starterCode[activeLang] || '').substring(end);
                  setStarterCode(s => ({ ...s, [activeLang]: next }));
                  requestAnimationFrame(() => { el.selectionStart = el.selectionEnd = start + 4; });
                }
              }}
            />
          </div>

          <div className="field">
            <label className="label">Visibility</label>
            <div className="role-toggle">
              {[true, false].map(v => (
                <label key={String(v)} className={`role-option${form.isPublic === v ? ' selected' : ''}`}>
                  <input type="radio" name="isPublic" checked={form.isPublic === v} onChange={() => set('isPublic', v)} />
                  {v ? 'Public' : 'Private'}
                </label>
              ))}
            </div>
          </div>

          {apiError && <div className="error-banner" role="alert">✖ {apiError}</div>}

          <div className="settings-divider" />

          <div className="settings-actions">
            <button type="button" className="btn btn-ghost" onClick={() => navigate('/dashboard')}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? <><span className="spinner" /> Saving…</> : 'Save Changes'}
            </button>
          </div>

        </form>
      </div>
    </Layout>
  );
}
