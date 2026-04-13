import React, { useState, useEffect } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import dayjs from 'dayjs';
import { LogService } from '../services/LogService';
import CalorieLookupModal from './CalorieLookupModal';
import CustomAlert from './CustomAlert';
import { THEME } from '../constants/theme';

const defaultMealSlots = [
  { id: 1, time: '07:00', title: 'Bữa sáng', icon: 'bowl-mix', foods: [{fId: 1, name: 'Phở bò béo', kcal: 450}] },
  { id: 2, time: '10:00', title: 'Bữa phụ sáng', icon: 'cup-water', foods: [{fId: 2, name: 'Sữa tươi + Bánh giò', kcal: 300}] },
  { id: 3, time: '12:30', title: 'Bữa trưa', icon: 'food-drumstick', foods: [{fId: 3, name: 'Cơm sườn nướng', kcal: 600}] },
  { id: 4, time: '15:30', title: 'Bữa phụ chiều', icon: 'blender', foods: [{fId: 4, name: 'Sinh tố bơ', kcal: 350}] },
  { id: 5, time: '18:30', title: 'Bữa tối', icon: 'food-turkey', foods: [{fId: 5, name: 'Cơm ba chỉ quay', kcal: 600}] },
  { id: 6, time: '21:30', title: 'Bữa phụ tối', icon: 'glass-mug', foods: [{fId: 6, name: 'Sữa ông thọ pha ấm', kcal: 200}] }
];

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function TomorrowMenuModal({ visible, onClose }: Props) {
  const [slots, setSlots] = useState<any[]>(JSON.parse(JSON.stringify(defaultMealSlots)));
  const [lookupVisible, setLookupVisible] = useState(false);
  const [activeSlotId, setActiveSlotId] = useState<number | null>(null);
  
  const [alertState, setAlertState] = useState({ 
    visible: false, title: '', message: '', type: 'success', dataPayload: null as any 
  });

  useEffect(() => {
    if (visible) loadSchedule();
  }, [visible]);

  const getTomorrowDateStr = () => dayjs().add(1, 'day').format('YYYY-MM-DD');

  const loadSchedule = async () => {
    try {
      const savedData = await LogService.getCustomSchedule(getTomorrowDateStr());
      if (savedData) {
        const mapped = savedData.map((p: any) => ({
          id: p.id,
          time: p.time,
          title: p.title,
          icon: p.icon || 'food',
          foods: p.foods ? p.foods : [{ fId: Date.now() + Math.random(), name: p.sub, kcal: p.kcal }]
        }));
        setSlots(mapped);
      } else {
        setSlots(JSON.parse(JSON.stringify(defaultMealSlots))); 
      }
    } catch(e) {}
  };

  const handleRemoveFood = (slotId: number, fId: number) => {
    setSlots(prev => prev.map(s => {
      if (s.id === slotId) {
        return { ...s, foods: s.foods.filter((f: any) => f.fId !== fId) };
      }
      return s;
    }));
  };

  const openLookup = (slotId: number) => {
    setActiveSlotId(slotId);
    setLookupVisible(true);
  };

  const handleAddFoodToSlot = (kcal: number, item: any) => {
    setSlots(prev => prev.map(s => {
      if (s.id === activeSlotId) {
        return { ...s, foods: [...s.foods, { fId: Date.now() + Math.random(), name: item?.name || 'Món mới', kcal }] };
      }
      return s;
    }));
  };

  const saveSchedule = async () => {
    let hasEmptySlot = false;
    const finalData = slots.map(s => {
      const totalKcal = s.foods.reduce((sum: number, f: any) => sum + f.kcal, 0);
      const subNames = s.foods.map((f:any) => f.name).join(' + ');
      if (s.foods.length === 0) hasEmptySlot = true;
      return {
        id: s.id,
        time: s.time,
        type: 'meal',
        title: s.title,
        icon: s.icon,
        sub: subNames || 'Chưa chọn món',
        kcal: totalKcal,
        foods: s.foods
      };
    });

    if (hasEmptySlot) {
      setAlertState({
        visible: true,
        title: "Xác nhận lịch trình",
        message: "Bạn có bữa ăn chưa chọn món nào. Lịch trình này sẽ ghi nhận là 'Chưa chọn món'. Bạn có chắc chắn muốn lưu?",
        type: "confirm_save",
        dataPayload: finalData
      });
      return;
    }
    
    executeSave(finalData);
  };

  const executeSave = async (data: any) => {
    await LogService.saveCustomSchedule(getTomorrowDateStr(), data);
    setAlertState({ 
      visible: true, 
      title: "Thành công", 
      message: "Đã chốt thực đơn cho ngày mai!", 
      type: "success", 
      dataPayload: null 
    });
  };

  const handleAlertConfirm = () => {
    if (alertState.type === 'confirm_save') {
      const data = alertState.dataPayload;
      setAlertState({ ...alertState, visible: false });
      setTimeout(() => executeSave(data), 300);
    } else if (alertState.type === 'success') {
      setAlertState({ ...alertState, visible: false });
      onClose();
    } else {
      setAlertState({ ...alertState, visible: false });
    }
  };

  let totalKcal = 0;
  slots.forEach(s => s.foods.forEach((f:any) => totalKcal += f.kcal));

  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Thiết Kế Thực Đơn Ngày Mai</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <MaterialCommunityIcons name="close" size={24} color={THEME.colors.textMain} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.list} contentContainerStyle={{paddingBottom: 20}}>
          {slots.map(slot => {
            const slotKcal = slot.foods.reduce((sum: number, f:any) => sum + f.kcal, 0);
            return (
              <View key={slot.id} style={styles.slotCard}>
                <View style={styles.slotHeader}>
                  <View style={{flexDirection: 'row', alignItems: 'center'}}>
                     <MaterialCommunityIcons name={slot.icon} size={22} color={THEME.colors.textMain} />
                     <Text style={styles.slotTitle}>{slot.title} <Text style={{fontSize: 14, color:THEME.colors.textSub, fontWeight: '400'}}>({slot.time})</Text></Text>
                  </View>
                  <Text style={styles.slotKcal}>{slotKcal} Kcal</Text>
                </View>

                {slot.foods.map((food: any) => (
                  <View key={food.fId} style={styles.foodRow}>
                    <Text style={styles.foodName}>• {food.name}</Text>
                    <View style={{flexDirection:'row', alignItems:'center'}}>
                      <Text style={styles.foodKcal}>{food.kcal}</Text>
                      <TouchableOpacity onPress={() => handleRemoveFood(slot.id, food.fId)} style={styles.removeBtn}>
                        <MaterialCommunityIcons name="close-circle" size={20} color={THEME.colors.textSub} />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}

                <TouchableOpacity style={styles.addBtn} onPress={() => openLookup(slot.id)}>
                   <MaterialCommunityIcons name="plus" size={20} color={THEME.colors.primary} />
                   <Text style={styles.addBtnText}>Thêm món vào {slot.title}</Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </ScrollView>

        <View style={styles.footer}>
           {totalKcal < 2500 ? (
             <View style={styles.warningBanner}>
               <Text style={styles.warningText}>⚠️ CẢNH BÁO: Thực đơn ngày mai mới đạt {totalKcal} Kcal. Đang hụt so với chỉ tiêu 2500 Kcal tăng cân!</Text>
             </View>
           ) : (
             <View style={styles.successBanner}>
               <Text style={styles.successText}>✅ Cán mốc mục tiêu: {totalKcal} Kcal. Tuyệt vời!</Text>
             </View>
           )}

           <TouchableOpacity style={styles.saveBtn} onPress={saveSchedule}>
             <Text style={styles.saveBtnText}>LƯU TRỮ TRẠNG THÁI</Text>
           </TouchableOpacity>
        </View>
      </View>

      <CalorieLookupModal visible={lookupVisible} onClose={() => setLookupVisible(false)} onAddFood={handleAddFoodToSlot} />
      
      <CustomAlert 
        visible={alertState.visible}
        title={alertState.title}
        message={alertState.message}
        onConfirm={handleAlertConfirm}
        onCancel={alertState.type === 'confirm_save' ? () => setAlertState({ ...alertState, visible: false }) : undefined}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.colors.white, paddingTop: 50 },
  header: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 15, alignItems: 'center' },
  title: { fontSize: 22, fontWeight: '700', color: THEME.colors.textMain },
  closeBtn: { padding: 5, backgroundColor: THEME.colors.bgCard, borderRadius: 20 },
  list: { paddingHorizontal: 20 },
  
  slotCard: { backgroundColor: THEME.colors.bgCard, padding: 15, borderRadius: THEME.radius.small, marginBottom: 15 },
  slotHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, borderBottomWidth: 1, borderBottomColor: '#E5E5EA', paddingBottom: 10 },
  slotTitle: { fontSize: 16, fontWeight: '700', color: THEME.colors.textMain, marginLeft: 8 },
  slotKcal: { fontSize: 15, fontWeight: '700', color: THEME.colors.accent },
  
  foodRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 5 },
  foodName: { fontSize: 14, color: THEME.colors.textMain, flex: 1 },
  foodKcal: { fontSize: 14, color: THEME.colors.textSub, marginRight: 10 },
  removeBtn: { padding: 5 },
  
  addBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, backgroundColor: '#E0F7FA', borderRadius: 12, marginTop: 10 },
  addBtnText: { marginLeft: 5, fontSize: 14, fontWeight: '600', color: '#00796B' },
  
  footer: { padding: 20, backgroundColor: THEME.colors.white, borderTopWidth: 1, borderTopColor: THEME.colors.bgCard, shadowColor: '#000', shadowOffset: { width:0, height:-5}, shadowOpacity: 0.05, shadowRadius: 10, elevation: 10 },
  warningBanner: { backgroundColor: THEME.colors.bgCard, padding: 15, borderRadius: 12, marginBottom: 15 },
  warningText: { color: THEME.colors.textSub, fontWeight: '600', fontSize: 13, lineHeight: 20 },
  successBanner: { backgroundColor: THEME.colors.primary, padding: 15, borderRadius: 12, marginBottom: 15, opacity: 0.2 },
  successText: { color: THEME.colors.primary, fontWeight: '700', fontSize: 14, textAlign: 'center' },
  
  saveBtn: { backgroundColor: THEME.colors.textMain, padding: 16, borderRadius: THEME.radius.small, alignItems: 'center' },
  saveBtnText: { color: THEME.colors.white, fontSize: 16, fontWeight: '700', letterSpacing: 1 }
});
