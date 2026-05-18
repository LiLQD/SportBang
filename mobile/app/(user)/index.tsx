import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  ScrollView,
  ActivityIndicator,
  Platform,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState, useCallback } from "react";
import { fieldService } from "@/src/services/field.service";
import { favoriteService } from "@/src/services/favorite.service";
import { useAuthStore } from "@/src/store/auth.store";
import { getShadow } from "@/src/utils/style";
import { getImageUrl } from "@/src/utils/helpers";
import { useFocusEffect } from "expo-router";

const categories = [
  "Tất cả",
  "Bóng đá",
  "Cầu lông",
  "Tennis",
  "Bóng rổ",
  "Bóng chuyền",
];

export default function HomeScreen() {
  const { user, darkMode } = useAuthStore();
  const [fields, setFields] = useState([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [activeCategory, setActiveCategory] = useState("Tất cả");

  useFocusEffect(
    useCallback(() => {
      if (user) {
        fetchFields();
        fetchFavorites();
      }
    }, [user, activeCategory])
  );

  const fetchFavorites = async () => {
    try {
      const res = await favoriteService.getFavorites();
      if (res && res.data) {
        setFavorites(res.data.map((f: any) => f._id));
      }
    } catch (error) {
      console.error("Error fetching favorites:", error);
    }
  };

  const handleToggleFavorite = async (fieldId: string) => {
    try {
      await favoriteService.toggleFavorite(fieldId);
      setFavorites((prev) =>
        prev.includes(fieldId)
          ? prev.filter((id) => id !== fieldId)
          : [...prev, fieldId]
      );
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  const fetchFields = async (searchOverride?: string) => {
    try {
      setLoading(true);
      const filters: any = {};

      if (activeCategory !== "Tất cả") {
        filters.sport_type = activeCategory;
      }

      const searchVal = searchOverride !== undefined ? searchOverride : searchText;
      if (searchVal) {
        filters.search = searchVal;
      }

      const res = await fieldService.getAllFields(filters);
      if (res && res.data) {
        setFields(res.data);
      } else {
        setFields([]);
      }
    } catch (error) {
      console.error("Error fetching fields:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (text: string) => {
    setSearchText(text);
    // Bạn có thể thêm debounce ở đây, hoặc gọi trực tiếp nếu muốn tìm kiếm ngay
  };

  const submitSearch = () => {
    fetchFields();
  };

  return (
    <View style={[styles.container, darkMode && { backgroundColor: "#111827" }]}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* HEADER */}
        <View style={[styles.header, darkMode && { backgroundColor: "#065F46" }]}>
          <View style={styles.headerTop}>
            <View>
              <Text style={[styles.helloText, darkMode && { color: "#A7F3D0" }]}>
                Xin chào,
              </Text>

              <Text style={styles.userName}>
                {user?.full_name || "Người dùng"}
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.avatar, darkMode && { backgroundColor: "#1F2937" }]}
              onPress={() => router.push("/(user)/profile")}
            >
              <Ionicons
                name="person"
                size={28}
                color="#22C55E"
              />
            </TouchableOpacity>
          </View>

          {/* SEARCH */}
          <View style={[styles.searchBox, darkMode && { backgroundColor: "#1F2937" }]}>
            <Ionicons
              name="search"
              size={20}
              color="#9CA3AF"
            />

            <TextInput
              placeholder="Tìm kiếm sân thể thao..."
              placeholderTextColor="#9CA3AF"
              style={[styles.input, darkMode && { color: "#fff" }]}
              value={searchText}
              onChangeText={handleSearch}
              onSubmitEditing={submitSearch}
              returnKeyType="search"
            />

            {searchText !== "" && (
              <TouchableOpacity onPress={() => {setSearchText(""); fetchFields("");}}>
                <Ionicons name="close-circle" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* CATEGORY */}
        <View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryContainer}
          >
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryButton,
                  darkMode && { backgroundColor: "#1F2937" },
                  activeCategory === category && styles.categoryButtonActive
                ]}
                onPress={() => setActiveCategory(category)}
              >
                <Text style={[
                  styles.categoryText,
                  darkMode && { color: "#fff" },
                  activeCategory === category && styles.categoryTextActive
                ]}>
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* FEATURED */}
        {fields.length > 0 && activeCategory === "Tất cả" && !searchText && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, darkMode && { color: "#fff" }]}>
              Sân bóng nổi bật
            </Text>

            {loading ? (
              <ActivityIndicator size="large" color="#22C55E" />
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
              >
                {fields.slice(0, 3).map((field: any) => (
                  <TouchableOpacity
                    key={field?._id}
                    style={[styles.featuredCard, darkMode && { backgroundColor: "#1F2937" }]}
                    onPress={() =>
                      router.push(`/field/${field?._id}`)
                    }
                  >
                    <View style={styles.imageContainer}>
                      <Image
                        source={{ uri: getImageUrl(field?.images?.[0]) }}
                        style={styles.featuredImage}
                      />
                      <TouchableOpacity
                        style={styles.favoriteBadge}
                        onPress={() => handleToggleFavorite(field?._id)}
                      >
                        <Ionicons
                          name={favorites.includes(field?._id) ? "heart" : "heart-outline"}
                          size={20}
                          color={favorites.includes(field?._id) ? "#EF4444" : "#fff"}
                        />
                      </TouchableOpacity>
                    </View>

                    <View style={styles.cardContent}>
                      <Text style={[styles.fieldName, darkMode && { color: "#fff" }]} numberOfLines={1}>
                        {field?.field_name}
                      </Text>

                      <View style={styles.rowBetween}>
                        <View style={styles.row}>
                          <Ionicons
                            name="star"
                            size={16}
                            color="#FACC15"
                          />

                          <Text style={darkMode && { color: "#9CA3AF" }}>{field?.users_rate || 5.0}</Text>
                        </View>

                        <Text style={styles.price}>
                          {field?.price_per_hour?.toLocaleString('vi-VN')}đ/h
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>
        )}

        {/* NEARBY (All Fields) */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, darkMode && { color: "#fff" }]}>
            {searchText ? `Kết quả tìm kiếm "${searchText}"` : activeCategory === "Tất cả" ? "Tất cả sân bóng" : `Sân ${activeCategory}`}
          </Text>

          {loading ? (
            <ActivityIndicator size="large" color="#22C55E" style={{ marginTop: 20 }} />
          ) : fields.length > 0 ? (
            fields.map((field: any) => (
              <TouchableOpacity
                key={field?._id}
                style={[styles.nearbyCard, darkMode && { backgroundColor: "#1F2937" }]}
                onPress={() =>
                  router.push(`/field/${field?._id}`)
                }
              >
                <View style={styles.nearbyImageContainer}>
                  <Image
                    source={{ uri: getImageUrl(field?.images?.[0]) }}
                    style={styles.nearbyImage}
                  />
                  <TouchableOpacity
                    style={styles.smallFavoriteBadge}
                    onPress={() => handleToggleFavorite(field?._id)}
                  >
                    <Ionicons
                      name={favorites.includes(field?._id) ? "heart" : "heart-outline"}
                      size={16}
                      color={favorites.includes(field?._id) ? "#EF4444" : "#fff"}
                    />
                  </TouchableOpacity>
                </View>

                <View style={styles.nearbyContent}>
                  <View>
                    <Text style={[styles.fieldName, darkMode && { color: "#fff" }]}>
                      {field?.field_name}
                    </Text>

                    <Text style={[styles.distance, darkMode && { color: "#9CA3AF" }]} numberOfLines={1}>
                      {field?.address || "Không có địa chỉ"}
                    </Text>
                  </View>

                  <View style={styles.rowBetween}>
                    <View style={styles.row}>
                      <Ionicons
                        name="star"
                        size={16}
                        color="#FACC15"
                      />

                      <Text style={darkMode && { color: "#9CA3AF" }}>{field?.users_rate || 5.0}</Text>
                    </View>

                    <Text style={styles.price}>
                      {field?.price_per_hour?.toLocaleString('vi-VN')}đ/h
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={60} color="#CBD5E1" />
              <Text style={styles.emptyText}>Không tìm thấy sân bóng nào phù hợp</Text>
            </View>
          )}
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  header: {
    backgroundColor: "#22C55E",
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },

  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },

  helloText: {
    color: "#DCFCE7",
    fontSize: 14,
  },

  userName: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "700",
  },

  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },

  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 18,
    paddingHorizontal: 16,
    height: 54,
  },

  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
  },

  categoryContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 12,
  },

  categoryButton: {
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 999,
    marginRight: 12,
    ...getShadow(0.05, 6, 2),
  },

  categoryButtonActive: {
    backgroundColor: "#22C55E",
  },

  categoryText: {
    fontWeight: "600",
    color: "#374151",
  },

  categoryTextActive: {
    color: "#fff",
  },

  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 16,
    color: "#111827",
  },

  featuredCard: {
    width: 280,
    backgroundColor: "#fff",
    borderRadius: 24,
    overflow: "hidden",
    marginRight: 16,
    ...getShadow(0.08, 10, 3),
  },

  featuredImage: {
    width: "100%",
    height: 170,
  },

  cardContent: {
    padding: 16,
  },

  fieldName: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 10,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  price: {
    color: "#22C55E",
    fontWeight: "700",
    fontSize: 15,
  },

  nearbyCard: {
    backgroundColor: "#fff",
    borderRadius: 24,
    overflow: "hidden",
    flexDirection: "row",
    marginBottom: 16,
    ...getShadow(0.05, 8, 2),
  },

  nearbyImage: {
    width: 110,
    height: 110,
  },

  imageContainer: {
    position: 'relative',
  },

  nearbyImageContainer: {
    position: 'relative',
    width: 110,
    height: 110,
  },

  favoriteBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.3)',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },

  smallFavoriteBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.3)',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },

  nearbyContent: {
    flex: 1,
    padding: 14,
    justifyContent: "space-between",
  },

  distance: {
    color: "#6B7280",
    marginTop: 4,
  },

  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 40,
    padding: 20,
  },

  emptyText: {
    marginTop: 12,
    fontSize: 15,
    color: "#94A3B8",
    textAlign: "center",
  },
});
