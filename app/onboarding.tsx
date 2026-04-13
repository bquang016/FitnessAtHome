import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { THEME } from '../constants/theme';
import { useAppStore, UserProfile } from '../store/useAppStore';

const activityLevels = [
  { label: 'Ít vận động (Việc văn phòng)', value: 1.2 },
  { label: 'Vận động nhẹ (Tập 1-3 ngày/tuần)', value: 1.375 },
  { label: 'Vận động vừa (Tập 3-5 ngày/tuần)', value: 1.55 },
  { label: 'Vận động nhiều (Tập 6-7 ngày/tuần)', value: 1.725 },
];

export default function OnboardingScreen() {
  const { setProfile } = useAppStore();

  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [activity, setActivity] = useState<number>(1.2);

  const handleSave = () => {
    if (!age || !weight || !height) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập đầy đủ tuổi, cân nặng và chiều cao!');
      return;
    }

    const ageNum = parseInt(age);
    const weightNum = parseFloat(weight);
    const heightNum = parseFloat(height);

    if (isNaN(ageNum) || isNaN(weightNum) || isNaN(heightNum)) {
      Alert.alert('Dữ liệu không hợp lệ', 'Tuổi, cân nặng và chiều cao phải là số!');
      return;
    }

    const profile: UserProfile = {
      gender,
      age: ageNum,
      weight: weightNum,
      height: heightNum,
      activityLevel: activity
    };

    setProfile(profile);
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Thiết Lập Mục Tiêu</Text>
          <Text style={styles.subtitle}>Để FitnessAtHome có thể tính toán chính xác mục tiêu TDEE giúp bạn tăng cân (Bulking), vui lòng cung cấp các chỉ số cơ thể.</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Giới tính</Text>
          <View style={styles.row}>
            <TouchableOpacity 
              style={[styles.genderBtn, gender === 'male' && styles.genderActive]} 
              onPress={() => setGender('male')}>
              <Text style={[styles.genderText, gender === 'male' && styles.textWhite]}>Nam</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.genderBtn, gender === 'female' && styles.genderActive]} 
              onPress={() => setGender('female')}>
              <Text style={[styles.genderText, gender === 'female' && styles.textWhite]}>Nữ</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tuổi</Text>
            <TextInput 
              style={styles.input} 
              keyboardType="numeric" 
              placeholder="Ví dụ: 25" 
              value={age} 
              onChangeText={setAge} 
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Chiều cao (cm)</Text>
            <TextInput 
              style={styles.input} 
              keyboardType="numeric" 
              placeholder="Ví dụ: 175" 
              value={height} 
              onChangeText={setHeight} 
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Cân nặng (kg)</Text>
            <TextInput 
              style={styles.input} 
              keyboardType="numeric" 
              placeholder="Ví dụ: 60" 
              value={weight} 
              onChangeText={setWeight} 
            />
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Mức độ Vận động (Công việc + Thể thao)</Text>
          {activityLevels.map(act => (
            <TouchableOpacity 
              key={act.value} 
              style={[styles.activityBtn, activity === act.value && styles.activityActive]}
              onPress={() => setActivity(act.value)}
            >
              <Text style={[styles.activityText, activity === act.value && styles.activityTextActive]}>{act.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>TÍNH TOÁN & BẮT ĐẦU</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.white,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: THEME.colors.textMain,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 15,
    color: THEME.colors.textSub,
    lineHeight: 22,
  },
  card: {
    backgroundColor: THEME.colors.bgCard,
    borderRadius: THEME.radius.medium,
    padding: 15,
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.colors.textMain,
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    gap: 15,
  },
  genderBtn: {
    flex: 1,
    padding: 15,
    borderRadius: THEME.radius.small,
    backgroundColor: THEME.colors.white,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    alignItems: 'center',
  },
  genderActive: {
    backgroundColor: THEME.colors.primary,
    borderColor: THEME.colors.primary,
  },
  genderText: {
    fontSize: 16,
    fontWeight: '600',
    color: THEME.colors.textMain,
  },
  textWhite: {
    color: THEME.colors.white,
  },
  inputGroup: {
    marginBottom: 15,
  },
  input: {
    backgroundColor: THEME.colors.white,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: THEME.radius.small,
    padding: 15,
    fontSize: 16,
    color: THEME.colors.textMain,
  },
  activityBtn: {
    padding: 15,
    borderRadius: THEME.radius.small,
    backgroundColor: THEME.colors.white,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    marginBottom: 10,
  },
  activityActive: {
    backgroundColor: '#E0F7FA',
    borderColor: THEME.colors.primary,
  },
  activityText: {
    fontSize: 14,
    fontWeight: '500',
    color: THEME.colors.textMain,
  },
  activityTextActive: {
    color: '#00796B',
    fontWeight: '700',
  },
  saveBtn: {
    backgroundColor: THEME.colors.textMain,
    padding: 18,
    borderRadius: THEME.radius.medium,
    alignItems: 'center',
    marginTop: 10,
  },
  saveBtnText: {
    color: THEME.colors.white,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1,
  }
});
