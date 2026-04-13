import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppStore } from '../../store/useAppStore';
import CustomAlert from '../../components/CustomAlert';
import RestTimerModal from '../../components/RestTimerModal';
import { THEME } from '../../constants/theme';
import { ectomorphWorkoutPlan, Exercise } from '../../data/workout_plan';
import dayjs from 'dayjs';

export default function WorkoutScreen() {
  const insets = useSafeAreaInsets();
  const { workoutHistory, lastWorkoutHistory, setWorkoutSet, completeWorkout, workoutDone } = useAppStore();
  
  // States
  const [alertConfig, setAlertConfig] = useState({ visible: false, title: '', message: '', confirmText: 'ĐÃ HIỂU' });
  const [timerVisible, setTimerVisible] = useState(false);
  const [expandedEx, setExpandedEx] = useState<string | null>(null);

  // 48h Recovery Check
  useEffect(() => {
    if (lastWorkoutHistory && lastWorkoutHistory.date) {
      const isYesterday = dayjs().subtract(1, 'day').format('YYYY-MM-DD') === lastWorkoutHistory.date;
      const isSameDay = dayjs().format('YYYY-MM-DD') === lastWorkoutHistory.date;
      
      // If we did a workout yesterday, show 48h warning
      if (isYesterday && !workoutDone) {
        setAlertConfig({
          visible: true,
          title: 'Cần Phục Hồi Cơ Bắp ⚠️',
          message: 'Cơ bắp cần ít nhất 48 giờ để tổng hợp Protein. Hôm nay là ngày nghỉ ngơi bắt buộc để phục hồi!',
          confirmText: 'BỎ QUA VÀ TẬP (KHÔNG KHUYẾN KHÍCH)'
        });
      }
    }
  }, []);

  const handleFinishSet = (exId: string, setIndex: number, currentText: string, currentlyCompleted: boolean) => {
    // Nếu chưa nhập Reps mà bấm hòan thành
    if (!currentlyCompleted && currentText.trim() === '') {
       // Do nothing or alert
       return;
    }
    
    // Đảo trạng thái
    const newCompleted = !currentlyCompleted;
    setWorkoutSet(exId, setIndex, currentText, newCompleted);

    // Kích hoạt Timer nếu tích xanh hoàn thành (Và không phải là Set cuối cùng của bài cuối cùng)
    if (newCompleted) {
       setTimerVisible(true);
    }
  };

  const handleCompleteWorkout = () => {
    // Validation: Kiểm tra xem ít nhất mỗi bài có 1 set hoàn thành không
    const exercises = workoutHistory.exercises || {};
    const completedExercises = ectomorphWorkoutPlan.filter(ex => {
      const sets = exercises[ex.id] || [];
      return sets.some((s: any) => s.completed);
    });

    if (completedExercises.length < ectomorphWorkoutPlan.length) {
      setAlertConfig({
        visible: true,
        title: 'Chưa hoàn thành đủ bài tập ⚠️',
        message: `Bạn mới hoàn thành ${completedExercises.length}/${ectomorphWorkoutPlan.length} bài tập. Hãy cố gắng hoàn thành ít nhất 1 hiệp cho TẤT CẢ các bài tập trước khi kết thúc buổi tập.`,
        confirmText: 'QUAY LẠI TẬP TIẾP'
      });
      return;
    }

    completeWorkout();
    setAlertConfig({
      visible: true,
      title: 'Chúc mừng! 🏆',
      message: 'Buổi tập Full-body mệt mỏi nhưng xứng đáng. Quá trình kích thích cơ tạng Ectomorph đã hoàn thành, hãy đi bổ sung Protein xịn nhé!',
      confirmText: 'TUYỆT VỜI'
    });
  };

  const renderExerciseCard = (ex: Exercise) => {
    const isExpanded = expandedEx === ex.id;
    const historyEx = workoutHistory.exercises[ex.id] || [];
    const lastHistoryEx = lastWorkoutHistory?.exercises[ex.id] || [];

    return (
      <View key={ex.id} style={styles.exCard}>
        <TouchableOpacity 
          activeOpacity={0.7} 
          style={styles.exHeader} 
          onPress={() => setExpandedEx(isExpanded ? null : ex.id)}
        >
          <View style={styles.exIcon}>
            <MaterialCommunityIcons name={ex.icon} size={28} color={THEME.colors.primary} />
          </View>
          <View style={styles.exInfo}>
            <Text style={styles.exNum}>BÀI {ectomorphWorkoutPlan.indexOf(ex) + 1}</Text>
            <Text style={styles.exTitle}>{ex.name}</Text>
            <Text style={styles.exDesc}>{ex.description}</Text>
          </View>
          <MaterialCommunityIcons 
            name={isExpanded ? "chevron-up" : "chevron-down"} 
            size={24} 
            color={THEME.colors.textSub} 
          />
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.setsContainer}>
             <View style={styles.setHeaderRow}>
                <Text style={styles.setColHeader}>HIỆP</Text>
                <Text style={[styles.setColHeader, { flex: 2 }]}>MỤC TIÊU</Text>
                <Text style={[styles.setColHeader, { flex: 2 }]}>THỰC TẾ (REPS)</Text>
                <Text style={styles.setColHeader}>XONG</Text>
             </View>

             {[0, 1, 2].map((setIdx) => {
               const currentSet = historyEx[setIdx] || { reps: '', completed: false };
               const lastSet = lastHistoryEx[setIdx];
               
               return (
                 <View key={setIdx} style={styles.setRow}>
                    <Text style={styles.setColNum}>{setIdx + 1}</Text>
                    <Text style={[styles.setColTarget, { flex: 2 }]}>{ex.targetReps}</Text>
                    
                    <View style={[styles.setColInputBox, { flex: 2 }]}>
                       <TextInput 
                         style={[styles.repInput, currentSet.completed && styles.repInputDisabled]}
                         keyboardType="numeric"
                         placeholder="Nhập..."
                         editable={!currentSet.completed}
                         value={String(currentSet.reps)}
                         onChangeText={(text) => setWorkoutSet(ex.id, setIdx, text, currentSet.completed)}
                       />
                       {lastSet && lastSet.reps !== '' && (
                         <Text style={styles.lastRepsText}>Lần trước: {lastSet.reps}</Text>
                       )}
                    </View>

                    <TouchableOpacity 
                       style={styles.setColCheck}
                       onPress={() => handleFinishSet(ex.id, setIdx, String(currentSet.reps), currentSet.completed)}
                    >
                       <MaterialCommunityIcons 
                         name={currentSet.completed ? "checkbox-marked-circle" : "checkbox-blank-circle-outline"}
                         size={28}
                         color={currentSet.completed ? THEME.colors.primary : '#D1D1D6'}
                       />
                    </TouchableOpacity>
                 </View>
               );
             })}
          </View>
        )}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={[styles.mainLayout, { paddingTop: insets.top }]}
    >
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        
        <View style={styles.pageHeader}>
          <Text style={styles.subtitle}>Ectomorph Workout</Text>
          <Text style={styles.title}>Full-Body Power</Text>
          <Text style={styles.summaryText}>
            Giáo án 6 bài tập ưu tiên nhóm cơ lớn (Hệ thống PPL gập gọn). Hãy đẩy tạ nặng dần qua mỗi buổi tập (Progressive Overload).
          </Text>
        </View>

        {/* Cảnh báo an toàn ngay trên top nếu Workout Done = true */}
        {workoutDone && (
          <View style={styles.doneBadge}>
            <MaterialCommunityIcons name="trophy" size={24} color="#FFD93D" />
            <Text style={styles.doneText}>Bạn đã hoàn thành giáo án hôm nay!</Text>
          </View>
        )}

        <View style={styles.planContainer}>
          {ectomorphWorkoutPlan.map(renderExerciseCard)}
        </View>

        <TouchableOpacity 
          style={[styles.finishBtn, workoutDone && styles.finishBtnDisabled]} 
          disabled={workoutDone}
          onPress={handleCompleteWorkout}
        >
          <Text style={styles.finishBtnText}>
            {workoutDone ? "ĐÃ LƯU KẾT QUẢ" : "HOÀN THÀNH BUỔI TẬP"}
          </Text>
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Popups */}
      <RestTimerModal 
        visible={timerVisible} 
        onClose={() => setTimerVisible(false)} 
        restSeconds={90} 
      />

      <CustomAlert 
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        onConfirm={() => setAlertConfig({ visible: false, title: '', message: '', confirmText: 'ĐÃ HIỂU' })}
      />

    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  mainLayout: {
    flex: 1,
    backgroundColor: THEME.colors.white,
  },
  container: {
    paddingHorizontal: THEME.spacing.l,
    paddingTop: THEME.spacing.m,
  },
  pageHeader: {
    marginBottom: THEME.spacing.l,
  },
  subtitle: {
    fontSize: 24,
    color: THEME.colors.textSub,
    fontWeight: '400',
  },
  title: {
    fontSize: 32,
    color: THEME.colors.textMain,
    fontWeight: '800',
    marginBottom: THEME.spacing.s,
  },
  summaryText: {
    fontSize: 14,
    color: THEME.colors.textSub,
    lineHeight: 20,
  },
  doneBadge: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 217, 61, 0.15)',
    padding: THEME.spacing.m,
    borderRadius: THEME.radius.small,
    alignItems: 'center',
    marginBottom: THEME.spacing.l,
    gap: 10,
  },
  doneText: {
    color: '#D4A000',
    fontWeight: '700',
    fontSize: 15,
  },
  planContainer: {
    gap: 15,
    marginBottom: THEME.spacing.xl,
  },
  exCard: {
    backgroundColor: THEME.colors.bgCard,
    borderRadius: THEME.radius.small,  // RADIUS_SMALL per requirement
    overflow: 'hidden',
  },
  exHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  exIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E6F7F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  exInfo: {
    flex: 1,
  },
  exNum: {
    fontSize: 12,
    fontWeight: '800',
    color: THEME.colors.primary,
    letterSpacing: 1,
    marginBottom: 2,
  },
  exTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: THEME.colors.textMain,
    marginBottom: 4,
  },
  exDesc: {
    fontSize: 13,
    color: THEME.colors.textSub,
    lineHeight: 18,
  },
  setsContainer: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    padding: 15,
  },
  setHeaderRow: {
    flexDirection: 'row',
    marginBottom: 10,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F7',
  },
  setColHeader: {
    flex: 1,
    fontSize: 11,
    color: THEME.colors.textSub,
    fontWeight: '700',
    textAlign: 'center',
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F7',
  },
  setColNum: {
    flex: 1,
    fontSize: 15,
    fontWeight: '800',
    color: THEME.colors.textSub,
    textAlign: 'center',
  },
  setColTarget: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.colors.textMain,
    textAlign: 'center',
  },
  setColInputBox: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  repInput: {
    backgroundColor: '#F5F5F7',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    width: 70,
    marginBottom: 4,
  },
  repInputDisabled: {
    backgroundColor: '#E5E5EA',
    color: THEME.colors.textSub,
  },
  lastRepsText: {
    fontSize: 10,
    color: THEME.colors.textSub,
  },
  setColCheck: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  finishBtn: {
    backgroundColor: THEME.colors.textMain,
    padding: 18,
    borderRadius: THEME.radius.medium,
    alignItems: 'center',
  },
  finishBtnDisabled: {
    backgroundColor: '#D1D1D6',
  },
  finishBtnText: {
    color: THEME.colors.white,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1,
  }
});