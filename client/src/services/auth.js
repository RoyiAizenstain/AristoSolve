import { post, get, setStoredUser, clearStoredUser } from './api';

export async function login(email, password) {
  const user = await post('/auth/login', { email, password });
  setStoredUser(user);
  return user;
}

export async function logout() {
  await post('/auth/logout', {});
  clearStoredUser();
}

export function getMe() {
  return get('/users/me');
}
