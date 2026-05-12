let evaluations = [
  { id: 1, userId: 3, problemId: 1, conversationId: 1, score: 85, feedback: 'Good understanding of hash map optimization. Pivoted from brute force quickly.', thinkingAnalysis: 'Candidate started with O(n^2) but recognized the pattern after one hint. Strong reasoning.', createdAt: '2024-02-01T11:00:00Z' },
  { id: 2, userId: 4, problemId: 1, conversationId: 3, score: 72, feedback: 'Reached correct solution but needed multiple prompts.', thinkingAnalysis: 'Candidate struggled to independently identify the hash map pattern. Required direct hints.', createdAt: '2024-02-03T10:00:00Z' },
  { id: 3, userId: 5, problemId: 3, conversationId: 4, score: 91, feedback: 'Excellent stack-based approach with clear explanation.', thinkingAnalysis: 'Candidate independently recognized the stack pattern and explained edge cases unprompted.', createdAt: '2024-02-05T12:00:00Z' },
  { id: 4, userId: 4, problemId: 3, conversationId: 5, score: 78, feedback: 'Solid solution on the third attempt.', thinkingAnalysis: 'Improved significantly across attempts. Shows good learning ability.', createdAt: '2024-02-06T16:00:00Z' },
];
let nextId = 5;

const findAll = () => evaluations;
const findById = (id) => evaluations.find(e => e.id === id);

const create = (data) => {
  const evaluation = { id: nextId++, ...data, createdAt: new Date().toISOString() };
  evaluations.push(evaluation);
  return evaluation;
};

const update = (id, data) => {
  const idx = evaluations.findIndex(e => e.id === id);
  if (idx === -1) return null;
  evaluations[idx] = { ...evaluations[idx], ...data };
  return evaluations[idx];
};

const remove = (id) => {
  const idx = evaluations.findIndex(e => e.id === id);
  if (idx === -1) return false;
  evaluations.splice(idx, 1);
  return true;
};

module.exports = { findAll, findById, create, update, remove };
