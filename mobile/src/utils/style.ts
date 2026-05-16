import { Platform } from "react-native";

/**
 * Helper to create cross-platform shadows (iOS, Android, Web)
 */
export const getShadow = (opacity: number, radius: number, elevation: number) => {
  return Platform.select({
    ios: {
      shadowColor: "#000",
      shadowOpacity: opacity,
      shadowRadius: radius,
      shadowOffset: { width: 0, height: 2 },
    },
    android: {
      elevation: elevation,
    },
    web: {
      boxShadow: `0px 2px ${radius}px rgba(0, 0, 0, ${opacity})`,
    },
  });
};
