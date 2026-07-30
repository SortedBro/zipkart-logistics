const API_URL = import.meta.env.VITE_API_URL || '';
const BASE = `${API_URL.replace(/\/$/, '')}/api`;

async function request(path, options = {}) {
  let res;
  try {
    res = await fetch(`${BASE}${path}`, {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
  } catch (err) {
    if (err.name === 'TypeError' || err.message === 'Failed to fetch') {
      throw new Error(
        'Unable to connect to server ("Failed to fetch"). Please verify backend URL and CORS settings on Render.'
      );
    }
    throw err;
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || 'Something went wrong');
  }
  return data;
}

// Multipart upload — the browser sets the multipart boundary, so we must NOT set Content-Type.
async function upload(path, file, { type } = {}) {
  const body = new FormData();
  body.append('file', file);
  const qs = type ? `?type=${encodeURIComponent(type)}` : '';
  let res;
  try {
    res = await fetch(`${BASE}${path}${qs}`, {
      method: 'POST',
      credentials: 'include',
      body,
    });
  } catch (err) {
    if (err.name === 'TypeError' || err.message === 'Failed to fetch') {
      throw new Error(
        'Unable to connect to server ("Failed to fetch"). Please verify backend URL and CORS settings on Render.'
      );
    }
    throw err;
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || 'Upload failed');
  }
  return data;
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) }),
  put: (path, body) => request(path, { method: 'PUT', body: JSON.stringify(body) }),
  patch: (path, body) => request(path, { method: 'PATCH', body: JSON.stringify(body) }),
  upload,
  // True when server-side object storage (R2/S3) is configured; else callers use base64.
  uploadEnabled: async () => {
    try {
      const data = await request('/uploads/status');
      return Boolean(data.enabled);
    } catch {
      return false;
    }
  },
};

// A stored document value can be an object-storage URL or a legacy base64 data URL.
export function isPdfDoc(value) {
  if (typeof value !== 'string') return false;
  return value.startsWith('data:application/pdf') || value.split('?')[0].toLowerCase().endsWith('.pdf');
}
