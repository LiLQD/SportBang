import { Stack } from "expo-router";
import { Provider as PaperProvider } from "react-native-paper";
import { useAuthStore } from "@/src/store/auth.store";
import { useEffect, useState } from "react";
import { useRouter, useSegments, useRootNavigationState } from "expo-router";
import { View, ActivityIndicator, StyleSheet, Text, Platform } from "react-native";

export default function RootLayout() {
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);

  const segments = useSegments();
  const router = useRouter();
  const rootNavigationState = useRootNavigationState();

  const [isMounted, setIsMounted] = useState(false);
  const [isReady, setIsReady] = useState(false);

  // Bước 1: Đánh dấu đã Mount để tránh lỗi Hydration của React 19
  useEffect(() => {
    setIsMounted(true);
    console.log("[RootLayout] App Mounted");
  }, []);

  // Bước 2: Kiểm tra sẵn sàng (Hydration + Navigation)
  useEffect(() => {
    if (!isMounted || !isHydrated) return;

    // Trên Web, đôi khi navigationState.key bị null, ta bỏ qua check này để vào app luôn
    const isNavReady = Platform.OS === 'web' ? true : !!rootNavigationState?.key;

    if (isNavReady) {
      console.log("[RootLayout] System Ready");
      setIsReady(true);
    }
  }, [isMounted, isHydrated, rootNavigationState?.key]);

  // Bước 3: Logic điều hướng (Chỉ chạy khi đã sẵn sàng)
  useEffect(() => {
    if (!isReady || !isMounted) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!token) {
      if (!inAuthGroup) {
        router.replace("/(auth)/login");
      }
    } else if (user && inAuthGroup) {
      const role = user.role || 'user';
      if (role === 'admin') router.replace("/(admin)/dashboard");
      else if (role === 'owner') router.replace("/owner/");
      else router.replace("/(user)/");
    }
  }, [token, user, segments, isReady, isMounted]);

  // Nếu chưa mounted thì không render gì cả (Tránh lỗi React 19 Hydration)
  if (!isMounted) return null;

  return (
    <PaperProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(user)" />
        <Stack.Screen name="(admin)" />
        <Stack.Screen name="owner" />
      </Stack>

      {!isReady && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#22C55E" />
          <Text style={styles.loadingText}>Đang khởi tạo hệ thống...</Text>
        </View>
      )}
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 99999,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500'
  }
});
