import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Platform,
  ScrollView,
} from "react-native";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { authService } from "@/src/services/auth.service";
import { useRouter } from "expo-router";
import { getShadow } from "@/src/utils/style";

export default function RegisterScreen() {
  const router = useRouter();

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleRegister = async () => {
    console.log("Register button pressed", form);

    if (!form.full_name || !form.email || !form.password) {
      const msg = "Vui lòng nhập các trường bắt buộc (Tên, Email, Mật khẩu)";
      return Platform.OS === 'web' ? window.alert(msg) : Alert.alert("Lỗi", msg);
    }

    if (form.password !== form.confirmPassword) {
      const msg = "Mật khẩu xác nhận không khớp";
      return Platform.OS === 'web' ? window.alert(msg) : Alert.alert("Lỗi", msg);
    }

    try {
      setLoading(true);
      // Gửi toàn bộ form (bao gồm full_name) lên backend
      await authService.register(form);

      const successMsg = "Đăng ký thành công! Hãy đăng nhập.";
      if (Platform.OS === 'web') {
        window.alert(successMsg);
        router.replace("/(auth)/login");
      } else {
        Alert.alert("Thành công", successMsg, [
          { text: "OK", onPress: () => router.replace("/(auth)/login") }
        ]);
      }
    } catch (err: any) {
      console.error("Register Error Details:", err);
      const errorMsg = err.message || "Đăng ký thất bại";
      if (Platform.OS === 'web') {
        window.alert(errorMsg);
      } else {
        Alert.alert("Lỗi", errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>

        <View style={styles.logoContainer}>
          <View style={styles.logoBox} />
          <Text style={styles.appName}>SportBang</Text>
        </View>

        <View style={styles.titleBox}>
          <Text style={styles.title}>Tạo tài khoản</Text>
          <Text style={styles.subtitle}>Điền thông tin để bắt đầu</Text>
        </View>

        <View style={styles.inputWrapper}>
          <Ionicons name="person-outline" size={20} color="#64748B" style={styles.iconLeft} />
          <TextInput
            placeholder="Họ tên *"
            placeholderTextColor="#94A3B8"
            style={styles.input}
            value={form.full_name}
            onChangeText={(v) => setForm({ ...form, full_name: v })}
          />
        </View>

        <View style={styles.inputWrapper}>
          <Ionicons name="mail-outline" size={20} color="#64748B" style={styles.iconLeft} />
          <TextInput
            placeholder="Email *"
            placeholderTextColor="#94A3B8"
            style={styles.input}
            value={form.email}
            autoCapitalize="none"
            keyboardType="email-address"
            onChangeText={(v) => setForm({ ...form, email: v })}
          />
        </View>

        <View style={styles.inputWrapper}>
          <Ionicons name="call-outline" size={20} color="#64748B" style={styles.iconLeft} />
          <TextInput
            placeholder="Số điện thoại"
            placeholderTextColor="#94A3B8"
            style={styles.input}
            value={form.phone}
            keyboardType="phone-pad"
            onChangeText={(v) => setForm({ ...form, phone: v })}
          />
        </View>

        <View style={styles.inputWrapper}>
          <Ionicons name="lock-closed-outline" size={20} color="#64748B" style={styles.iconLeft} />
          <TextInput
            placeholder="Mật khẩu *"
            placeholderTextColor="#94A3B8"
            secureTextEntry={!showPassword}
            style={styles.input}
            value={form.password}
            onChangeText={(v) => setForm({ ...form, password: v })}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.iconRight}>
            <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color="#64748B" />
          </TouchableOpacity>
        </View>

        <View style={styles.inputWrapper}>
          <Ionicons name="lock-closed-outline" size={20} color="#64748B" style={styles.iconLeft} />
          <TextInput
            placeholder="Xác nhận mật khẩu *"
            placeholderTextColor="#94A3B8"
            secureTextEntry={!showConfirm}
            style={styles.input}
            value={form.confirmPassword}
            onChangeText={(v) => setForm({ ...form, confirmPassword: v })}
          />
          <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)} style={styles.iconRight}>
            <Ionicons name={showConfirm ? "eye-off" : "eye"} size={20} color="#64748B" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.button, loading && { opacity: 0.7 }]}
          onPress={handleRegister}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Đang xử lý..." : "Đăng ký"}
          </Text>
        </TouchableOpacity>

        <View style={styles.switchBox}>
          <Text style={styles.switchText}>Đã có tài khoản? </Text>
          <TouchableOpacity onPress={() => router.replace("/(auth)/login")}>
            <Text style={styles.switchLink}>Đăng nhập</Text>
          </TouchableOpacity>
        </View>

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  card: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 32,
    padding: 24,
    ...getShadow(0.05, 10, 5),
  },
  logoContainer: { alignItems: "center", marginBottom: 12 },
  logoBox: { width: 48, height: 48, backgroundColor: "#22C55E", borderRadius: 12, marginBottom: 8 },
  appName: { fontSize: 24, fontWeight: "bold", color: "#0F172A" },
  titleBox: { alignItems: "center", marginBottom: 16 },
  title: { fontSize: 20, fontWeight: "bold", color: "#0F172A" },
  subtitle: { fontSize: 14, color: "#64748B" },
  inputWrapper: { marginBottom: 12, justifyContent: "center" },
  input: { height: 52, borderRadius: 12, borderWidth: 1.5, borderColor: "#E2E8F0", paddingLeft: 44, paddingRight: 44, fontSize: 15, color: "#0F172A" },
  iconLeft: { position: "absolute", left: 14, zIndex: 1 },
  iconRight: { position: "absolute", right: 14, zIndex: 1 },
  button: { height: 52, backgroundColor: "#22C55E", borderRadius: 12, justifyContent: "center", alignItems: "center", marginTop: 10 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  switchBox: { flexDirection: "row", justifyContent: "center", marginTop: 20 },
  switchText: { color: "#64748B", fontSize: 14 },
  switchLink: { color: "#22C55E", fontSize: 14, fontWeight: "600" },
});
