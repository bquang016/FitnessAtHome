import React, { useEffect, useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Vibration, Platform } from 'react-native';
import { THEME } from '../constants/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface Props {
  visible: boolean;
  onClose: () => void;
  restSeconds?: number;
}

export default function RestTimerModal({ visible, onClose, restSeconds = 90 }: Props) {
  const [timeLeft, setTimeLeft] = useState(restSeconds);

  useEffect(() => {
    let timerId: ReturnType<typeof setInterval>;

    if (visible) {
      // Reset timer whenever modal shows
      setTimeLeft(restSeconds);

      timerId = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerId);
            // Vibrate when done (1s on, 0.5s off, 1s on pattern)
            if (Platform.OS === 'ios') {
              Vibration.vibrate([0, 1000, 500, 1000]);
            } else {
              Vibration.vibrate(2000); 
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(timerId);
  }, [visible, restSeconds]);

  const handleSkip = () => {
    onClose();
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeStr = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <MaterialCommunityIcons name="timer-sand" size={48} color={THEME.colors.primary} style={{ marginBottom: 10 }} />
          <Text style={styles.title}>
            {timeLeft > 0 ? 'Thời gian nghỉ' : 'Hết giờ nghỉ!'}
          </Text>
          <Text style={styles.timerText}>{timeStr}</Text>
          
          <Text style={styles.subtitle}>
            {timeLeft > 0 
              ? 'Hãy hít thở sâu và thư giãn cơ bắp để chuẩn bị cho hiệp tiếp theo.' 
              : 'Hãy vào vị trí ngay!'}
          </Text>

          <TouchableOpacity 
            style={[styles.button, timeLeft === 0 && styles.buttonAction]} 
            onPress={handleSkip}
          >
            <Text style={[styles.buttonText, timeLeft === 0 && styles.buttonTextAction]}>
              {timeLeft > 0 ? 'BỎ QUA & TẬP LUÔN' : 'BẮT ĐẦU HIỆP MỚI'}
            </Text>
          </TouchableOpacity>
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
    padding: 24,
  },
  card: {
    backgroundColor: THEME.colors.white,
    borderRadius: THEME.radius.large,
    width: '100%',
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: THEME.colors.textMain,
    marginBottom: THEME.spacing.s,
  },
  timerText: {
    fontSize: 64,
    fontWeight: '800',
    color: THEME.colors.primary,
    marginBottom: THEME.spacing.m,
  },
  subtitle: {
    fontSize: 14,
    color: THEME.colors.textSub,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  button: {
    width: '100%',
    backgroundColor: '#F5F5F7',
    paddingVertical: 16,
    borderRadius: THEME.radius.small,
    alignItems: 'center',
  },
  buttonText: {
    color: THEME.colors.textSub,
    fontWeight: '700',
    fontSize: 15,
  },
  buttonAction: {
    backgroundColor: THEME.colors.primary,
  },
  buttonTextAction: {
    color: THEME.colors.white,
  }
});
