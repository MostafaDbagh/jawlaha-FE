export const meta = {
  name: 'jawlah-migrate-screens',
  description: 'Migrate jawlah Flutter feature widgets + all screens to RN (expo-router)',
  phases: [
    { title: 'Widgets' },
    { title: 'Screens' },
  ],
};

const FL = '/Users/mostafa/Desktop/pesonal/jawleh_ae-main/lib';
const RN = '/Users/mostafa/Desktop/app-jawlaha/jawlah_sy_react';
const CONV = `${RN}/MIGRATION_CONVENTIONS.md`;

const preamble = `You are migrating the jawlah food-delivery app from Flutter to React Native (Expo Router, TypeScript).
FIRST read the conventions file: ${CONV} (fully). Flutter source root: ${FL}. RN target root: ${RN}.
Always Read the Flutter source before porting. Port LITERALLY — same layout, same widgets, same text, same colors/sizes, same logic.
Foundation already exists — import and reuse:
  import { AppColors, w, h, r, sp, TextStyles, Radii } from '@/theme';
  import { Responsive } from '@/theme/responsive';
  import { t } from '@/i18n'; import { useI18n } from '@/i18n';
  import { AppImage, BaseText, TextButton, LoadingButton, AppTextField, AppBar, StateBody } from '@/components';
  import { Res } from '@/lib/assets';
  import { Validator } from '@/lib/validators';
  import { showSnack } from '@/lib/snack';
  import { mediaUrl, AppCurrency, CustomResponse } from '@/lib/api';
  import { useAuthStore } from '@/store/authStore';
  import { navArgs, useNavArgs } from '@/store/navArgs';   // mirrors Get.arguments
Models live in '@/types/*' (parseX + interfaces). Repository in '@/data/repository' (\`import { repository } from '@/data/repository'\`). Feature stores in '@/features/<f>/<store>'.
Icons: use \`import { Ionicons, MaterialIcons, Feather } from '@expo/vector-icons'\` to replace Flutter Material Icons (pick the closest matching icon name).
Write the output file(s) yourself with Write. Return a 1-line summary.`;

// ---------------- Phase 1: feature widgets → src/components/cards/* ----------------
phase('Widgets');
const WIDGETS = [
  { out: 'PromotionCard', src: 'widgets/promotion_card.dart' },
  { out: 'VendorListCard', src: 'widgets/vendor_list_card.dart' },
  { out: 'MenuListItemCard', src: 'widgets/menu_list_item_card.dart' },
  { out: 'PopularItemCard', src: 'widgets/popular_item_card.dart' },
  { out: 'CategoryGridItem', src: 'widgets/category_grid_item.dart' },
  { out: 'HomeBanner', src: 'screens/cart/widgets/home_banner.dart' },
  { out: 'StoreCard', src: 'screens/cart/widgets/store_card.dart' },
  { out: 'CategoryCard', src: 'screens/cart/widgets/category_card.dart' },
  { out: 'SectionHeader', src: 'screens/cart/widgets/section_header.dart' },
  { out: 'LocationHeader', src: 'screens/cart/widgets/location_header.dart' },
  { out: 'CustomSearchBar', src: 'screens/cart/widgets/custom_search_bar.dart' },
  { out: 'CartItemCard', src: 'screens/cart/widgets/cart_item_card.dart' },
  { out: 'OrderSummaryCard', src: 'screens/cart/widgets/order_summary_card.dart' },
  { out: 'PromoCodeInput', src: 'screens/cart/widgets/promo_code_input.dart' },
  { out: 'ProfileMenuItem', src: 'screens/cart/widgets/profile_menu_item.dart' },
  { out: 'NotificationCard', src: 'screens/profile_screens/widgets/notification_card.dart' },
  { out: 'ProfileCard', src: 'screens/profile_screens/widgets/profile_card.dart' },
  { out: 'SupportTeamResponseCard', src: 'screens/profile_screens/widgets/support_team_response_card.dart' },
  { out: 'AuthSubBar', src: 'screens/auth/widgets/auth_sub_bar.dart' },
];

const WIDGET_SCHEMA = {
  type: 'object',
  properties: { file: { type: 'string' }, component: { type: 'string' }, props: { type: 'array', items: { type: 'string' } }, summary: { type: 'string' } },
  required: ['file', 'summary'],
};

await parallel(
  WIDGETS.map((wdg) => () =>
    agent(
      `${preamble}

TASK: Port a Flutter widget to a React Native component.
Source: ${FL}/${wdg.src}
Target: ${RN}/src/components/cards/${wdg.out}.tsx
Export a named functional component \`export function ${wdg.out}(props) {...}\` with a props interface matching the Flutter widget's constructor params (same names, camelCase; callbacks like onTap -> onPress).
Use StyleSheet.create. Reproduce the layout faithfully (Row/Column/Padding/Container -> View with fl ex styles, Text -> BaseText, images -> AppImage, taps -> Pressable).
If the widget takes a model (e.g. VendorModel), import its type from '@/types/...'.`,
      { label: `widget:${wdg.out}`, phase: 'Widgets', schema: WIDGET_SCHEMA },
    ),
  ),
);

// Write the cards barrel after widgets exist.
log('Widgets done — screens next.');

// ---------------- Phase 2: screens → app/* ----------------
phase('Screens');
const SCREENS = [
  // auth
  { route: 'app/index.tsx', src: 'screens/auth/splash_screen.dart', store: "features/auth/authStore", extra: 'This is the SPLASH route ("/"). After its logic decides where to go, navigate with router.replace: to "/login" if not logged in, or "/(tabs)" if logged in (mirror the Dart decision using useAuthStore + prefs.getIsFirstOpen).' },
  { route: 'app/login.tsx', src: 'screens/auth/login_screen.dart', store: 'features/auth/authStore' },
  { route: 'app/create-account.tsx', src: 'screens/auth/create_account_screen.dart', store: 'features/auth/authStore' },
  { route: 'app/verification-code.tsx', src: 'screens/auth/verification_code_screen.dart', store: 'features/auth/authStore' },
  { route: 'app/forgot-password.tsx', src: 'screens/auth/forgot_password_screen.dart', store: 'features/auth/authStore' },
  { route: 'app/reset-new-password.tsx', src: 'screens/auth/reset_new_password_screen.dart', store: 'features/auth/authStore' },
  // home (tabs)
  { route: 'app/(tabs)/index.tsx', src: 'screens/home/home_screen.dart', store: 'features/home/homeStore', extra: 'This is the HOME tab.' },
  { route: 'app/order-history.tsx', src: 'screens/home/order_history_screen.dart', store: 'features/home/homeStore' },
  { route: 'app/order-details.tsx', src: 'screens/home/order_details_screen.dart', store: 'features/home/homeStore' },
  // categories (tabs)
  { route: 'app/(tabs)/categories.tsx', src: 'screens/categories/categories_screen.dart', store: 'features/categories/productStore', extra: 'This is the CATEGORIES tab.' },
  { route: 'app/sub-categories.tsx', src: 'screens/categories/sub_categories_screen.dart', store: 'features/categories/productStore' },
  { route: 'app/product-details.tsx', src: 'screens/categories/product_details_screen.dart', store: 'features/categories/productStore' },
  // vendor
  { route: 'app/all-vendors.tsx', src: 'screens/vendor/all_vendors_screen.dart', store: 'features/vendor/vendorStore' },
  { route: 'app/vendor-details.tsx', src: 'screens/vendor/vendor_details_screen.dart', store: 'features/vendor/vendorStore' },
  // cart (tabs) + checkout flow
  { route: 'app/(tabs)/cart.tsx', src: 'screens/cart/cart_screen.dart', store: '', extra: 'This is the CART tab. Cart state may be local (no controller) — use local useState/zustand as the Dart does.' },
  { route: 'app/checkout-address.tsx', src: 'screens/cart/checkout_address_screen.dart', store: '' },
  { route: 'app/choose-location.tsx', src: 'screens/cart/choose_location_screen.dart', store: 'features/branches/branchesStore', extra: 'Uses google_maps -> render the <MapPlaceholder/> approach from conventions (a styled View with a TODO); keep surrounding logic.' },
  { route: 'app/add-address.tsx', src: 'screens/cart/add_address_screen.dart', store: '', extra: 'Takes an isEdit arg (Get.arguments["isEdit"]) -> read from useNavArgs().args.isEdit.' },
  { route: 'app/checkout-payment.tsx', src: 'screens/cart/checkout_payment_screen.dart', store: '' },
  { route: 'app/checkout-success.tsx', src: 'screens/cart/checkout_success_screen.dart', store: '' },
  { route: 'app/tracking-order.tsx', src: 'screens/cart/tracking_order_screen.dart', store: '' },
  // profile (tabs) + sub-screens
  { route: 'app/(tabs)/profile.tsx', src: 'screens/profile/profile_screen.dart', store: 'features/profile/profileStore', extra: 'This is the PROFILE tab.' },
  { route: 'app/edit-profile.tsx', src: 'screens/profile_screens/profile_screen.dart', store: 'features/profile/profileStore' },
  { route: 'app/about-us.tsx', src: 'screens/profile_screens/about_us_screen.dart', store: 'features/profile/profileStore' },
  { route: 'app/contact-us.tsx', src: 'screens/profile_screens/content_us_screen.dart', store: 'features/profile/profileStore' },
  { route: 'app/privacy-policy.tsx', src: 'screens/profile_screens/privacy_police_screen.dart', store: 'features/profile/profileStore' },
  { route: 'app/change-password.tsx', src: 'screens/profile_screens/change_password_screen.dart', store: 'features/profile/profileStore' },
  { route: 'app/notifications.tsx', src: 'screens/profile_screens/notification_screen.dart', store: 'features/profile/profileStore' },
  { route: 'app/support-report.tsx', src: 'screens/profile_screens/support_report_screen.dart', store: 'features/profile/profileStore' },
];

const SCREEN_SCHEMA = {
  type: 'object',
  properties: { file: { type: 'string' }, usedComponents: { type: 'array', items: { type: 'string' } }, notes: { type: 'string' }, summary: { type: 'string' } },
  required: ['file', 'summary'],
};

await parallel(
  SCREENS.map((sc) => () =>
    agent(
      `${preamble}

TASK: Port a Flutter screen to an expo-router screen.
Source: ${FL}/${sc.src}
Target route file: ${RN}/${sc.route}
${sc.store ? `Feature store: import the store from '@/${sc.store}' and use it (read state via \`useXStore((s)=>s.field)\`, call actions via \`useXStore.getState().action()\` or destructure). Read the store file first to learn its exact exported name + fields.` : 'No feature store — keep state local (useState) exactly as the Dart screen does.'}
${sc.extra ? 'IMPORTANT: ' + sc.extra : ''}

Rules:
- Default-export a React component (this is the route file). Render the full screen UI directly here.
- Wrap content in a SafeArea (\`import { SafeAreaView } from 'react-native-safe-area-context'\`) with backgroundColor AppColors.backgroundColor, matching the Flutter Scaffold.
- Use the shared components and the feature card components from '@/components/cards' (read ${RN}/src/components/cards to see what exists; import the ones this screen uses).
- Navigation: Flutter \`Get.to/Navigator.push(X)\` or \`Get.toNamed('/r')\` -> \`import { useRouter } from 'expo-router'; const router = useRouter(); router.push('/route')\`. Use the route paths from the conventions route map. \`Get.back()\` -> \`router.back()\`. To pass an object argument, call \`navArgs.set({ ... })\` before \`router.push(...)\` and read it on the target with \`useNavArgs((s)=>s.args)\`.
- Forms: port validators via \`Validator.*\`; track field values with useState and an errors object; validate on submit like the Dart Form.
- Preserve EVERY visible string (via t('key')), color, and size. Keep commented-out Dart logic as commented-out TS.
- If the screen needs a native feature flagged in conventions (maps/picker/qr/rating/pin), use the simple RN fallback there and keep going. Do not leave the screen unfinished.
- Output must be valid TSX that compiles.`,
      { label: `screen:${sc.route.replace('app/', '')}`, phase: 'Screens', schema: SCREEN_SCHEMA },
    ),
  ),
);

return { widgets: WIDGETS.length, screens: SCREENS.length };
