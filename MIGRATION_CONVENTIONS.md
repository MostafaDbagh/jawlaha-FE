# Flutter → React Native (Expo) Migration Conventions

You are migrating the **jawlah** food-delivery app from Flutter (GetX) to React Native
(Expo Router + TypeScript). Port **literally** — same screens, same layout, same fields,
same API calls, same text. Only the framework changes.

## Source & target

- Flutter source root: `/Users/mostafa/Desktop/pesonal/jawleh_ae-main/lib`
- RN target root: `/Users/mostafa/Desktop/app-jawlaha/jawlah_sy_react`
- Always **read the Flutter source file** before porting. Reproduce its structure faithfully.

## Foundation already built (import these — DO NOT recreate)

```ts
import { AppColors, w, h, r, sp, TextStyles, Radii } from '@/theme';
import { Responsive } from '@/theme/responsive';
import { t } from '@/i18n';                         // t('local_key')  ===  Flutter `LocalKeys.x.tr`
import { useI18n } from '@/i18n';                    // { lang, isRTL, t, setLang }
import { apiClient, CustomResponse, mediaUrl, AppCurrency } from '@/lib/api';
import { storage, prefs, secureStorage, StorageKeys } from '@/lib/storage';
import { Res } from '@/lib/assets';                  // Res.loginLogo, Res.emailIcon, ... (mirrors res.dart)
```

- `@/` → `src/`. `@/assets/` → `assets/`.
- Translations: Flutter `LocalKeys.welcome_back.tr` → `t('welcome_back')`. The key string is the
  value, which equals the field name. If a key is missing from `src/i18n/keys.ts`, still call
  `t('the_key')` (it falls back to English then the raw key).

## Sizing

- Flutter `16.w` → `w(16)`, `16.h` → `h(16)`, `16.r` → `r(16)`, `16.sp` → `sp(16)`.
- `ResponsiveUtils.responsiveGap` → `Responsive.gap`, `.responsivePadding` → `Responsive.padding`, etc.
- `ResponsiveUtils.getResponsivePadding(context)` → `Responsive.getResponsivePadding()` (returns `{paddingHorizontal}`).

## Colors

- Flutter `AppColors.primaryColorTheme` → `AppColors.primaryColorTheme`. Same names (see `src/theme/colors.ts`).
- `Theme.of(context).textTheme.titleLarge` → `TextStyles.titleLarge` (spread into a style array).
- `.copyWith(color: X)` → merge: `[TextStyles.bodySmall, { color: AppColors.x }]`.

## Components — use the shared kit in `src/components` (see those files)

| Flutter widget | RN component |
|---|---|
| `BaseText(title:, textStyle:)` | `<BaseText title={} style={} />` |
| `GeneralImageAssets(path: Res.x)` | `<AppImage source={Res.x} style={} />` (expo-image; handles svg + png + remote) |
| `CustomTextFormField(...)` | `<AppTextField label= controller= validator= ... />` |
| `LoadingButton(loading:, onPressed:, child:)` | `<LoadingButton loading onPress>{}</LoadingButton>` |
| `CustomTextButton(title:, onPressed:)` | `<TextButton title onPress style />` |
| `SubAppBar` / app bars | `<AppBar title= />` |
| state widgets (`StateBodyWidget`) | `<StateBody loading error empty>{}</StateBody>` |
| `Get.to/toNamed`, `Navigator.push` | `expo-router`: `router.push('/route')` |
| `Get.back()` | `router.back()` |
| `showSnackBarMessage` | `import { showSnack } from '@/lib/snack'` |

If a shared component you need does not exist yet, check `src/components/index.ts`. Build a small
local one only if truly missing, and keep it consistent with the kit.

## Screens & routing (expo-router, file-based)

- Route files live in `app/`. Keep route files **thin** — they import and render the screen
  component from `src/features/<feature>/<ScreenName>.tsx`.
- Route map (Flutter GetX route → expo-router path):
  - `/splash` → `app/index.tsx`
  - `/login` → `app/login.tsx`
  - `/create-account-1` → `app/create-account.tsx`
  - `/verification-code` → `app/verification-code.tsx`
  - `/forgot-password` → `app/forgot-password.tsx`
  - `/reset-new-password` → `app/reset-new-password.tsx`
  - Tabs (`MainScreens` bottom nav: home, categories, cart, profile) → `app/(tabs)/_layout.tsx`
    with `app/(tabs)/index.tsx` (home), `app/(tabs)/categories.tsx`, `app/(tabs)/cart.tsx`, `app/(tabs)/profile.tsx`
  - `/all-vendors` → `app/all-vendors.tsx`; `/vendor-details` → `app/vendor-details.tsx`
  - `/product-details` → `app/product-details.tsx`; `/sub-categories` → `app/sub-categories.tsx`
  - `/checkout-address` → `app/checkout-address.tsx`; `/choose-location` → `app/choose-location.tsx`
  - `/add-address` → `app/add-address.tsx`; `/checkout-payment` → `app/checkout-payment.tsx`
  - `/checkout-success` → `app/checkout-success.tsx`; `/tracking-order` → `app/tracking-order.tsx`
  - `/order-history` → `app/order-history.tsx`; `/order-details` → `app/order-details.tsx`
  - `/change-password-screen` → `app/change-password.tsx`; `/about-us-screen` → `app/about-us.tsx`
  - `/content-us-screen` → `app/contact-us.tsx`; `/privacy-police-screen` → `app/privacy-policy.tsx`
  - `/notification-screen` → `app/notifications.tsx`; `/support-report-screen` → `app/support-report.tsx`
- Navigation args (`Get.arguments['x']`) → `useLocalSearchParams()` params, or a route store.

## State (GetX controllers → zustand)

- Each GetX controller (`*_controller.dart` + `*_state.dart`) → a zustand store in
  `src/features/<feature>/<feature>Store.ts`. Observables (`.obs` / `RxInt`/`RxBool`) become store
  fields; methods become store actions. `Obx(() => ...)` → read the store with `useXStore(s => s.field)`.
- Repository calls: `repository.method()` from `@/data/repository`. Returns `CustomResponse`.
  Check `res.success` and `res.object` / `res.msg` exactly like Flutter.
- Auth/lang/theme are global: `src/store/authStore.ts`, plus `useI18n()`.

## Data layer

- `src/lib/api/httpHelper.ts` mirrors `data/http_helper.dart` (endpoints).
- `src/data/repository.ts` mirrors `data/repository.dart` (adds token/profile side-effects).
- Models → `src/types/<name>.ts` as a TS `interface` + a `parseX(json): X` function
  (mirrors Dart `fromJson`) and optional `xToJson(x)` (mirrors `toJson`).

## Style mechanics

- Use `StyleSheet.create`. Flutter `Column` → `<View>` (default flexDirection column).
  `Row` → `<View style={{flexDirection:'row'}}>`. `mainAxisAlignment` → `justifyContent`,
  `crossAxisAlignment` → `alignItems`. `SizedBox(height: x)` → `<View style={{height:x}}/>`.
  `Padding` → padding style. `Expanded` → `flex:1`. `SingleChildScrollView` → `<ScrollView>`.
  `ListView.builder` → `<FlatList>`. `Spacer` → `<View style={{flex:1}}/>`.
  `Column(spacing: g)` → add `gap: g` to the container style.
- `SafeArea` → `useSafeAreaInsets()` / `<SafeAreaView>` from `react-native-safe-area-context`.
- `TextEditingController` → `useState('')` + controlled `<AppTextField value onChangeText>`.
- `Form` + validators → keep a local `errors` state; run the same validator functions
  (port `core/functions/validtion.dart` to `src/lib/validators.ts`).

## Native features — keep it running, don't pull heavy native deps

- Maps (`google_maps_flutter`, `choose_location_screen`): render a placeholder `<MapPlaceholder/>`
  component with a TODO comment; keep the surrounding UI/logic. Do not add react-native-maps.
- Image/file pickers (`image_picker`, `file_picker`): use a stub `pickImage()` that returns null with a
  TODO; keep the calling code. Do not add native picker deps.
- QR, rating bar, page indicator, OTP pin field: build simple pure-RN versions (stars from icons,
  dots row, TextInput-based pins).

## Rules

- Output valid TypeScript/TSX. No `any` unless the Dart was equally loose.
- Preserve every visible string, color, size, and API endpoint.
- Comment the top of each file with the Flutter source path it was ported from.
- Do not leave a screen half-ported. If logic is commented out in the Flutter source, keep it
  commented out in the port (faithful).
