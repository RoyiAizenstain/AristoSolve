import { get } from './api';

export function listProblems(params = {}) {
  const qs = new URLSearchParams(params).toString();
  return get(`/problems${qs ? `?${qs}` : ''}`);
}

export function getProblem(id) {
  return get(`/problems/${id}`);
}
