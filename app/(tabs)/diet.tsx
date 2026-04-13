// app/(tabs)/diet.tsx
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppStore } from '../../store/useAppStore';
import CalorieLookupModal from '../../components/CalorieLookupModal';
import TomorrowMenuModal from '../../components/TomorrowMenuModal';

const dailyMeals = [
  { id: 1, time: '07:00', type: 'Bữa sáng', name: 'Phở bò béo', kcal: 450, icon: 'bowl-mix' as const },
  { id: 2, time: '10:00', type: 'Bữa phụ sáng', name: 'Sữa tươi + Bánh giò', kcal: 300, icon: 'cup-water' as const },
  { id: 3, time: '12:30', type: 'Bữa trưa', name: 'Cơm sườn nướng', kcal: 600, icon: 'food-drumstick' as const },
  { id: 4, time: '15:30', type: 'Bữa phụ chiều', name: 'Sinh tố bơ', kcal: 350, icon: 'blender' as const },
  { id: 5, time: '18:30', type: 'Bữa tối', name: 'Cơm ba chỉ quay + Canh xương', kcal: 600, icon: 'food-turkey' as const },
  { id: 6, time: '21:30', type: 'Bữa phụ tối', name: 'Sữa ông thọ pha ấm', kcal: 200, icon: 'glass-mug' as const },
];

export default function DietScreen() {
  const insets = useSafeAreaInsets();
  const { completedMeals, extraFoodsKcal, toggleMeal, addExtraKcal } = useAppStore();
  const [isLookupVisible, setIsLookupVisible] = useState(false);
  const [isTomorrowVisible, setIsTomorrowVisible] = useState(false);

  const handleAddExtraFood = (kcal: number) => {
    addExtraKcal(kcal);
  };


  const baseConsumedKcal = dailyMeals
    .filter(meal => completedMeals.includes(meal.id))
    .reduce((total, meal) => total + meal.kcal, 0);
  
  const consumedKcal = baseConsumedKcal + extraFoodsKcal;
  const targetKcal = 2500;
  const progressPercent = Math.min((consumedKcal / targetKcal) * 100, 100);

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={{ paddingTop: insets.top + 10, paddingBottom: 120 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.subtitle}>Dinh dưỡng</Text>
        <Text style={styles.title}>Thực Đơn</Text>
      </View>

      <View style={styles.calorieCard}>
        <Text style={styles.calorieTitle}>Năng lượng hôm nay</Text>
        <View style={styles.calorieRow}>
          <View style={{flexDirection: 'row', alignItems: 'baseline'}}>
            <Text style={styles.calorieBigText}>{consumedKcal}</Text>
            <Text style={styles.calorieTargetText}>/ {targetKcal} kcal</Text>
          </View>
          <TouchableOpacity onPress={() => setIsLookupVisible(true)} style={styles.addFoodBtn}>
            <MaterialCommunityIcons name="plus" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
        </View>
        <Text style={styles.motivationText}>
          {consumedKcal >= targetKcal ? "Tuyệt vời! Đã nạp đủ năng lượng 🔥" : "Cố lên! Ăn dư Calo mới tăng cân được 💪"}
        </Text>
      </View>

      <View style={styles.mealsContainer}>
        <Text style={styles.sectionTitle}>Lịch Ăn Uống</Text>
        
        {dailyMeals.map((meal) => {
          const isCompleted = completedMeals.includes(meal.id);
          return (
            <TouchableOpacity 
              key={meal.id} 
              style={[styles.mealCard, isCompleted && styles.mealCardCompleted]}
              onPress={() => toggleMeal(meal.id)}
              activeOpacity={0.7}
            >
              <View style={[styles.iconBox, isCompleted ? styles.iconBoxCompleted : undefined]}>
                <MaterialCommunityIcons name={meal.icon} size={24} color={isCompleted ? '#FFFFFF' : '#121212'} />
              </View>

              <View style={styles.mealInfo}>
                <View style={styles.mealHeader}>
                  <Text style={[styles.mealType, isCompleted && styles.textCompleted]}>{meal.type}</Text>
                  <Text style={styles.mealTime}>{meal.time}</Text>
                </View>
                <Text style={[styles.mealName, isCompleted && styles.textCompleted]}>{meal.name}</Text>
                <Text style={styles.mealKcal}>{meal.kcal} kcal</Text>
              </View>

              <View style={[styles.checkbox, isCompleted && styles.checkboxCompleted]}>
                {isCompleted && <MaterialCommunityIcons name="check" size={16} color="#FFFFFF" />}
              </View>
            </TouchableOpacity>
          );
        })}
        
        <TouchableOpacity style={styles.tomorrowBtn} onPress={() => setIsTomorrowVisible(true)}>
          <View style={styles.tomorrowIconWrap}>
            <MaterialCommunityIcons name="calendar-edit" size={24} color="#33D1C1" />
          </View>
          <View style={{marginLeft: 15, flex:1}}>
             <Text style={styles.tomorrowTitle}>Lên thực đơn ngày mai</Text>
             <Text style={styles.tomorrowSub}>Điều chỉnh Kcal và thay đổi món ăn</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={24} color="#8E8E93" />
        </TouchableOpacity>
      </View>

      <CalorieLookupModal 
        visible={isLookupVisible} 
        onClose={() => setIsLookupVisible(false)} 
        onAddFood={handleAddExtraFood} 
      />
      <TomorrowMenuModal 
        visible={isTomorrowVisible} 
        onClose={() => setIsTomorrowVisible(false)} 
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF', paddingHorizontal: 20 },
  header: { marginBottom: 20 },
  subtitle: { fontSize: 28, color: '#8E8E93', fontWeight: '400' },
  title: { fontSize: 28, color: '#121212', fontWeight: '700' },
  calorieCard: { backgroundColor: '#121212', borderRadius: 24, padding: 24, marginBottom: 25, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.15, shadowRadius: 20, elevation: 8 },
  calorieTitle: { color: '#8E8E93', fontSize: 15, fontWeight: '600', marginBottom: 5 },
  calorieRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 15 },
  addFoodBtn: { backgroundColor: '#33D1C1', width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  calorieBigText: { color: '#FFFFFF', fontSize: 36, fontWeight: '700' },
  calorieTargetText: { color: '#8E8E93', fontSize: 18, fontWeight: '600', marginLeft: 8 },
  progressBarBg: { height: 8, backgroundColor: '#2A2A2A', borderRadius: 4, marginBottom: 12 },
  progressBarFill: { height: 8, backgroundColor: '#33D1C1', borderRadius: 4 },
  motivationText: { color: '#FFB870', fontSize: 13, fontWeight: '600' },
  mealsContainer: { gap: 12 },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: '#121212', marginBottom: 5 },
  mealCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F5F7', padding: 16, borderRadius: 20 },
  mealCardCompleted: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E5EA' },
  iconBox: { width: 48, height: 48, borderRadius: 16, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', marginRight: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  iconBoxCompleted: { backgroundColor: '#33D1C1' },
  mealInfo: { flex: 1 },
  mealHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  mealType: { fontSize: 15, fontWeight: '700', color: '#121212' },
  mealTime: { fontSize: 13, fontWeight: '600', color: '#8E8E93' },
  mealName: { fontSize: 14, color: '#121212', opacity: 0.8, marginBottom: 4 },
  mealKcal: { fontSize: 13, fontWeight: '600', color: '#FFB870' },
  textCompleted: { color: '#8E8E93', textDecorationLine: 'line-through' },
  checkbox: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: '#D1D1D6', marginLeft: 10, justifyContent: 'center', alignItems: 'center' },
  checkboxCompleted: { backgroundColor: '#33D1C1', borderColor: '#33D1C1' },
  tomorrowBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F5F7', padding: 20, borderRadius: 24, marginTop: 20, borderWidth: 1, borderColor: '#E5E5EA' },
  tomorrowIconWrap: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  tomorrowTitle: { fontSize: 16, fontWeight: '700', color: '#121212' },
  tomorrowSub: { fontSize: 13, color: '#8E8E93', marginTop: 4 },
});