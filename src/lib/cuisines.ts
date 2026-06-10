// Restaurant category labels. Keys mirror the backend Vendor.cuisines enum and
// the merchant portal's RESTAURANT_CATEGORIES. A vendor can carry up to 5.
export const CUISINE_LABELS: Record<string, string> = {
  shawarma: 'شاورما',
  burgers: 'برغر',
  pizza: 'بيتزا',
  grills: 'مشاوي',
  chicken: 'دجاج',
  breakfast: 'فطور',
  sandwiches: 'سندويشات',
  arabic: 'مأكولات عربية',
  healthy: 'صحي',
  coffee: 'قهوة',
  desserts: 'حلويات',
  ice_cream: 'آيس كريم',
  fried: 'مقالي',
  bakery: 'مخبوزات',
  fast_food: 'وجبات سريعة',
  international: 'مأكولات عالمية',
  cafe: 'كافيه', // legacy key, still rendered on older vendors
};

// Map a single key → localized label (falls back to the raw key if unknown).
export function cuisineLabel(key?: string | null): string {
  if (!key) return '';
  return CUISINE_LABELS[key] ?? key;
}

// Join a vendor's category keys into one display line, e.g. "كافيه · مخبوزات".
export function cuisineLabels(keys?: string[] | null): string {
  if (!Array.isArray(keys) || keys.length === 0) return '';
  return keys.map(cuisineLabel).filter(Boolean).join(' · ');
}
