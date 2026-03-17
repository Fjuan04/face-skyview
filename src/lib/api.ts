//

//centralizar URL del servidor
const BASE_URL = import.meta.env.VITE_API_URL;

async function request(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token')
  const isFormData = options.body instanceof FormData;

  const headers: Record<string, string> = {
    'Accept': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string> || {}),
  }

  if (!isFormData && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  })

  if (!res.ok) throw await res.json()
  return res.json()
}

export const api = {
  get: (url: string) => request(url),
  post: (url: string, body: unknown) => request(url, { method: 'POST', body: body instanceof FormData ? body : JSON.stringify(body) }),
  put: (url: string, body: unknown) => request(url, { method: 'PUT', body: body instanceof FormData ? body : JSON.stringify(body) }),
  delete: (url: string) => request(url, { method: 'DELETE' }),
}