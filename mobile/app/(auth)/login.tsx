import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useState, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";

import { useAuthStore } from "@/src/store/auth.store";
import { authService } from "@/src/services/auth.service";
import { getShadow } from "@/src/utils/style";
import { Toast, ToastType } from "@/src/components/Toast";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Toast state
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  // Inline Errors state
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});

  const router = useRouter();
  const params = useLocalSearchParams();
  const setAuth = useAuthStore((state) => state.setAuth);

  useEffect(() => {
    if (params.registered === "true") {
      setToast({ message: "Đăng ký thành công! Vui lòng đăng nhập.", type: "success" });
    }
  }, [params.registered]);

  const validate = () => {
    let newErrors: { email?: string; password?: string } = {};
    if (!email) newErrors.email = "Vui lòng nhập email";
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Email không đúng định dạng";

    if (!password) newErrors.password = "Vui lòng nhập mật khẩu";
    else if (password.length < 6) newErrors.password = "Mật khẩu phải từ 6 ký tự";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    setErrors({});
    if (!validate()) return;

    try {
      setLoading(true);
      const res = await authService.login(email, password);
      const payload = res.data || res;
      const userData = payload.user;

      // KIỂM TRA QUYỀN TRUY CẬP TRÊN MOBILE
      if (userData.role !== 'customer') {
        setErrors({ general: "Tài khoản này dành cho Quản lý/Admin. Vui lòng đăng nhập trên phiên bản Web." });
        return;
      }

      setAuth(userData, payload.token, payload.refreshToken);
      router.replace("/(user)/");

    } catch (err: any) {
      const msg = err.message || "Sai tài khoản hoặc mật khẩu";
      setErrors({ general: msg });
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
          <Ionicons name="mail-outline" size={20} color={errors.email ? "#EF4444" : "#64748B"} style={styles.iconLeft} />
          <TextInput
            placeholder="Email"
            placeholderTextColor="#94A3B8"
            value={email}
            onChangeText={(txt) => {
              setEmail(txt);
              if (errors.email) setErrors({ ...errors, email: undefined });
            }}
            style={[styles.input, errors.email && styles.inputError]}
            autoCapitalize="none"
          />
          {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
        </View>

        <View style={styles.inputWrapper}>
          <Ionicons name="lock-closed-outline" size={20} color={errors.password ? "#EF4444" : "#64748B"} style={styles.iconLeft} />
          <TextInput
            placeholder="Mật khẩu"
            placeholderTextColor="#94A3B8"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={(txt) => {
              setPassword(txt);
              if (errors.password) setErrors({ ...errors, password: undefined });
            }}
            style={[styles.input, errors.password && styles.inputError]}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.iconRight}>
            <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color="#64748B" />
          </TouchableOpacity>
          {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
        </View>

        {errors.general && (
          <View style={styles.generalErrorBox}>
            <Ionicons name="alert-circle" size={18} color="#EF4444" />
            <Text style={styles.generalErrorText}>{errors.general}</Text>
          </View>
        )}

        <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Đăng nhập</Text>
          )}
        </TouchableOpacity>

        <View style={styles.switchBox}>
          <Text style={styles.switchText}>Chưa có tài khoản? </Text>
          <TouchableOpacity onPress={() => router.push("/register")}>
            <Text style={styles.switchLink}>Đăng ký</Text>
          </TouchableOpacity>
        </View>
      </View>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onHide={() => setToast(null)}
        />
      )}
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
  inputError: { borderColor: "#EF4444" },
  errorText: { color: "#EF4444", fontSize: 12, marginTop: 4, marginLeft: 4 },
  generalErrorBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF2F2', padding: 12, borderRadius: 12, marginBottom: 16 },
  generalErrorText: { color: "#EF4444", fontSize: 13, marginLeft: 8, flex: 1 },
  iconLeft: { position: "absolute", left: 14, top: 18, zIndex: 1 },
  iconRight: { position: "absolute", right: 14 },
  button: { height: 56, backgroundColor: "#22C55E", borderRadius: 16, justifyContent: "center", alignItems: "center", marginTop: 10 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  switchBox: { flexDirection: "row", justifyContent: "center", marginTop: 20 },
  switchText: { color: "#64748B", fontSize: 14 },
  switchLink: { color: "#22C55E", fontSize: 14, fontWeight: "600" },
});
