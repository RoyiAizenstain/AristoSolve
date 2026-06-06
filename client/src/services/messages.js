import { get, post } from './api';

export function listMessages(conversationId) {
  return get(`/conversations/${conversationId}/messages`);
}

export function sendMessage(conversationId, role, content) {
  return post(`/conversations/${conversationId}/messages`, { role, content });
}
