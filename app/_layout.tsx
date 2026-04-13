// app/_layout.tsx
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { setupDailyReminders } from '@/notifications/notificationService';

// Ngăn màn hình splash tự động ẩn trước khi setup xong
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // 1. Kích hoạt hệ thống thông báo 6 bữa/ngày & tập luyện
    setupDailyReminders(); 
    
    // 2. Ẩn màn hình chờ và báo hiệu app đã sẵn sàng
    SplashScreen.hideAsync();
    setIsReady(true);
  }, []);

  if (!isReady) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
    </ThemeProvider>
  );
}