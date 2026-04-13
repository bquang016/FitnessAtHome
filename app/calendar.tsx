import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function CalendarScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [streakHistory, setStreakHistory] = useState<string[]>([]);
  const [streakCount, setStreakCount] = useState(0);

  useEffect(() => {
    const loadStreakData = async () => {
      try {
        const STREAK_DATA_KEY = '@streak_data';
        const streakStr = await AsyncStorage.getItem(STREAK_DATA_KEY);
        if (streakStr) {
          const streakData = JSON.parse(streakStr);
          setStreakHistory(streakData.history || []);
          setStreakCount(streakData.count || 0);
        }
      } catch (e) {}
    };
    loadStreakData();
  }, []);

  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  const daysArray = Array.from({ length: daysInMonth }, (_, k) => k + 1);
  const paddingDays = Array.from({ length: firstDayOfWeek }, (_, k) => `pad-${k}`);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#121212" />
        </TouchableOpacity>
        <Text style={styles.title}>Lịch Sử Chuỗi Thực Hiện</Text>
        <View style={styles.spacer} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        
        <View style={styles.streakBanner}>
          <View style={styles.streakIconBg}>
            <MaterialCommunityIcons name="fire" size={40} color="#FFB870" />
          </View>
          <View style={styles.bannerInfo}>
            <Text style={styles.bannerText}>Chuỗi hiện tại của bạn</Text>
            <Text style={styles.bannerCount}>{streakCount} ngày</Text>
          </View>
        </View>

        <View style={styles.calendarCard}>
          <Text style={styles.monthTitle}>Tháng {month + 1} / {year}</Text>
          
          <View style={styles.weekInfoRow}>
             {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map(d => <Text key={d} style={styles.weekDayText}>{d}</Text>)}
          </View>

          <View style={styles.daysGrid}>
            {paddingDays.map(item => (
              <View key={item} style={styles.dayItem} />
            ))}
            {daysArray.map((day) => {
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const isAchieved = streakHistory.includes(dateStr);
              const isToday = day === today.getDate();
              
              return (
                <View key={day} style={[styles.dayItem, isAchieved && styles.dayAchieved, !isAchieved && isToday && styles.dayToday]}>
                  <Text style={[styles.dayNumber, isAchieved && styles.dayNumberAchieved, isToday && !isAchieved && {color: '#FFB870'}]}>{day}</Text>
                  {isAchieved && <MaterialCommunityIcons name="fire" size={12} color="#FFFFFF" style={{position:'absolute', bottom:2}} />}
                </View>
              );
            })}
          </View>
        </View>

        <Text style={styles.noteText}>* Các ngày có biểu tượng ngọn lửa là ngày bạn đã hoàn thành đủ chỉ tiêu năng lượng (2500 Kcal) hoặc có tập luyện.</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF', paddingHorizontal: 20 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 15, marginBottom: 20 },
  backBtn: { padding: 8, backgroundColor: '#F5F5F7', borderRadius: 20 },
  title: { fontSize: 18, fontWeight: '700', color: '#121212' },
  spacer: { width: 40 },

  streakBanner: { flexDirection: 'row', backgroundColor: '#121212', borderRadius: 24, padding: 25, alignItems: 'center', marginBottom: 30, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.15, shadowRadius: 20, elevation: 8 },
  streakIconBg: { backgroundColor: '#2A2A2A', padding: 15, borderRadius: 24 },
  bannerInfo: { marginLeft: 15 },
  bannerText: { color: '#8E8E93', fontSize: 14, fontWeight: '600', marginBottom: 5 },
  bannerCount: { color: '#FFFFFF', fontSize: 32, fontWeight: '700' },

  calendarCard: { backgroundColor: '#F5F5F7', borderRadius: 24, padding: 20 },
  monthTitle: { fontSize: 18, fontWeight: '700', color: '#121212', marginBottom: 20, textAlign: 'center' },
  weekInfoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  weekDayText: { color: '#8E8E93', fontWeight: '600', fontSize: 13, width: `${100/7}%`, textAlign: 'center' },
  daysGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  dayItem: { width: `${100/7 - 2}%`, aspectRatio: 1, marginVertical: '1%', justifyContent: 'center', alignItems: 'center', borderRadius: 12 },
  dayAchieved: { backgroundColor: '#FFB870' },
  dayToday: { borderWidth: 2, borderColor: '#FFB870' },
  dayNumber: { fontSize: 15, fontWeight: '600', color: '#121212' },
  dayNumberAchieved: { color: '#FFFFFF', fontWeight: '700' },

  noteText: { marginTop: 30, color: '#8E8E93', fontSize: 13, lineHeight: 20, textAlign: 'center', paddingHorizontal: 10 }
});
