async function api(path, body) {
  const res = await fetch(path, {
    method: body ? 'POST' : 'GET',
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'include'
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const AuthApi = {
  me: () => api('/api/me'),
  register: (payload) => api('/api/register', payload),
  login: (payload) => api('/api/login', payload),
  logout: () => api('/api/logout', {})
};
