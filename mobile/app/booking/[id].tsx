import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";

import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Calendar } from "react-native-calendars";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

const TIME_SLOTS = [
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
  "20:00",
];

const HOURLY_RATE = 50;

export default function BookingScreen() {
  const { id } = useLocalSearchParams<{
    id: string;
  }>();

  const [selectedDate, setSelectedDate] = useState("");

  const [selectedTime, setSelectedTime] =
    useState("");

  const [duration, setDuration] =
    useState(1);

  const dates = [
    "Today",
    "Tomorrow",
    "May 12",
    "May 13",
    "May 14",
  ];

  const calculateTotal = () => {
    return HOURLY_RATE * duration;
  };

  const handleConfirmBooking = () => {
    if (!selectedTime) return;

    Alert.alert(
      "Booking Confirmed",
      `Field booked successfully!

Date: ${selectedDate}
Time: ${selectedTime}
Duration: ${duration} hour(s)

Total: $${calculateTotal()}`
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 120,
        }}
      >
      <SafeAreaView style={styles.container}>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity
                style={styles.backButton}
                onPress={() => router.back()}
              >
                <Ionicons
                  name="chevron-back"
                  size={24}
                  color="#111827"
                />
              </TouchableOpacity>

              <Text style={styles.headerTitle}>
                Book Field
              </Text>

              {/* spacer */}
              <View style={{ width: 40 }} />
            </View>
          <Text style={styles.title}>
            Book Your Field
          </Text>

          <Text style={styles.subtitle}>
            Select your preferred date and
            time
          </Text>
        </SafeAreaView>

        {/* FIELD INFO */}
        <View style={styles.fieldCard}>
          <Image
            source={{
              uri: "https://images.unsplash.com/photo-1641029185333-7ed62a19d5f0",
            }}
            style={styles.fieldImage}
          />

          <View style={styles.fieldInfo}>
            <Text style={styles.fieldName}>
              Stadium Field A
            </Text>

            <View style={styles.ratingRow}>
              <Ionicons
                name="star"
                size={16}
                color="#FACC15"
              />

              <Text style={styles.rating}>
                4.8
              </Text>

              <Text style={styles.review}>
                (234 reviews)
              </Text>
            </View>

            <View style={styles.locationRow}>
              <Ionicons
                name="location-outline"
                size={15}
                color="#6B7280"
              />

              <Text style={styles.location}>
                Downtown Sports Complex
              </Text>
            </View>
          </View>
        </View>

        {/* DATE */}
        <View style={styles.calendarContainer}>
          <Text style={styles.sectionTitle}>Select Date</Text>

          <Calendar
            onDayPress={(day) => {
              setSelectedDate(day.dateString);
            }}
            markedDates={{
              [selectedDate]: {
                selected: true,
                selectedColor: "#22C55E",
              },
            }}
            minDate={new Date().toISOString().split("T")[0]}
            enableSwipeMonths
            theme={{
              todayTextColor: "#22C55E",
              arrowColor: "#22C55E",
              selectedDayBackgroundColor: "#22C55E",
              selectedDayTextColor: "#fff",
              textDayFontWeight: "500",
              textMonthFontWeight: "bold",
              textDayHeaderFontWeight: "600",
            }}
          />
        </View>

        {/* TIME SLOT */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Ionicons
              name="time-outline"
              size={20}
              color="#111827"
            />

            <Text style={styles.cardTitle}>
              Select Time Slot
            </Text>
          </View>

          <View style={styles.timeGrid}>
            {TIME_SLOTS.map((slot) => (
              <TouchableOpacity
                key={slot}
                style={[
                  styles.timeButton,
                  selectedTime === slot &&
                    styles.timeButtonActive,
                ]}
                onPress={() =>
                  setSelectedTime(slot)
                }
              >
                <Text
                  style={[
                    styles.timeText,
                    selectedTime === slot &&
                      styles.timeTextActive,
                  ]}
                >
                  {slot}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* DURATION */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            Duration (hours)
          </Text>

          <View style={styles.durationRow}>
            {[1, 2, 3, 4].map((hour) => (
              <TouchableOpacity
                key={hour}
                style={[
                  styles.durationButton,
                  duration === hour &&
                    styles.durationButtonActive,
                ]}
                onPress={() =>
                  setDuration(hour)
                }
              >
                <Text
                  style={[
                    styles.durationText,
                    duration === hour &&
                      styles.durationTextActive,
                  ]}
                >
                  {hour}h
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* PRICE SUMMARY */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            Price Summary
          </Text>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>
              Hourly Rate
            </Text>

            <Text style={styles.summaryValue}>
              ${HOURLY_RATE}/hour
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>
              Duration
            </Text>

            <Text style={styles.summaryValue}>
              {duration} hour
              {duration > 1 ? "s" : ""}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>
              Total Price
            </Text>

            <Text style={styles.totalPrice}>
              ${calculateTotal()}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* BOTTOM BUTTON */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          disabled={!selectedTime}
          style={[
            styles.confirmButton,
            !selectedTime && {
              backgroundColor: "#9CA3AF",
            },
          ]}
          onPress={handleConfirmBooking}
        >
          <Text style={styles.confirmText}>
            Confirm Booking - $
            {calculateTotal()}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },

  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    marginBottom: 20,
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 6,
  },

  subtitle: {
    color: "#6B7280",
    fontSize: 15,
  },

  fieldCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 20,
  },

  fieldImage: {
    width: 120,
    height: 110,
  },

  fieldInfo: {
    flex: 1,
    padding: 14,
    justifyContent: "center",
  },

  fieldName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
  },

  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 8,
  },

  rating: {
    fontWeight: "700",
    color: "#111827",
  },

  review: {
    color: "#6B7280",
    fontSize: 13,
  },

  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  location: {
    color: "#6B7280",
    fontSize: 13,
  },

  card: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 18,
    marginBottom: 20,
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 18,
  },

  calendarContainer: {
      backgroundColor: "#fff",
      borderRadius: 20,
      padding: 10,
      marginBottom: 20,
    },

    sectionTitle: {
      fontSize: 18,
      fontWeight: "700",
      marginBottom: 12,
      color: "#111827",
    },

  dateRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
  },

  dateButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#F3F4F6",
    borderRadius: 14,
  },

  dateButtonActive: {
    backgroundColor: "#2563EB",
  },

  dateText: {
    color: "#374151",
    fontWeight: "600",
  },

  dateTextActive: {
    color: "#FFFFFF",
  },

  timeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },

  timeButton: {
    width: "22%",
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    alignItems: "center",
  },

  timeButtonActive: {
    backgroundColor: "#2563EB",
    borderColor: "#2563EB",
  },

  timeText: {
    color: "#374151",
    fontWeight: "600",
  },

  timeTextActive: {
    color: "#FFFFFF",
  },

  durationRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 18,
  },

  durationButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    alignItems: "center",
  },

  durationButtonActive: {
    backgroundColor: "#2563EB",
    borderColor: "#2563EB",
  },

  durationText: {
    fontWeight: "700",
    color: "#374151",
  },

  durationTextActive: {
    color: "#FFFFFF",
  },

  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
  },

  summaryLabel: {
    color: "#6B7280",
    fontSize: 15,
  },

  summaryValue: {
    color: "#111827",
    fontWeight: "600",
  },

  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 14,
  },

  totalLabel: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },

  totalPrice: {
    fontSize: 24,
    fontWeight: "700",
    color: "#22C55E",
  },

  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },

  confirmButton: {
    backgroundColor: "#2563EB",
    height: 58,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },

  confirmText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
  },
});
