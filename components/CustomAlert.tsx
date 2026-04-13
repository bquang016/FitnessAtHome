import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { THEME } from '../constants/theme';

interface CustomAlertProps {
  visible: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  confirmText?: string;
  onCancel?: () => void;
  cancelText?: string;
}

export default function CustomAlert({
  visible,
  title,
  message,
  onConfirm,
  confirmText = 'Đồng ý',
  onCancel,
  cancelText = 'Hủy'
}: CustomAlertProps) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.alertBox}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          
          <View style={styles.buttonRow}>
            {onCancel && (
              <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
                <Text style={styles.cancelText}>{cancelText}</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.confirmBtn} onPress={onConfirm}>
              <Text style={styles.confirmText}>{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: THEME.colors.alertBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertBox: {
    width: '80%',
    backgroundColor: THEME.colors.white,
    borderRadius: THEME.radius.large,
    padding: THEME.spacing.l,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: THEME.colors.textMain,
    marginBottom: THEME.spacing.s,
    textAlign: 'center',
  },
  message: {
    fontSize: 15,
    color: THEME.colors.textSub,
    textAlign: 'center',
    marginBottom: THEME.spacing.l,
    lineHeight: 22,
  },
  buttonRow: {
    flexDirection: 'row',
    width: '100%',
    gap: THEME.spacing.s,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    backgroundColor: THEME.colors.bgCard,
    borderRadius: THEME.radius.small,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: THEME.colors.textMain,
  },
  confirmBtn: {
    flex: 1,
    paddingVertical: 14,
    backgroundColor: THEME.colors.primary,
    borderRadius: THEME.radius.small,
    alignItems: 'center',
  },
  confirmText: {
    fontSize: 15,
    fontWeight: '700',
    color: THEME.colors.white,
  }
});
