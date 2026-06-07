import React, { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { I18nProvider } from '@/i18n';
import { SnackProvider } from '@/lib/snack';
import { useAuthStore } from '@/store/authStore';
import { useCityStore } from '@/features/location/cityStore';

export function AppProviders({ children }: { children: React.ReactNode }) {
  const hydrate = useAuthStore((s) => s.hydrate);
  const hydrateCity = useCityStore((s) => s.hydrate);
  const [, setReady] = useState(false);

  useEffect(() => {
    // Load the saved city alongside auth so the home knows it on first render.
    hydrateCity();
    hydrate().finally(() => setReady(true));
  }, [hydrate, hydrateCity]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <I18nProvider>
            <SnackProvider>{children}</SnackProvider>
          </I18nProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
