import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ScrollView,
} from "react-native";

import { useState } from "react";

import { Ionicons } from "@expo/vector-icons";

type NotificationType =
  | "all"
  | "booking"
  | "payment"
  | "promotion"
  | "system";

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  time: string;
  isUnread: boolean;
}

const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "booking",
    title: "Booking Confirmed",
    message:
      "Your booking at Downtown Stadium has been confirmed.",
    time: "2m ago",
    isUnread: true,
  },

  {
    id: "2",
    type: "booking",
    title: "Match Reminder",
    message:
      "You have a football match today at 7:00 PM.",
    time: "1h ago",
    isUnread: true,
  },

  {
    id: "3",
    type: "payment",
    title: "Payment Successful",
    message:
      "Your payment of $25 was completed successfully.",
    time: "3h ago",
    isUnread: false,
  },

  {
    id: "4",
    type: "promotion",
    title: "Weekend Special",
    message:
      "Get 20% off for weekend bookings.",
    time: "Yesterday",
    isUnread: false,
  },

  {
    id: "5",
    type: "system",
    title: "System Update",
    message:
      "New version available with improved booking experience.",
    time: "2 days ago",
    isUnread: false,
  },
];

const categories: {
  label: string;
  value: NotificationType;
}[] = [
  { label: "All", value: "all" },
  { label: "Booking", value: "booking" },
  { label: "Payment", value: "payment" },
  { label: "Promotion", value: "promotion" },
  { label: "System", value: "system" },
];

export default function NotificationScreen() {
  const [selectedCategory, setSelectedCategory] =
    useState<NotificationType>("all");

  const [notifications, setNotifications] =
    useState(mockNotifications);

  const filteredNotifications =
    selectedCategory === "all"
      ? notifications
      : notifications.filter(
          (n) => n.type === selectedCategory
        );

  const unreadCount = notifications.filter(
    (n) => n.isUnread
  ).length;

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((n) => ({
        ...n,
        isUnread: false,
      }))
    );
  };

  const handleNotificationClick = (
    id: string
  ) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id
          ? { ...n, isUnread: false }
          : n
      )
    );
  };

  const getNotificationIcon = (
    type: NotificationType
  ) => {
    switch (type) {
      case "booking":
        return "calendar-outline";

      case "payment":
        return "wallet-outline";

      case "promotion":
        return "gift-outline";

      case "system":
        return "settings-outline";

      default:
        return "notifications-outline";
    }
  };

  const getIconColor = (
    type: NotificationType
  ) => {
    switch (type) {
      case "booking":
        return "#22C55E";

      case "payment":
        return "#3B82F6";

      case "promotion":
        return "#F97316";

      case "system":
        return "#6B7280";

      default:
        return "#6B7280";
    }
  };

  const renderNotification = ({
    item,
  }: {
    item: Notification;
  }) => {
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() =>
          handleNotificationClick(item.id)
        }
        style={[
          styles.notificationCard,

          item.isUnread &&
            styles.unreadCard,
        ]}
      >
        {/* ICON */}
        <View
          style={[
            styles.iconContainer,
            {
              backgroundColor:
                item.type === "booking"
                  ? "#DCFCE7"
                  : item.type === "payment"
                  ? "#DBEAFE"
                  : item.type === "promotion"
                  ? "#FFEDD5"
                  : "#F3F4F6",
            },
          ]}
        >
          <Ionicons
            name={
              getNotificationIcon(item.type) as any
            }
            size={24}
            color={getIconColor(item.type)}
          />
        </View>

        {/* CONTENT */}
        <View style={styles.content}>
          <View style={styles.topRow}>
            <Text style={styles.title}>
              {item.title}
            </Text>

            {item.isUnread && (
              <View style={styles.newBadge}>
                <Text style={styles.newText}>
                  NEW
                </Text>
              </View>
            )}
          </View>

          <Text style={styles.message}>
            {item.message}
          </Text>

          <Text style={styles.time}>
            {item.time}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>

      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.screenTitle}>
            Notifications
          </Text>

          <Text style={styles.subtitle}>
            Stay updated with your bookings
          </Text>
        </View>

        {unreadCount > 0 && (
          <TouchableOpacity
            style={styles.readAllButton}
            onPress={markAllAsRead}
          >
            <Ionicons
              name="checkmark-done-outline"
              size={18}
              color="#fff"
            />

            <Text style={styles.readAllText}>
              Read all
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* CATEGORIES */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={
          styles.categoryContainer
        }
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category.value}
            style={[
              styles.categoryButton,

              selectedCategory ===
                category.value &&
                styles.activeCategoryButton,
            ]}
            onPress={() =>
              setSelectedCategory(
                category.value
              )
            }
          >
            <Text
              style={[
                styles.categoryText,

                selectedCategory ===
                  category.value &&
                  styles.activeCategoryText,
              ]}
            >
              {category.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* LIST */}
      <FlatList
        data={filteredNotifications}
        keyExtractor={(item) => item.id}
        renderItem={renderNotification}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 30,
        }}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Ionicons
              name="notifications-outline"
              size={70}
              color="#D1D5DB"
            />

            <Text style={styles.emptyTitle}>
              No notifications yet
            </Text>

            <Text style={styles.emptyText}>
              Booking and payment updates
              will appear here
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FB",
    paddingHorizontal: 16,
    paddingTop: 10,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },

  screenTitle: {
    fontSize: 30,
    fontWeight: "700",
    color: "#111827",
  },

  subtitle: {
    color: "#6B7280",
    marginTop: 4,
  },

  readAllButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#22C55E",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
  },

  readAllText: {
    color: "#fff",
    fontWeight: "600",
  },

  categoryContainer: {
    gap: 10,
    paddingBottom: 20,
  },

  categoryButton: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
  },

  activeCategoryButton: {
    backgroundColor: "#22C55E",
  },

  categoryText: {
    color: "#6B7280",
    fontWeight: "600",
  },

  activeCategoryText: {
    color: "#FFFFFF",
  },

  notificationCard: {
    flexDirection: "row",
    gap: 14,
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 20,
    marginBottom: 14,

    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4,
    },

    elevation: 2,
  },

  unreadCard: {
    backgroundColor: "#F0FDF4",
  },

  iconContainer: {
    width: 54,
    height: 54,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },

  content: {
    flex: 1,
  },

  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },

  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    flex: 1,
    marginRight: 10,
  },

  newBadge: {
    backgroundColor: "#22C55E",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },

  newText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
  },

  message: {
    color: "#6B7280",
    lineHeight: 20,
    marginBottom: 8,
  },

  time: {
    color: "#9CA3AF",
    fontSize: 12,
  },

  emptyBox: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 120,
    paddingHorizontal: 30,
  },

  emptyTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginTop: 20,
    color: "#111827",
  },

  emptyText: {
    textAlign: "center",
    color: "#6B7280",
    marginTop: 10,
    lineHeight: 22,
  },
});