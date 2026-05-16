import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "@/src/store/auth.store";

export default function OwnerLayout() {
  const { darkMode } = useAuthStore();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: darkMode ? "#1F2937" : "#fff",
          borderTopColor: darkMode ? "#374151" : "#E2E8F0",
          height: 65,
          paddingBottom: 10,
        },
        tabBarActiveTintColor: "#22C55E",
        tabBarInactiveTintColor: darkMode ? "#9CA3AF" : "#64748B",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Tổng quan",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="stats-chart" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="fields"
        options={{
          title: "Sân của tôi",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="football" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="bookings"
        options={{
          title: "Đặt sân",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
