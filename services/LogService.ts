import { db } from '../lib/firebase';
import { doc, setDoc, updateDoc, onSnapshot } from 'firebase/firestore';

export interface DailyLog {
  completedMeals: number[];
  extraFoodsKcal: number;
  waterConsumed: number;
  workoutDone: boolean;
  currentProtein: number;
  currentCarb: number;
  currentFat: number;
  workoutHistory?: any;
}

export const LogService = {
  getDailyLog: (dateStr: string): Promise<DailyLog | null> => {
    return new Promise((resolve) => {
      const docRef = doc(db, 'daily_logs', dateStr);
      const unsubscribe = onSnapshot(docRef, 
        (docSnap) => {
          unsubscribe();
          if (docSnap.exists()) {
            resolve(docSnap.data() as DailyLog);
          } else {
            resolve(null);
          }
        },
        (error) => {
          console.error("Error getting daily log:", error);
          unsubscribe();
          resolve(null);
        }
      );
    });
  },

  saveDailyLog: async (dateStr: string, data: Partial<DailyLog>) => {
    try {
      const docRef = doc(db, 'daily_logs', dateStr);
      await setDoc(docRef, data, { merge: true });
    } catch (error) {
      console.error("Error saving daily log:", error);
    }
  },

  getStreak: (): Promise<any> => {
    return new Promise((resolve) => {
      const docRef = doc(db, 'user_data', 'streak');
      const unsubscribe = onSnapshot(docRef, 
        (docSnap) => {
          unsubscribe();
          if (docSnap.exists()) {
            resolve(docSnap.data());
          } else {
            resolve(null);
          }
        },
        (error) => {
          console.error("Error getting streak:", error);
          unsubscribe();
          resolve(null);
        }
      );
    });
  },

  saveStreak: async (streakData: any) => {
    try {
      const docRef = doc(db, 'user_data', 'streak');
      await setDoc(docRef, streakData, { merge: true });
    } catch (error) {
      console.error("Error saving streak:", error);
    }
  },

  getCustomSchedule: (dateStr: string): Promise<any> => {
    return new Promise((resolve) => {
      const docRef = doc(db, 'custom_schedules', dateStr);
      const unsubscribe = onSnapshot(docRef, 
        (docSnap) => {
          unsubscribe();
          if (docSnap.exists()) {
            resolve(docSnap.data().schedule);
          } else {
            resolve(null);
          }
        },
        (error) => {
          console.error("Error getting custom schedule:", error);
          unsubscribe();
          resolve(null);
        }
      );
    });
  },

  saveCustomSchedule: async (dateStr: string, scheduleData: any) => {
    try {
      const docRef = doc(db, 'custom_schedules', dateStr);
      await setDoc(docRef, { schedule: scheduleData }, { merge: true });
    } catch (error) {
      console.error("Error saving custom schedule:", error);
    }
  },

  getProfile: (): Promise<any> => {
    return new Promise((resolve) => {
      const docRef = doc(db, 'user_data', 'profile');
      const unsubscribe = onSnapshot(docRef, 
        (docSnap) => {
          unsubscribe();
          if (docSnap.exists()) {
            resolve(docSnap.data());
          } else {
            resolve(null);
          }
        },
        (error) => {
          console.error("Error getting profile:", error);
          unsubscribe();
          resolve(null);
        }
      );
    });
  },

  saveProfile: async (profileData: any) => {
    try {
      const docRef = doc(db, 'user_data', 'profile');
      await setDoc(docRef, profileData, { merge: true });
    } catch (error) {
      console.error("Error saving profile:", error);
    }
  },

  getLastWorkout: (): Promise<any> => {
    return new Promise((resolve) => {
      const docRef = doc(db, 'user_data', 'last_workout');
      const unsubscribe = onSnapshot(docRef, 
        (docSnap) => {
          unsubscribe();
          if (docSnap.exists()) {
            resolve(docSnap.data());
          } else {
            resolve(null);
          }
        },
        (error) => {
          console.error("Error getting last workout:", error);
          unsubscribe();
          resolve(null);
        }
      );
    });
  },

  saveLastWorkout: async (workoutData: any) => {
    try {
      const docRef = doc(db, 'user_data', 'last_workout');
      await setDoc(docRef, workoutData, { merge: true });
    } catch (error) {
      console.error("Error saving last workout:", error);
    }
  }
};
