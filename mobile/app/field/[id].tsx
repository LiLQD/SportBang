import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  FlatList,
  Platform,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useState, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { getImageUrl } from "@/src/utils/helpers";
import { fieldService } from "@/src/services/field.service";
import { reviewService } from "@/src/services/review.service";
import { favoriteService } from "@/src/services/favorite.service";
import { useAuthStore } from "@/src/store/auth.store";

const { width } = Dimensions.get("window");

export default function FieldDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { darkMode } = useAuthStore();

  const [field, setField] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (id) {
      fetchFieldData();
    }
  }, [id]);

  const fetchFieldData = async () => {
    try {
      setLoading(true);

      // 1. Lấy thông tin sân bóng trước (Bắt buộc)
      try {
        const fieldRes = await fieldService.getFieldById(id);
        if (fieldRes && fieldRes.data) {
          setField(fieldRes.data);
        }
      } catch (err) {
        console.error("Error fetching field details:", err);
      }

      // 2. Lấy dữ liệu phụ (Không bắt buộc, lỗi cũng không sao)
      try {
        const [reviewRes, favRes] = await Promise.allSettled([
          reviewService.getFieldReviews(id),
          favoriteService.getFavorites()
        ]);

        if (reviewRes.status === 'fulfilled' && reviewRes.value?.data) {
          setReviews(reviewRes.value.data);
        } else {
          setReviews([]);
        }

        if (favRes.status === 'fulfilled' && favRes.value?.data && Array.isArray(favRes.value.data)) {
          const isFav = favRes.value.data.some((f: any) => f._id === id);
          setIsFavorite(isFav);
        }
      } catch (err) {
        console.error("Error fetching supplemental data:", err);
      }

    } catch (error) {
      console.error("Unexpected error in fetchFieldData:", error);
    } finally {
      setLoading(false);
    }
  };


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

  const handleFavorite = async () => {
    try {
      await favoriteService.toggleFavorite(id);
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  const handleBooking = () => {
    router.push({
      pathname: "/booking/[id]",
      params: { id },
    });
  };

  if (loading) {
    return (
      <View style={[styles.container, darkMode && { backgroundColor: "#111827" }, { justifyContent: "center" }]}>
        <ActivityIndicator size="large" color="#22C55E" />
      </View>
    );
  }

  if (!field) {
    return (
      <View style={[styles.container, darkMode && { backgroundColor: "#111827" }, { justifyContent: "center", alignItems: "center" }]}>
        <Text style={darkMode && { color: "#fff" }}>Không tìm thấy sân bóng</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ color: "#22C55E", marginTop: 10 }}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const fieldImages = field.images?.length > 0 ? field.images : [
    "https://images.unsplash.com/photo-1716745559715-282bb61e3012",
  ];

  return (
    <View style={[styles.container, darkMode && { backgroundColor: "#111827" }]}>
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
          {fieldImages.map((img: string, index: number) => (
            <Image
              key={index}
              source={{ uri: getImageUrl(img) }}
              style={styles.image}
            />
          ))}
        </ScrollView>

        {/* BACK BUTTON */}
        <TouchableOpacity
          style={[styles.backIconBtn, darkMode && { backgroundColor: "#1F2937" }]}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={darkMode ? "#fff" : "#111827"} />
        </TouchableOpacity>

        {/* CONTENT */}
        <View style={styles.content}>
          {/* TITLE SECTION */}
          <View style={styles.titleSection}>
            <Text style={[styles.title, darkMode && { color: "#fff" }]}>
              {field.field_name}
            </Text>

            <View style={styles.ratingRow}>
              <Ionicons
                name="star"
                size={18}
                color="#FACC15"
              />

              <Text style={[styles.rating, darkMode && { color: "#fff" }]}>
                {field.users_rate || "5.0"}
              </Text>

              <Text style={[styles.review, darkMode && { color: "#9CA3AF" }]}>
                ({field.reviewCount || 0} reviews)
              </Text>
            </View>
          </View>

          {/* ADDRESS */}
          <View style={styles.addressBox}>
            <View style={styles.addressRow}>
              <Ionicons
                name="location-outline"
                size={20}
                color="#22C55E"
              />

              <View>
                <Text style={[styles.addressTitle, darkMode && { color: "#fff" }]}>
                  {field.address}
                </Text>

                <Text style={[styles.addressSub, darkMode && { color: "#9CA3AF" }]}>
                  {field.location?.city || "Hà Nội"}
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
              {field.price_per_hour?.toLocaleString('vi-VN')}đ
            </Text>

            <Text style={[styles.perHour, darkMode && { color: "#9CA3AF" }]}>
              / hour
            </Text>
          </View>

          {/* ABOUT */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, darkMode && { color: "#fff" }]}>
              About this field
            </Text>

            <Text style={[styles.description, darkMode && { color: "#D1D5DB" }]}>
              {field.description || "No description provided."}
            </Text>
          </View>

          {/* AMENITIES */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, darkMode && { color: "#fff" }]}>
              Amenities
            </Text>

            <View style={styles.amenitiesGrid}>
              {(field.amenities || amenities).map((item: any, index: number) => (
                <View
                  key={index}
                  style={styles.amenityCard}
                >
                  <View
                    style={[styles.amenityIcon, darkMode && { backgroundColor: "#1F2937" }]}
                  >
                    <Ionicons
                      name={(item.icon || "checkmark-circle-outline") as any}
                      size={24}
                      color={darkMode ? "#22C55E" : "#111827"}
                    />
                  </View>

                  <Text
                    style={[styles.amenityText, darkMode && { color: "#9CA3AF" }]}
                  >
                    {item.label || item}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* REVIEWS */}
          <View style={styles.section}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <Text style={[styles.sectionTitle, darkMode && { color: "#fff" }]}>Reviews</Text>
              <Text style={{ color: '#6B7280' }}>{reviews.length} reviews</Text>
            </View>

            {reviews.length === 0 ? (
              <Text style={{ color: '#6B7280', fontStyle: 'italic' }}>No reviews yet.</Text>
            ) : (
              reviews.map((review) => (
                <View key={review._id} style={[styles.reviewItem, darkMode && { backgroundColor: "#1F2937", borderColor: "#374151" }]}>
                  <View style={styles.reviewHeader}>
                    <Text style={[styles.reviewerName, darkMode && { color: "#fff" }]}>{review.user_id?.full_name}</Text>
                    <View style={styles.starRow}>
                      {[...Array(5)].map((_, i) => (
                        <Ionicons
                          key={i}
                          name={i < review.rating ? "star" : "star-outline"}
                          size={14}
                          color="#FACC15"
                        />
                      ))}
                    </View>
                  </View>
                  <Text style={[styles.reviewComment, darkMode && { color: "#D1D5DB" }]}>{review.comment}</Text>
                  <Text style={styles.reviewDate}>{new Date(review.createdAt).toLocaleDateString()}</Text>
                </View>
              ))
            )}
          </View>
        </View>
      </ScrollView>

      {/* BOTTOM ACTION */}
      <View style={[styles.bottomBar, darkMode && { backgroundColor: "#111827", borderTopColor: "#1F2937" }]}>
        {/* FAVORITE */}
        <TouchableOpacity
          style={[
            styles.favoriteButton,
            darkMode && { backgroundColor: "#1F2937", borderColor: "#374151" },
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
                : (darkMode ? "#9CA3AF" : "#374151")
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
    backgroundColor: "#22C55E",

    justifyContent: "center",
    alignItems: "center",
  },

  bookButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
  },
  backIconBtn: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  reviewItem: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  reviewerName: {
    fontWeight: '600',
    color: '#111827',
  },
  starRow: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewComment: {
    color: '#4B5563',
    fontSize: 14,
    lineHeight: 20,
  },
  reviewDate: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 8,
  },
});