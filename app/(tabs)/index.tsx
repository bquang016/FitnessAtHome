// app/(tabs)/index.tsx
import React, { useState, useCallback } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CalorieLookupModal from '../../components/CalorieLookupModal';
export default function HomeScreen() {
  const router = useRouter();
  const [consumedKcal, setConsumedKcal] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timelineData, setTimelineData] = useState<any[]>([]);
  const [isLookupVisible, setIsLookupVisible] = useState(false);
  const [refreshSeed, setRefreshSeed] = useState(0);
  const targetKcal = 2500;

  useFocusEffect(
    useCallback(() => {
      setRefreshSeed(s => s + 1);
      return () => {};
    }, [])
  );

  React.useEffect(() => {
    let isMounted = true;
    const loadDashboardData = async () => {
        try {
          const todayDate = new Date().toISOString().split('T')[0];
          const STORAGE_KEY = `@meals_${todayDate}`;
          const EXTRA_KCAL_KEY = `@extra_kcal_${todayDate}`;
          const CUSTOM_SCHED_KEY = `@custom_schedule_${todayDate}`;
          
          let dailyMealsData = [
            { id: 1, time: '07:00', type: 'meal', title: 'Bữa sáng', sub: 'Phở bò béo', icon: 'bowl-mix', kcal: 450 },
            { id: 2, time: '10:00', type: 'meal', title: 'Bữa phụ sáng', sub: 'Sữa tươi + Bánh giò', icon: 'cup-water', kcal: 300 },
            { id: 3, time: '12:30', type: 'meal', title: 'Bữa trưa', sub: 'Cơm sườn nướng', icon: 'food-drumstick', kcal: 600 },
            { id: 4, time: '15:30', type: 'meal', title: 'Bữa phụ chiều', sub: 'Sinh tố bơ', icon: 'blender', kcal: 350 },
            { id: 5, time: '18:30', type: 'meal', title: 'Bữa tối', sub: 'Cơm ba chỉ quay', icon: 'food-turkey', kcal: 600 },
            { id: 6, time: '21:30', type: 'meal', title: 'Bữa phụ tối', sub: 'Sữa ông thọ pha ấm', icon: 'glass-mug', kcal: 200 }
          ];

          const customScheduleStr = await AsyncStorage.getItem(CUSTOM_SCHED_KEY);
          if (customScheduleStr) {
            dailyMealsData = JSON.parse(customScheduleStr);
          }

          let baseKcal = 0;
          let completedMealsList: number[] = [];
          const savedMeals = await AsyncStorage.getItem(STORAGE_KEY);
          if (savedMeals !== null) {
            completedMealsList = JSON.parse(savedMeals);
            baseKcal = dailyMealsData
              .filter(meal => completedMealsList.includes(meal.id))
              .reduce((total, meal) => total + meal.kcal, 0);
          }

          let extraKcal = 0;
          const extraData = await AsyncStorage.getItem(EXTRA_KCAL_KEY);
          if (extraData !== null) {
            extraKcal = Number(extraData);
          }

          const totalKcal = baseKcal + extraKcal;
          if (isMounted) setConsumedKcal(totalKcal);

          // Cập nhật Chuỗi (Streak)
          const STREAK_DATA_KEY = '@streak_data';
          const streakStr = await AsyncStorage.getItem(STREAK_DATA_KEY);
          let streakData = streakStr ? JSON.parse(streakStr) : { count: 0, lastDate: '', history: [] };
          if (!streakData.history) streakData.history = [];

          const yesterdayDate = new Date(Date.now() - 86400000).toISOString().split('T')[0];

          if (totalKcal >= targetKcal) {
            if (streakData.lastDate === yesterdayDate) {
              streakData.count += 1;
              streakData.lastDate = todayDate;
            } else if (streakData.lastDate !== todayDate) {
              streakData.count = 1;
              streakData.lastDate = todayDate;
            }
            if (!streakData.history.includes(todayDate)) streakData.history.push(todayDate);
            await AsyncStorage.setItem(STREAK_DATA_KEY, JSON.stringify(streakData));
          } else {
            if (streakData.lastDate !== todayDate && streakData.lastDate !== yesterdayDate && streakData.count !== 0) {
               streakData.count = 0; // Mất chuỗi do hôm qua không đạt
               await AsyncStorage.setItem(STREAK_DATA_KEY, JSON.stringify(streakData));
            }
          }
          if (isMounted) setStreak(streakData.count);

          // TẠO DỮ LIỆU LỊCH TRÌNH ĐỘNG
          const workoutDoneStr = await AsyncStorage.getItem(`@workout_done_${todayDate}`);
          const isWorkoutDone = workoutDoneStr === 'true';

          let scheduleData: any[] = [];
          dailyMealsData.forEach((m: any) => scheduleData.push({...m, isCompleted: completedMealsList.includes(m.id)}));
          scheduleData.push({ id: 'w1', time: '17:00', type: 'workout', title: 'Giờ Tập Luyện', sub: 'Lịch Tập • 45 phút', icon: 'dumbbell', isCompleted: isWorkoutDone });

          scheduleData.sort((a, b) => {
            const timeA = a.time ? Number(a.time.replace(':', '')) : 0;
            const timeB = b.time ? Number(b.time.replace(':', '')) : 0;
            return (isNaN(timeA) ? 0 : timeA) - (isNaN(timeB) ? 0 : timeB);
          });

          const nowMinutes = new Date().getHours() * 60 + new Date().getMinutes();
          let nextActiveFound = false;

          const finalTimeline = scheduleData.map((item) => {
            const h = item.time ? Number(item.time.split(':')[0]) : 0;
            const m = item.time ? Number(item.time.split(':')[1]) : 0;
            const itemMinutes = h * 60 + m;

            if (item.isCompleted) return {...item, status: 'completed'};
            
            if (itemMinutes <= nowMinutes) {
              return {...item, status: 'missed'};
            } else {
              if (!nextActiveFound) {
                nextActiveFound = true;
                return {...item, status: 'active'};
              }
              return {...item, status: 'upcoming'};
            }
          });
          if (isMounted) setTimelineData(finalTimeline);

        } catch (error) {
          console.log("Lỗi:", error);
        }
      };
      
      loadDashboardData();
      return () => { isMounted = false; };
    }, [refreshSeed]);

  const handleAddExtraFood = async (addKcal: number) => {
    const todayDate = new Date().toISOString().split('T')[0];
    const EXTRA_KCAL_KEY = `@extra_kcal_${todayDate}`;
    
    try {
      const extraData = await AsyncStorage.getItem(EXTRA_KCAL_KEY);
      const currentExtra = extraData ? Number(extraData) : 0;
      await AsyncStorage.setItem(EXTRA_KCAL_KEY, (currentExtra + addKcal).toString());
      setRefreshSeed(s => s + 1); // trigger reload
    } catch(e) {}
  };

  const handleToggleEvent = async (item: any) => {
    if (item.type === 'workout') return; // Tập gym check ở màn hình tập
    
    const todayDate = new Date().toISOString().split('T')[0];
    const STORAGE_KEY = `@meals_${todayDate}`;
    
    try {
      const savedMeals = await AsyncStorage.getItem(STORAGE_KEY);
      let completedMealsList: number[] = savedMeals ? JSON.parse(savedMeals) : [];
      
      if (completedMealsList.includes(item.id)) {
         completedMealsList = completedMealsList.filter(id => id !== item.id);
      } else {
         completedMealsList.push(item.id);
      }
      
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(completedMealsList));
      setRefreshSeed(s => s + 1);
    } catch(e) {}
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      
      {/* 1. TIÊU ĐỀ LỚN & HEADER ICON */}
      <View style={styles.titleContainer}>
        <View>
          <Text style={styles.subtitle}>Theo Dõi</Text>
          <Text style={styles.title}>Sức Khỏe</Text>
        </View>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => router.push('/calendar')}>
            <MaterialCommunityIcons name="calendar-month-outline" size={26} color="#121212" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.iconBtn, {marginLeft: 15}]} onPress={() => router.push('/profile')}>
            <MaterialCommunityIcons name="account-circle-outline" size={26} color="#121212" />
          </TouchableOpacity>
        </View>
      </View>

      {/* STREAK WIDGET */}
      <View style={styles.streakContainer}>
        <View style={styles.streakLeft}>
          <Text style={styles.streakTitle}>🔥 Đang giữ chuỗi</Text>
          <Text style={styles.streakDays}>{streak} Ngày</Text>
        </View>
        <View style={styles.streakIconBg}>
          <MaterialCommunityIcons name="fire" size={32} color="#FFB870" />
        </View>
      </View>

      {/* DASHBOARD THỐNG KÊ */}
      <View style={styles.dashboardContainer}>
        <View style={styles.dashboardHeader}>
          <Text style={styles.dashboardTitle}>Năng lượng hôm nay</Text>
          <TouchableOpacity onPress={() => setIsLookupVisible(true)} style={styles.quickAddBtn}>
            <MaterialCommunityIcons name="plus" size={16} color="#121212" />
            <Text style={styles.quickAddText}>Thêm món</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.dashboardKcalRow}>
          <Text style={styles.dashboardKcalText}>{consumedKcal} <Text style={styles.dashboardKcalTarget}>/ {targetKcal} kcal</Text></Text>
        </View>

        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${Math.min((consumedKcal / targetKcal) * 100, 100)}%` }]} />
        </View>
      </View>

      {/* 4. LỊCH TRÌNH HÔM NAY */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Lịch Trình Hôm Nay</Text>
        <View style={styles.badgeLock}>
          <MaterialCommunityIcons name="lock-outline" size={14} color="#8E8E93" />
          <Text style={styles.badgeLockText}>Đã chốt</Text>
        </View>
      </View>

      <View style={styles.timelineContainer}>
        {timelineData.map((item, index) => {
          const isLast = index === timelineData.length - 1;
          const isCompleted = item.status === 'completed';
          const isActive = item.status === 'active';
          const isMissed = item.status === 'missed';
          
          return (
            <View key={item.id} style={styles.timelineItem}>
              <View style={styles.timelineLeft}>
                <Text style={isCompleted ? styles.timeTextCompleted : isActive ? styles.timeTextActive : isMissed ? styles.timeTextMissed : styles.timeTextUpcoming}>{item.time}</Text>
                <View style={[styles.dot, isCompleted ? styles.dotCompleted : isActive ? styles.dotActive : isMissed ? styles.dotMissed : styles.dotUpcoming]} />
                {!isLast && <View style={[styles.line, !isCompleted && !isActive && !isMissed ? { backgroundColor: 'transparent' } : {}]} />}
              </View>
              <TouchableOpacity 
                activeOpacity={item.type === 'workout' ? 1 : 0.7}
                onPress={() => item.type !== 'workout' && handleToggleEvent(item)}
                style={[styles.actionCard, isCompleted ? styles.actionCardCompleted : isActive ? styles.actionCardActive : isMissed ? styles.actionCardMissed : styles.actionCardUpcoming]}
              >
                <MaterialCommunityIcons 
                  name={item.icon} 
                  size={24} 
                  color={isCompleted ? '#8E8E93' : '#121212'} 
                />
                <View style={styles.actionInfo}>
                  <Text style={isCompleted ? styles.actionTitleCompleted : isActive ? styles.actionTitleActive : isMissed ? styles.actionTitleMissed : styles.actionTitleUpcoming}>{item.title}</Text>
                  <Text style={isCompleted ? styles.actionSubCompleted : isMissed ? styles.actionSubMissed : isActive ? styles.actionSubActive : styles.actionSubUpcoming}>{item.sub}</Text>
                </View>
                {isCompleted ? (
                   <MaterialCommunityIcons name="check-circle" size={24} color="#33D1C1" />
                ) : isMissed ? (
                   <View style={styles.missedCheckCircle}></View>
                ) : isActive && item.type === 'workout' ? (
                   <TouchableOpacity style={styles.playButton} onPress={() => {}}>
                     <MaterialCommunityIcons name="play" size={20} color="#FFFFFF" />
                   </TouchableOpacity>
                ) : null}
              </TouchableOpacity>
            </View>
          );
        })}
      </View>

      <View style={{ height: 120 }} /> 

      <CalorieLookupModal 
        visible={isLookupVisible} 
        onClose={() => setIsLookupVisible(false)} 
        onAddFood={handleAddExtraFood} 
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
  },
  titleContainer: {
    marginTop: 10,
    marginBottom: 25,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerIcons: {
    flexDirection: 'row',
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F5F5F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 28,
    color: '#8E8E93',
    fontWeight: '400',
  },
  title: {
    fontSize: 28,
    color: '#121212',
    fontWeight: '700',
  },
  streakContainer: {
    backgroundColor: '#121212',
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  streakLeft: {
    flex: 1,
  },
  streakTitle: {
    color: '#8E8E93',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
  },
  streakDays: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '700',
  },
  streakIconBg: {
    backgroundColor: '#2A2A2A',
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dashboardContainer: {
    backgroundColor: '#F5F5F7',
    borderRadius: 24,
    padding: 24,
    marginBottom: 30,
  },
  dashboardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  dashboardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#121212',
  },
  quickAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#33D1C1',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  quickAddText: {
    color: '#121212',
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 4,
  },
  dashboardKcalRow: {
    marginBottom: 15,
  },
  dashboardKcalText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#121212',
  },
  dashboardKcalTarget: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8E8E93',
  },
  progressBarBg: { height: 8, backgroundColor: '#E5E5EA', borderRadius: 4 },
  progressBarFill: { height: 8, backgroundColor: '#33D1C1', borderRadius: 4 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#121212',
  },
  badgeLock: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeLockText: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '600',
    marginLeft: 4,
  },
  timelineContainer: {
    paddingLeft: 10,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  timelineLeft: {
    alignItems: 'center',
    width: 50,
    marginRight: 10,
  },
  timeTextCompleted: { color: '#8E8E93', fontSize: 13, fontWeight: '600', marginBottom: 5 },
  timeTextActive: { color: '#121212', fontSize: 13, fontWeight: '700', marginBottom: 5 },
  timeTextMissed: { color: '#FF453A', fontSize: 13, fontWeight: '700', marginBottom: 5 },
  timeTextUpcoming: { color: '#8E8E93', fontSize: 13, fontWeight: '600', marginBottom: 5 },
  dot: { width: 12, height: 12, borderRadius: 6, zIndex: 2 },
  dotCompleted: { backgroundColor: '#33D1C1' },
  dotActive: { backgroundColor: '#FFB870', borderWidth: 3, borderColor: '#FFF', shadowColor: '#FFB870', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 5 },
  dotMissed: { backgroundColor: '#FF453A' },
  dotUpcoming: { backgroundColor: '#E5E5EA' },
  line: { width: 2, flex: 1, backgroundColor: '#E5E5EA', marginTop: 5, marginBottom: -15 },
  actionCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
  },
  actionCardCompleted: { backgroundColor: '#F5F5F7' },
  actionCardActive: { backgroundColor: '#FFB870', shadowColor: '#FFB870', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.3, shadowRadius: 10 },
  actionCardMissed: { backgroundColor: '#FFF0F0', borderWidth: 1, borderColor: '#FFD1D0' },
  actionCardUpcoming: { backgroundColor: '#F5F5F7', opacity: 0.8 },
  actionInfo: { flex: 1, marginLeft: 15 },
  actionTitleCompleted: { fontSize: 16, fontWeight: '600', color: '#8E8E93', textDecorationLine: 'line-through' },
  actionSubCompleted: { fontSize: 13, color: '#AEAEB2', marginTop: 4 },
  actionTitleActive: { fontSize: 16, fontWeight: '700', color: '#121212' },
  actionSubActive: { fontSize: 13, color: '#121212', marginTop: 4, opacity: 0.8 },
  actionTitleMissed: { fontSize: 16, fontWeight: '700', color: '#FF453A' },
  actionSubMissed: { fontSize: 13, color: '#FF8A84', marginTop: 4 },
  actionTitleUpcoming: { fontSize: 16, fontWeight: '600', color: '#8E8E93' },
  actionSubUpcoming: { fontSize: 13, color: '#AEAEB2', marginTop: 4 },
  missedCheckCircle: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: '#FF453A', opacity: 0.5 },
  playButton: { backgroundColor: '#121212', width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
});