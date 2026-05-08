import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  ScrollView,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

const categories = [
  "Football",
  "Badminton",
  "Tennis",
  "Basketball",
];

const featuredFields = [
  {
    id: "1",
    name: "Premier Stadium",
    image:
      "https://images.unsplash.com/photo-1600130202712-fd01014ffa79",
    rating: 4.8,
    price: 50,
  },

  {
    id: "2",
    name: "Elite Badminton Court",
    image:
      "https://images.unsplash.com/photo-1776999035766-9c2b5cddf613",
    rating: 4.9,
    price: 30,
  },
];

const nearbyFields = [
  {
    id: "3",
    name: "City Sports Arena",
    image:
      "https://images.unsplash.com/photo-1705593813682-033ee2991df6",
    rating: 4.6,
    price: 45,
    distance: "1.2 km",
  },

  {
    id: "4",
    name: "Green Field Stadium",
    image:
      "https://images.unsplash.com/photo-1729843352938-0e10fbf96585",
    rating: 4.5,
    price: 35,
    distance: "2.5 km",
  },
];

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.helloText}>
                Hello,
              </Text>

              <Text style={styles.userName}>
                User
              </Text>
            </View>

            <View style={styles.avatar}>
              <Ionicons
                name="person"
                size={28}
                color="#22C55E"
              />
            </View>
          </View>

          {/* SEARCH */}
          <View style={styles.searchBox}>
            <Ionicons
              name="search"
              size={20}
              color="#9CA3AF"
            />

            <TextInput
              placeholder="Find sports fields..."
              placeholderTextColor="#9CA3AF"
              style={styles.input}
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
              style={styles.categoryButton}
            >
              <Text style={styles.categoryText}>
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* FEATURED */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Featured Fields
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
          >
            {featuredFields.map((field) => (
              <TouchableOpacity
                key={field.id}
                style={styles.featuredCard}
                onPress={() =>
                  router.push(`/field/${field.id}`)
                }
              >
                <Image
                  source={{ uri: field.image }}
                  style={styles.featuredImage}
                />

                <View style={styles.cardContent}>
                  <Text style={styles.fieldName}>
                    {field.name}
                  </Text>

                  <View style={styles.rowBetween}>
                    <View style={styles.row}>
                      <Ionicons
                        name="star"
                        size={16}
                        color="#FACC15"
                      />

                      <Text>{field.rating}</Text>
                    </View>

                    <Text style={styles.price}>
                      ${field.price}/h
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* NEARBY */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Nearby Fields
          </Text>

          {nearbyFields.map((field) => (
            <TouchableOpacity
              key={field.id}
              style={styles.nearbyCard}
              onPress={() =>
                router.push(`/field/${field.id}`)
              }
            >
              <Image
                source={{ uri: field.image }}
                style={styles.nearbyImage}
              />

              <View style={styles.nearbyContent}>
                <View>
                  <Text style={styles.fieldName}>
                    {field.name}
                  </Text>

                  <Text style={styles.distance}>
                    {field.distance}
                  </Text>
                </View>

                <View style={styles.rowBetween}>
                  <View style={styles.row}>
                    <Ionicons
                      name="star"
                      size={16}
                      color="#FACC15"
                    />

                    <Text>{field.rating}</Text>
                  </View>

                  <Text style={styles.price}>
                    ${field.price}/h
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
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

    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
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

    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
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

    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
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