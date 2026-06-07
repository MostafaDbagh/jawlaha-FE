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
