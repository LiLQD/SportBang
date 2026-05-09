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

export default function FieldDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [isFavorite, setIsFavorite] = useState(false);

  const fieldImages = [
    "https://images.unsplash.com/photo-1716745559715-282bb61e3012",
    "https://images.unsplash.com/photo-1760384702320-a7409c8b4f37",
    "https://images.unsplash.com/photo-1758535013088-20f84ac4c645",
    "https://images.unsplash.com/photo-1729433939211-458edc336757",
  ];

  const amenities = [
    {
      icon: "wifi-outline",
      label: "WiFi",
    },
    {
      icon: "car-outline",
      label: "Parking",
    },
    {
      icon: "restaurant-outline",
      label: "Cafe",
    },
    {
      icon: "shield-checkmark-outline",
      label: "Security",
    },
    {
      icon: "people-outline",
      label: "Changing Rooms",
    },
    {
      icon: "bulb-outline",
      label: "Floodlights",
    },
  ];

  const handleFavorite = () => {
    setIsFavorite(!isFavorite);

    // sau này có thể lưu vào AsyncStorage / API
  };

  const handleBooking = () => {
    router.push({
      pathname: "/booking/[id]",
      params: { id },
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 120,
        }}
      >
        {/* IMAGE CAROUSEL */}
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
        >
          {fieldImages.map((img, index) => (
            <Image
              key={index}
              source={{ uri: img }}
              style={styles.image}
            />
          ))}
        </ScrollView>

        {/* CONTENT */}
        <View style={styles.content}>
          {/* TITLE */}
          <View style={styles.titleSection}>
            <Text style={styles.title}>
              Champions Arena
            </Text>

            <View style={styles.ratingRow}>
              <Ionicons
                name="star"
                size={18}
                color="#FACC15"
              />

              <Text style={styles.rating}>
                4.8
              </Text>

              <Text style={styles.review}>
                (234 reviews)
              </Text>
            </View>
          </View>

          {/* ADDRESS */}
          <View style={styles.addressBox}>
            <View style={styles.addressRow}>
              <Ionicons
                name="location-outline"
                size={20}
                color="#6B7280"
              />

              <View>
                <Text style={styles.addressTitle}>
                  123 Stadium Avenue
                </Text>

                <Text style={styles.addressSub}>
                  Downtown, CA 94102
                </Text>
              </View>
            </View>

            {/* MAP PREVIEW */}
            <Image
              source={{
                uri: "https://images.unsplash.com/photo-1524661135-423995f22d0b",
              }}
              style={styles.mapImage}
            />
          </View>

          {/* PRICE */}
          <View style={styles.priceRow}>
            <Text style={styles.price}>
              $45
            </Text>

            <Text style={styles.perHour}>
              / hour
            </Text>
          </View>

          {/* ABOUT */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              About this field
            </Text>

            <Text style={styles.description}>
              Champions Arena is a premium indoor
              football facility featuring
              professional-grade artificial turf and
              modern lighting systems. Perfect for
              training sessions, friendly matches,
              and tournament play.
            </Text>
          </View>

          {/* AMENITIES */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Amenities
            </Text>

            <View style={styles.amenitiesGrid}>
              {amenities.map((item, index) => (
                <View
                  key={index}
                  style={styles.amenityCard}
                >
                  <View
                    style={styles.amenityIcon}
                  >
                    <Ionicons
                      name={item.icon as any}
                      size={24}
                      color="#111827"
                    />
                  </View>

                  <Text
                    style={styles.amenityText}
                  >
                    {item.label}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* BOTTOM ACTION */}
      <View style={styles.bottomBar}>
        {/* FAVORITE */}
        <TouchableOpacity
          style={[
            styles.favoriteButton,
            isFavorite &&
              styles.favoriteButtonActive,
          ]}
          onPress={handleFavorite}
        >
          <Ionicons
            name={
              isFavorite
                ? "heart"
                : "heart-outline"
            }
            size={26}
            color={
              isFavorite
                ? "#EF4444"
                : "#374151"
            }
          />
        </TouchableOpacity>

        {/* BOOK BUTTON */}
        <TouchableOpacity
          style={styles.bookButton}
          onPress={handleBooking}
        >
          <Text style={styles.bookButtonText}>
            Book Field
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

  image: {
    width: width,
    height: 280,
  },

  content: {
    padding: 20,
  },

  titleSection: {
    marginBottom: 20,
  },

  title: {
    fontSize: 30,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
  },

  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  rating: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },

  review: {
    color: "#6B7280",
    fontSize: 15,
  },

  addressBox: {
    marginBottom: 24,
  },

  addressRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 14,
  },

  addressTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
  },

  addressSub: {
    color: "#6B7280",
    marginTop: 2,
  },

  mapImage: {
    width: "100%",
    height: 170,
    borderRadius: 18,
  },

  priceRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 28,
  },

  price: {
    fontSize: 34,
    fontWeight: "700",
    color: "#22C55E",
  },

  perHour: {
    fontSize: 16,
    color: "#6B7280",
    marginBottom: 6,
    marginLeft: 6,
  },

  section: {
    marginBottom: 28,
  },

  sectionTitle: {
    fontSize: 21,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 14,
  },

  description: {
    color: "#4B5563",
    lineHeight: 24,
    fontSize: 15,
  },

  amenitiesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 18,
  },

  amenityCard: {
    width: "30%",
    alignItems: "center",
  },

  amenityIcon: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },

  amenityText: {
    fontSize: 13,
    color: "#4B5563",
    textAlign: "center",
  },

  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,

    flexDirection: "row",
    gap: 14,

    padding: 18,
    backgroundColor: "#FFFFFF",

    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },

  favoriteButton: {
    width: 58,
    height: 58,
    borderRadius: 18,

    borderWidth: 2,
    borderColor: "#D1D5DB",

    justifyContent: "center",
    alignItems: "center",

    backgroundColor: "#FFFFFF",
  },

  favoriteButtonActive: {
    backgroundColor: "#FEF2F2",
    borderColor: "#EF4444",
  },

  bookButton: {
    flex: 1,
    height: 58,

    borderRadius: 18,
    backgroundColor: "#2563EB",

    justifyContent: "center",
    alignItems: "center",
  },

  bookButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
  },
});