import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ConfirmationModalProps {
  visible: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'success' | 'info';
  darkMode?: boolean;
}

export const ConfirmationModal = ({
  visible,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "Xác nhận",
  cancelText = "Hủy",
  type = 'info',
  darkMode = false,
}: ConfirmationModalProps) => {
  const getIcon = () => {
    switch (type) {
      case 'danger': return 'alert-circle';
      case 'success': return 'checkmark-circle';
      default: return 'information-circle';
    }
  };

  const getColor = () => {
    switch (type) {
      case 'danger': return '#EF4444';
      case 'success': return '#22C55E';
      default: return '#3B82F6';
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={[styles.content, darkMode && { backgroundColor: "#1F2937" }]}>
          <View style={[styles.iconBox, { backgroundColor: getColor() + '20' }]}>
            <Ionicons name={getIcon()} size={40} color={getColor()} />
          </View>

          <Text style={[styles.title, darkMode && { color: "#fff" }]}>{title}</Text>
          <Text style={[styles.message, darkMode && { color: "#9CA3AF" }]}>{message}</Text>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.btn, styles.cancelBtn, darkMode && { backgroundColor: "#374151" }]}
              onPress={onCancel}
            >
              <Text style={[styles.cancelText, darkMode && { color: "#D1D5DB" }]}>{cancelText}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.btn, { backgroundColor: getColor() }]}
              onPress={onConfirm}
            >
              <Text style={styles.confirmText}>{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  content: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  iconBox: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 8,
    textAlign: 'center'
  },
  message: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%'
  },
  btn: {
    flex: 1,
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center'
  },
  cancelBtn: {
    backgroundColor: '#F1F5F9'
  },
  cancelText: {
    color: '#64748B',
    fontWeight: '600'
  },
  confirmText: {
    color: '#fff',
    fontWeight: 'bold'
  }
});
