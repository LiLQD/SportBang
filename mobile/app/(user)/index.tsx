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
import { useEffect, useState } from "react";
import { fieldService } from "@/src/services/field.service";
import { useAuthStore } from "@/src/store/auth.store";
import { getShadow } from "@/src/utils/style";

const categories = [
  "Football",
  "Badminton",
  "Tennis",
  "Basketball",
];

export default function HomeScreen() {
  const { user, darkMode } = useAuthStore();
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Chỉ fetch khi đã có user để đảm bảo token trong apiCall đã sẵn sàng
    if (user) {
      fetchFields();
    }
  }, [user]);

  const fetchFields = async () => {
    try {
      setLoading(true);
      const res = await fieldService.getAllFields();
      // Backend trả về { success: true, message: ..., data: [...] }
      if (res && res.data) {
        setFields(res.data);
      } else {
        setFields([]);
      }
    } catch (error) {
      console.error("Error fetching fields:", error);
      setFields([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, darkMode && { backgroundColor: "#111827" }]}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* HEADER */}
        <View style={[styles.header, darkMode && { backgroundColor: "#065F46" }]}>
          <View style={styles.headerTop}>
            <View>
              <Text style={[styles.helloText, darkMode && { color: "#A7F3D0" }]}>
                Hello,
              </Text>

              <Text style={styles.userName}>
                {user?.full_name || "User"}
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
              placeholder="Find sports fields..."
              placeholderTextColor="#9CA3AF"
              style={[styles.input, darkMode && { color: "#fff" }]}
            />
          </View>
        </View>

        {/* CATEGORY */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryContainer}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[styles.categoryButton, darkMode && { backgroundColor: "#1F2937" }]}
            >
              <Text style={[styles.categoryText, darkMode && { color: "#fff" }]}>
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* FEATURED */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, darkMode && { color: "#fff" }]}>
            Featured Fields
          </Text>

          {loading ? (
            <ActivityIndicator size="large" color="#22C55E" />
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
            >
              {fields.slice(0, 3).map((field) => (
                <TouchableOpacity
                  key={field?._id}
                  style={[styles.featuredCard, darkMode && { backgroundColor: "#1F2937" }]}
                  onPress={() =>
                    router.push(`/field/${field?._id}`)
                  }
                >
                  <Image
                    source={{ uri: field?.images?.[0] || "https://images.unsplash.com/photo-1600130202712-fd01014ffa79" }}
                    style={styles.featuredImage}
                  />

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

        {/* NEARBY (All Fields) */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, darkMode && { color: "#fff" }]}>
            All Fields
          </Text>

          {loading ? (
            <ActivityIndicator size="large" color="#22C55E" />
          ) : (
            fields.map((field) => (
              <TouchableOpacity
                key={field?._id}
                style={[styles.nearbyCard, darkMode && { backgroundColor: "#1F2937" }]}
                onPress={() =>
                  router.push(`/field/${field?._id}`)
                }
              >
                <Image
                  source={{ uri: field?.images?.[0] || "https://images.unsplash.com/photo-1705593813682-033ee2991df6" }}
                  style={styles.nearbyImage}
                />

                <View style={styles.nearbyContent}>
                  <View>
                    <Text style={[styles.fieldName, darkMode && { color: "#fff" }]}>
                      {field?.field_name}
                    </Text>

                    <Text style={[styles.distance, darkMode && { color: "#9CA3AF" }]} numberOfLines={1}>
                      {field?.address || "Location unavailable"}
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

  categoryText: {
    fontWeight: "600",
    color: "#374151",
  },

  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },

  sectionTitle: {
    fontSize: 22,
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

  nearbyContent: {
    flex: 1,
    padding: 14,
    justifyContent: "space-between",
  },

  distance: {
    color: "#6B7280",
    marginTop: 4,
  },
});
