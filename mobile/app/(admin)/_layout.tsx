import { Stack } from "expo-router";

export default function Layout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#16a34a" },
        headerTintColor: "#fff",
        headerTitleStyle: { fontWeight: "bold" },
      }}
    >
      <Stack.Screen name="dashboard" options={{ headerShown: false }} />
      <Stack.Screen name="users" options={{ title: "Quản lý Người dùng" }} />
      <Stack.Screen name="fields" options={{ title: "Quản lý Sân bóng" }} />
      <Stack.Screen name="bookings" options={{ title: "Quản lý Đơn đặt" }} />
    </Stack>
  );
}
