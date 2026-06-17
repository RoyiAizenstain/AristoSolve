/* ============================================================
   api.js — central fetch wrapper
   The ONLY module that talks to fetch directly. Every request:
     - is prefixed with /api (CRA proxy forwards to :3000)
     - carries x-user-id + x-user-role from localStorage (mock auth)
     - is unwrapped from the { success, data, error } envelope
   ============================================================ */

const STORAGE_KEY = 'aristosolve_user';

/* ---- localStorage helpers (the app's whole "session") ---- */

export function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY));
  } catch {
    return null;
  }
}

export function setStoredUser(user) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

export function clearStoredUser() {
  localStorage.removeItem(STORAGE_KEY);
}

/* ---- Typed error so pages can show error.message / error.code ---- */

export class ApiError extends Error {
  constructor(message, status, code, details) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

function authHeaders() {
  const user = getStoredUser();
  if (!user) return {};
  return {
    'x-user-id': String(user.userId),
    'x-user-role': user.userRole,
  };
}

/* ---- Core request ---- */

async function request(path, { method = 'GET', body } = {}) {
  let res;
  try {
    res = await fetch(`/api${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders(),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    // Network-level failure (server down, CORS, offline)
    throw new ApiError('Cannot reach the server', 0, 'NETWORK_ERROR');
  }

  let payload = null;
  try {
    payload = await res.json();
  } catch {
    throw new ApiError('Unexpected server response', res.status, 'BAD_RESPONSE');
  }

  if (!res.ok || !payload.success) {
    const err = payload.error || {};
    throw new ApiError(
      err.message || 'Request failed',
      res.status,
      err.code || 'UNKNOWN',
      err.details
    );
  }

  return payload.data;
}

/* ---- Verb shortcuts ---- */

export const get = (path) => request(path, { method: 'GET' });
export const post = (path, body) => request(path, { method: 'POST', body });
export const put = (path, body) => request(path, { method: 'PUT', body });
export const del = (path) => request(path, { method: 'DELETE' });
