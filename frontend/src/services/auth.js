import { post, get, setStoredUser, clearStoredUser } from './api';

export async function login(email, password) {
  const user = await post('/auth/login', { email, password });
  setStoredUser(user);
  try {
    const settings = await get('/settings');
    if (settings?.theme) {
      document.documentElement.setAttribute('data-theme', settings.theme);
      localStorage.setItem('aristosolve_theme', settings.theme);
    }
  } catch {
    // settings fetch failure shouldn't block login
  }
  return user;
}

export async function logout() {
  await post('/auth/logout', {});
  clearStoredUser();
}

export function getMe() {
  return get('/users/me');
}
