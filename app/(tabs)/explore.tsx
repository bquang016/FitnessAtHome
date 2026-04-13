import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Modal, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Helper để lấy thời gian từ chuỗi reps (ví dụ: 'Giữ 45 giây')
const getExerciseDuration = (repsStr: string) => {
  const matchSec = repsStr.match(/(\d+)\s*(giây)/i);
  if (matchSec) return parseInt(matchSec[1], 10);
  
  const matchMin = repsStr.match(/(\d+)\s*(phút)/i);
  if (matchMin) return parseInt(matchMin[1], 10) * 60;
  
  return 0;
};

// 1. DATA DATABASE (Ectomorph PPL Routine)
const WORKOUT_PLANS = [
  {
    id: 'day1',
    dayCode: 'Ngày Đẩy (Push)',
    title: 'Ngực, Vai, Tay sau',
    color: '#FFB870',
    description: 'Thúc đẩy phần thân trước để tăng độ vuông vức cho khung xương và độ phân tách Ngực.',
    exercises: [
      { id: 'p1', name: 'Chống đẩy (Push-up)', sets: 3, reps: '15 cái', rest: 60, howTo: 'Hai tay đặt rộng bằng vai, gồng chắc cơ bụng. Xuống chậm hít vào, đẩy lên thở ra mạnh.', muscle: 'Cơ ngực giữa.', evolution: 'Tăng lên 20 cái, hoặc đặt tạ 5kg lên lưng.' },
      { id: 'p2', name: 'Đẩy vai Dây Kháng Lực', sets: 3, reps: '12 cái', rest: 60, howTo: 'Dẫm lên dây kháng lực, 2 tay nắm đầu dây đẩy dứt khoát qua đầu.', muscle: 'Cầu vai và Vai trước.', evolution: 'Đổi dây có độ căng nặng hơn (Tím/Đen).' },
      { id: 'p3', name: 'Chống đẩy ghế dốc xuống', sets: 3, reps: '10-12 cái', rest: 60, howTo: 'Gác 2 chân lên giường hoặc ghế, dồn trọng tâm về tay tỳ xuống.', muscle: 'Phần ngực trên lấp đầy quai xanh.', evolution: 'Khi xuống giữ 1 nhịp ở đáy tạo độ bão hòa cơ.' },
    ]
  },
  {
    id: 'day2',
    dayCode: 'Ngày Kéo (Pull)',
    title: 'Lưng Xô, Tay trước',
    color: '#33D1C1',
    description: 'Tạo tấm lưng xô chữ V, chìa khóa đem lại ảo giác cơ thể to ra 2 bên.',
    exercises: [
      { id: 'pl1', name: 'Kéo dây ngang ngược', sets: 4, reps: '15 cái', rest: 60, howTo: 'Cột dây ngang hông, kéo thật mạnh sát khủy tay vào mạn sườn, kẹp chặt 2 bả vai sau lưng.', muscle: 'Cơ lưng giữa, tạo độ dày.', evolution: 'Squeeze (Giữ co) 2 giây ở điểm kéo sau nhất.' },
      { id: 'pl2', name: 'Cuốn tay trước (Biceps)', sets: 3, reps: '12 cái', rest: 45, howTo: 'Kép chặt cùi chỏ vào eo, gập cánh tay cuộn dây/tạ dần lên ngực.', muscle: 'Chuột tay trước.', evolution: 'Bỏ thói quen thả tự do. Tập Eccentric (thả tạ chạm xuống) trong 4 giây.' },
      { id: 'pl3', name: 'Hít đất rộng kéo Xô', sets: 3, reps: '12 cái', rest: 60, howTo: 'Làm động tác hít đất tay nhưng mở dang rất rộng tay ra khỏi phương cơ thể x1.5 lần.', muscle: 'Kéo xô ngang ngoài.', evolution: 'Ép thân gần sát đất mới nảy.' },
    ]
  },
  {
    id: 'day3',
    dayCode: 'Ngày Chân (Legs)',
    title: 'Đùi, Mông & Bụng',
    color: '#FF5C5C',
    description: 'Chân là nhóm cơ lớn nhất. Luyện thân dưới sẽ sinh ra Testosterone nội sinh giúp tăng cân tự nhiên cực mạnh.',
    exercises: [
      { id: 'l1', name: 'Squat', sets: 4, reps: '15-20 cái', rest: 60, howTo: 'Thế đứng rộng bằng vai, xuống mông sâu qua đầu gối, lưng thẳng tự nhiên.', muscle: 'Đùi trước, một phần mông.', evolution: 'Ôm một balo nặng 10kg trước ngực (Goblet Squat).' },
      { id: 'l2', name: 'Romanian Deadlift Balo', sets: 3, reps: '12 cái', rest: 60, howTo: 'Tay xách balo, đầu gối chùng nhẹ. Đẩy mông ra xa tít ra đằng sau.', muscle: 'Cơ đùi sau (Hamstring).', evolution: 'Thay balo to hơn và tập trung mind-muscle nối sợi thần kinh vào mông.' },
      { id: 'l3', name: 'Plank chuẩn', sets: 3, reps: 'Giữ 45 giây', rest: 45, howTo: 'Chống khuỷu tay, gồng chăn chắc siết bụng xẹp xuống, bóp chặt mông.', muscle: 'Core (Cơ trọng tâm).', evolution: 'Tăng lên 60 giây và thêm vòng đai tạ.' },
    ]
  },
  {
    id: 'day4',
    dayCode: 'Phục Hồi (Rest)',
    title: 'Nghỉ Ngơi Xây Cơ',
    color: '#8E8E93',
    description: 'Sai lầm của Ecto là tập quá nhiều. Cơ bắp KHÔNG ĐƯỢC xây trong lúc tập, nó phân bào trong lúc nghỉ ngơi.',
    exercises: [] 
  }
];

export default function WorkoutScreen() {
  const insets = useSafeAreaInsets();
  
  // -- WORKOUT DAY LOGIC --
  const getCycleDay = () => {
     // A smart cyclic planner: day offset
     const epochDays = Math.floor(Date.now() / 86400000);
     return (epochDays + 2) % 4; // Cycles through 0, 1, 2, 3
  }
  
  const todayIndex = getCycleDay();
  const nextIndex = (todayIndex + 1) % 4;
  
  const currentWorkout = WORKOUT_PLANS[todayIndex];
  const nextWorkout = WORKOUT_PLANS[nextIndex];

  const [isCompletedToday, setIsCompletedToday] = useState(false);
  const [totalWorkoutsCompleted, setTotalWorkoutsCompleted] = useState(0);

  // -- PLAYER STATE --
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [exIndex, setExIndex] = useState(0);
  const [setIndex, setSetIndex] = useState(0); 
  const [isResting, setIsResting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  // -- EXERCISE TIMER STATE --
  const [workTimeLeft, setWorkTimeLeft] = useState(0);
  const [isWorkTimerRunning, setIsWorkTimerRunning] = useState(false);

  // LIFECYCLE
  useEffect(() => {
    const checkDone = async () => {
      try {
        const todayDate = new Date().toISOString().split('T')[0];
        const doneStr = await AsyncStorage.getItem(`@workout_done_${todayDate}`);
        if (doneStr === 'true') setIsCompletedToday(true);

        const historyStr = await AsyncStorage.getItem('@streak_data');
        if (historyStr) {
           const historyObj = JSON.parse(historyStr);
           if (historyObj.history) setTotalWorkoutsCompleted(historyObj.history.length);
        }
      } catch (e) {}
    }
    checkDone();
  }, [isPlayerOpen]);

  // REST TIMER EFFORT
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isResting && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(t => t - 1), 1000);
    } else if (isResting && timeLeft <= 0) {
      finishRest();
    }
    return () => clearInterval(interval);
  }, [isResting, timeLeft]);

  // EXERCISE TIMER EFFORT (For time-based like Plank)
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isWorkTimerRunning && workTimeLeft > 0) {
      interval = setInterval(() => setWorkTimeLeft(t => t - 1), 1000);
    } else if (isWorkTimerRunning && workTimeLeft <= 0) {
      setIsWorkTimerRunning(false);
      Alert.alert("Đã đủ thời gian!", "Bạn đã hoàn thành thời gian yêu cầu cho hiệp này. Bấm quá trình 'Hoàn Thành Hiệp Này' để tiếp tục nhé!");
    }
    return () => clearInterval(interval);
  }, [isWorkTimerRunning, workTimeLeft]);

  const startWorkout = () => {
    setExIndex(0);
    setSetIndex(0);
    setIsResting(false);
    setIsWorkTimerRunning(false);
    setWorkTimeLeft(0);
    setIsPlayerOpen(true);
  };

  const handleDoneSet = () => {
    setIsWorkTimerRunning(false);
    setWorkTimeLeft(0);
    const currentEx = currentWorkout.exercises[exIndex];
    if (setIndex < currentEx.sets - 1) {
      // Transition to rest for same exercise
      setIsResting(true);
      setTimeLeft(currentEx.rest);
    } else {
      // Finished the exercise! Moving to next exercise
      if (exIndex < currentWorkout.exercises.length - 1) {
         setIsResting(true);
         setTimeLeft(60); 
         // setIndex -1 denotes we are in transit between different exercises
         setSetIndex(-1); 
      } else {
         // WORKOUT FINISHED!
         triggerCompletion();
      }
    }
  };

  const finishRest = () => {
    setIsResting(false);
    if (setIndex === -1) {
       setExIndex(e => e + 1);
       setSetIndex(0);
    } else {
       setSetIndex(s => s + 1);
    }
  };

  const modifyTime = (add: number) => {
     setTimeLeft(t => Math.max(1, t + add));
  };

  const triggerCompletion = async () => {
    try {
      const todayDate = new Date().toISOString().split('T')[0];
      await AsyncStorage.setItem(`@workout_done_${todayDate}`, 'true');
      
      const STREAK_DATA_KEY = '@streak_data';
      const streakStr = await AsyncStorage.getItem(STREAK_DATA_KEY);
      let streakData = streakStr ? JSON.parse(streakStr) : { count: 0, lastDate: '', history: [] };
      const yesterdayDate = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      
      if (streakData.lastDate !== todayDate) {
        if (streakData.lastDate === yesterdayDate) {
          streakData.count += 1;
        } else {
          streakData.count = 1;
        }
        streakData.lastDate = todayDate;
        if (!streakData.history) streakData.history = [];
        if (!streakData.history.includes(todayDate)) streakData.history.push(todayDate);
        await AsyncStorage.setItem(STREAK_DATA_KEY, JSON.stringify(streakData));
      }
      setIsCompletedToday(true);
      setIsPlayerOpen(false);
      Alert.alert("🎉 Hoàn Thành Xuất Sắc!", "Bạn đã chinh phục buổi tập hôm nay. Hiện tại hãy nghỉ ngơi và nạp đủ năng lượng nhé!");
    } catch(e) {}
  };

  const closePlayerConfirm = () => {
    Alert.alert("Bạn muốn dừng tập?", "Luồng tập luyện sẽ không được lưu nếu bạn chưa hoàn tất toàn bộ bài tập.", [
      { text: "Hủy", style: 'cancel' },
      { text: "Dừng", style: 'destructive', onPress: () => setIsPlayerOpen(false) }
    ])
  };

  // Build the Player UI dynamically
  const renderPlayer = () => {
     if (!isPlayerOpen || currentWorkout.exercises.length === 0) return null;

     const progressRatio = ((exIndex * 100) + (setIndex === -1 ? 100 : ((setIndex / currentWorkout.exercises[exIndex].sets)*100))) / (currentWorkout.exercises.length);

     return (
        <Modal visible animationType="fade" onRequestClose={closePlayerConfirm}>
          <View style={[styles.playerContainer, { paddingTop: insets.top }]}>
            
            {/* Header & Progress */}
            <View style={styles.playerHeader}>
              <TouchableOpacity onPress={closePlayerConfirm} style={styles.closeBtn}>
                <MaterialCommunityIcons name="close" size={24} color="#8E8E93"/>
              </TouchableOpacity>
              <Text style={styles.playerTitle}>{currentWorkout.dayCode}</Text>
              <View style={{width: 34}}/>
            </View>
            <View style={styles.playerProgression}>
              <View style={[styles.playerFill, { width: `${progressRatio}%` }]} />
            </View>

            {/* REST MODE UI */}
            {isResting ? (
               <View style={styles.restRoot}>
                 <Text style={styles.restTitle}>PHỤC HỒI CƠ</Text>
                 {setIndex === -1 && <Text style={styles.restNextHint}>Sắp tới: {currentWorkout.exercises[exIndex + 1].name}</Text>}
                 <Text style={[styles.restBigClock, { color: currentWorkout.color }]}>{Math.floor(timeLeft / 60)}:{('0'+(timeLeft%60)).slice(-2)}</Text>
                 <View style={styles.restControls}>
                    <TouchableOpacity style={styles.restTimeBtn} onPress={() => modifyTime(-10)}>
                       <Text style={styles.restTimeBtnText}>-10s</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.restSkip} onPress={finishRest}>
                       <Text style={styles.restSkipText}>BỎ QUA NGHỈ</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.restTimeBtn} onPress={() => modifyTime(10)}>
                       <Text style={styles.restTimeBtnText}>+10s</Text>
                    </TouchableOpacity>
                 </View>
               </View>
            ) : (
            /* WORKOUT MODE UI */
               <View style={styles.workRoot}>
                 <Text style={[styles.workMuscle, { color: currentWorkout.color }]}>{currentWorkout.exercises[exIndex].muscle.toUpperCase()}</Text>
                 <Text style={styles.workName}>{currentWorkout.exercises[exIndex].name}</Text>
                 
                 <View style={styles.workMetaBlock}>
                    <View style={styles.workSetBox}>
                       <Text style={styles.workVal}>{setIndex + 1} / {currentWorkout.exercises[exIndex].sets}</Text>
                       <Text style={styles.workLbl}>Hiệp</Text>
                    </View>
                    
                    {/* KHỐI MỤC TIÊU CÓ THỂ ĐẾM GIỜ */}
                    {(() => {
                       const duration = getExerciseDuration(currentWorkout.exercises[exIndex].reps);
                       if (duration > 0) {
                          if (workTimeLeft > 0 || isWorkTimerRunning) {
                             return (
                                <View style={[styles.workSetBox, { backgroundColor: '#1A1A1A', borderColor: currentWorkout.color, borderWidth: 1, paddingVertical: 15 }]}>
                                    <Text style={[styles.workVal, { color: currentWorkout.color }]}>{Math.floor(workTimeLeft / 60)}:{('0'+(workTimeLeft%60)).slice(-2)}</Text>
                                    <View style={{ flexDirection: 'row', gap: 20, marginTop: 10 }}>
                                        <TouchableOpacity onPress={() => setIsWorkTimerRunning(!isWorkTimerRunning)}>
                                            <MaterialCommunityIcons name={isWorkTimerRunning ? "pause-circle" : "play-circle"} size={36} color={currentWorkout.color} />
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => { setWorkTimeLeft(duration); setIsWorkTimerRunning(false); }}>
                                            <MaterialCommunityIcons name="refresh-circle" size={36} color="#8E8E93" />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                             );
                          } else {
                             return (
                                <TouchableOpacity style={[styles.workSetBox, { backgroundColor: '#2A2A2A', borderColor: currentWorkout.color, borderWidth: 1 }]} onPress={() => { setWorkTimeLeft(duration); setIsWorkTimerRunning(true); }}>
                                    <MaterialCommunityIcons name="timer-play-outline" size={32} color={currentWorkout.color} style={{ marginBottom: 5 }} />
                                    <Text style={{ color: '#FFF', fontWeight: '800', fontSize: 13, letterSpacing: 1 }}>ĐẾM GIỜ</Text>
                                    <Text style={styles.workLbl}>{currentWorkout.exercises[exIndex].reps}</Text>
                                </TouchableOpacity>
                             );
                          }
                       } else {
                          return (
                             <View style={styles.workSetBox}>
                                <Text style={styles.workVal}>{currentWorkout.exercises[exIndex].reps}</Text>
                                <Text style={styles.workLbl}>Mục tiêu</Text>
                             </View>
                          );
                       }
                    })()}
                 </View>
                 
                 <View style={styles.workInstructionCard}>
                   <MaterialCommunityIcons name="lightbulb-on-outline" size={20} color="#FFB870" />
                   <Text style={styles.workHowTo}>{currentWorkout.exercises[exIndex].howTo}</Text>
                 </View>

                 <TouchableOpacity style={[styles.workDoneBtn, { backgroundColor: currentWorkout.color }]} onPress={handleDoneSet}>
                    <Text style={styles.workDoneText}>HOÀN THÀNH HIỆP NÀY</Text>
                 </TouchableOpacity>
               </View>
            )}
          </View>
        </Modal>
     )
  }

  // OVERVIEW UI
  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: insets.top + 10, paddingBottom: 150, paddingHorizontal: 20 }}>
        
        <View style={styles.header}>
          <Text style={styles.subtitle}>Huấn luyện • {totalWorkoutsCompleted} Streak</Text>
          <Text style={styles.title}>Chu Kỳ Khoa Học</Text>
        </View>

        {/* TODAY'S PLAN CARD */}
        <View style={[styles.activeCard, { borderColor: currentWorkout.color, borderWidth: 1 }]}>
           <Text style={[styles.activeDay, { color: currentWorkout.color }]}>HÔM NAY</Text>
           <Text style={styles.activeTitle}>{currentWorkout.dayCode}</Text>
           <Text style={styles.activeSub}>{currentWorkout.title}</Text>
           <Text style={styles.activeDesc}>{currentWorkout.description}</Text>

           {isCompletedToday ? (
             <View style={styles.successBadge}>
               <MaterialCommunityIcons name="check-decagram" size={24} color="#33D1C1" />
               <Text style={styles.successBadgeText}>BẠN ĐÃ TẬP XONG GIÁO ÁN NÀY!</Text>
             </View>
           ) : currentWorkout.exercises.length > 0 ? (
             <TouchableOpacity style={[styles.startBtn, { backgroundColor: currentWorkout.color }]} onPress={startWorkout}>
                <Text style={styles.startBtnText}>BẮT ĐẦU BUỔI TẬP</Text>
             </TouchableOpacity>
           ) : (
             <View style={styles.restBadge}>
               <MaterialCommunityIcons name="home-heart" size={24} color="#8E8E93" />
               <Text style={styles.restBadgeText}>Hôm nay xả hơi tái tạo cơ bắp tĩnh.</Text>
             </View>
           )}
        </View>

        {/* EXERCISES DIAGNOSTICS */}
        {currentWorkout.exercises.length > 0 && (
           <View style={styles.breakdownSection}>
              <Text style={styles.sectionHeading}>Phân Tích Chuyên Sâu ({currentWorkout.exercises.length} Bài)</Text>
              
              {currentWorkout.exercises.map(ex => (
                 <View key={ex.id} style={styles.exBreakdown}>
                   <View style={styles.exNameRow}>
                      <Text style={styles.exName}>{ex.name}</Text>
                      <Text style={styles.exMeta}>{ex.sets}x</Text>
                   </View>
                   <Text style={styles.exHowTo}>{ex.howTo}</Text>

                   {/* Logic Progressive Overload & Muscles */}
                   <View style={styles.logicBox}>
                      <View style={styles.logicRow}>
                         <MaterialCommunityIcons name="arm-flex" size={16} color="#33D1C1" />
                         <Text style={styles.logicText}><Text style={{fontWeight:'700'}}>Tác dụng:</Text> {ex.muscle}</Text>
                      </View>
                      <View style={styles.logicRow}>
                         <MaterialCommunityIcons name="trending-up" size={16} color="#FFB870" />
                         <Text style={styles.logicText}><Text style={{fontWeight:'700'}}>Tăng tiến sau 1 tháng:</Text> {ex.evolution}</Text>
                      </View>
                   </View>
                 </View>
              ))}
           </View>
        )}

        {/* PREVIEW CARD */}
        <View style={styles.previewCard}>
          <Text style={styles.previewHeader}>LỘ TRÌNH NGÀY MAI</Text>
          <View style={styles.previewBody}>
             <View>
               <Text style={styles.previewTitle}>{nextWorkout.dayCode}</Text>
               <Text style={styles.previewSub}>{nextWorkout.title} ({nextWorkout.exercises.length} Mục)</Text>
             </View>
             <MaterialCommunityIcons name="lock" size={28} color="#D1D1D6" />
          </View>
        </View>

      </ScrollView>

      {renderPlayer()}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { marginBottom: 20 },
  subtitle: { fontSize: 16, color: '#8E8E93', fontWeight: '600', textTransform: 'uppercase' },
  title: { fontSize: 32, color: '#121212', fontWeight: '800' },
  
  activeCard: { backgroundColor: '#1A1A1A', padding: 25, borderRadius: 24, marginVertical: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 10 },
  activeDay: { fontSize: 13, fontWeight: '700', letterSpacing: 2, marginBottom: 10 },
  activeTitle: { fontSize: 26, fontWeight: '800', color: '#FFFFFF', marginBottom: 5 },
  activeSub: { fontSize: 16, color: '#E0E0E0', fontWeight: '600' },
  activeDesc: { color: '#8E8E93', marginTop: 15, lineHeight: 22, fontSize: 14 },
  
  startBtn: { padding: 18, borderRadius: 16, alignItems: 'center', marginTop: 30 },
  startBtnText: { color: '#121212', fontWeight: '800', letterSpacing: 1, fontSize: 15 },
  
  successBadge: { flexDirection: 'row', backgroundColor: '#E0F7FA', padding: 15, borderRadius: 12, marginTop: 25, justifyContent: 'center', alignItems: 'center' },
  successBadgeText: { color: '#00796B', fontWeight: '800', marginLeft: 10 },
  restBadge: { flexDirection: 'row', backgroundColor: '#2A2A2A', padding: 15, borderRadius: 12, marginTop: 25, justifyContent: 'center', alignItems: 'center' },
  restBadgeText: { color: '#E5E5EA', fontWeight: '600', marginLeft: 10 },

  breakdownSection: { marginTop: 30 },
  sectionHeading: { fontSize: 20, fontWeight: '800', color: '#121212', marginBottom: 15 },
  exBreakdown: { backgroundColor: '#F5F5F7', padding: 20, borderRadius: 20, marginBottom: 15, borderWidth: 1, borderColor: '#E5E5EA' },
  exNameRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  exName: { fontSize: 17, fontWeight: '800', color: '#121212', flex: 1 },
  exMeta: { color: '#8E8E93', fontWeight: '800', fontSize: 16 },
  exHowTo: { color: '#666', marginTop: 10, lineHeight: 22, fontSize: 14 },
  
  logicBox: { backgroundColor: '#FFFFFF', padding: 15, borderRadius: 12, marginTop: 15 },
  logicRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
  logicText: { fontSize: 13, color: '#121212', marginLeft: 10, flex: 1, lineHeight: 20 },

  previewCard: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20, marginTop: 30, borderWidth: 1, borderColor: '#E5E5EA', borderStyle: 'dashed' },
  previewHeader: { color: '#8E8E93', fontSize: 12, fontWeight: '700', letterSpacing: 1, marginBottom: 15 },
  previewBody: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  previewTitle: { fontSize: 18, fontWeight: '800', color: '#121212', opacity: 0.5 },
  previewSub: { fontSize: 14, color: '#8E8E93', marginTop: 4 },

  // LIVE PLAYER STYLES
  playerContainer: { flex: 1, backgroundColor: '#121212', paddingHorizontal: 20 },
  playerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 15 },
  closeBtn: { padding: 10, backgroundColor: '#2A2A2A', borderRadius: 20 },
  playerTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '700', letterSpacing: 1 },
  playerProgression: { height: 6, backgroundColor: '#333', borderRadius: 3, marginBottom: 30, overflow: 'hidden' },
  playerFill: { height: '100%', backgroundColor: '#FFB870', borderRadius: 3 },
  
  restRoot: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  restTitle: { color: '#8E8E93', fontSize: 20, fontWeight: '800', letterSpacing: 3 },
  restNextHint: { color: '#AEAEB2', fontSize: 16, marginTop: 15 },
  restBigClock: { fontSize: 100, fontWeight: '900', marginVertical: 30, fontVariant: ['tabular-nums'] },
  restControls: { flexDirection: 'row', gap: 15, alignItems: 'center' },
  restTimeBtn: { backgroundColor: '#2A2A2A', paddingVertical: 18, borderRadius: 16, width: 80, alignItems: 'center' },
  restTimeBtnText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
  restSkip: { backgroundColor: '#FFB870', paddingVertical: 18, paddingHorizontal: 35, borderRadius: 16 },
  restSkipText: { color: '#121212', fontWeight: '800', fontSize: 15 },

  workRoot: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 50 },
  workMuscle: { fontSize: 16, fontWeight: '800', marginBottom: 15, alignSelf: 'center', letterSpacing: 2 },
  workName: { fontSize: 34, fontWeight: '900', color: '#FFF', textAlign: 'center', marginHorizontal: 10, marginBottom: 30 },
  workMetaBlock: { flexDirection: 'row', gap: 15, marginBottom: 30, width: '100%' },
  workSetBox: { backgroundColor: '#2A2A2A', paddingVertical: 25, borderRadius: 20, alignItems: 'center', flex: 1 },
  workVal: { fontSize: 28, fontWeight: '800', color: '#FFF' },
  workLbl: { color: '#8E8E93', fontSize: 14, marginTop: 5, fontWeight: '600' },
  
  workInstructionCard: { flexDirection: 'row', backgroundColor: '#1A1A1A', padding: 20, borderRadius: 16, width: '100%', marginBottom: 30 },
  workHowTo: { color: '#AEAEB2', fontSize: 15, lineHeight: 22, flex: 1, marginLeft: 15 },
  
  workDoneBtn: { paddingVertical: 20, width: '100%', borderRadius: 20, alignItems:'center', position: 'absolute', bottom: 30 },
  workDoneText: { color: '#121212', fontWeight: '800', fontSize: 16, letterSpacing: 1 }
});