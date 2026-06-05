// Asset registry — mirrors lib/res.dart (Res).
// Each entry is a static require() so Metro bundles it. Render with expo-image
// (supports both PNG and SVG sources).

export const Res = {
  // general images
  mainLogoJawlah: require('@/assets/images/general/main-logo-jawlah.svg'),

  // auth images
  loginLogo: require('@/assets/images/auth/login-logo.svg'),
  onboardin1: require('@/assets/images/auth/onboardin-1.png'),
  onboardin2: require('@/assets/images/auth/onboardin-2.png'),
  onboardin3: require('@/assets/images/auth/onboardin-3.png'),

  // home images
  profileBackgroundImage: require('@/assets/images/home/profile-background-image.png'),

  // auth icons
  profileIcon: require('@/assets/icons/auth/profile.svg'),
  emailIcon: require('@/assets/icons/auth/email-icon.svg'),
  cakeIcon: require('@/assets/icons/auth/cake-icon.svg'),
  lockIcon: require('@/assets/icons/auth/lock-icon.svg'),
  googleIcon: require('@/assets/icons/auth/google-icon.svg'),
  facebookIcon: require('@/assets/icons/auth/facebook-icon.svg'),
  appleIcon: require('@/assets/icons/auth/apple-icon.svg'),
  authLogo: require('@/assets/icons/auth/auth-logo.svg'),
  genderIcon: require('@/assets/icons/auth/gender-icon.svg'),

  // general icons
  locationIcon: require('@/assets/icons/general/location-icon.svg'),
  searchIcon: require('@/assets/icons/general/search-normal.svg'),
  closeCircleIcon: require('@/assets/icons/general/close-circle-icon.svg'),
} as const;

export type ResKey = keyof typeof Res;
