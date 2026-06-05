import { readFileSync, writeFileSync } from 'fs';

// Files containing style-object (colon form) fontWeight that must become a
// Quicksand family. Excludes BaseText/typography (already correct),
// product-details (handled by its local helper) and AuthSubBar (shorthand spread,
// fixed by hand).
const files = [
  'src/components/AppTextField.tsx',
  'src/components/cards/HomeBanner.tsx',
  'src/components/cards/CartItemCard.tsx',
  'src/components/cards/ProfileMenuItem.tsx',
  'src/components/cards/SupportTeamResponseCard.tsx',
  'src/components/cards/StoreCard.tsx',
  'src/components/cards/VendorListCard.tsx',
  'src/components/cards/PopularItemCard.tsx',
  'src/components/cards/SectionHeader.tsx',
  'src/components/cards/RestaurantRowCard.tsx',
  'src/components/cards/OrderSummaryCard.tsx',
  'src/components/cards/PromotionCard.tsx',
  'app/checkout-success.tsx',
  'app/tracking-order.tsx',
  'app/onboarding.tsx',
  'app/vendor-details.tsx',
  'app/(tabs)/profile.tsx',
  'app/(tabs)/index.tsx',
  'app/(tabs)/cart.tsx',
  'app/create-account.tsx',
];

// Matches the object-property form `fontWeight: <expr>` (stops before , } or EOL).
// Does NOT match JSX prop forms `fontWeight="..."` / `fontWeight={...}`,
// TS type members `fontWeight?: ...`, or default params `fontWeight = ...`.
const propRe = /fontWeight:\s*([^,\n}]+?)(\s*)(?=[,}\n])/g;

function ensureImport(src) {
  if (/\bquicksand\b/.test(src)) {
    // Already references quicksand somewhere — make sure it's imported.
    const typoImport = src.match(/import\s*\{([^}]*)\}\s*from\s*'@\/theme\/typography';/);
    if (typoImport && /\bquicksand\b/.test(typoImport[1])) return src;
  }
  const typoImport = src.match(/import\s*\{([^}]*)\}\s*from\s*'@\/theme\/typography';/);
  if (typoImport) {
    if (/\bquicksand\b/.test(typoImport[1])) return src;
    const names = typoImport[1].trim();
    return src.replace(
      typoImport[0],
      `import { ${names}${names.endsWith(',') ? '' : ','} quicksand } from '@/theme/typography';`,
    );
  }
  // Insert a fresh import after the base '@/theme' import, else after first import.
  const themeImport = src.match(/^import .*from '@\/theme';$/m);
  const line = "import { quicksand } from '@/theme/typography';";
  if (themeImport) {
    return src.replace(themeImport[0], `${themeImport[0]}\n${line}`);
  }
  const firstImport = src.match(/^import .*$/m);
  return src.replace(firstImport[0], `${firstImport[0]}\n${line}`);
}

for (const f of files) {
  let src = readFileSync(f, 'utf8');
  let count = 0;
  const out = src.replace(propRe, (_m, expr, trail) => {
    count++;
    return `fontFamily: quicksand(${expr.trim()})${trail}`;
  });
  if (count > 0) {
    const withImport = ensureImport(out);
    writeFileSync(f, withImport);
    console.log(`${f}: ${count} converted`);
  } else {
    console.log(`${f}: 0 (skipped)`);
  }
}
