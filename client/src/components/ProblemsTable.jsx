import { useNavigate } from 'react-router-dom';
import DifficultyPill from './DifficultyPill';

export default function ProblemsTable({ problems, progress = [] }) {
  const navigate = useNavigate();

  const solvedIds = new Set(
    progress.filter(p => p.status === 'completed').map(p => p.problemId)
  );
  const attemptedIds = new Set(progress.map(p => p.problemId));

  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th>Status</th>
            <th>Problem</th>
            <th>Difficulty</th>
            <th>Topic</th>
            <th>Type</th>
            <th>History</th>
          </tr>
        </thead>
        <tbody>
          {problems.map(p => {
            const solved    = solvedIds.has(p.id);
            const attempted = attemptedIds.has(p.id);
            return (
              <tr
                key={p.id}
                className={`table-row${solved ? ' row-solved' : ''}`}
                onClick={() => navigate(`/problems/${p.id}`)}
                style={{ cursor: 'pointer' }}
              >
                <td>
                  <span title={solved ? 'Solved' : 'Unsolved'}>
                    {solved ? '☑' : '☐'}
                  </span>
                </td>
                <td className="problem-title">{p.title}</td>
                <td><DifficultyPill difficulty={p.difficulty} /></td>
                <td className="muted">{p.topic}</td>
                <td className="muted">{p.type}</td>
                <td>{attempted ? '🕐' : <span className="subtle">—</span>}</td>
              </tr>
            );
          })}
          {problems.length === 0 && (
            <tr>
              <td colSpan={6} className="table-empty">No problems found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
