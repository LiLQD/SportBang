import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  message: string;
  type?: ToastType;
  onHide?: () => void;
  duration?: number;
}

const { width } = Dimensions.get('window');

export const Toast = ({ message, type = 'success', onHide, duration = 3000 }: ToastProps) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      hide();
    }, duration);

    return () => clearTimeout(timer);
  }, []);

  const hide = () => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: -20,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (onHide) onHide();
    });
  };

  const getIcon = () => {
    switch (type) {
      case 'success': return 'checkmark-circle';
      case 'error': return 'alert-circle';
      case 'warning': return 'warning';
      default: return 'information-circle';
    }
  };

  const getColor = () => {
    switch (type) {
      case 'success': return '#22C55E';
      case 'error': return '#EF4444';
      case 'warning': return '#F59E0B';
      default: return '#3B82F6';
    }
  };

  return (
    <Animated.View style={[
      styles.container,
      { opacity, transform: [{ translateY }] }
    ]}>
      <View style={[styles.content, { borderLeftColor: getColor() }]}>
        <Ionicons name={getIcon()} size={24} color={getColor()} />
        <Text style={styles.text}>{message}</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    zIndex: 9999,
    alignItems: 'center',
  },
  content: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    borderLeftWidth: 4,
  },
  text: {
    marginLeft: 12,
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '500',
    flex: 1,
  },
});
