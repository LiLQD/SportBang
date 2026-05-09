import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function UserLayout() {
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
          backgroundColor: "#fff",
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

      {/* BOOKING */}
      <Tabs.Screen
        name="booking"
        options={{
          title: "Booking",

          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="calendar"
              size={size}
              color={color}
            />
          ),
        }}
      />

      {/* NOTIFICATION */}
      <Tabs.Screen
        name="notification"
        options={{
          title: "Notification",

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

    </Tabs>
  );
}