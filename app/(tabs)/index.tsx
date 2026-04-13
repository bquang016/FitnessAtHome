// app/(tabs)/index.tsx
import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppStore } from '../../store/useAppStore';
import dayjs from 'dayjs';
import { useRouter } from 'expo-router';
import CalorieLookupModal from '../../components/CalorieLookupModal';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { THEME } from '../../constants/theme';
import CustomAlert from '../../components/CustomAlert';

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [consumedKcal, setConsumedKcal] = useState(0);
  const [timelineData, setTimelineData] = useState<any[]>([]);
  const [isLookupVisible, setIsLookupVisible] = useState(false);
  
  // Custom Alert state
  const [alertConfig, setAlertConfig] = useState({ visible: false, title: '', message: '' });

  const { 
    currentDate, completedMeals, extraFoodsKcal, workoutDone, streak,
    currentSchedule, toggleMeal, addExtraKcal,
    userProfile, targets, currentProtein, currentCarb, currentFat, waterConsumed, setWaterConsumed
  } = useAppStore();

  // initializeForDay đã được chuyển sang app/_layout.tsx để đảm bảo Routing Guard

  React.useEffect(() => {
    let dailyMealsData = currentSchedule.length > 0 ? currentSchedule : [
      { id: 1, time: '07:00', type: 'meal', title: 'Bữa sáng', sub: 'Phở bò béo', icon: 'bowl-mix', kcal: 450 },
      { id: 2, time: '10:00', type: 'meal', title: 'Bữa phụ sáng', sub: 'Sữa tươi + Bánh giò', icon: 'cup-water', kcal: 300 },
      { id: 3, time: '12:30', type: 'meal', title: 'Bữa trưa', sub: 'Cơm sườn nướng', icon: 'food-drumstick', kcal: 600 },
      { id: 4, time: '15:30', type: 'meal', title: 'Bữa phụ chiều', sub: 'Sinh tố bơ', icon: 'blender', kcal: 350 },
      { id: 5, time: '18:30', type: 'meal', title: 'Bữa tối', sub: 'Cơm ba chỉ quay', icon: 'food-turkey', kcal: 600 },
      { id: 6, time: '21:30', type: 'meal', title: 'Bữa phụ tối', sub: 'Sữa ông thọ pha ấm', icon: 'glass-mug', kcal: 200 }
    ];

    let baseKcal = dailyMealsData
      .filter(meal => completedMeals.includes(meal.id))
      .reduce((total, meal) => total + meal.kcal, 0);

    const totalKcal = baseKcal + extraFoodsKcal;
    setConsumedKcal(totalKcal);

    let scheduleData: any[] = [];
    dailyMealsData.forEach((m: any) => scheduleData.push({...m, isCompleted: completedMeals.includes(m.id)}));
    scheduleData.push({ id: 'w1', time: '17:00', type: 'workout', title: 'Giờ Tập Luyện', sub: 'Lịch Tập • 45 phút', icon: 'dumbbell', isCompleted: workoutDone });

    scheduleData.sort((a, b) => {
      const timeA = a.time ? Number(a.time.replace(':', '')) : 0;
      const timeB = b.time ? Number(b.time.replace(':', '')) : 0;
      return (isNaN(timeA) ? 0 : timeA) - (isNaN(timeB) ? 0 : timeB);
    });

    const nowMinutes = dayjs().hour() * 60 + dayjs().minute();
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

    setTimelineData(finalTimeline);
  }, [completedMeals, extraFoodsKcal, workoutDone, currentDate, currentSchedule]);

  const handleAddExtraFood = (kcal: number, item?: any) => {
    addExtraKcal(kcal, item?.protein || 0, item?.carb || 0, item?.fat || 0);
  };

  const handleAddWater = () => {
    setWaterConsumed(250);
  };

  const handleToggleEvent = (item: any) => {
    if (item.type === 'workout') {
       setAlertConfig({
         visible: true,
         title: 'Chuyển trang',
         message: 'Hãy chuyển sang tab Tập Luyện để xem và hoàn thành bài tập thể lực nhé.'
       });
       return;
    }
    toggleMeal(item.id);
  };

  // Tách UpNext và Các lịch trình khác
  const upNextItem = timelineData.find(item => item.status === 'active' || item.status === 'upcoming');
  const otherItems = timelineData.filter(item => item.id !== upNextItem?.id);

  return (
    <View style={[styles.mainLayout, { paddingTop: insets.top }]}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* Khối 1: Header */}
        <View style={styles.titleContainer}>
          <View>
            <Text style={styles.subtitle}>Theo Dõi</Text>
            <Text style={styles.title}>Sức Khỏe</Text>
          </View>
          <View style={styles.headerIcons}>
            <TouchableOpacity style={styles.iconBtn} onPress={() => router.push('/calendar')}>
              <MaterialCommunityIcons name="calendar-month-outline" size={26} color={THEME.colors.textMain} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.iconBtn, {marginLeft: THEME.spacing.m}]} onPress={() => router.push('/profile')}>
              <MaterialCommunityIcons name="account-circle-outline" size={26} color={THEME.colors.textMain} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Khối 2: Dashboard Tổng Hợp Streak + Kcal */}
        <View style={styles.heroCard}>
          <View style={styles.heroHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
               <MaterialCommunityIcons name="fire" size={24} color={THEME.colors.accent} />
               <Text style={styles.heroTitle}>Đang giữ chuỗi</Text>
            </View>
            <TouchableOpacity onPress={() => setIsLookupVisible(true)} style={styles.quickAddBtn}>
               <MaterialCommunityIcons name="plus" size={16} color={THEME.colors.textMain} />
               <Text style={styles.quickAddText}>Thêm món</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.smartBulkBadge}>
             <MaterialCommunityIcons name="shield-check" size={14} color="#00C853" style={{marginRight: 4}} />
             <Text style={styles.smartBulkText}>Chế độ Smart Bulk đang bật (+300 Kcal)</Text>
          </View>

          <Text style={styles.streakDays}>{streak.count} Ngày</Text>
          
          <View style={styles.kcalRow}>
             <Text style={styles.kcalLabel}>Năng lượng tiêu thụ</Text>
             <Text style={styles.kcalValueRow}>
               <Text style={styles.kcalValue}>{consumedKcal}</Text>
               <Text style={styles.kcalTarget}> / {targets.targetKcal || 2500} kcal</Text>
             </Text>
          </View>
          
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${Math.min((consumedKcal / (targets.targetKcal || 2500)) * 100, 100)}%` }]} />
          </View>
        </View>

        {/* Khối Macros Giai Đoạn 3 */}
        <View style={styles.macrosContainer}>
          <View style={styles.macroBox}>
            <Text style={styles.macroTitle}>Protein</Text>
            <View style={styles.macroBarBg}>
               <View style={[styles.macroBarFill, { backgroundColor: THEME.colors.macroProtein, width: `${Math.min((currentProtein / (targets.targetProtein || 1)) * 100, 100)}%` }]} />
            </View>
            <Text style={styles.macroValue}>{currentProtein} / {targets.targetProtein}g</Text>
          </View>

          <View style={styles.macroBox}>
            <Text style={styles.macroTitle}>Carbs</Text>
            <View style={styles.macroBarBg}>
               <View style={[styles.macroBarFill, { backgroundColor: THEME.colors.macroCarb, width: `${Math.min((currentCarb / (targets.targetCarb || 1)) * 100, 100)}%` }]} />
            </View>
            <Text style={styles.macroValue}>{currentCarb} / {targets.targetCarb}g</Text>
          </View>

          <View style={styles.macroBox}>
            <Text style={styles.macroTitle}>Fat</Text>
            <View style={styles.macroBarBg}>
               <View style={[styles.macroBarFill, { backgroundColor: THEME.colors.macroFat, width: `${Math.min((currentFat / (targets.targetFat || 1)) * 100, 100)}%` }]} />
            </View>
            <Text style={styles.macroValue}>{currentFat} / {targets.targetFat}g</Text>
          </View>
        </View>

        {/* Khối Nước Hydration */}
        <View style={styles.waterCard}>
          <View style={styles.waterInfo}>
            <MaterialCommunityIcons name="water" size={32} color="#4D96FF" />
            <View style={{ marginLeft: 15 }}>
              <Text style={styles.waterTitle}>Lượng nước uống</Text>
              <Text style={styles.waterValue}>{waterConsumed} / {targets.targetWater} ml</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.waterAddBtn} onPress={handleAddWater}>
             <MaterialCommunityIcons name="plus" size={20} color="#4D96FF" />
             <Text style={styles.waterAddText}>250ml</Text>
          </TouchableOpacity>
        </View>

        {/* Khối 3: Sắp diễn ra (Up Next) */}
        {upNextItem && (
          <View style={styles.upNextSection}>
            <Text style={styles.sectionTitle}>Sắp Diễn Ra</Text>
            <TouchableOpacity 
               activeOpacity={upNextItem.type === 'workout' ? 1 : 0.7}
               onPress={() => handleToggleEvent(upNextItem)}
               style={styles.upNextCard}
            >
               <View style={styles.upNextIconBg}>
                  <MaterialCommunityIcons name={upNextItem.icon} size={32} color={THEME.colors.accent} />
               </View>
               <View style={styles.upNextInfo}>
                 <Text style={styles.upNextTime}>{upNextItem.time}</Text>
                 <Text style={styles.upNextTitle}>{upNextItem.title}</Text>
                 <Text style={styles.upNextSub} numberOfLines={1}>{upNextItem.sub}</Text>
               </View>
               <View style={styles.upNextAction}>
                 {upNextItem.type === 'workout' ? (
                   <MaterialCommunityIcons name="play-circle" size={36} color={THEME.colors.primary} />
                 ) : (
                   <MaterialCommunityIcons name="check-circle-outline" size={36} color={THEME.colors.primary} />
                 )}
               </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Khối Lịch trình khác */}
        <View style={styles.otherSection}>
          <Text style={styles.sectionTitle}>Danh Sách Trong Ngày</Text>
          <View style={styles.otherList}>
            {otherItems.map((item) => {
              const isCompleted = item.status === 'completed';
              const isMissed = item.status === 'missed';
              // Theo yêu cầu: không dùng viền đỏ lỗi. Thay vào đó dùng xám mờ và gạch ngang chữ.
              
              return (
                <TouchableOpacity 
                   key={item.id}
                   activeOpacity={0.7}
                   onPress={() => handleToggleEvent(item)}
                   style={styles.smallCard}
                >
                  <Text style={[styles.smallTime, isMissed && styles.textMissed]}>{item.time}</Text>
                  <View style={styles.smallIcon}>
                    <MaterialCommunityIcons name={item.icon} size={20} color={isCompleted ? THEME.colors.primary : THEME.colors.textSub} />
                  </View>
                  <View style={styles.smallInfo}>
                     <Text style={[styles.smallTitle, isCompleted && styles.textCompleted, isMissed && styles.textMissed]}>{item.title}</Text>
                     <Text style={[styles.smallSub, isCompleted && styles.textCompleted, isMissed && styles.textMissed]} numberOfLines={1}>{item.sub}</Text>
                  </View>
                  {isCompleted && <MaterialCommunityIcons name="check-circle" size={20} color={THEME.colors.primary} />}
                  {isMissed && <MaterialCommunityIcons name="minus-circle-outline" size={20} color={THEME.colors.textSub} />}
                </TouchableOpacity>
              )
            })}
          </View>
        </View>

        <View style={{ height: 120 }} /> 
      </ScrollView>

      <CalorieLookupModal 
        visible={isLookupVisible} 
        onClose={() => setIsLookupVisible(false)} 
        onAddFood={handleAddExtraFood} 
      />

      <CustomAlert 
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        onConfirm={() => setAlertConfig({ visible: false, title: '', message: '' })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  mainLayout: {
    flex: 1,
    backgroundColor: THEME.colors.white,
  },
  container: {
    paddingHorizontal: THEME.spacing.l,
  },
  titleContainer: {
    marginTop: THEME.spacing.s,
    marginBottom: THEME.spacing.l,
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
    backgroundColor: THEME.colors.bgCard,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 24,
    color: THEME.colors.textSub,
    fontWeight: '400',
  },
  title: {
    fontSize: 32,
    color: THEME.colors.textMain,
    fontWeight: '700',
  },
  
  heroCard: {
    backgroundColor: THEME.colors.textMain,
    borderRadius: THEME.radius.large,
    padding: THEME.spacing.l,
    marginBottom: THEME.spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: THEME.spacing.s,
  },
  heroTitle: {
    color: THEME.colors.textSub,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 6,
  },
  quickAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  quickAddText: {
    color: THEME.colors.textMain,
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 4,
  },
  streakDays: {
    color: THEME.colors.white,
    fontSize: 48,
    fontWeight: '800',
    marginBottom: THEME.spacing.m,
  },
  smartBulkBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 200, 83, 0.15)',
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginBottom: 8,
  },
  smartBulkText: {
    color: '#00C853',
    fontSize: 12,
    fontWeight: '600',
  },
  kcalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: THEME.spacing.s,
  },
  kcalLabel: {
    color: THEME.colors.textSub,
    fontSize: 14,
    fontWeight: '500',
  },
  kcalValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  kcalValue: {
    color: THEME.colors.white,
    fontSize: 20,
    fontWeight: '700',
  },
  kcalTarget: {
    color: THEME.colors.textSub,
    fontSize: 14,
    fontWeight: '600',
  },
  progressBarBg: { 
    height: 6, 
    backgroundColor: THEME.colors.white, 
    borderRadius: 3,
    opacity: 0.2,
  },
  progressBarFill: { 
    height: 6, 
    backgroundColor: THEME.colors.primary, 
    borderRadius: 3,
    position: 'absolute',
    top: 0,
    left: 0,
  },

  // Macros Section
  macrosContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: THEME.spacing.l,
    gap: 10,
  },
  macroBox: {
    flex: 1,
    backgroundColor: THEME.colors.bgCard,
    padding: THEME.spacing.m,
    borderRadius: THEME.radius.small,
  },
  macroTitle: {
    fontSize: 13,
    color: THEME.colors.textSub,
    marginBottom: 8,
    fontWeight: '600',
  },
  macroBarBg: {
    height: 6,
    backgroundColor: '#E5E5EA',
    borderRadius: 3,
    marginBottom: 8,
  },
  macroBarFill: {
    height: 6,
    borderRadius: 3,
  },
  macroValue: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.colors.textMain,
  },

  // Water Card
  waterCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: THEME.colors.bgCard,
    padding: THEME.spacing.l,
    borderRadius: THEME.radius.medium,
    marginBottom: THEME.spacing.xl,
  },
  waterInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  waterTitle: {
    fontSize: 14,
    color: THEME.colors.textSub,
    marginBottom: 4,
  },
  waterValue: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME.colors.textMain,
  },
  waterAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6F0FF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  waterAddText: {
    color: '#4D96FF',
    fontWeight: '700',
    fontSize: 14,
    marginLeft: 4,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: THEME.colors.textMain,
    marginBottom: THEME.spacing.m,
  },
  upNextSection: {
    marginBottom: THEME.spacing.xl,
  },
  upNextCard: {
    backgroundColor: THEME.colors.white,
    borderRadius: THEME.radius.large,
    padding: THEME.spacing.m,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    shadowColor: THEME.colors.textSub,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  upNextIconBg: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFF4E6', 
    justifyContent: 'center',
    alignItems: 'center',
  },
  upNextInfo: {
    flex: 1,
    marginLeft: THEME.spacing.m,
  },
  upNextTime: {
    color: THEME.colors.accent,
    fontWeight: '700',
    fontSize: 14,
    marginBottom: 4,
  },
  upNextTitle: {
    color: THEME.colors.textMain,
    fontWeight: '700',
    fontSize: 18,
    marginBottom: 2,
  },
  upNextSub: {
    color: THEME.colors.textSub,
    fontSize: 13,
  },
  upNextAction: {
    marginLeft: THEME.spacing.s,
  },

  otherSection: {
    marginBottom: THEME.spacing.m,
  },
  otherList: {
    backgroundColor: THEME.colors.bgCard,
    borderRadius: THEME.radius.small,
    padding: THEME.spacing.m,
  },
  smallCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: THEME.spacing.s,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  smallTime: {
    width: 50,
    color: THEME.colors.textMain,
    fontWeight: '600',
    fontSize: 14,
  },
  smallIcon: {
    width: 32,
    alignItems: 'center',
  },
  smallInfo: {
    flex: 1,
    paddingLeft: THEME.spacing.s,
  },
  smallTitle: {
    color: THEME.colors.textMain,
    fontWeight: '600',
    fontSize: 15,
  },
  smallSub: {
    color: THEME.colors.textSub,
    fontSize: 12,
  },
  textCompleted: {
    textDecorationLine: 'line-through',
    color: THEME.colors.textSub,
  },
  textMissed: {
    color: THEME.colors.textSub,
    textDecorationLine: 'line-through',
    opacity: 0.6,
  }
});