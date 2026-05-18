import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  Platform,
  ScrollView,
} from "react-native";
import { useState, useEffect, useCallback } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import { getImageUrl } from "@/src/utils/helpers";
import { getShadow } from "@/src/utils/style";
import { useAuthStore } from "@/src/store/auth.store";
import { favoriteService } from "@/src/services/favorite.service";

const sportsCategories = ["Tất cả", "Bóng đá", "Cầu lông", "Tennis", "Bóng rổ"];

export default function FavoritesScreen() {
  const router = useRouter();
  const { darkMode } = useAuthStore();
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSport, setSelectedSport] = useState("Tất cả");
  const [searchQuery, setSearchQuery] = useState("");

  useFocusEffect(
    useCallback(() => {
      fetchFavorites();
    }, [])
  );

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const res = await favoriteService.getFavorites();
      if (res && res.data) {
        setFavorites(res.data);
      }
    } catch (error) {
      console.error("Error fetching favorites:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = async (fieldId: string) => {
    try {
      await favoriteService.toggleFavorite(fieldId);
      // Cập nhật danh sách tại chỗ để mượt mà
      setFavorites(prev => prev.filter(item => item._id !== fieldId));
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  const filteredFields = favorites.filter(field => {
    if (!field) return false;
    const matchesSport = selectedSport === "Tất cả" ||
                         (field.sport_type && field.sport_type.includes(selectedSport)) ||
                         (field.field_type && field.field_type.includes(selectedSport));
    const matchesSearch = (field.field_name?.toLowerCase().includes(searchQuery.toLowerCase())) ||
                         (field.address?.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSport && matchesSearch;
  });

  const renderFieldCard = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[styles.card, darkMode && { backgroundColor: "#1F2937" }]}
      onPress={() => router.push(`/field/${item._id}`)}
    >
      <Image
        source={{ uri: getImageUrl(item.images?.[0]) }}
        style={styles.image}
      />
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={[styles.sportTag, darkMode && { backgroundColor: "#064E3B" }]}>{item.field_type}</Text>
          <TouchableOpacity onPress={() => handleToggleFavorite(item._id)}>
            <Ionicons name="heart" size={24} color="#EF4444" />
          </TouchableOpacity>
        </View>

        <Text style={[styles.fieldName, darkMode && { color: "#fff" }]} numberOfLines={1}>{item.field_name}</Text>

        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={16} color="#6B7280" />
          <Text style={[styles.infoText, darkMode && { color: "#9CA3AF" }]} numberOfLines={1}>{item.address}</Text>
        </View>

        <View style={[styles.footer, darkMode && { borderTopColor: "#374151" }]}>
          <Text style={styles.price}>{item.price_per_hour?.toLocaleString('vi-VN')}đ/h</Text>
          <TouchableOpacity
            style={styles.bookBtn}
            onPress={() => router.push(`/booking/${item._id}`)}
          >
            <Text style={styles.bookBtnText}>Book Now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, darkMode && { backgroundColor: "#111827" }]}>
      {/* HEADER */}
      <View style={[styles.header, darkMode && { backgroundColor: "#065F46" }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Favorite Fields</Text>
          <Text style={[styles.headerSubtitle, darkMode && { color: "#A7F3D0" }]}>Your saved sports venues</Text>
        </View>
      </View>

      <View style={styles.content}>
        {/* SEARCH */}
        <View style={[styles.searchContainer, darkMode && { backgroundColor: "#1F2937" }]}>
          <Ionicons name="search" size={20} color="#94A3B8" />
          <TextInput
            placeholder="Search favorite fields..."
            placeholderTextColor="#94A3B8"
            style={[styles.searchInput, darkMode && { color: "#fff" }]}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* CATEGORIES */}
        <View style={{ marginBottom: 20 }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {sportsCategories.map((sport) => (
              <TouchableOpacity
                key={sport}
                style={[
                  styles.chip,
                  darkMode && { backgroundColor: "#1F2937", borderColor: "#374151" },
                  selectedSport === sport && styles.chipActive
                ]}
                onPress={() => setSelectedSport(sport)}
              >
                <Text style={[
                  styles.chipText,
                  darkMode && { color: "#9CA3AF" },
                  selectedSport === sport && styles.chipTextActive
                ]}>
                  {sport}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#22C55E" style={{ marginTop: 50 }} />
        ) : (
          <FlatList
            data={filteredFields}
            keyExtractor={(item) => item._id}
            renderItem={renderFieldCard}
            contentContainerStyle={{ paddingBottom: 100 }}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="heart-outline" size={80} color={darkMode ? "#1F2937" : "#E2E8F0"} />
                <Text style={[styles.emptyText, darkMode && { color: "#9CA3AF" }]}>No favorite fields yet</Text>
                <TouchableOpacity
                  style={styles.exploreBtn}
                  onPress={() => router.push("/(user)/")}
                >
                  <Text style={styles.exploreBtnText}>Explore Fields</Text>
                </TouchableOpacity>
              </View>
            }
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  header: {
    backgroundColor: "#22C55E",
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  headerSubtitle: { fontSize: 14, color: '#DCFCE7' },
  content: { flex: 1, paddingHorizontal: 20, marginTop: -20 },
  searchContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 15,
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    ...getShadow(0.05, 10, 5),
  },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 16 },
  chip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 99,
    backgroundColor: '#fff',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chipActive: { backgroundColor: '#22C55E', borderColor: '#22C55E' },
  chipText: { color: '#64748B', fontWeight: '600' },
  chipTextActive: { color: '#fff' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
    ...getShadow(0.05, 10, 5),
  },
  image: { width: '100%', height: 180 },
  cardContent: { padding: 15 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sportTag: { color: '#22C55E', backgroundColor: '#DCFCE7', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, fontSize: 12, fontWeight: '700' },
  fieldName: { fontSize: 18, fontWeight: 'bold', color: '#1E293B', marginBottom: 5 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 15 },
  infoText: { color: '#64748B', fontSize: 14, flex: 1 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 15 },
  price: { fontSize: 18, fontWeight: 'bold', color: '#22C55E' },
  bookBtn: { backgroundColor: '#22C55E', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12 },
  bookBtnText: { color: '#fff', fontWeight: '700' },
  emptyContainer: { alignItems: 'center', marginTop: 100 },
  emptyText: { fontSize: 18, color: '#64748B', marginTop: 20, marginBottom: 20 },
  exploreBtn: { backgroundColor: '#22C55E', paddingHorizontal: 30, paddingVertical: 15, borderRadius: 16 },
  exploreBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
