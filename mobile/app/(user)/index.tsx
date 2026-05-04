import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const fields = [
  {
    id: "1",
    name: "Riverside Football Stadium",
    location: "Downtown, 2.5 km",
    rating: 4.8,
    price: 45,
    image: "https://images.unsplash.com/photo-1734652246537-104c43a68942",
  },
  {
    id: "2",
    name: "Elite Soccer Arena",
    location: "North District, 3.2 km",
    rating: 4.9,
    price: 55,
    image: "https://images.unsplash.com/photo-1641280173256-0ac1b2f4cd78",
  },
];

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Header */}
        <Text style={styles.title}>Find Your Field</Text>
        <Text style={styles.subtitle}>
          Book sports facilities near you
        </Text>

        {/* Search */}
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color="#999" />
          <TextInput
            placeholder="Search field..."
            style={styles.input}
          />
        </View>

        {/* List */}
        {fields.map((item) => (
          <TouchableOpacity key={item.id} style={styles.card}>
            <Image source={{ uri: item.image }} style={styles.image} />

            <View style={styles.cardContent}>
              <Text style={styles.name}>{item.name}</Text>

              <View style={styles.row}>
                <Ionicons name="location-outline" size={16} />
                <Text style={styles.location}>{item.location}</Text>
              </View>

              <View style={styles.rowBetween}>
                <View style={styles.row}>
                  <Ionicons name="star" size={16} color="gold" />
                  <Text>{item.rating}</Text>
                </View>

                <Text style={styles.price}>
                  ${item.price}/h
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5", padding: 16 },

  title: { fontSize: 24, fontWeight: "bold" },
  subtitle: { color: "#666", marginBottom: 16 },

  searchBox: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 10,
    marginBottom: 16,
    alignItems: "center",
  },

  input: { marginLeft: 10, flex: 1 },

  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 16,
    overflow: "hidden",
  },

  image: { width: "100%", height: 150 },

  cardContent: { padding: 12 },

  name: { fontWeight: "bold", marginBottom: 6 },

  row: { flexDirection: "row", alignItems: "center", gap: 5 },

  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },

  location: { color: "#666" },

  price: { color: "blue", fontWeight: "bold" },
});