import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function LoginScreen() {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  return (
    <View style={{ flex: 1, backgroundColor: "#F8FAFC", justifyContent: "center", padding: 24 }}>

      {/* Logo */}
      <View style={{ alignItems: "center", marginBottom: 30 }}>
        <View style={{
          width: 64,
          height: 64,
          backgroundColor: "#22C55E",
          borderRadius: 16,
          justifyContent: "center",
          alignItems: "center"
        }}>
          <Text style={{ color: "white", fontWeight: "bold" }}>SB</Text>
        </View>

        <Text style={{ fontSize: 28, fontWeight: "bold", marginTop: 10 }}>
          SportBang
        </Text>
      </View>

      {/* Title */}
      <Text style={{ fontSize: 24, fontWeight: "bold", textAlign: "center" }}>
        Chào mừng trở lại
      </Text>

      <Text style={{ textAlign: "center", color: "#64748B", marginBottom: 20 }}>
        Đăng nhập để tiếp tục
      </Text>

      {/* Email */}
      <View style={{ marginBottom: 15 }}>
        <TextInput
          placeholder="Email"
          style={{
            height: 55,
            borderWidth: 1,
            borderColor: "#ccc",
            borderRadius: 16,
            paddingHorizontal: 15
          }}
        />
      </View>

      {/* Password */}
      <View style={{ marginBottom: 15 }}>
        <View style={{
          flexDirection: "row",
          alignItems: "center",
          borderWidth: 1,
          borderColor: "#ccc",
          borderRadius: 16,
          paddingHorizontal: 10
        }}>
          <TextInput
            placeholder="Mật khẩu"
            secureTextEntry={!showPassword}
            style={{ flex: 1, height: 55 }}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Ionicons name={showPassword ? "eye-off" : "eye"} size={22} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Button */}
      <TouchableOpacity
        style={{
          backgroundColor: "#22C55E",
          height: 55,
          borderRadius: 16,
          justifyContent: "center",
          alignItems: "center"
        }}
      >
        <Text style={{ color: "white", fontWeight: "bold" }}>
          Đăng nhập
        </Text>
      </TouchableOpacity>

      {/* Link */}
      <View style={{ flexDirection: "row", justifyContent: "center", marginTop: 20 }}>
        <Text>Chưa có tài khoản? </Text>
        <TouchableOpacity onPress={() => router.push("/register")}>
          <Text style={{ color: "#22C55E", fontWeight: "bold" }}>
            Đăng ký
          </Text>
        </TouchableOpacity>
      </View>

    </View>
  );
}