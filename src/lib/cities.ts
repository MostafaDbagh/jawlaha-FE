// Canonical Syrian governorates / cities. The backend stores branch.city in
// ENGLISH (e.g. "Damascus"), so filtering must send the English name, while the
// UI shows the localized label. Keep `en` values in sync with seeded branch
// cities (jawlahapp seedData) so the city filter actually matches.
export interface City {
  key: string;
  en: string;
  ar: string;
}

export const SYRIAN_CITIES: City[] = [
  { key: 'damascus', en: 'Damascus', ar: 'دمشق' },
  { key: 'rif_dimashq', en: 'Rif Dimashq', ar: 'ريف دمشق' },
  { key: 'aleppo', en: 'Aleppo', ar: 'حلب' },
  { key: 'homs', en: 'Homs', ar: 'حمص' },
  { key: 'hama', en: 'Hama', ar: 'حماة' },
  { key: 'latakia', en: 'Latakia', ar: 'اللاذقية' },
  { key: 'tartus', en: 'Tartus', ar: 'طرطوس' },
  { key: 'idlib', en: 'Idlib', ar: 'إدلب' },
  { key: 'daraa', en: 'Daraa', ar: 'درعا' },
  { key: 'as_suwayda', en: 'As-Suwayda', ar: 'السويداء' },
  { key: 'quneitra', en: 'Quneitra', ar: 'القنيطرة' },
  { key: 'deir_ez_zor', en: 'Deir ez-Zor', ar: 'دير الزور' },
  { key: 'al_hasakah', en: 'Al-Hasakah', ar: 'الحسكة' },
  { key: 'raqqa', en: 'Raqqa', ar: 'الرقة' },
];

/** A geographic point. Shared by the map picker and saved addresses. */
export interface LatLng {
  lat: number;
  lng: number;
}

// Approximate governorate-capital centers, used only to center the map picker
// when the user hasn't pinned a precise spot yet. Not authoritative coordinates.
export const CITY_CENTERS: Record<string, LatLng> = {
  damascus: { lat: 33.5138, lng: 36.2765 },
  rif_dimashq: { lat: 33.5167, lng: 36.3 },
  aleppo: { lat: 36.2021, lng: 37.1343 },
  homs: { lat: 34.7324, lng: 36.7137 },
  hama: { lat: 35.1318, lng: 36.7578 },
  latakia: { lat: 35.5317, lng: 35.7915 },
  tartus: { lat: 34.8886, lng: 35.8866 },
  idlib: { lat: 35.9306, lng: 36.6339 },
  daraa: { lat: 32.6189, lng: 36.1021 },
  as_suwayda: { lat: 32.7094, lng: 36.5694 },
  quneitra: { lat: 33.1265, lng: 35.8244 },
  deir_ez_zor: { lat: 35.3359, lng: 40.1408 },
  al_hasakah: { lat: 36.5024, lng: 40.7477 },
  raqqa: { lat: 35.9594, lng: 39.0136 },
};

// Damascus — the fallback center when no city is selected.
export const DEFAULT_CENTER: LatLng = CITY_CENTERS.damascus;

/** Map-picker starting center for a city (falls back to Damascus). */
export function cityCenter(city: City | null | undefined): LatLng {
  if (city && CITY_CENTERS[city.key]) return CITY_CENTERS[city.key];
  return DEFAULT_CENTER;
}

/** Localized display label for a city. */
export function cityLabel(city: City | null | undefined, lang: string): string {
  if (!city) return '';
  return lang === 'ar' ? city.ar : city.en;
}

/** Resolve a city from any of its forms (key / English / Arabic). */
export function findCity(value: string | null | undefined): City | undefined {
  if (!value) return undefined;
  const v = String(value).trim().toLowerCase();
  return SYRIAN_CITIES.find(
    (c) => c.key === v || c.en.toLowerCase() === v || c.ar === String(value).trim(),
  );
}
