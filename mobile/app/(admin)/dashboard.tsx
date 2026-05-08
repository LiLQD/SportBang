import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const bookings = [
  { status: "approved", price: 100 },
  { status: "approved", price: 200 },
  { status: "pending", price: 150 },
  { status: "cancelled", price: 80 },
];

export default function Dashboard() {
  const router = useRouter();

  const totalRevenue = bookings
    .filter((b) => b.status === "approved")
    .reduce((sum, b) => sum + b.price, 0);

  const totalBookings = bookings.length;

  const approved = bookings.filter((b) => b.status === "approved").length;
  const pending = bookings.filter((b) => b.status === "pending").length;
  const cancelled = bookings.filter((b) => b.status === "cancelled").length;

  return (
    <ScrollView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Admin Dashboard</Text>
          <Text style={styles.subtitle}>
            Overview of system performance
          </Text>
        </View>

        <View style={styles.headerRight}>
          <Ionicons name="notifications-outline" size={22} color="#fff" />
          <View style={styles.avatar}>
            <Text style={{ color: "#16a34a", fontWeight: "bold" }}>
              AD
            </Text>
          </View>
        </View>
      </View>

      {/* KPI */}
      <View style={styles.grid}>
        <Card title="Bookings" value={totalBookings} icon="calendar" />
        <Card title="Revenue" value={`$${totalRevenue}`} icon="cash" />
        <Card title="Approved" value={approved} icon="checkmark" />
        <Card title="Pending" value={pending} icon="time" />
      </View>

      {/* QUICK ACTION */}
      <Text style={styles.section}>Quick Actions</Text>

      <TouchableOpacity
        style={styles.actionCard}
        onPress={() => router.push("/(admin)/bookings")}
      >
        <Ionicons name="list" size={20} color="#16a34a" />
        <Text style={styles.actionText}>Manage Bookings</Text>
        <Ionicons name="chevron-forward" size={18} />
      </TouchableOpacity>

      {/* STATUS SUMMARY */}
      <Text style={styles.section}>Booking Status</Text>

      <View style={styles.row}>
        <StatusBox label="Approved" value={approved} color="#16a34a" />
        <StatusBox label="Pending" value={pending} color="#f59e0b" />
        <StatusBox label="Cancelled" value={cancelled} color="#6b7280" />
      </View>
    </ScrollView>
  );
}

/* COMPONENTS */

const Card = ({ title, value, icon }: any) => (
  <View style={styles.card}>
    <Ionicons name={icon} size={20} color="#16a34a" />
    <Text style={styles.cardTitle}>{title}</Text>
    <Text style={styles.cardValue}>{value}</Text>
  </View>
);

const StatusBox = ({ label, value, color }: any) => (
  <View style={[styles.statusBox, { backgroundColor: color + "20" }]}>
    <Text style={{ color }}>{label}</Text>
    <Text style={[styles.statusValue, { color }]}>{value}</Text>
  </View>
);

/* STYLES */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f3f4f6" },

  header: {
    backgroundColor: "#16a34a",
    padding: 20,
    paddingTop: 50,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  title: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
  },

  subtitle: {
    color: "#d1fae5",
    fontSize: 12,
  },

  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  avatar: {
    width: 35,
    height: 35,
    backgroundColor: "#fff",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 10,
    gap: 10,
  },

  card: {
    width: "48%",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
  },

  cardTitle: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 5,
  },

  cardValue: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 5,
  },

  section: {
    marginLeft: 15,
    marginTop: 15,
    marginBottom: 10,
    fontWeight: "bold",
  },

  actionCard: {
    backgroundColor: "#fff",
    marginHorizontal: 15,
    padding: 15,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    justifyContent: "space-between",
  },

  actionText: {
    flex: 1,
    fontWeight: "500",
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 15,
  },

  statusBox: {
    flex: 1,
    marginHorizontal: 5,
    padding: 12,
    borderRadius: 10,
  },

  statusValue: {
    fontWeight: "bold",
    fontSize: 16,
    marginTop: 5,
  },
});