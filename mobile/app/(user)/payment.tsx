import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useState } from "react";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

type PaymentMethod = "momo" | "zalopay" | "card";

export default function PaymentScreen() {
  const { time, duration, total } = useLocalSearchParams();

  const [selected, setSelected] = useState<PaymentMethod | null>(null);
  const [loading, setLoading] = useState(false);

  const handlePay = async () => {
    if (!selected) return;

    setLoading(true);

    // 🚀 Fake API delay
    setTimeout(() => {
      setLoading(false);

      Alert.alert(
        "Payment Success 🎉",
        `Paid ${total}$ via ${selected.toUpperCase()}`,
        [
          {
            text: "OK",
            onPress: () => router.replace("/(user)/"),
          },
        ]
      );
    }, 1500);
  };

  const renderMethod = (
    id: PaymentMethod,
    label: string,
    icon: any,
    color: string
  ) => {
    const isActive = selected === id;

    return (
      <TouchableOpacity
        key={id}
        onPress={() => setSelected(id)}
        style={[
          styles.method,
          isActive && { borderColor: "#007bff", backgroundColor: "#eef6ff" },
        ]}
      >
        <View style={styles.row}>
          <View style={[styles.iconBox, { backgroundColor: color }]}>
            <Ionicons name={icon} size={20} color="#fff" />
          </View>
          <Text style={styles.methodText}>{label}</Text>
        </View>

        {isActive && (
          <Ionicons name="checkmark-circle" size={22} color="#007bff" />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>

      {/* HEADER */}
      <Text style={styles.title}>Payment</Text>

      {/* BOOKING SUMMARY */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Booking Summary</Text>

        <View style={styles.item}>
          <Ionicons name="time-outline" size={18} />
          <Text>{time}</Text>
        </View>

        <View style={styles.item}>
          <Ionicons name="hourglass-outline" size={18} />
          <Text>{duration} hours</Text>
        </View>

        <View style={styles.item}>
          <Ionicons name="cash-outline" size={18} />
          <Text style={styles.price}>{total}$</Text>
        </View>
      </View>

      {/* PAYMENT METHODS */}
      <Text style={styles.subtitle}>Choose Payment Method</Text>

      {renderMethod("momo", "MoMo Wallet", "wallet", "#d82d8b")}
      {renderMethod("zalopay", "ZaloPay", "logo-usd", "#0068ff")}
      {renderMethod("card", "Credit Card", "card", "#333")}

      {/* BUTTON */}
      <TouchableOpacity
        disabled={!selected || loading}
        style={[
          styles.button,
          (!selected || loading) && { backgroundColor: "#ccc" },
        ]}
        onPress={handlePay}
      >
        <Text style={styles.buttonText}>
          {loading ? "Processing..." : "Pay Now"}
        </Text>
      </TouchableOpacity>

      {/* SECURITY NOTE */}
      <Text style={styles.secure}>
        🔒 Secure payment with SSL encryption
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },

  subtitle: {
    fontSize: 16,
    fontWeight: "600",
    marginVertical: 10,
  },

  card: {
    backgroundColor: "#f5f7ff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },

  cardTitle: {
    fontWeight: "bold",
    marginBottom: 10,
  },

  item: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 6,
    alignItems: "center",
  },

  price: {
    fontWeight: "bold",
    color: "green",
  },

  method: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },

  methodText: {
    fontSize: 16,
  },

  button: {
    marginTop: 20,
    backgroundColor: "#007bff",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },

  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },

  secure: {
    textAlign: "center",
    marginTop: 10,
    color: "#888",
    fontSize: 12,
  },
});