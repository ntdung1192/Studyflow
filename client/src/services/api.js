const API_BASE = '/api/v1';
const TOKEN_KEY = 'studyflow.token';

export class ApiError extends Error {
  constructor(status, body) {
    super(body?.error?.message || 'Không thể kết nối máy chủ.');
    this.name = 'ApiError';
    this.status = status;
    this.code = body?.error?.code || 'NETWORK_ERROR';
    this.details = body?.error?.details || [];
  }
}

export function getAuthToken() {
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token) {
  if (token) window.localStorage.setItem(TOKEN_KEY, token);
  else window.localStorage.removeItem(TOKEN_KEY);
}

async function request(path, options = {}) {
  const { body, headers = {}, ...rest } = options;
  const token = getAuthToken();
  const response = await fetch(`${API_BASE}${path}`, {
    ...rest,
    headers: {
      ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });

  if (response.status === 204) return null;

  let payload;
  try {
    payload = await response.json();
  } catch {
    throw new ApiError(response.status, null);
  }

  if (!response.ok) throw new ApiError(response.status, payload);
  return payload.data;
}

export const api = {
  get: (path, options) => request(path, { ...options, method: 'GET' }),
  post: (path, body, options) => request(path, { ...options, method: 'POST', body }),
  patch: (path, body, options) => request(path, { ...options, method: 'PATCH', body }),
  delete: (path, options) => request(path, { ...options, method: 'DELETE' }),
};
