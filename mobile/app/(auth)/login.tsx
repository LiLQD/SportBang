import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Platform,
} from "react-native";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { useAuthStore } from "@/src/store/auth.store";
import { authService } from "@/src/services/auth.service";
import { getShadow } from "@/src/utils/style";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleLogin = async () => {
    if (!email || !password) {
      if (Platform.OS === 'web') window.alert("Vui lòng nhập đầy đủ thông tin");
      else Alert.alert("Lỗi", "Vui lòng nhập đầy đủ thông tin");
      return;
    }

    try {
      setLoading(true);
      const res = await authService.login(email, password);

      // Kiểm tra cấu trúc dữ liệu linh hoạt (Backend có thể trả về res.data hoặc res trực tiếp)
      const payload = res.data || res;
      const userData = payload.user;
      const tokenData = payload.token;
      const refreshTokenData = payload.refreshToken;

      if (!userData || !tokenData) {
        console.error("Dữ liệu trả về không đúng cấu trúc:", res);
        throw new Error("Không tìm thấy thông tin User hoặc Token từ Server.");
      }

      // Lưu vào Store (Gồm cả Refresh Token)
      setAuth(userData, tokenData, refreshTokenData);

      // Hàm điều hướng dựa trên role
      const redirectByRole = () => {
        const role = userData.role || 'customer';
        if (role === 'admin') router.replace("/(admin)/dashboard");
        else if (role === 'owner') router.replace("/owner");
        else router.replace("/(user)/");
      };

      if (Platform.OS === 'web') {
        window.alert("Đăng nhập thành công!");
        redirectByRole();
      } else {
        Alert.alert("Thành công", "Đăng nhập thành công", [
          { text: "OK", onPress: redirectByRole }
        ]);
      }
    } catch (err: any) {
      console.error("Login Crash Error:", err);
      const msg = err.message || "Sai tài khoản hoặc mật khẩu";
      if (Platform.OS === 'web') window.alert("Lỗi: " + msg);
      else Alert.alert("Lỗi", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.logoContainer}>
          <View style={styles.logoBox} />
          <Text style={styles.appName}>SportBang</Text>
        </View>

        <View style={styles.titleBox}>
          <Text style={styles.title}>Chào mừng trở lại</Text>
          <Text style={styles.subtitle}>Đăng nhập để tiếp tục</Text>
        </View>

        <View style={styles.inputWrapper}>
          <Ionicons name="mail-outline" size={20} color="#64748B" style={styles.iconLeft} />
          <TextInput
            placeholder="Email"
            placeholderTextColor="#94A3B8"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputWrapper}>
          <Ionicons name="lock-closed-outline" size={20} color="#64748B" style={styles.iconLeft} />
          <TextInput
            placeholder="Mật khẩu"
            placeholderTextColor="#94A3B8"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
            style={styles.input}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.iconRight}>
            <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color="#64748B" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
          <Text style={styles.buttonText}>
            {loading ? "Đang xử lý..." : "Đăng nhập"}
          </Text>
        </TouchableOpacity>

        <View style={styles.switchBox}>
          <Text style={styles.switchText}>Chưa có tài khoản? </Text>
          <TouchableOpacity onPress={() => router.push("/register")}>
            <Text style={styles.switchLink}>Đăng ký</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC", justifyContent: "center", alignItems: "center" },
  card: { width: "90%", maxWidth: 450, backgroundColor: "#fff", borderRadius: 32, padding: 24, ...getShadow(0.05, 10, 5) },
  logoContainer: { alignItems: "center", marginBottom: 16 },
  logoBox: { width: 64, height: 64, backgroundColor: "#22C55E", borderRadius: 16, marginBottom: 8 },
  appName: { fontSize: 26, fontWeight: "bold", color: "#0F172A" },
  titleBox: { alignItems: "center", marginBottom: 20 },
  title: { fontSize: 22, fontWeight: "bold", color: "#0F172A" },
  subtitle: { fontSize: 14, color: "#64748B", marginTop: 4 },
  inputWrapper: { marginBottom: 14, justifyContent: "center" },
  input: { height: 56, borderRadius: 16, borderWidth: 2, borderColor: "#E2E8F0", paddingLeft: 44, paddingRight: 44, fontSize: 15, color: "#0F172A" },
  iconLeft: { position: "absolute", left: 14, zIndex: 1 },
  iconRight: { position: "absolute", right: 14 },
  button: { height: 56, backgroundColor: "#22C55E", borderRadius: 16, justifyContent: "center", alignItems: "center", marginTop: 10 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  switchBox: { flexDirection: "row", justifyContent: "center", marginTop: 20 },
  switchText: { color: "#64748B", fontSize: 14 },
  switchLink: { color: "#22C55E", fontSize: 14, fontWeight: "600" },
});
