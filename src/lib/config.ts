// Configuration helper for backend URL
export function getBackendUrl(): string {
  // Check if we're in production
  if (process.env.NODE_ENV === 'production') {
    return process.env.NEXT_PUBLIC_BACKEND_URL || 'https://my-app-production-28d2.up.railway.app';
  }
  
  // Development environment
  return process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
}

export function getApiUrl(path: string): string {
  const backendUrl = getBackendUrl();
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${backendUrl}/${cleanPath}`;
}
