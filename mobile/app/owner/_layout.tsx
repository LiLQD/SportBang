import { Stack } from "expo-router";

export default function OwnerRootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Tab bar chính */}
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

      {/* Các màn hình phụ nằm ngoài Tab Bar */}
      <Stack.Screen
        name="add-field"
        options={{
          headerShown: true,
          title: 'Thêm sân bóng mới',
          headerBackTitle: 'Quay lại'
        }}
      />
      <Stack.Screen
        name="notifications"
        options={{
          headerShown: true,
          title: 'Thông báo',
          presentation: 'modal'
        }}
      />
      <Stack.Screen
        name="field-detail/[id]"
        options={{ headerShown: true, title: 'Chi tiết sân' }}
      />
      <Stack.Screen
        name="edit-field/[id]"
        options={{ headerShown: true, title: 'Chỉnh sửa sân' }}
      />
      <Stack.Screen
        name="booking-detail/[id]"
        options={{ headerShown: true, title: 'Chi tiết đơn đặt' }}
      />
    </Stack>
  );
}
