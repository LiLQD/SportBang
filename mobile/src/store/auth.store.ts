import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

interface AuthState {
  user: any | null;
  token: string | null;
  darkMode: boolean;
  isHydrated: boolean;
  setAuth: (user: any, token: string) => void;
  toggleDarkMode: () => void;
  logout: () => void;
  setHydrated: (state: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      darkMode: false,
      isHydrated: false,

      setAuth: (user, token) => {
        set({ user: user || null, token: token || null });
      },
      toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
      logout: () => {
        set({ user: null, token: null });
      },
      setHydrated: (state) => set({ isHydrated: state }),
    }),
    {
      name: "sportbang-auth-v11",
      storage: createJSONStorage(() => (Platform.OS === "web" ? window.localStorage : AsyncStorage)),
      onRehydrateStorage: () => (state) => {
        // Gọi sau khi quá trình rehydrate hoàn tất
        state?.setHydrated(true);
      },
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        darkMode: state.darkMode,
      }),
    }
  )
);
