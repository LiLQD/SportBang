import { Stack } from "expo-router";
import { Provider as PaperProvider } from "react-native-paper";
import { useAuthStore } from "@/src/store/auth.store";
import { useEffect, useState } from "react";
import { useRouter, useSegments } from "expo-router";
import { View, ActivityIndicator, StyleSheet, Platform } from "react-native";

export default function RootLayout() {
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);

  const segments = useSegments();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Logic điều hướng tập trung
  useEffect(() => {
    if (!isHydrated || !isMounted) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!token) {
      // Nếu không có token -> Bắt buộc về Login (nếu đang không ở đó)
      if (!inAuthGroup) {
        router.replace("/(auth)/login");
      }
    } else if (inAuthGroup) {
      // Nếu đã có token mà lỡ vào vùng auth -> Đẩy ra dashboard tương ứng
      const role = user?.role || "customer";
      if (role === "admin") router.replace("/(admin)/dashboard");
      else if (role === "owner") router.replace("/owner/");
      else router.replace("/(user)/");
    }
  }, [token, isHydrated, isMounted, segments]);

  // Không render gì khi chưa Hydrate để tránh nháy màn hình/sai lệch điều hướng
  if (!isHydrated || !isMounted) {
    return (
      <View style={styles.fullLoading}>
        <ActivityIndicator size="large" color="#22C55E" />
      </View>
    );
  }

  return (
    <PaperProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(user)" />
        <Stack.Screen name="(admin)" />
        <Stack.Screen name="owner" />
      </Stack>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  fullLoading: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
});
