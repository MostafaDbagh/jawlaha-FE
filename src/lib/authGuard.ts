// Guest-mode gate. The app lets people browse without an account (see the
// splash routing in app/index.tsx); sign-in is only required for actions that
// belong to a real account — placing an order, opening settings, etc.
// Call this before such an action: it returns true when the user is signed in,
// otherwise it nudges them to /login and returns false so the caller bails.
import type { useRouter } from 'expo-router';

import { useAuthStore } from '@/store/authStore';
import { showSnack } from '@/lib/snack';
import { t } from '@/i18n';

type Router = ReturnType<typeof useRouter>;

export function requireAuth(router: Router): boolean {
  if (useAuthStore.getState().isLoggedIn) return true;
  showSnack(t('login_required_guest'), 'info');
  router.push('/login');
  return false;
}
