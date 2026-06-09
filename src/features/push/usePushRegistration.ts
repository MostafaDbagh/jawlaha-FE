// Drives the device side of FCM for the customer app:
//   1. once signed in, asks permission, fetches the FCM token, and registers it
//      with the backend (plus re-registers on token rotation);
//   2. shows foreground messages in the in-app snackbar;
//   3. routes notification taps (from background or a cold start) to the related
//      order, or the Orders tab when no order is referenced.
// Everything is a no-op when push isn't supported (Expo Go / web), so this hook
// is always safe to mount.
import { useEffect, useRef } from 'react';
import { useRouter } from 'expo-router';

import { useAuthStore } from '@/store/authStore';
import { showSnack } from '@/lib/snack';
import { navArgs } from '@/store/navArgs';
import { repository } from '@/data/repository';
import { collectDeviceArgs } from '@/lib/push/deviceInfo';
import {
  isPushSupported,
  requestPushPermission,
  getFcmToken,
  onTokenRefresh,
  onForegroundMessage,
  onNotificationOpened,
  getInitialNotification,
} from '@/lib/push/messaging';

type Router = ReturnType<typeof useRouter>;

async function register(token: string) {
  await repository.saveFCMToken({ firebaseToken: token, ...collectDeviceArgs() });
}

// Order notifications carry an order_id → open that order's details; otherwise
// fall back to the Orders tab.
function routeForData(router: Router, data: Record<string, any> | undefined) {
  const orderId = data?.order_id;
  if (orderId) {
    navArgs.set({ orderId });
    router.navigate('/order-details' as any);
  } else {
    router.navigate('/(tabs)/orders' as any);
  }
}

export function usePushRegistration() {
  const router = useRouter();
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const lastToken = useRef<string | null>(null);

  // (1) Register the token whenever there's an active session.
  useEffect(() => {
    if (!isLoggedIn || !isPushSupported()) return;
    let cancelled = false;

    (async () => {
      const granted = await requestPushPermission();
      if (cancelled || !granted) return;
      const token = await getFcmToken();
      if (cancelled || !token) return;
      lastToken.current = token;
      await register(token);
    })();

    const unsubscribe = onTokenRefresh(async (token) => {
      if (!token || token === lastToken.current) return;
      lastToken.current = token;
      await register(token);
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [isLoggedIn]);

  // (2) Foreground messages → snackbar.
  useEffect(() => {
    if (!isPushSupported()) return;
    return onForegroundMessage((msg) => {
      const n = msg?.notification;
      const text = [n?.title, n?.body].filter(Boolean).join(' — ');
      if (text) showSnack(text, 'info');
    });
  }, []);

  // (3) Notification taps (background tap + cold-start) → navigate.
  useEffect(() => {
    if (!isPushSupported()) return;
    const unsubscribe = onNotificationOpened((msg) => routeForData(router, msg?.data));
    (async () => {
      const initial = await getInitialNotification();
      if (initial) routeForData(router, initial.data);
    })();
    return unsubscribe;
  }, [router]);
}
