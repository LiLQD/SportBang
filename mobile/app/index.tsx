import { Redirect } from "expo-router";
import { useAuthStore } from "@/src/store/auth.store";

export default function App() {
  const { user } = useAuthStore();

  if (!user) return <Redirect href="/(auth)/login" />;

  if (user.role === 'owner') {
    return <Redirect href="/owner" />;
  }

  if (user.role === 'admin') {
    return <Redirect href="/(admin)/dashboard" />;
  }

  return <Redirect href="/(user)" />;
}
