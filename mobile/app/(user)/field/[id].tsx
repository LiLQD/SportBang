import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

export default function FieldDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const fieldImages = [
    "https://images.unsplash.com/photo-1716745559715-282bb61e3012",
    "https://images.unsplash.com/photo-1760384702320-a7409c8b4f37",
    "https://images.unsplash.com/photo-1758535013088-20f84ac4c645",
  ];

  const timeSlots = [
    "08:00",
    "10:00",
    "12:00",
    "14:00",
    "16:00",
    "18:00",
    "20:00",
  ];

  const amenities = [
    { icon: "wifi", label: "WiFi" },
    { icon: "car", label: "Parking" },
    { icon: "restaurant", label: "Cafe" },
    { icon: "shield-checkmark", label: "Security" },
    { icon: "people", label: "Rooms" },
    { icon: "time", label: "Lights" },
  ];

  const handleBooking = () => {
    if (!selectedTime) return;

    router.push({
      pathname: "/(user)/booking",
      params: { id, time: selectedTime },
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* IMAGE CAROUSEL */}
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
        >
          {fieldImages.map((img, index) => (
            <Image key={index} source={{ uri: img }} style={styles.image} />
          ))}
        </ScrollView>

        {/* CONTENT */}
        <View style={styles.content}>
          {/* NAME + RATING */}
          <Text style={styles.title}>Champions Arena</Text>

          <View style={styles.row}>
            <Ionicons name="star" size={18} color="gold" />
            <Text style={styles.rating}>4.8</Text>
            <Text style={styles.review}>(234 reviews)</Text>
          </View>

          {/* ADDRESS */}
          <View style={styles.addressRow}>
            <Ionicons name="location-outline" size={18} />
            <Text style={styles.address}>
              123 Stadium Avenue, Downtown
            </Text>
          </View>

          {/* PRICE */}
          <Text style={styles.price}>45$ / hour</Text>

          {/* TIME SLOT */}
          <Text style={styles.section}>Available Time</Text>

          <View style={styles.timeContainer}>
            {timeSlots.map((slot) => (
              <TouchableOpacity
                key={slot}
                onPress={() => setSelectedTime(slot)}
                style={[
                  styles.timeSlot,
                  selectedTime === slot && styles.timeSlotActive,
                ]}
              >
                <Text
                  style={
                    selectedTime === slot
                      ? styles.timeTextActive
                      : styles.timeText
                  }
                >
                  {slot}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* DESCRIPTION */}
          <Text style={styles.section}>About</Text>
          <Text style={styles.desc}>
            Premium football field with modern turf, lighting system, and full
            facilities. Suitable for training and matches.
          </Text>

          {/* AMENITIES */}
          <Text style={styles.section}>Amenities</Text>

          <View style={styles.amenities}>
            {amenities.map((item, index) => (
              <View key={index} style={styles.amenityItem}>
                <Ionicons name={item.icon as any} size={22} />
                <Text style={styles.amenityText}>{item.label}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* BOOK BUTTON */}
      <View style={styles.bottom}>
        <TouchableOpacity
          disabled={!selectedTime}
          onPress={handleBooking}
          style={[
            styles.button,
            !selectedTime && { backgroundColor: "#ccc" },
          ]}
        >
          <Text style={styles.buttonText}>
            {selectedTime
              ? `Book ${selectedTime}`
              : "Select time slot"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  image: {
    width: width,
    height: 250,
  },

  content: {
    padding: 16,
  },

  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 8,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginBottom: 10,
  },

  rating: { fontWeight: "bold" },
  review: { color: "#666" },

  addressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginBottom: 10,
  },

  address: { color: "#555" },

  price: {
    fontSize: 20,
    fontWeight: "bold",
    color: "green",
    marginBottom: 20,
  },

  section: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 10,
  },

  timeContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },

  timeSlot: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ccc",
  },

  timeSlotActive: {
    backgroundColor: "#007bff",
    borderColor: "#007bff",
  },

  timeText: {
    color: "#333",
  },

  timeTextActive: {
    color: "#fff",
  },

  desc: {
    color: "#666",
    lineHeight: 20,
  },

  amenities: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 20,
    marginTop: 10,
  },

  amenityItem: {
    alignItems: "center",
    width: "30%",
  },

  amenityText: {
    marginTop: 5,
    fontSize: 12,
  },

  bottom: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderColor: "#eee",
  },

  button: {
    backgroundColor: "#007bff",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
  },

  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});