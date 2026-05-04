import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from "react-native";

const mockData = [
  { date: "2026-05-01", total: 200 },
  { date: "2026-05-02", total: 350 },
  { date: "2026-05-03", total: 150 },
  { date: "2026-05-04", total: 500 },
];

const bookings = [
  { status: "approved", price: 100 },
  { status: "approved", price: 200 },
  { status: "pending", price: 150 },
  { status: "cancelled", price: 80 },
];

export default function Dashboard() {
  const totalRevenue = bookings
    .filter((b) => b.status === "approved")
    .reduce((sum, b) => sum + b.price, 0);

  const totalBookings = bookings.length;

  const approved = bookings.filter(b => b.status === "approved").length;
  const pending = bookings.filter(b => b.status === "pending").length;
  const cancelled = bookings.filter(b => b.status === "cancelled").length;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Dashboard</Text>

      {/* SUMMARY */}
      <View style={styles.row}>
        <View style={styles.card}>
          <Text>Total Revenue</Text>
          <Text style={styles.value}>${totalRevenue}</Text>
        </View>

        <View style={styles.card}>
          <Text>Total Bookings</Text>
          <Text style={styles.value}>{totalBookings}</Text>
        </View>
      </View>

      {/* STATUS */}
      <View style={styles.row}>
        <View style={[styles.card, { backgroundColor: "#e8f5e9" }]}>
          <Text>Approved</Text>
          <Text style={styles.value}>{approved}</Text>
        </View>

        <View style={[styles.card, { backgroundColor: "#fff3e0" }]}>
          <Text>Pending</Text>
          <Text style={styles.value}>{pending}</Text>
        </View>

        <View style={[styles.card, { backgroundColor: "#fbe9e7" }]}>
          <Text>Cancelled</Text>
          <Text style={styles.value}>{cancelled}</Text>
        </View>
      </View>

      {/* CHART */}
      <Text style={styles.subtitle}>Revenue by Day</Text>

      {mockData.map((item) => (
        <View key={item.date} style={styles.chartRow}>
          <Text style={styles.chartLabel}>{item.date}</Text>

          <View style={styles.barContainer}>
            <View
              style={[
                styles.bar,
                { width: item.total / 2 }, // scale
              ]}
            />
          </View>

          <Text>${item.total}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },

  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },

  subtitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
  },

  row: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 15,
  },

  card: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 16,
    borderRadius: 10,
  },

  value: {
    marginTop: 5,
    fontSize: 18,
    fontWeight: "bold",
  },

  chartRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  chartLabel: {
    width: 90,
  },

  barContainer: {
    flex: 1,
    height: 10,
    backgroundColor: "#eee",
    marginHorizontal: 10,
    borderRadius: 5,
  },

  bar: {
    height: 10,
    backgroundColor: "#007bff",
    borderRadius: 5,
  },
});