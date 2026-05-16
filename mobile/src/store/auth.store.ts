import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import { authService } from "../services/auth.service";

interface AuthState {
  user: any | null;
  token: string | null;
  refreshToken: string | null;
  darkMode: boolean;
  isHydrated: boolean;
  setAuth: (user: any, token: string, refreshToken?: string) => void;
  toggleDarkMode: () => void;
  logout: () => Promise<void>;
  setHydrated: (state: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      refreshToken: null,
      darkMode: false,
      isHydrated: false,

      setAuth: (user, token, refreshToken) => {
        set({
          user: user || null,
          token: token || null,
          refreshToken: refreshToken || null
        });
      },
      toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),

      logout: async () => {
        console.log("[AuthStore] Starting logout process...");
        try {
          // 1. Gọi API logout (revoke trên server) - Timeout sau 2s để không kẹt UI
          await Promise.race([
            authService.logout(),
            new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 2000))
          ]).catch(() => console.log("Backend logout skipped/timed out"));
        } catch (error) {
          console.error("Logout API error:", error);
        } finally {
          // 2. Xóa State trong bộ nhớ
          set({ user: null, token: null, refreshToken: null });

          // 3. Xóa thủ công trong Storage để chắc chắn
          try {
            const storageKey = "sportbang-auth-v11";
            if (Platform.OS === 'web') {
              window.localStorage.removeItem(storageKey);
            } else {
              await AsyncStorage.removeItem(storageKey);
            }
          } catch (e) {
            console.error("Manual storage clear failed:", e);
          }
          console.log("[AuthStore] Logout successful, storage cleared.");
        }
      },
      setHydrated: (state) => set({ isHydrated: state }),
    }),
    {
      name: "sportbang-auth-v11",
      storage: createJSONStorage(() => (Platform.OS === "web" ? window.localStorage : AsyncStorage)),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        darkMode: state.darkMode,
      }),
    }
  )
);
