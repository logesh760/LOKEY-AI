export const getApiUrl = (path: string) => {
  const baseUrl = (import.meta as any).env.VITE_API_URL || '';
  // Ensure path starts with a slash if baseUrl is present
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${normalizedPath}`;
};
