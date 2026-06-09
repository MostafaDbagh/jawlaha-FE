// Ported from screens/home/main_screens.dart (MainScreens bottom navigation)
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppColors, sp } from '@/theme';
import { t } from '@/i18n';
import { usePushRegistration } from '@/features/push/usePushRegistration';

export default function TabsLayout() {
  // User is authenticated by the time the tabs render — register for push
  // notifications and wire up tap/foreground handling here.
  usePushRegistration();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: AppColors.primaryColorTheme,
        tabBarInactiveTintColor: AppColors.lightGray,
        tabBarStyle: { backgroundColor: AppColors.white },
        tabBarLabelStyle: { fontSize: sp(12) },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('home'),
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: t('orders'),
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'receipt' : 'receipt-outline'} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('account'),
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'person' : 'person-outline'} size={24} color={color} />
          ),
        }}
      />
      {/* Cart route stays reachable (home/checkout link to it) but is hidden from the tab bar. */}
      <Tabs.Screen name="cart" options={{ href: null }} />
    </Tabs>
  );
}
