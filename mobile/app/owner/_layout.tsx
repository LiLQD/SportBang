import { Stack } from "expo-router";

export default function OwnerRootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="notifications" options={{ presentation: 'modal', title: 'Thông báo' }} />
      <Stack.Screen name="field-detail/[id]" options={{ title: 'Chi tiết sân' }} />
      <Stack.Screen name="booking-detail/[id]" options={{ title: 'Chi tiết đơn đặt' }} />
      <Stack.Screen name="edit-field/[id]" options={{ title: 'Chỉnh sửa sân' }} />
    </Stack>
  );
}
