import { create } from 'zustand';
import dayjs from 'dayjs';
import { LogService } from '../services/LogService';

export interface UserProfile {
  age: number;
  weight: number;
  height: number;
  gender: 'male' | 'female';
  activityLevel: number; // 1.2, 1.375, 1.55, 1.725
  armSize?: number;
  chestSize?: number;
  thighSize?: number;
}

export interface StreakData {
  count: number;
  lastDate: string;
  history: string[];
}

export interface WorkoutSetData {
  reps: string;
  completed: boolean;
}

export interface WorkoutHistory {
  date: string;
  exercises: {
    [exerciseId: string]: WorkoutSetData[];
  }
}

export interface DailyTargets {
  targetKcal: number;
  targetProtein: number;
  targetCarb: number;
  targetFat: number;
  targetWater: number;
}

interface AppState {
  currentDate: string;
  completedMeals: number[];
  extraFoodsKcal: number;
  waterConsumed: number;
  workoutDone: boolean;
  streak: StreakData;
  currentSchedule: any[];
  isInitialized: boolean;

  // Phase 3 Variables
  userProfile: UserProfile | null;
  targets: DailyTargets;
  currentProtein: number;
  currentCarb: number;
  currentFat: number;
  
  // Phase 4 Variables
  workoutHistory: WorkoutHistory;
  lastWorkoutHistory: WorkoutHistory | null;

  // Actions
  initializeForDay: (dateStr: string) => Promise<void>;
  toggleMeal: (mealId: number) => void;
  addExtraKcal: (kcal: number, protein?: number, carb?: number, fat?: number) => void;
  setWaterConsumed: (ml: number) => void;
  setWorkoutDone: (done: boolean) => void;
  updateStreak: (todayDate: string) => void;
  setProfile: (profile: UserProfile) => void;
  
  // Phase 4 Actions
  setWorkoutSet: (exerciseId: string, setIndex: number, reps: string, completed: boolean) => void;
  completeWorkout: () => void;
}

const calculateTargets = (profile: UserProfile): DailyTargets => {
  // BMR formula Mifflin-St Jeor
  let bmr = (10 * profile.weight) + (6.25 * profile.height) - (5 * profile.age);
  bmr += profile.gender === 'male' ? 5 : -161;
  
  const tdee = Math.round(bmr * profile.activityLevel);
  const targetKcal = tdee + 300; // Smart Bulking for Ectomorph
  const targetProtein = Math.round(profile.weight * 2.2);
  const targetFat = Math.round(profile.weight * 1);
  const targetCarb = Math.round((targetKcal - (targetProtein * 4) - (targetFat * 9)) / 4);
  const targetWater = Math.round(profile.weight * 40);

  return { targetKcal, targetProtein, targetCarb, targetFat, targetWater };
};

export const useAppStore = create<AppState>((set, get) => ({
  currentDate: dayjs().format('YYYY-MM-DD'),
  completedMeals: [],
  extraFoodsKcal: 0,
  waterConsumed: 0,
  workoutDone: false,
  streak: { count: 0, lastDate: '', history: [] },
  currentSchedule: [],
  isInitialized: false,
  
  userProfile: null,
  targets: { targetKcal: 2500, targetProtein: 130, targetCarb: 300, targetFat: 60, targetWater: 2500 },
  currentProtein: 0,
  currentCarb: 0,
  currentFat: 0,
  
  workoutHistory: { date: dayjs().format('YYYY-MM-DD'), exercises: {} },
  lastWorkoutHistory: null,

  initializeForDay: async (dateStr: string) => {
    const log = await LogService.getDailyLog(dateStr);
    const streakData = await LogService.getStreak();
    const customSched = await LogService.getCustomSchedule(dateStr);
    const profile = await LogService.getProfile();
    const lastWorkout = await LogService.getLastWorkout();

    let newTargets = get().targets;
    if (profile) {
      newTargets = calculateTargets(profile as UserProfile);
    }

    set({
      currentDate: dateStr,
      completedMeals: log?.completedMeals || [],
      extraFoodsKcal: log?.extraFoodsKcal || 0,
      waterConsumed: log?.waterConsumed || 0,
      workoutDone: log?.workoutDone || false,
      streak: streakData || { count: 0, lastDate: '', history: [] },
      currentSchedule: customSched || [],
      userProfile: profile || null,
      targets: newTargets,
      currentProtein: log?.currentProtein || 0,
      currentCarb: log?.currentCarb || 0,
      currentFat: log?.currentFat || 0,
      workoutHistory: log?.workoutHistory || { date: dateStr, exercises: {} },
      lastWorkoutHistory: lastWorkout || null,
      isInitialized: true,
    });
  },

  setProfile: (profile: UserProfile) => {
    const newTargets = calculateTargets(profile);
    set({ userProfile: profile, targets: newTargets });
    LogService.saveProfile(profile);
  },

  toggleMeal: (mealId: number) => {
    const { completedMeals, currentDate } = get();
    const newMeals = completedMeals.includes(mealId)
      ? completedMeals.filter(id => id !== mealId)
      : [...completedMeals, mealId];
    
    set({ completedMeals: newMeals });
    LogService.saveDailyLog(currentDate, { completedMeals: newMeals });
  },

  addExtraKcal: (kcal: number, protein: number = 0, carb: number = 0, fat: number = 0) => {
    const { extraFoodsKcal, currentProtein, currentCarb, currentFat, currentDate } = get();
    const newKcal = extraFoodsKcal + kcal;
    const newP = currentProtein + protein;
    const newC = currentCarb + carb;
    const newF = currentFat + fat;
    
    set({ 
       extraFoodsKcal: newKcal,
       currentProtein: newP,
       currentCarb: newC,
       currentFat: newF
    });
    
    LogService.saveDailyLog(currentDate, { 
       extraFoodsKcal: newKcal,
       currentProtein: newP,
       currentCarb: newC,
       currentFat: newF
    });
  },

  setWaterConsumed: (ml: number) => {
    const { waterConsumed, currentDate } = get();
    const newWater = waterConsumed + ml;
    set({ waterConsumed: newWater });
    LogService.saveDailyLog(currentDate, { waterConsumed: newWater });
  },

  setWorkoutDone: (done: boolean) => {
    const { currentDate } = get();
    set({ workoutDone: done });
    LogService.saveDailyLog(currentDate, { workoutDone: done });
  },

  updateStreak: (todayDate: string) => {
    const { streak } = get();
    let newStreak = { ...streak };
    const yesterdayDate = dayjs(todayDate).subtract(1, 'day').format('YYYY-MM-DD');

    if (newStreak.lastDate !== todayDate) {
      if (newStreak.lastDate === yesterdayDate) {
        newStreak.count += 1;
      } else {
        newStreak.count = 1;
      }
      newStreak.lastDate = todayDate;
      if (!newStreak.history) newStreak.history = [];
      if (!newStreak.history.includes(todayDate)) newStreak.history.push(todayDate);
      
      set({ streak: newStreak });
      LogService.saveStreak(newStreak);
    }
  },

  setWorkoutSet: (exerciseId: string, setIndex: number, reps: string, completed: boolean) => {
    const { workoutHistory, currentDate } = get();

    // Deep-clone exercises để tránh mutate state cũ (Zustand immutability)
    const clonedExercises: { [key: string]: WorkoutSetData[] } = {};
    for (const key of Object.keys(workoutHistory.exercises || {})) {
      clonedExercises[key] = workoutHistory.exercises[key].map(s => ({ ...s }));
    }

    if (!clonedExercises[exerciseId]) {
      clonedExercises[exerciseId] = [
        { reps: '', completed: false },
        { reps: '', completed: false },
        { reps: '', completed: false }
      ];
    }

    clonedExercises[exerciseId][setIndex] = { reps, completed };

    const newHistory: WorkoutHistory = { date: currentDate, exercises: clonedExercises };

    set({ workoutHistory: newHistory });
    LogService.saveDailyLog(currentDate, { workoutHistory: newHistory });
  },

  completeWorkout: () => {
    const { currentDate, workoutHistory } = get();
    // Đánh dấu date vào workoutHistory trước khi lưu làm lastWorkout
    const finalHistory: WorkoutHistory = { ...workoutHistory, date: currentDate };
    set({ workoutDone: true, workoutHistory: finalHistory });
    LogService.saveDailyLog(currentDate, { workoutDone: true, workoutHistory: finalHistory });

    // Lưu làm lastWorkout để Progressive Overload ngày hôm sau đọc được
    LogService.saveLastWorkout(finalHistory);
  }
}));
