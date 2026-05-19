import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "@/src/store/auth.store";

export default function UserLayout() {
  const { darkMode } = useAuthStore();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,

        tabBarActiveTintColor: "#22C55E",
        tabBarInactiveTintColor: "#9CA3AF",

        tabBarStyle: {
          height: 70,
          paddingBottom: 8,
          paddingTop: 8,
          backgroundColor: darkMode ? "#1F2937" : "#fff",
          borderTopColor: darkMode ? "#374151" : "#E5E7EB",
        },
      }}
    >

      {/* HOME */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",

          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="home"
              size={size}
              color={color}
            />
          ),
        }}
      />

      {/* BOOKINGS */}
      <Tabs.Screen
        name="bookings"
        options={{
          title: "Đơn đặt",

          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="calendar"
              size={size}
              color={color}
            />
          ),
        }}
      />

      {/* NOTIFICATIONS */}
      <Tabs.Screen
        name="notifications"
        options={{
          title: "Thông báo",

          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="notifications"
              size={size}
              color={color}
            />
          ),
        }}
      />

      {/* PROFILE */}
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",

          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="person"
              size={size}
              color={color}
            />
          ),
        }}
      />

      {/* HIDE THESE FROM TABS */}
      <Tabs.Screen
        name="favorites"
        options={{
          href: null,
        }}
      />

    </Tabs>
  );
}