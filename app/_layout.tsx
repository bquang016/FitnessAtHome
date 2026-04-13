// app/_layout.tsx
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useRef } from 'react';
import 'react-native-reanimated';
import { useRouter, useSegments } from 'expo-router';
import { useAppStore } from '@/store/useAppStore';
import dayjs from 'dayjs';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { setupDailyReminders } from '@/notifications/notificationService';

// Ngăn màn hình splash tự động ẩn trước khi setup xong
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const segments = useSegments();
  const { isInitialized, initializeForDay, userProfile } = useAppStore();
  const hasNavigated = useRef(false);

  useEffect(() => {
    // Khởi tạo notifications (không chặn UI)
    setupDailyReminders().catch(() => {}); 
    // Tải dữ liệu Firebase (chạy ngầm, không chặn render)
    initializeForDay(dayjs().format('YYYY-MM-DD'));
    // Ẩn splash ngay sau 500ms bất kể Firebase xong chưa
    const timer = setTimeout(() => {
      SplashScreen.hideAsync().catch(() => {});
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Routing guard: chỉ chạy 1 lần khi isInitialized chuyển từ false → true
  useEffect(() => {
    if (!isInitialized || hasNavigated.current) return;
    hasNavigated.current = true;

    SplashScreen.hideAsync().catch(() => {});

    const inTabsGroup = segments[0] === '(tabs)' || !segments[0];
    
    if (!userProfile && inTabsGroup) {
      router.replace('/onboarding');
    } else if (userProfile && segments[0] === 'onboarding') {
      router.replace('/(tabs)');
    }
  }, [isInitialized, userProfile]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false, gestureEnabled: false }} />
      </Stack>
    </ThemeProvider>
  );
}