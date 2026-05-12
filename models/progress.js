let progress = [
  { id: 1, userId: 3, problemId: 1, status: 'completed', attempts: 2, lastAttemptAt: '2024-02-01T10:45:00Z', deadline: null },
  { id: 2, userId: 3, problemId: 2, status: 'in_progress', attempts: 1, lastAttemptAt: '2024-02-02T14:00:00Z', deadline: '2024-02-10T23:59:00Z' },
  { id: 3, userId: 4, problemId: 1, status: 'completed', attempts: 1, lastAttemptAt: '2024-02-03T09:30:00Z', deadline: null },
  { id: 4, userId: 5, problemId: 3, status: 'in_progress', attempts: 1, lastAttemptAt: '2024-02-04T11:00:00Z', deadline: '2024-02-15T23:59:00Z' },
  { id: 5, userId: 4, problemId: 3, status: 'completed', attempts: 3, lastAttemptAt: '2024-02-06T15:50:00Z', deadline: null },
];
let nextId = 6;

const findAll = () => progress;
const findById = (id) => progress.find(p => p.id === id);

const create = (data) => {
  const record = { id: nextId++, ...data, lastAttemptAt: new Date().toISOString() };
  progress.push(record);
  return record;
};

const update = (id, data) => {
  const idx = progress.findIndex(p => p.id === id);
  if (idx === -1) return null;
  progress[idx] = { ...progress[idx], ...data, lastAttemptAt: new Date().toISOString() };
  return progress[idx];
};

const remove = (id) => {
  const idx = progress.findIndex(p => p.id === id);
  if (idx === -1) return false;
  progress.splice(idx, 1);
  return true;
};

module.exports = { findAll, findById, create, update, remove };
