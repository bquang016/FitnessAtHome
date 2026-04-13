export interface Exercise {
  id: string;
  name: string;
  targetSets: number;
  targetReps: string;
  restTime: number; // in seconds
  icon: any; // MaterialCommunityIcons name
  description: string;
}

export const ectomorphWorkoutPlan: Exercise[] = [
  {
    id: "e1_goblet_squat",
    name: "Goblet Squat",
    targetSets: 3,
    targetReps: "10-15",
    restTime: 90,
    icon: "weight-lifter",
    description: "Knee Dominant: Tạ tay 5-10kg (Đùi/Mông)"
  },
  {
    id: "e2_push_up",
    name: "Push-up",
    targetSets: 3,
    targetReps: "8-12",
    restTime: 90,
    icon: "human-handsdown",
    description: "Horizontal Push: Hít đất (Ngực/Tay sau), thêm dây kháng lực nếu nhẹ"
  },
  {
    id: "e3_seated_row",
    name: "Seated Band Row",
    targetSets: 3,
    targetReps: "12-15",
    restTime: 90,
    icon: "rowing",
    description: "Horizontal Pull: Kéo xô ngang bằng dây kháng lực (Lưng/Tay trước)"
  },
  {
    id: "e4_rdl",
    name: "Romanian Deadlift",
    targetSets: 3,
    targetReps: "10-15",
    restTime: 90,
    icon: "weight",
    description: "Hip Dominant: Gập người kéo tạ + dây (Đùi sau/Lưng dưới)"
  },
  {
    id: "e5_ohp",
    name: "Dumbbell Shoulder Press",
    targetSets: 3,
    targetReps: "10-12",
    restTime: 90,
    icon: "arm-flex",
    description: "Vertical Push: Đẩy tạ tay qua đầu 5kg (Vai)"
  },
  {
    id: "e6_pull_ups",
    name: "Pull-ups",
    targetSets: 3,
    targetReps: "Failure",
    restTime: 90,
    icon: "human-handsup",
    description: "Vertical Pull: Kéo xà (Xô/Lưng) - Dùng dây kháng lực để hỗ trợ nếu cần"
  }
];
