import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
} from "react-native";

import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";

interface Booking {
  id: string;
  fieldName: string;
  date: string;
  time: string;
  imageUrl: string;
}

const mockBookings: Booking[] = [
  {
    id: "1",
    fieldName: "Downtown Soccer Field A",
    date: "2026-05-10",
    time: "14:00 - 16:00",
    imageUrl:
      "https://images.unsplash.com/photo-1459865264687-595d652de67e?w=400&h=250&fit=crop",
  },

  {
    id: "2",
    fieldName: "Riverside Basketball Court",
    date: "2026-05-12",
    time: "18:00 - 20:00",
    imageUrl:
      "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400&h=250&fit=crop",
  },

  {
    id: "3",
    fieldName: "Central Tennis Court 3",
    date: "2026-05-15",
    time: "10:00 - 12:00",
    imageUrl:
      "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=400&h=250&fit=crop",
  },

  {
    id: "4",
    fieldName: "Northside Volleyball Court",
    date: "2026-05-18",
    time: "16:00 - 18:00",
    imageUrl:
      "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=400&h=250&fit=crop",
  },
];

export default function BookingScreen() {
  const [bookings, setBookings] =
    useState<Booking[]>(mockBookings);

  const handleCancelBooking = (id: string) => {
    setBookings((prev) =>
      prev.filter((booking) => booking.id !== id)
    );
  };

  const renderBooking = ({
    item,
  }: {
    item: Booking;
  }) => {
    return (
      <View style={styles.card}>

        {/* IMAGE */}
        <Image
          source={{ uri: item.imageUrl }}
          style={styles.image}
        />

        {/* CONTENT */}
        <View style={styles.contentContainer}>

          <View style={{ flex: 1 }}>
            <Text style={styles.fieldName}>
              {item.fieldName}
            </Text>

            {/* DATE */}
            <View style={styles.infoRow}>
              <Ionicons
                name="calendar-outline"
                size={18}
                color="#6B7280"
              />

              <Text style={styles.infoText}>
                {new Date(item.date).toDateString()}
              </Text>
            </View>

            {/* TIME */}
            <View style={styles.infoRow}>
              <Ionicons
                name="time-outline"
                size={18}
                color="#6B7280"
              />

              <Text style={styles.infoText}>
                {item.time}
              </Text>
            </View>

            {/* STATUS */}
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                Upcoming
              </Text>
            </View>
          </View>

          {/* BUTTON */}
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() =>
              handleCancelBooking(item.id)
            }
          >
            <Text style={styles.cancelText}>
              Cancel Booking
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>

      <Text style={styles.title}>
        Upcoming Bookings
      </Text>

      <FlatList
        data={bookings}
        keyExtractor={(item) => item.id}
        renderItem={renderBooking}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 20,
        }}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>
              No upcoming bookings
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
    backgroundColor: "#F9FAFB",
    padding: 16,
  },

  title: {
    fontSize: 30,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 24,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    overflow: "hidden",
    marginBottom: 18,

    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4,
    },

    elevation: 3,
  },

  image: {
    width: "100%",
    height: 190,
  },

  contentContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    gap: 14,
  },

  fieldName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 14,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },

  infoText: {
    color: "#6B7280",
    fontSize: 14,
  },

  badge: {
    alignSelf: "flex-start",
    backgroundColor: "#DBEAFE",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    marginTop: 8,
  },

  badgeText: {
    color: "#2563EB",
    fontWeight: "600",
  },

  cancelButton: {
    borderWidth: 1,
    borderColor: "#FCA5A5",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    alignSelf: "flex-start",
  },

  cancelText: {
    color: "#DC2626",
    fontWeight: "600",
    fontSize: 13,
  },

  emptyBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 40,
    alignItems: "center",
  },

  emptyText: {
    color: "#9CA3AF",
    fontSize: 16,
  },
});