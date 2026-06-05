export const meta = {
  name: 'jawlah-migrate-data',
  description: 'Migrate jawlah Flutter models, repository, and controllers→zustand stores to RN',
  phases: [
    { title: 'Models' },
    { title: 'Repository' },
    { title: 'Stores' },
  ],
};

const FL = '/Users/mostafa/Desktop/pesonal/jawleh_ae-main/lib';
const RN = '/Users/mostafa/Desktop/app-jawlaha/jawlah_sy_react';
const CONV = `${RN}/MIGRATION_CONVENTIONS.md`;

const preamble = `You are migrating the jawlah food-delivery app from Flutter to React Native (Expo, TypeScript).
FIRST read the conventions file: ${CONV} (read it fully).
Flutter source root: ${FL}. RN target root: ${RN}.
Always Read the Flutter source file(s) before porting. Port LITERALLY — same fields, same names, same logic.
Write the output file(s) yourself with the Write tool. Return a 1-line summary of what you wrote.`;

// ---------- Phase 1: Models → src/types/* ----------
phase('Models');
const MODELS = [
  { out: 'category.ts', src: ['model/category_model.dart'], note: 'CategoryModel' },
  { out: 'subcategory.ts', src: ['model/subcategory_model.dart'], note: 'SubcategoryModel' },
  { out: 'name.ts', src: ['model/base_respons/name_model.dart'], note: 'NameModel' },
  { out: 'vendor.ts', src: ['model/vendor_model.dart'], note: 'VendorModel' },
  { out: 'branch.ts', src: ['model/branch_model.dart'], note: 'BranchModel' },
  { out: 'product.ts', src: ['model/product_model.dart'], note: 'ProductModel + ProductVariation' },
  { out: 'offer.ts', src: ['model/offer_model.dart'], note: 'OfferModel' },
  { out: 'review.ts', src: ['model/review_model.dart'], note: 'ReviewModel' },
  { out: 'settings.ts', src: ['model/settings/content_us_model.dart', 'model/settings/global_text_model.dart'], note: 'ContentUsModel + GlobalTextModel' },
  { out: 'notification.ts', src: ['model/settings/notification_model.dart'], note: 'NotificationModel' },
  { out: 'ticket.ts', src: ['model/settings/ticket_model.dart'], note: 'TicketModel' },
  { out: 'authExtras.ts', src: ['model/auth_models/register_model.dart', 'model/auth_models/check_form_model.dart', 'model/auth_models/verify_code_model.dart', 'model/auth_models/check_code_password_model.dart', 'model/home/company_model.dart'], note: 'RegisterModel, CheckFormModel, VerifyCodeModel, CheckCodePasswordModel, CompanyModel' },
  { out: 'entities.ts', src: ['entities/address/address_entity.dart', 'entities/address/payment_card_entity.dart', 'entities/checkout_entities/checkout_order_entity.dart', 'entities/filter_eintty.dart', 'entities/base_entities/paginate_req_entity.dart'], note: 'AddressEntity, PaymentCardEntity, CheckoutOrderEntity, FilterEntity, PaginateReqEntity' },
];

const MODEL_SCHEMA = {
  type: 'object',
  properties: { file: { type: 'string' }, exports: { type: 'array', items: { type: 'string' } }, summary: { type: 'string' } },
  required: ['file', 'summary'],
};

await parallel(
  MODELS.map((m) => () =>
    agent(
      `${preamble}

TASK: Port Flutter model(s) to TypeScript.
Source file(s): ${m.src.map((s) => `${FL}/${s}`).join(', ')}
Target: ${RN}/src/types/${m.out}
Models: ${m.note}

For EACH Dart class produce:
- a TS \`interface\` with the same fields (Dart camelCase field names kept; nested classes become nested interfaces in the same file).
- a \`parseX(json: any): X\` function mirroring Dart \`fromJson\` EXACTLY (same json keys, same nested parsing, same \`?.toString()\` / list mapping).
- a \`xToJson(x: X): any\` function mirroring \`toJson\` when the Dart class has one.
Use the example at ${RN}/src/types/auth.ts as the exact style to follow.
Do NOT import anything except sibling type files in src/types if a nested model lives elsewhere (e.g. NameModel). Keep it self-contained otherwise.`,
      { label: `model:${m.out}`, phase: 'Models', schema: MODEL_SCHEMA },
    ),
  ),
);

// ---------- Phase 2: Repository → src/data/repository/* ----------
phase('Repository');
const REPO = [
  {
    out: 'auth.ts',
    note: 'Auth + profile + FCM endpoints',
    detail: `Port the AUTH-related methods. Read BOTH:
- ${FL}/data/http_helper.dart (for the exact subUrl, http method, params, body keys, and which model parses the response)
- ${FL}/data/repository.dart (for side-effects: saving token, calling getProfile, updating user)
Include: login, getProfile, getLogoutFromCurrentToken, checkField, checkCompanyUser, getNewCode, verifyCode, checkCodeForResetPassword, changePasswordViaCode, resetPasswordViaEmail, register, updateProfile, requestOtpLogin, verifyOtpLogin, verifyEmail, refreshToken, resendOtp, verifyOtp, requestPasswordReset, resetPassword, logout, saveFcmToken/saveFCMToken, healthCheck, getCompaniesForRegister.
Side-effects (login/register/verifyOtpLogin success): call \`useAuthStore.getState().setToken(token)\` and set user via \`useAuthStore.getState().setUser(parseUser(...))\`, mirroring repository.dart which sets LocalStaticVar.userInfo + saveToken + getProfile.`,
  },
  {
    out: 'catalog.ts',
    note: 'Categories, vendors, branches, subcategories, products, reviews, offers',
    detail: `Port the CATALOG methods from ${FL}/data/http_helper.dart + ${FL}/data/repository.dart.
Include the food-delivery domain: getCategories(paginate), getCategory, getVendors, getPopularVendors, getVendor, getBranches, getNearbyBranches, getPopularBranches, getBranch, getVendorBranches, searchSubcategories, getBranchSubcategories, getSubcategory, getProduct, getBranchProducts, getSubcategoryProducts, getBranchReviews, getBranchReviewStats, getUserReviews, getActiveOffers, getExpiredOffers, getOffer.
For the offline-cache methods in repository.dart (Connectivity + DatabaseCachingHelper): SIMPLIFY — just call the API (skip the connectivity/cache-diff logic) but keep the same return shape (CustomResponse with the parsed model / list / PageEntity). Add a // NOTE comment that offline caching was omitted.
Use parsers from src/types (parseCategory, parseVendor, parseBranch, parseSubcategory, parseProduct, parseReview, parseOffer).`,
  },
  {
    out: 'settings.ts',
    note: 'About/privacy/contact, notifications, tickets, support',
    detail: `Port the SETTINGS/profile methods from ${FL}/data/http_helper.dart + ${FL}/data/repository.dart.
Include: getAboutUs, getPrivacyPolicy, getContactUs, getMyTickets(paginate), submitSupportReport, getTicketDetails, replayToTicket, getNotifications(paginate), readNotifications, getNotificationsNew, getNotificationsByType, markNotificationAsRead.
Use parsers from src/types (parseContentUsModel/parseGlobalText, parseTicketModel, parseNotificationModel) as appropriate.`,
  },
];

const REPO_SCHEMA = {
  type: 'object',
  properties: { file: { type: 'string' }, methods: { type: 'array', items: { type: 'string' } }, summary: { type: 'string' } },
  required: ['file', 'summary'],
};

await parallel(
  REPO.map((rp) => () =>
    agent(
      `${preamble}

TASK: Port repository methods to TypeScript → ${RN}/src/data/repository/${rp.out}
${rp.detail}

Conventions for EVERY method:
- async function returning \`Promise<CustomResponse>\`. import { apiClient, CustomResponse, PageEntity } from '@/lib/api'.
- Use apiClient.getV2 / getPagination / postV2 / post / delete with the SAME subUrl, needToken, query/body, and pass \`fromJson\` = the parseX function from '@/types/...'. (apiClient.getV2 signature: { subUrl, needToken, query, fromJson, isListOfModel }. getPagination: { subUrl, needToken, query, fromJson }. postV2: { subUrl, needToken, data, fromJson, isListOfModel }.)
- For pagination, accept a \`PaginateReqEntity\`-like \`{ page: number; perPage: number; ... }\` arg and build the same query keys (page, per_page, etc.) as the Dart.
- Keep the EXACT subUrl strings and body/query keys from http_helper.dart.
- Export each method as a named export AND collect them in a default object, e.g. \`export const authRepo = { login, register, ... }\`.
- import { useAuthStore } from '@/store/authStore' only in auth.ts if needed.`,
      { label: `repo:${rp.out}`, phase: 'Repository', schema: REPO_SCHEMA },
    ),
  ),
);

// ---------- Phase 3: Controllers → zustand stores ----------
phase('Stores');
const STORES = [
  { out: 'features/auth/authStore.ts', src: ['screens/auth/controllers/auth/auth_controller.dart', 'screens/auth/controllers/auth/auth_state.dart'], repo: 'authRepo', note: 'AuthController: form state (isLoginWithPhone, isLoading, countryCode, etc.) + login/register/verify/reset actions. Calls authRepo + global useAuthStore for token/user.' },
  { out: 'features/home/homeStore.ts', src: ['screens/home/controllers/home_controller.dart', 'screens/home/controllers/home_state.dart'], repo: 'catalogRepo', note: 'HomeController: categories, vendors, offers/banners, branches loading + state. Also saveFCMToken (stub the device-token fetch).' },
  { out: 'features/categories/productStore.ts', src: ['screens/categories/controllers/product_controller.dart', 'screens/categories/controllers/product_state.dart'], repo: 'catalogRepo', note: 'ProductController: products, subcategories, product details, filters, pagination.' },
  { out: 'features/vendor/vendorStore.ts', src: ['screens/vendor/controllers/vendor_controller.dart', 'screens/vendor/controllers/vendor_state.dart'], repo: 'catalogRepo', note: 'VendorController: vendors list, vendor details, vendor branches.' },
  { out: 'features/branches/branchesStore.ts', src: ['screens/branshes/controllers/branshes_controller.dart', 'screens/branshes/controllers/branshes_state.dart'], repo: 'catalogRepo', note: 'BranshesController: nearby/popular branches, location.' },
  { out: 'features/profile/profileStore.ts', src: ['screens/profile_screens/controllers/profile_controller.dart', 'screens/profile_screens/controllers/profile_state.dart'], repo: 'settingsRepo', note: 'ProfileController: profile, notifications, tickets/support, about/privacy/contact, change password.' },
];

const STORE_SCHEMA = {
  type: 'object',
  properties: { file: { type: 'string' }, state: { type: 'array', items: { type: 'string' } }, actions: { type: 'array', items: { type: 'string' } }, summary: { type: 'string' } },
  required: ['file', 'summary'],
};

await parallel(
  STORES.map((st) => () =>
    agent(
      `${preamble}

TASK: Port a GetX controller (+ its state class) to a zustand store → ${RN}/src/${st.out}
Source: ${st.src.map((s) => `${FL}/${s}`).join(', ')}
${st.note}

Rules:
- Use \`import { create } from 'zustand'\`. Create one store with state fields + action methods.
- Each GetX observable (RxInt/RxBool/RxString/Rx<...>/.obs/RxList) becomes a plain store field with the same name + same initial value.
- Each controller method becomes a store action (async where the Dart is async). Preserve the logic and the repository calls.
- Repository: import the repo object from '@/data/repository' (e.g. \`import { repository } from '@/data/repository'\`) and call \`repository.<method>()\`. Methods return CustomResponse: check \`res.success\`, read \`res.object\` and \`res.msg\` exactly like the Dart checks \`res.success\` / \`res.object\` / \`res.msg\`.
- Show messages with \`import { showSnack } from '@/lib/snack'\` where the Dart calls showSnackBarMessage/Get.snackbar.
- Pagination/scroll-listener logic: keep page counters; expose a \`loadMore\`/\`refresh\` action.
- Export \`export const use<Name>Store = create<...>(...)\`. Also export any enums/types the screens need.
- If the controller references device info / FCM / permissions / location native APIs, stub them with a function returning a sensible default and a // TODO comment; keep the surrounding logic.
- The store will be consumed as \`useXStore((s) => s.field)\` and actions via \`useXStore.getState().action()\` or destructured.`,
      { label: `store:${st.out.split('/').pop()}`, phase: 'Stores', schema: STORE_SCHEMA },
    ),
  ),
);

return {
  models: MODELS.length,
  repository: REPO.length,
  stores: STORES.length,
};
