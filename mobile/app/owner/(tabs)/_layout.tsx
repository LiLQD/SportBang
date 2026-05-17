import { Tabs, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity, Platform, Alert } from "react-native";
import { useAuthStore } from "@/src/store/auth.store";

export default function OwnerTabsLayout() {
  const { darkMode } = useAuthStore();
  const router = useRouter();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: darkMode ? "#1F2937" : "#fff",
          borderTopColor: darkMode ? "#374151" : "#E2E8F0",
          height: Platform.OS === 'ios' ? 85 : 65,
          paddingBottom: Platform.OS === 'ios' ? 30 : 10,
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
            <Ionicons name="grid-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="fields"
        options={{
          title: "Sân bóng",
          headerShown: true,
          headerTitle: "Sân bóng của tôi",
          headerStyle: { backgroundColor: "#22C55E" },
          headerTintColor: "#fff",
          headerRight: () => (
            <TouchableOpacity
              onPress={() => {
                console.log("Header Add Button Pressed");
                router.push("/owner/add-field");
              }}
              style={{ padding: 10, marginRight: 5 }}
              hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
            >
              <Ionicons name="add" size={28} color="#fff" />
            </TouchableOpacity>
          ),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="football-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="bookings"
        options={{
          title: "Đơn đặt",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="revenue"
        options={{
          title: "Doanh thu",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bar-chart-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Cá nhân",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
