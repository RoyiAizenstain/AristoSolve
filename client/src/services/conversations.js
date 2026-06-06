import { get, post, put, getStoredUser } from './api';

export function listConversations() {
  return get('/conversations');
}

export function getConversation(id) {
  return get(`/conversations/${id}`);
}

export function createConversation(problemId, language) {
  const user = getStoredUser();
  return post('/conversations', { userId: user.userId, problemId, language });
}

export function endConversation(id) {
  return put(`/conversations/${id}`, { endedAt: new Date().toISOString() });
}
