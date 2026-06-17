import { useCallback, useEffect, useState } from 'react';
import Layout from '../components/Layout';
import Toast from '../components/Toast';
import PageLoader from '../components/PageLoader';
import { get, post, put, del } from '../services/api';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ROLES  = ['candidate', 'company', 'admin'];
const LEVELS = ['beginner', 'intermediate', 'advanced'];
const EMPTY_FORM = { firstName: '', lastName: '', email: '', password: '', userRole: 'candidate', level: 'beginner' };

function validate(form, isEdit) {
  const e = {};
  if (!form.firstName.trim()) e.firstName = 'Required';
  if (!form.lastName.trim())  e.lastName  = 'Required';
  if (!EMAIL_RE.test(form.email)) e.email = 'Invalid email';
  if (!isEdit && form.password.length < 6) e.password = 'Min 6 characters';
  return e;
}

/* ---- User modal (create / edit) ---- */
function UserModal({ user, onSave, onClose, saving }) {
  const isEdit = !!user?.userId;
  const [form, setForm]     = useState(isEdit ? { ...user, password: '' } : EMPTY_FORM);
  const [errors, setErrors] = useState({});

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); }

  function handleSubmit(ev) {
    ev.preventDefault();
    const e = validate(form, isEdit);
    if (Object.keys(e).length) { setErrors(e); return; }
    onSave(form, isEdit);
  }

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-labelledby="modal-title">
        <div className="modal-header">
          <h2 id="modal-title">{isEdit ? 'Edit User' : 'Create User'}</h2>
          <button className="btn btn-ghost" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-row">
            <div className="field">
              <label className="label">First name</label>
              <input className={`input${errors.firstName ? ' invalid' : ''}`} value={form.firstName} onChange={e => set('firstName', e.target.value)} />
              {errors.firstName && <p className="error-text">⚠ {errors.firstName}</p>}
            </div>
            <div className="field">
              <label className="label">Last name</label>
              <input className={`input${errors.lastName ? ' invalid' : ''}`} value={form.lastName} onChange={e => set('lastName', e.target.value)} />
              {errors.lastName && <p className="error-text">⚠ {errors.lastName}</p>}
            </div>
          </div>

          <div className="field">
            <label className="label">Email</label>
            <input type="email" className={`input${errors.email ? ' invalid' : ''}`} value={form.email} onChange={e => set('email', e.target.value)} />
            {errors.email && <p className="error-text">⚠ {errors.email}</p>}
          </div>

          {!isEdit && (
            <div className="field">
              <label className="label">Password</label>
              <input type="password" className={`input${errors.password ? ' invalid' : ''}`} value={form.password} onChange={e => set('password', e.target.value)} />
              {errors.password && <p className="error-text">⚠ {errors.password}</p>}
            </div>
          )}

          <div className="field">
            <label className="label">Role</label>
            <div className="role-toggle">
              {ROLES.map(r => (
                <label key={r} className={`role-option${form.userRole === r ? ' selected' : ''}`}>
                  <input type="radio" name="userRole" value={r} checked={form.userRole === r} onChange={() => set('userRole', r)} />
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </label>
              ))}
            </div>
          </div>

          <div className="field">
            <label className="label">Level</label>
            <div className="role-toggle">
              {LEVELS.map(l => (
                <label key={l} className={`role-option${form.level === l ? ' selected' : ''}`}>
                  <input type="radio" name="level" value={l} checked={form.level === l} onChange={() => set('level', l)} />
                  {l.charAt(0).toUpperCase() + l.slice(1)}
                </label>
              ))}
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? <><span className="spinner" /> Saving…</> : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ---- Page ---- */
export default function UsersPage() {
  const [users,         setUsers]         = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [modal,         setModal]         = useState(null);   // null | user object (empty = create)
  const [confirmDelete, setConfirmDelete] = useState(null);   // userId
  const [saving,        setSaving]        = useState(false);
  const [toast,         setToast]         = useState(null);

  useEffect(() => {
    get('/users')
      .then(setUsers)
      .catch(err => setToast({ message: err.message, type: 'error' }))
      .finally(() => setLoading(false));
  }, []);

  async function handleSave(form, isEdit) {
    setSaving(true);
    try {
      if (isEdit) {
        const updated = await put(`/users/${form.userId}`, form);
        setUsers(us => us.map(u => u.userId === updated.userId ? updated : u));
        setToast({ message: 'User updated', type: 'success' });
      } else {
        const created = await post('/users', form);
        setUsers(us => [...us, created]);
        setToast({ message: 'User created', type: 'success' });
      }
      setModal(null);
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(userId) {
    try {
      await del(`/users/${userId}`);
      setUsers(us => us.filter(u => u.userId !== userId));
      setConfirmDelete(null);
      setToast({ message: 'User deleted', type: 'success' });
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    }
  }

  const dismissToast = useCallback(() => setToast(null), []);

  return (
    <Layout>
      <div className="dashboard">
        <div className="dashboard-header">
          <div>
            <h1 className="page-title">Users</h1>
            <p className="page-sub">Manage all platform users</p>
          </div>
          <button className="btn btn-primary" onClick={() => setModal({})}>+ Create User</button>
        </div>

        {loading && <PageLoader />}

        {!loading && (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th><th>Email</th><th>Role</th><th>Level</th><th>Joined</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  confirmDelete === u.userId ? (
                    <tr key={u.userId} className="table-row" style={{ background: 'var(--error-bg)' }}>
                      <td colSpan={4} style={{ color: 'var(--error)' }}>
                        Delete <strong>{u.firstName} {u.lastName}</strong>?
                      </td>
                      <td colSpan={2}>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button className="btn btn-danger" onClick={() => handleDelete(u.userId)}>Yes, delete</button>
                          <button className="btn btn-ghost" onClick={() => setConfirmDelete(null)}>Cancel</button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    <tr key={u.userId} className="table-row">
                      <td className="problem-title">{u.firstName} {u.lastName}</td>
                      <td className="muted">{u.email}</td>
                      <td><span className="pill pill-easy">{u.userRole}</span></td>
                      <td className="muted">{u.level}</td>
                      <td className="muted">{u.createDate?.slice(0, 10)}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button
                            className="btn btn-ghost"
                            style={{ height: 30, padding: '0 10px', fontSize: 'var(--text-xs)' }}
                            onClick={() => setModal(u)}
                            aria-label={`Edit user ${u.firstName} ${u.lastName}`}
                          >✎ Edit</button>
                          <button
                            className="btn btn-danger"
                            style={{ height: 30, padding: '0 10px', fontSize: 'var(--text-xs)' }}
                            onClick={() => setConfirmDelete(u.userId)}
                            aria-label={`Delete user ${u.firstName} ${u.lastName}`}
                          >🗑 Delete</button>
                        </div>
                      </td>
                    </tr>
                  )
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal !== null && (
        <UserModal user={modal} onSave={handleSave} onClose={() => setModal(null)} saving={saving} />
      )}

      {toast && <Toast message={toast.message} type={toast.type} onDismiss={dismissToast} />}
    </Layout>
  );
}
