import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useState } from "react";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const TIME_SLOTS = [
  "08:00", "10:00", "12:00",
  "14:00", "16:00", "18:00", "20:00"
];

const DURATIONS = [1, 2, 3, 4];
const PRICE_PER_HOUR = 50;

export default function BookingScreen() {
  const { id } = useLocalSearchParams();

  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [duration, setDuration] = useState(1);

  const total = PRICE_PER_HOUR * duration;

  const canBook = selectedTime !== null;

  return (
    <ScrollView style={styles.container}>

      {/* FIELD INFO */}
      <View style={styles.card}>
        <Text style={styles.fieldName}>Field #{id}</Text>
        <View style={styles.row}>
          <Ionicons name="location-outline" size={16} />
          <Text>Downtown Stadium</Text>
        </View>
      </View>

      {/* TIME SLOT */}
      <Text style={styles.title}>Select Time</Text>

      <View style={styles.wrap}>
        {TIME_SLOTS.map((slot) => (
          <TouchableOpacity
            key={slot}
            onPress={() => setSelectedTime(slot)}
            style={[
              styles.slot,
              selectedTime === slot && styles.slotActive,
            ]}
          >
            <Text
              style={
                selectedTime === slot
                  ? styles.slotTextActive
                  : styles.slotText
              }
            >
              {slot}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* DURATION */}
      <Text style={styles.title}>Duration</Text>

      <View style={styles.wrap}>
        {DURATIONS.map((d) => (
          <TouchableOpacity
            key={d}
            onPress={() => setDuration(d)}
            style={[
              styles.slot,
              duration === d && styles.slotActive,
            ]}
          >
            <Text
              style={
                duration === d
                  ? styles.slotTextActive
                  : styles.slotText
              }
            >
              {d}h
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* PRICE */}
      <View style={styles.summary}>
        <Text style={styles.summaryText}>
          Price: {PRICE_PER_HOUR}$ x {duration}h
        </Text>

        <Text style={styles.total}>
          Total: {total}$
        </Text>
      </View>

      {/* BUTTON */}
      <TouchableOpacity
        disabled={!canBook}
        style={[
          styles.button,
          !canBook && { backgroundColor: "#ccc" },
        ]}
        onPress={() =>
          router.push({
            pathname: "/(user)/payment",
            params: {
              time: selectedTime,
              duration,
              total,
            },
          })
        }
      >
        <Text style={styles.buttonText}>
          {canBook ? "Continue to Payment" : "Select time"}
        </Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },

  card: {
    backgroundColor: "#f5f5f5",
    padding: 16,
    borderRadius: 10,
    marginBottom: 20,
  },

  fieldName: { fontSize: 18, fontWeight: "bold" },

  row: { flexDirection: "row", gap: 5, marginTop: 5 },

  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },

  wrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 20,
  },

  slot: {
    borderWidth: 1,
    borderColor: "#ccc",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },

  slotActive: {
    backgroundColor: "#007bff",
    borderColor: "#007bff",
  },

  slotText: { color: "#333" },
  slotTextActive: { color: "#fff" },

  summary: {
    backgroundColor: "#f0f8ff",
    padding: 16,
    borderRadius: 10,
    marginBottom: 20,
  },

  summaryText: { color: "#333" },

  total: {
    marginTop: 5,
    fontSize: 18,
    fontWeight: "bold",
    color: "green",
  },

  button: {
    backgroundColor: "#007bff",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
  },

  buttonText: { color: "#fff", fontWeight: "bold" },
});