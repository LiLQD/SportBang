import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";

type Status = "pending" | "approved" | "cancelled";

interface Booking {
  id: string;
  user: string;
  field: string;
  date: string;
  time: string;
  status: Status;
}

const mockData: Booking[] = [
  {
    id: "1",
    user: "Nguyen Van A",
    field: "Sân bóng A",
    date: "2026-05-05",
    time: "14:00 - 16:00",
    status: "pending",
  },
  {
    id: "2",
    user: "Tran Van B",
    field: "Sân tennis B",
    date: "2026-05-06",
    time: "10:00 - 12:00",
    status: "approved",
  },
  {
    id: "3",
    user: "Le Van C",
    field: "Sân cầu lông C",
    date: "2026-05-07",
    time: "18:00 - 20:00",
    status: "pending",
  },
];

export default function AdminBookingScreen() {
  const [bookings, setBookings] = useState<Booking[]>(mockData);
  const [statusFilter, setStatusFilter] = useState<Status | "all">("all");
  const [dateFilter, setDateFilter] = useState("");

  // Filter logic
  const filtered = bookings.filter((b) => {
    const matchStatus =
      statusFilter === "all" || b.status === statusFilter;
    const matchDate =
      !dateFilter || b.date.includes(dateFilter);
    return matchStatus && matchDate;
  });

  const handleApprove = (id: string) => {
    setBookings((prev) =>
      prev.map((b) =>
        b.id === id ? { ...b, status: "approved" } : b
      )
    );
  };

  const handleCancel = (id: string) => {
    setBookings((prev) =>
      prev.map((b) =>
        b.id === id ? { ...b, status: "cancelled" } : b
      )
    );
  };

  const getColor = (status: Status) => {
    switch (status) {
      case "pending":
        return "#f39c12";
      case "approved":
        return "#27ae60";
      case "cancelled":
        return "#7f8c8d";
    }
  };

  const renderItem = ({ item }: { item: Booking }) => (
    <View style={styles.card}>
      <Text style={styles.field}>{item.field}</Text>

      <View style={styles.row}>
        <Ionicons name="person-outline" size={16} />
        <Text>{item.user}</Text>
      </View>

      <View style={styles.row}>
        <Ionicons name="calendar-outline" size={16} />
        <Text>{item.date}</Text>
      </View>

      <View style={styles.row}>
        <Ionicons name="time-outline" size={16} />
        <Text>{item.time}</Text>
      </View>

      {/* STATUS */}
      <View
        style={[
          styles.status,
          { backgroundColor: getColor(item.status) },
        ]}
      >
        <Text style={{ color: "#fff" }}>{item.status}</Text>
      </View>

      {/* ACTIONS */}
      {item.status === "pending" && (
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.btn, { backgroundColor: "#27ae60" }]}
            onPress={() => handleApprove(item.id)}
          >
            <Text style={styles.btnText}>Approve</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btn, { backgroundColor: "#e74c3c" }]}
            onPress={() => handleCancel(item.id)}
          >
            <Text style={styles.btnText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Admin Booking</Text>

      {/* FILTER */}
      <View style={styles.filterBox}>
        <TextInput
          placeholder="Filter by date (YYYY-MM-DD)"
          value={dateFilter}
          onChangeText={setDateFilter}
          style={styles.input}
        />

        <View style={styles.tabs}>
          {["all", "pending", "approved", "cancelled"].map((s) => (
            <TouchableOpacity
              key={s}
              onPress={() => setStatusFilter(s as any)}
              style={[
                styles.tab,
                statusFilter === s && styles.tabActive,
              ]}
            >
              <Text
                style={
                  statusFilter === s
                    ? styles.tabTextActive
                    : styles.tabText
                }
              >
                {s}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* LIST */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 40 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },

  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
  },

  filterBox: {
    marginBottom: 15,
  },

  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },

  tabs: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  tab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 20,
  },

  tabActive: {
    backgroundColor: "#007bff",
    borderColor: "#007bff",
  },

  tabText: { color: "#333" },
  tabTextActive: { color: "#fff" },

  card: {
    backgroundColor: "#f9f9f9",
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
  },

  field: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 5,
  },

  row: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 4,
  },

  status: {
    marginTop: 8,
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },

  actions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
  },

  btn: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },

  btnText: {
    color: "#fff",
    fontWeight: "bold",
  },
});