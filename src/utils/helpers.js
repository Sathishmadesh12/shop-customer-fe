// helpers.js
export const getErrorMessage = (err) => {
  return err?.response?.data?.message || err?.message || 'Something went wrong';
};

export const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  const base = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000';
  return `${base}/${path}`;
};

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
