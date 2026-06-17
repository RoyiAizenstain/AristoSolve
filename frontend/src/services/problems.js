import { get, post, put, del } from './api';

export function listProblems(params = {}) {
  const qs = new URLSearchParams(params).toString();
  return get(`/problems${qs ? `?${qs}` : ''}`);
}

export function getProblem(id) {
  return get(`/problems/${id}`);
}

export function createProblem(data) {
  return post('/problems', data);
}

export function updateProblem(id, data) {
  return put(`/problems/${id}`, data);
}

export function deleteProblem(id) {
  return del(`/problems/${id}`);
}
