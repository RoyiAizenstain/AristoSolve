import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import StatCard from '../components/StatCard';
import ProblemsTable from '../components/ProblemsTable';
import PageLoader from '../components/PageLoader';
import { listProblems, deleteProblem } from '../services/problems';
import { get, post, getStoredUser } from '../services/api';

/* ------------------------------------------------------------------ */
/* Evaluation Detail Modal                                              */
/* ------------------------------------------------------------------ */
function EvaluationModal({ evaluation, users, problems, onClose }) {
  const u = users.find(u => u.userId === evaluation.userId);
  const p = problems.find(p => p.id === evaluation.problemId);
  const dim = evaluation.dimensions || {};

  const scoreColor = (s) => {
    if (s === null || s === undefined) return 'var(--muted)';
    if (s >= 75) return 'var(--success)';
    if (s >= 50) return '#fb923c';
    return 'var(--error)';
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 600 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Evaluation Report</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">

          {/* Header info */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
            <div>
              <p style={{ fontWeight: 600, color: 'var(--text)' }}>{u ? `${u.firstName} ${u.lastName}` : `User #${evaluation.userId}`}</p>
              <p className="muted" style={{ fontSize: 'var(--text-sm)' }}>{u?.email}</p>
              <p className="muted" style={{ fontSize: 'var(--text-sm)', marginTop: 4 }}>Problem: <span style={{ color: 'var(--text)' }}>{p?.title ?? `#${evaluation.problemId}`}</span></p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 48, fontWeight: 700, color: scoreColor(evaluation.score), lineHeight: 1 }}>
                {evaluation.score ?? '—'}
              </div>
              <div className="muted" style={{ fontSize: 'var(--text-xs)' }}>Overall Score</div>
            </div>
          </div>

          {/* Dimension scores */}
          {dim.prompting !== undefined && (
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontWeight: 600, color: 'var(--text)', marginBottom: 10, fontSize: 'var(--text-sm)' }}>Dimension Scores</p>
              {[
                { label: 'Prompting skill',    key: 'prompting' },
                { label: 'Critical thinking',  key: 'criticalThinking' },
                { label: 'Adaptability',        key: 'adaptability' },
                { label: 'Code correctness',    key: 'codeCorrectness' },
              ].map(({ label, key }) => (
                <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                  <span style={{ width: 140, fontSize: 'var(--text-sm)', color: 'var(--muted)' }}>{label}</span>
                  <div style={{ flex: 1, background: 'var(--surface-2)', borderRadius: 4, height: 8 }}>
                    <div style={{ width: `${dim[key] ?? 0}%`, background: scoreColor(dim[key]), height: 8, borderRadius: 4, transition: 'width 0.5s' }} />
                  </div>
                  <span style={{ width: 36, textAlign: 'right', fontWeight: 600, color: scoreColor(dim[key]), fontSize: 'var(--text-sm)' }}>{dim[key] ?? '—'}</span>
                </div>
              ))}
            </div>
          )}

          {/* Feedback */}
          {evaluation.feedback && (
            <div style={{ marginBottom: 16 }}>
              <p style={{ fontWeight: 600, color: 'var(--text)', marginBottom: 6, fontSize: 'var(--text-sm)' }}>Overall Feedback</p>
              <p style={{ color: 'var(--muted)', fontSize: 'var(--text-sm)', lineHeight: 1.6, background: 'var(--surface-2)', padding: '10px 14px', borderRadius: 8 }}>{evaluation.feedback}</p>
            </div>
          )}

          {/* Thinking analysis */}
          {evaluation.thinkingAnalysis && (
            <div style={{ marginBottom: 16 }}>
              <p style={{ fontWeight: 600, color: 'var(--text)', marginBottom: 6, fontSize: 'var(--text-sm)' }}>AI Thinking Analysis</p>
              <p style={{ color: 'var(--muted)', fontSize: 'var(--text-sm)', lineHeight: 1.6, background: 'var(--surface-2)', padding: '10px 14px', borderRadius: 8 }}>{evaluation.thinkingAnalysis}</p>
            </div>
          )}

          {/* Code analysis */}
          {dim.codeAnalysis && (
            <div>
              <p style={{ fontWeight: 600, color: 'var(--text)', marginBottom: 6, fontSize: 'var(--text-sm)' }}>Code Analysis</p>
              <p style={{ color: 'var(--muted)', fontSize: 'var(--text-sm)', lineHeight: 1.6, background: 'var(--surface-2)', padding: '10px 14px', borderRadius: 8 }}>{dim.codeAnalysis}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const STAT_CARDS = [
  { icon: '🤖', title: 'AI-Guided, Not AI-Solved',         description: 'Nudges your thinking without giving answers.' },
  { icon: '💬', title: 'Mentor, Not Solver',                description: 'AristoBot asks the right questions so you find the answer.' },
  { icon: '📊', title: 'Detailed Evaluation at the End',   description: 'Get scored on your thinking process, not just the result.' },
];

/* ------------------------------------------------------------------ */
/* Assign Modal (company)                                               */
/* ------------------------------------------------------------------ */
function AssignModal({ problem, candidates, onClose, onAssigned }) {
  const [candidateId, setCandidateId] = useState('');
  const [deadline,    setDeadline]    = useState('');
  const [saving,      setSaving]      = useState(false);
  const [error,       setError]       = useState('');

  const submit = async () => {
    if (!candidateId) return setError('Please select a candidate');
    setSaving(true);
    setError('');
    try {
      await post('/progress', {
        userId:    parseInt(candidateId),
        problemId: problem.id,
        status:    'in_progress',
        deadline:  deadline || null,
      });
      onAssigned();
      onClose();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Assign: {problem.title}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">Select candidate</label>
            <select className="form-input" value={candidateId} onChange={e => setCandidateId(e.target.value)}>
              <option value="">— choose a candidate —</option>
              {candidates.map(c => (
                <option key={c.userId} value={c.userId}>{c.firstName} {c.lastName} ({c.email})</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Deadline (optional)</label>
            <input className="form-input" type="date" value={deadline} onChange={e => setDeadline(e.target.value)} />
          </div>
          {error && <p className="error-text">{error}</p>}
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={submit} disabled={saving}>
            {saving ? 'Assigning…' : 'Assign'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Candidate view                                                       */
/* ------------------------------------------------------------------ */
function CandidateDashboard({ problems, progress, loading, error }) {
  const navigate  = useNavigate();
  const solved    = progress.filter(p => p.status === 'completed').length;
  const total     = problems.length;
  const easy      = problems.filter(p => p.difficulty === 'easy').length;
  const medium    = problems.filter(p => p.difficulty === 'medium').length;
  const hard      = problems.filter(p => p.difficulty === 'hard').length;
  const assigned  = progress.filter(p => p.deadline && p.status !== 'completed');

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1 className="page-title">AI-Guided Problems</h1>
          <p className="page-sub">Practice with an AI mentor.</p>
        </div>
        <div className="dashboard-stats-row">
          <span className="diff-stat easy">Easy {easy}</span>
          <span className="diff-stat medium">Med {medium}</span>
          <span className="diff-stat hard">Hard {hard}</span>
          <span className="diff-stat solved">◯ {solved}/{total} Solved</span>
        </div>
      </div>

      <div className="stat-cards">
        {STAT_CARDS.map(c => <StatCard key={c.title} {...c} />)}
      </div>

      {loading && <PageLoader />}
      {error   && <p className="error-text">{error}</p>}

      {!loading && !error && (
        <>
          {assigned.length > 0 && (
            <>
              <h2 className="section-title">Assigned to me</h2>
              <div className="table-wrap" style={{ marginBottom: 32 }}>
                <table className="data-table">
                  <thead>
                    <tr><th>Problem</th><th>Difficulty</th><th>Deadline</th><th>Status</th><th></th></tr>
                  </thead>
                  <tbody>
                    {assigned.map(p => {
                      const problem = problems.find(pr => pr.id === (p.problemId || p.Problem?.id));
                      const title   = problem?.title ?? p.Problem?.title ?? `Problem #${p.problemId}`;
                      const diff    = problem?.difficulty ?? p.Problem?.difficulty ?? '—';
                      const dead    = p.deadline ? new Date(p.deadline).toLocaleDateString() : '—';
                      const isOver  = p.deadline && new Date(p.deadline) < new Date();
                      return (
                        <tr key={p.id} className="table-row">
                          <td className="problem-title">{title}</td>
                          <td><span className={`pill pill-${diff}`}>{diff}</span></td>
                          <td style={{ color: isOver ? 'var(--error)' : 'var(--text)' }}>{dead}</td>
                          <td><span className={`pill ${p.status === 'completed' ? 'pill-easy' : 'pill-medium'}`}>{p.status}</span></td>
                          <td>
                            <button className="btn btn-primary" style={{ padding: '4px 12px', fontSize: 'var(--text-xs)' }}
                              onClick={() => navigate(`/problems/${p.problemId || p.Problem?.id}`)}>
                              {p.status === 'completed' ? 'Review' : 'Start'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <h2 className="section-title">Open Repository</h2>
            </>
          )}
          <ProblemsTable problems={problems} progress={progress} />
        </>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Company view                                                         */
/* ------------------------------------------------------------------ */
function CompanyDashboard({ problems, evaluations, users, loading, error, onRefresh }) {
  const navigate    = useNavigate();
  const user        = getStoredUser();
  const myProblems  = problems.filter(p => p.createdBy === user?.userId);
  const candidates  = users.filter(u => u.userRole === 'candidate');
  const [assignModal, setAssignModal] = useState(null);
  const [evalModal,   setEvalModal]   = useState(null);

  const userName    = id => { const u = users.find(u => u.userId === id); return u ? `${u.firstName} ${u.lastName}` : `User #${id}`; };
  const problemTitle = id => { const p = problems.find(p => p.id === id); return p ? p.title : `Problem #${id}`; };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1 className="page-title">Company Dashboard</h1>
          <p className="page-sub">Your problems and candidate evaluations.</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/problems/new')}>+ Add Problem</button>
      </div>

      {loading && <PageLoader />}
      {error   && <p className="error-text">{error}</p>}

      {!loading && !error && (
        <>
          <h2 className="section-title">My Problems</h2>
          <div className="table-wrap" style={{ marginBottom: 32 }}>
            <table className="data-table">
              <thead>
                <tr><th>Title</th><th>Difficulty</th><th>Topic</th><th>Type</th><th>Visibility</th><th></th></tr>
              </thead>
              <tbody>
                {myProblems.length === 0 && <tr><td colSpan={6} className="table-empty">No problems created yet.</td></tr>}
                {myProblems.map(p => (
                  <tr key={p.id} className="table-row" style={{ cursor: 'pointer' }} onClick={() => navigate(`/problems/${p.id}`)}>
                    <td className="problem-title">{p.title}</td>
                    <td><span className={`pill pill-${p.difficulty}`}>{p.difficulty}</span></td>
                    <td className="muted">{p.topic}</td>
                    <td className="muted">{p.type}</td>
                    <td><span className={`pill ${p.isPublic ? 'pill-easy' : 'pill-hard'}`}>{p.isPublic ? 'Public' : 'Private'}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn btn-ghost" style={{ padding: '4px 10px', fontSize: 'var(--text-xs)' }}
                          onClick={e => { e.stopPropagation(); setAssignModal(p); }}>Assign</button>
                        <button className="btn btn-ghost" style={{ padding: '4px 10px', fontSize: 'var(--text-xs)' }}
                          onClick={e => { e.stopPropagation(); navigate(`/problems/${p.id}/edit`); }}>Edit</button>
                        <button className="btn btn-ghost" style={{ padding: '4px 10px', fontSize: 'var(--text-xs)', color: 'var(--error)' }}
                          onClick={async e => { e.stopPropagation(); if (window.confirm(`Delete "${p.title}"?`)) { await deleteProblem(p.id); window.location.reload(); } }}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2 className="section-title">Candidate Evaluations</h2>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr><th>Candidate</th><th>Email</th><th>Problem</th><th>Score</th><th>Feedback</th><th></th></tr>
              </thead>
              <tbody>
                {evaluations.length === 0 && <tr><td colSpan={6} className="table-empty">No evaluations yet.</td></tr>}
                {evaluations.map(e => {
                  const u = users.find(u => u.userId === e.userId);
                  const scoreColor = e.score >= 75 ? 'var(--success)' : e.score >= 50 ? '#fb923c' : e.score ? 'var(--error)' : 'var(--muted)';
                  return (
                    <tr key={e.id} className="table-row" style={{ cursor: 'pointer' }} onClick={() => setEvalModal(e)}>
                      <td>{userName(e.userId)}</td>
                      <td className="muted">{u?.email ?? '—'}</td>
                      <td>{problemTitle(e.problemId)}</td>
                      <td><strong style={{ color: scoreColor }}>{e.score ?? '—'}</strong></td>
                      <td className="muted" style={{ maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.feedback}</td>
                      <td><button className="btn btn-ghost" style={{ padding: '4px 10px', fontSize: 'var(--text-xs)' }} onClick={ev => { ev.stopPropagation(); setEvalModal(e); }}>View</button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {assignModal && (
        <AssignModal
          problem={assignModal}
          candidates={candidates}
          onClose={() => setAssignModal(null)}
          onAssigned={onRefresh}
        />
      )}

      {evalModal && (
        <EvaluationModal
          evaluation={evalModal}
          users={users}
          problems={problems}
          onClose={() => setEvalModal(null)}
        />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Admin view                                                           */
/* ------------------------------------------------------------------ */
function AdminDashboard({ problems, users, loading, error }) {
  const navigate = useNavigate();
  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1 className="page-title">Admin Dashboard</h1>
          <p className="page-sub">All problems and platform users.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button className="btn btn-primary" onClick={() => navigate('/problems/new')}>+ Add Problem</button>
          <div className="dashboard-stats-row">
            <span className="diff-stat easy">{problems.filter(p => p.difficulty === 'easy').length} Easy</span>
            <span className="diff-stat medium">{problems.filter(p => p.difficulty === 'medium').length} Med</span>
            <span className="diff-stat hard">{problems.filter(p => p.difficulty === 'hard').length} Hard</span>
            <span className="diff-stat solved">{users.length} Users</span>
          </div>
        </div>
      </div>

      {loading && <PageLoader />}
      {error   && <p className="error-text">{error}</p>}

      {!loading && !error && (
        <>
          <h2 className="section-title">All Problems</h2>
          <div className="table-wrap" style={{ marginBottom: 32 }}>
            <table className="data-table">
              <thead>
                <tr><th>Title</th><th>Difficulty</th><th>Topic</th><th>Type</th><th>Visibility</th><th></th></tr>
              </thead>
              <tbody>
                {problems.length === 0 && <tr><td colSpan={6} className="table-empty">No problems yet.</td></tr>}
                {problems.map(p => (
                  <tr key={p.id} className="table-row" style={{ cursor: 'pointer' }} onClick={() => navigate(`/problems/${p.id}`)}>
                    <td className="problem-title">{p.title}</td>
                    <td><span className={`pill pill-${p.difficulty}`}>{p.difficulty}</span></td>
                    <td className="muted">{p.topic}</td>
                    <td className="muted">{p.type}</td>
                    <td><span className={`pill ${p.isPublic ? 'pill-easy' : 'pill-hard'}`}>{p.isPublic ? 'Public' : 'Private'}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn btn-ghost" style={{ padding: '4px 10px', fontSize: 'var(--text-xs)' }} onClick={e => { e.stopPropagation(); navigate(`/problems/${p.id}/edit`); }}>Edit</button>
                        <button className="btn btn-ghost" style={{ padding: '4px 10px', fontSize: 'var(--text-xs)', color: 'var(--error)' }} onClick={async e => { e.stopPropagation(); if (window.confirm(`Delete "${p.title}"?`)) { await deleteProblem(p.id); window.location.reload(); } }}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2 className="section-title">All Users</h2>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr><th>Name</th><th>Email</th><th>Role</th><th>Level</th><th>Joined</th></tr>
              </thead>
              <tbody>
                {users.length === 0 && <tr><td colSpan={5} className="table-empty">No users yet.</td></tr>}
                {users.map(u => (
                  <tr key={u.userId} className="table-row">
                    <td className="problem-title">{u.firstName} {u.lastName}</td>
                    <td className="muted">{u.email}</td>
                    <td><span className="pill pill-easy">{u.userRole}</span></td>
                    <td className="muted">{u.level}</td>
                    <td className="muted">{u.createDate?.slice(0, 10)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Root — picks the right view by role                                  */
/* ------------------------------------------------------------------ */
export default function Dashboard() {
  const user = getStoredUser();
  const role = user?.userRole;

  const [problems,    setProblems]    = useState([]);
  const [progress,    setProgress]    = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [users,       setUsers]       = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState('');

  const load = async () => {
    setLoading(true);
    try {
      if (role === 'candidate') {
        const [probs, prog] = await Promise.all([
          listProblems(),
          get('/progress').catch(() => []),
        ]);
        setProblems(probs);
        setProgress(Array.isArray(prog) ? prog : []);
      } else if (role === 'company') {
        const [probs, evals, us] = await Promise.all([
          listProblems(),
          get('/evaluations').catch(() => []),
          get('/users').catch(() => []),
        ]);
        setProblems(probs);
        setEvaluations(Array.isArray(evals) ? evals : []);
        setUsers(Array.isArray(us) ? us : []);
      } else if (role === 'admin') {
        const [probs, us] = await Promise.all([
          listProblems(),
          get('/users').catch(() => []),
        ]);
        setProblems(probs);
        setUsers(Array.isArray(us) ? us : []);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [role]);

  return (
    <Layout>
      {role === 'candidate' && <CandidateDashboard problems={problems} progress={progress}    loading={loading} error={error} />}
      {role === 'company'   && <CompanyDashboard   problems={problems} evaluations={evaluations} users={users} loading={loading} error={error} onRefresh={load} />}
      {role === 'admin'     && <AdminDashboard     problems={problems} users={users}          loading={loading} error={error} />}
    </Layout>
  );
}
