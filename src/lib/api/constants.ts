// Mirrors Constant (core/constant.dart)
export const API = {
  baseUrl: 'https://jawlahapp.onrender.com/',
  mediaUrl: 'https://jawlahapp.onrender.com',
  apiVersion: 'api/v1',
  userAgent: 'Mobile',
  googleMapsBase: 'https://maps.googleapis.com/maps/api/',
} as const;

export const apiUrl = (subUrl: string) =>
  `${API.baseUrl}${API.apiVersion}/${subUrl}`;

/** Resolve a possibly-relative media path against the media host. */
export const mediaUrl = (path?: string | null): string | undefined => {
  if (!path) return undefined;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${API.mediaUrl}${path.startsWith('/') ? '' : '/'}${path}`;
};

export const AppCurrency = '£';
