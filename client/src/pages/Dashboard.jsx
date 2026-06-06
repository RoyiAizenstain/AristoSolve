import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import StatCard from '../components/StatCard';
import ProblemsTable from '../components/ProblemsTable';
import { listProblems } from '../services/problems';
import { get, getStoredUser } from '../services/api';

const STAT_CARDS = [
  { icon: '🤖', title: 'AI-Guided, Not AI-Solved',         description: 'Nudges your thinking without giving answers.' },
  { icon: '💬', title: 'Mentor, Not Solver',                description: 'AristoBot asks the right questions so you find the answer.' },
  { icon: '📊', title: 'Detailed Evaluation at the End',   description: 'Get scored on your thinking process, not just the result.' },
];

/* ------------------------------------------------------------------ */
/* Candidate view                                                       */
/* ------------------------------------------------------------------ */
function CandidateDashboard({ problems, progress, loading, error }) {
  const solved = progress.filter(p => p.status === 'completed').length;
  const total  = problems.length;
  const easy   = problems.filter(p => p.difficulty === 'easy').length;
  const medium = problems.filter(p => p.difficulty === 'medium').length;
  const hard   = problems.filter(p => p.difficulty === 'hard').length;

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

      {loading && <p className="muted" style={{ padding: '24px 0' }}>Loading…</p>}
      {error   && <p className="error-text">{error}</p>}
      {!loading && !error && <ProblemsTable problems={problems} progress={progress} />}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Company view                                                         */
/* ------------------------------------------------------------------ */
function CompanyDashboard({ problems, evaluations, loading, error }) {
  const user = getStoredUser();
  const myProblems = problems.filter(p => p.createdBy === user?.userId);

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1 className="page-title">Company Dashboard</h1>
          <p className="page-sub">Your problems and candidate evaluations.</p>
        </div>
      </div>

      {loading && <p className="muted" style={{ padding: '24px 0' }}>Loading…</p>}
      {error   && <p className="error-text">{error}</p>}

      {!loading && !error && (
        <>
          <h2 className="section-title">My Problems</h2>
          <div className="table-wrap" style={{ marginBottom: 32 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Title</th><th>Difficulty</th><th>Topic</th><th>Type</th><th>Visibility</th>
                </tr>
              </thead>
              <tbody>
                {myProblems.length === 0 && (
                  <tr><td colSpan={5} className="table-empty">No problems created yet.</td></tr>
                )}
                {myProblems.map(p => (
                  <tr key={p.id} className="table-row">
                    <td className="problem-title">{p.title}</td>
                    <td><span className={`pill pill-${p.difficulty}`}>{p.difficulty}</span></td>
                    <td className="muted">{p.topic}</td>
                    <td className="muted">{p.type}</td>
                    <td><span className={`pill ${p.isPublic ? 'pill-easy' : 'pill-hard'}`}>{p.isPublic ? 'Public' : 'Private'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2 className="section-title">Candidate Evaluations</h2>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr><th>Candidate</th><th>Problem</th><th>Score</th><th>Feedback</th></tr>
              </thead>
              <tbody>
                {evaluations.length === 0 && (
                  <tr><td colSpan={4} className="table-empty">No evaluations yet.</td></tr>
                )}
                {evaluations.map(e => (
                  <tr key={e.id} className="table-row">
                    <td>User #{e.userId}</td>
                    <td>Problem #{e.problemId}</td>
                    <td><strong style={{ color: 'var(--accent)' }}>{e.score}</strong></td>
                    <td className="muted" style={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.feedback}</td>
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
/* Admin view                                                           */
/* ------------------------------------------------------------------ */
function AdminDashboard({ problems, users, loading, error }) {
  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1 className="page-title">Admin Dashboard</h1>
          <p className="page-sub">All problems and platform users.</p>
        </div>
        <div className="dashboard-stats-row">
          <span className="diff-stat easy">{problems.filter(p => p.difficulty === 'easy').length} Easy</span>
          <span className="diff-stat medium">{problems.filter(p => p.difficulty === 'medium').length} Med</span>
          <span className="diff-stat hard">{problems.filter(p => p.difficulty === 'hard').length} Hard</span>
          <span className="diff-stat solved">{users.length} Users</span>
        </div>
      </div>

      {loading && <p className="muted" style={{ padding: '24px 0' }}>Loading…</p>}
      {error   && <p className="error-text">{error}</p>}

      {!loading && !error && (
        <>
          <h2 className="section-title">All Problems</h2>
          <div style={{ marginBottom: 32 }}>
            <ProblemsTable problems={problems} progress={[]} />
          </div>

          <h2 className="section-title">All Users</h2>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr><th>Name</th><th>Email</th><th>Role</th><th>Level</th><th>Joined</th></tr>
              </thead>
              <tbody>
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

  useEffect(() => {
    async function load() {
      try {
        if (role === 'candidate') {
          const [probs, prog] = await Promise.all([
            listProblems(),
            get('/progress').catch(() => []),
          ]);
          setProblems(probs);
          setProgress(prog);
        } else if (role === 'company') {
          const [probs, evals] = await Promise.all([
            listProblems(),
            get('/evaluations').catch(() => []),
          ]);
          setProblems(probs);
          setEvaluations(evals);
        } else if (role === 'admin') {
          const [probs, us] = await Promise.all([
            listProblems(),
            get('/users').catch(() => []),
          ]);
          setProblems(probs);
          setUsers(us);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [role]);

  return (
    <Layout>
      {role === 'candidate' && <CandidateDashboard problems={problems} progress={progress}    loading={loading} error={error} />}
      {role === 'company'   && <CompanyDashboard   problems={problems} evaluations={evaluations} loading={loading} error={error} />}
      {role === 'admin'     && <AdminDashboard     problems={problems} users={users}          loading={loading} error={error} />}
    </Layout>
  );
}
