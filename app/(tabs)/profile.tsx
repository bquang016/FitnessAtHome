import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Switch, Image, Modal, TextInput, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppStore } from '../../store/useAppStore';
import { THEME } from '../../constants/theme';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { userProfile, setProfile } = useAppStore();
  
  // State quản lý cài đặt thông báo
  const [notifyDiet, setNotifyDiet] = useState(true);
  const [notifyWorkout, setNotifyWorkout] = useState(true);

  // Update weight state
  const [isUpdateVisible, setIsUpdateVisible] = useState(false);
  const [newWeight, setNewWeight] = useState('');

  // Chỉ số cơ thể (editable) - load từ userProfile
  const [armSize, setArmSize] = useState(String(userProfile?.armSize || ''));
  const [chestSize, setChestSize] = useState(String(userProfile?.chestSize || ''));
  const [thighSize, setThighSize] = useState(String(userProfile?.thighSize || ''));

  // Dữ liệu tiến độ
  const currentWeight = userProfile?.weight || 0; // Cân nặng hiện tại
  const targetWeight = userProfile?.gender === 'male' ? currentWeight + 10 : currentWeight + 5;  // Mục tiêu giả định
  const startWeight = currentWeight > 0 ? currentWeight - 2 : 0;   // Giả lập
  
  // Tính % hoàn thành
  const weightProgress = Math.max(0, Math.min(100, ((currentWeight - startWeight) / (targetWeight - startWeight)) * 100));

  const handleUpdateWeight = () => {
    const parsed = parseFloat(newWeight);
    if (isNaN(parsed) || parsed <= 0) {
      Alert.alert('Lỗi', 'Vui lòng nhập cân nặng hợp lệ!');
      return;
    }
    if (userProfile) {
      setProfile({ ...userProfile, weight: parsed });
      setNewWeight('');
      setIsUpdateVisible(false);
      Alert.alert('Thành công', 'Đã cập nhật cân nặng và tính lại Macros mới!');
    }
  };

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={{ paddingTop: insets.top + 10, paddingBottom: 120 }}
      showsVerticalScrollIndicator={false}
    >
      {/* 1. TIÊU ĐỀ & AVATAR */}
      <View style={styles.header}>
        <View>
          <Text style={styles.subtitle}>Hồ sơ</Text>
          <Text style={styles.title}>Cá Nhân</Text>
        </View>
        <View style={styles.avatarContainer}>
          <MaterialCommunityIcons name="account-circle" size={60} color="#121212" />
        </View>
      </View>

      {/* 2. THẺ TIẾN ĐỘ TĂNG CÂN (MÀU TỐI) */}
      <View style={styles.progressCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Mục Tiêu Cân Nặng</Text>
          <MaterialCommunityIcons name="scale-bathroom" size={24} color="#FFB870" />
        </View>

        <View style={styles.weightInfo}>
          <View style={styles.weightBlock}>
            <Text style={styles.weightLabel}>Hiện tại</Text>
            <Text style={styles.weightValue}>{currentWeight} <Text style={styles.weightUnit}>kg</Text></Text>
          </View>
          <MaterialCommunityIcons name="arrow-right-bold" size={24} color="#8E8E93" />
          <View style={styles.weightBlock}>
            <Text style={styles.weightLabel}>Mục tiêu</Text>
            <Text style={[styles.weightValue, { color: '#33D1C1' }]}>{targetWeight} <Text style={styles.weightUnit}>kg</Text></Text>
          </View>
        </View>

        {/* Thanh Progress Bar */}
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${weightProgress}%` }]} />
        </View>
        <View style={styles.progressLabels}>
          <Text style={styles.progressLabelText}>Bắt đầu: {startWeight}kg</Text>
          <Text style={styles.progressLabelText}>Còn {targetWeight - currentWeight}kg nữa</Text>
        </View>

        <TouchableOpacity style={styles.updateButton} onPress={() => setIsUpdateVisible(true)}>
          <Text style={styles.updateButtonText}>CẬP NHẬT CÂN NẶNG</Text>
        </TouchableOpacity>
      </View>

      {/* 3. SỐ ĐO CƠ THỂ */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Chỉ Số Cơ Thể (cm)</Text>
        <View style={styles.measureContainer}>
          <View style={styles.measureBox}>
            <MaterialCommunityIcons name="arm-flex" size={24} color="#121212" />
            <Text style={styles.measureName}>Bắp tay</Text>
            <TextInput
              style={styles.measureInput}
              keyboardType="numeric"
              placeholder="--"
              value={armSize}
              onChangeText={setArmSize}
              onBlur={() => {
                if (userProfile && armSize) setProfile({ ...userProfile, armSize: parseFloat(armSize) || 0 } as any);
              }}
            />
          </View>
          <View style={styles.measureBox}>
            <MaterialCommunityIcons name="human-male" size={24} color="#121212" />
            <Text style={styles.measureName}>Vòng ngực</Text>
            <TextInput
              style={styles.measureInput}
              keyboardType="numeric"
              placeholder="--"
              value={chestSize}
              onChangeText={setChestSize}
              onBlur={() => {
                if (userProfile && chestSize) setProfile({ ...userProfile, chestSize: parseFloat(chestSize) || 0 } as any);
              }}
            />
          </View>
          <View style={styles.measureBox}>
            <MaterialCommunityIcons name="run" size={24} color="#121212" />
            <Text style={styles.measureName}>Vòng đùi</Text>
            <TextInput
              style={styles.measureInput}
              keyboardType="numeric"
              placeholder="--"
              value={thighSize}
              onChangeText={setThighSize}
              onBlur={() => {
                if (userProfile && thighSize) setProfile({ ...userProfile, thighSize: parseFloat(thighSize) || 0 } as any);
              }}
            />
          </View>
        </View>
      </View>

      {/* 4. CÀI ĐẶT ỨNG DỤNG */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Cài Đặt Hệ Thống</Text>
        <View style={styles.settingsCard}>
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <MaterialCommunityIcons name="bell-ring" size={22} color="#121212" />
              <Text style={styles.settingText}>Nhắc nhở ăn uống (6 bữa)</Text>
            </View>
            <Switch 
              value={notifyDiet} 
              onValueChange={setNotifyDiet} 
              trackColor={{ false: '#D1D1D6', true: '#33D1C1' }}
              thumbColor="#FFFFFF"
            />
          </View>
          <View style={styles.divider} />
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <MaterialCommunityIcons name="dumbbell" size={22} color="#121212" />
              <Text style={styles.settingText}>Nhắc nhở tập luyện</Text>
            </View>
            <Switch 
              value={notifyWorkout} 
              onValueChange={setNotifyWorkout}
              trackColor={{ false: '#D1D1D6', true: '#FFB870' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>
      </View>


      {/* WEIGHT UPDATE MODAL */}
      <Modal visible={isUpdateVisible} transparent animationType="fade">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Nhập cân nặng mới</Text>
            <Text style={styles.modalDesc}>Hệ thống sẽ tự động cấu hình lại kế hoạch Macros mới nhất dành riêng cho bạn sau khi cập nhật.</Text>
            
            <TextInput
              style={styles.modalInput}
              keyboardType="numeric"
              placeholder="Ví dụ: 62"
              value={newWeight}
              onChangeText={setNewWeight}
              autoFocus
            />

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => setIsUpdateVisible(false)}>
                <Text style={styles.modalCancelText}>HỦY</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSave} onPress={handleUpdateWeight}>
                <Text style={styles.modalSaveText}>LƯU & XỬ LÝ</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF', paddingHorizontal: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  subtitle: { fontSize: 28, color: '#8E8E93', fontWeight: '400' },
  title: { fontSize: 28, color: '#121212', fontWeight: '700' },
  avatarContainer: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#F5F5F7', justifyContent: 'center', alignItems: 'center' },
  
  // Card Tiến độ
  progressCard: { backgroundColor: '#121212', borderRadius: 24, padding: 24, marginBottom: 30, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.15, shadowRadius: 20, elevation: 8 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  cardTitle: { color: '#8E8E93', fontSize: 16, fontWeight: '600' },
  weightInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingHorizontal: 10 },
  weightBlock: { alignItems: 'center' },
  weightLabel: { color: '#8E8E93', fontSize: 13, marginBottom: 5 },
  weightValue: { color: '#FFFFFF', fontSize: 32, fontWeight: '700' },
  weightUnit: { fontSize: 16, color: '#8E8E93', fontWeight: '500' },
  
  progressBarBg: { height: 10, backgroundColor: '#2A2A2A', borderRadius: 5, marginBottom: 10 },
  progressBarFill: { height: 10, backgroundColor: '#FFB870', borderRadius: 5 },
  progressLabels: { flexDirection: 'row', justifyContent: 'space-between' },
  progressLabelText: { color: '#8E8E93', fontSize: 12 },
  
  updateButton: { backgroundColor: '#2A2A2A', paddingVertical: 14, borderRadius: 12, marginTop: 20, alignItems: 'center' },
  updateButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700', letterSpacing: 1 },

  // Sections
  section: { marginBottom: 30 },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: '#121212', marginBottom: 15 },
  
  // Box Số đo
  measureContainer: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  measureBox: { flex: 1, backgroundColor: '#F5F5F7', padding: 15, borderRadius: 16, alignItems: 'center' },
  measureName: { color: '#8E8E93', fontSize: 13, marginTop: 8, marginBottom: 4 },
  measureValue: { color: '#121212', fontSize: 18, fontWeight: '700' },
  measureInput: { color: '#121212', fontSize: 18, fontWeight: '700', textAlign: 'center', borderBottomWidth: 1, borderBottomColor: '#D1D1D6', paddingVertical: 4, minWidth: 50 },

  // Settings
  settingsCard: { backgroundColor: '#F5F5F7', borderRadius: 16, paddingHorizontal: 20 },
  settingItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 18 },
  settingInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  settingText: { fontSize: 15, fontWeight: '500', color: '#121212' },
  divider: { height: 1, backgroundColor: '#E5E5EA' },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 25, width: '100%', maxWidth: 400 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#121212', marginBottom: 10 },
  modalDesc: { fontSize: 14, color: '#8E8E93', marginBottom: 20, lineHeight: 20 },
  modalInput: { backgroundColor: '#F5F5F7', borderRadius: 12, padding: 15, fontSize: 20, fontWeight: '700', textAlign: 'center', color: '#121212', marginBottom: 25 },
  modalActions: { flexDirection: 'row', gap: 10 },
  modalCancel: { flex: 1, backgroundColor: '#F5F5F7', padding: 15, borderRadius: 12, alignItems: 'center' },
  modalCancelText: { color: '#8E8E93', fontWeight: '700', fontSize: 14 },
  modalSave: { flex: 1, backgroundColor: THEME.colors.primary, padding: 15, borderRadius: 12, alignItems: 'center' },
  modalSaveText: { color: THEME.colors.white, fontWeight: '700', fontSize: 14 },
});