import { get, put } from './api';

export function getSettings() {
  return get('/settings');
}

export function updateSettings(data) {
  return put('/settings', data);
}
