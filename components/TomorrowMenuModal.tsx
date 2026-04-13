import React, { useState, useEffect } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CalorieLookupModal from './CalorieLookupModal';

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
  const [slots, setSlots] = useState<any[]>([]);
  const [lookupVisible, setLookupVisible] = useState(false);
  const [activeSlotId, setActiveSlotId] = useState<number | null>(null);

  useEffect(() => {
    if (visible) loadSchedule();
  }, [visible]);

  const getTomorrowDateStr = () => {
    const d = new Date(); d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };

  const loadSchedule = async () => {
    try {
      const saved = await AsyncStorage.getItem(`@custom_schedule_${getTomorrowDateStr()}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        const mapped = parsed.map((p: any) => ({
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
      Alert.alert("Lưu ý", "Có bữa bạn chưa chọn món nào. Lịch trình sẽ ghi nhận là Chưa chọn món.");
    }
    
    await AsyncStorage.setItem(`@custom_schedule_${getTomorrowDateStr()}`, JSON.stringify(finalData));
    Alert.alert("Thành công", "Đã chốt thực đơn cho ngày mai!");
    onClose();
  };

  let totalKcal = 0;
  slots.forEach(s => s.foods.forEach((f:any) => totalKcal += f.kcal));

  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Thiết Kế Thực Đơn Ngày Mai</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <MaterialCommunityIcons name="close" size={24} color="#121212" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.list} contentContainerStyle={{paddingBottom: 20}}>
          {slots.map(slot => {
            const slotKcal = slot.foods.reduce((sum: number, f:any) => sum + f.kcal, 0);
            return (
              <View key={slot.id} style={styles.slotCard}>
                <View style={styles.slotHeader}>
                  <View style={{flexDirection: 'row', alignItems: 'center'}}>
                     <MaterialCommunityIcons name={slot.icon} size={22} color="#121212" />
                     <Text style={styles.slotTitle}>{slot.title} <Text style={{fontSize: 14, color:'#8E8E93', fontWeight: '400'}}>({slot.time})</Text></Text>
                  </View>
                  <Text style={styles.slotKcal}>{slotKcal} Kcal</Text>
                </View>

                {slot.foods.map((food: any) => (
                  <View key={food.fId} style={styles.foodRow}>
                    <Text style={styles.foodName}>• {food.name}</Text>
                    <View style={{flexDirection:'row', alignItems:'center'}}>
                      <Text style={styles.foodKcal}>{food.kcal}</Text>
                      <TouchableOpacity onPress={() => handleRemoveFood(slot.id, food.fId)} style={styles.removeBtn}>
                        <MaterialCommunityIcons name="close-circle" size={20} color="#FF453A" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}

                <TouchableOpacity style={styles.addBtn} onPress={() => openLookup(slot.id)}>
                   <MaterialCommunityIcons name="plus" size={20} color="#33D1C1" />
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
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF', paddingTop: 50 },
  header: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 15, alignItems: 'center' },
  title: { fontSize: 22, fontWeight: '700', color: '#121212' },
  closeBtn: { padding: 5, backgroundColor: '#F5F5F7', borderRadius: 20 },
  list: { paddingHorizontal: 20 },
  
  slotCard: { backgroundColor: '#F5F5F7', padding: 15, borderRadius: 16, marginBottom: 15, borderWidth: 1, borderColor: '#E5E5EA' },
  slotHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, borderBottomWidth: 1, borderBottomColor: '#E5E5EA', paddingBottom: 10 },
  slotTitle: { fontSize: 16, fontWeight: '700', color: '#121212', marginLeft: 8 },
  slotKcal: { fontSize: 15, fontWeight: '700', color: '#FFB870' },
  
  foodRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 5 },
  foodName: { fontSize: 14, color: '#121212', flex: 1 },
  foodKcal: { fontSize: 14, color: '#8E8E93', marginRight: 10 },
  removeBtn: { padding: 5 },
  
  addBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, backgroundColor: '#E0F7FA', borderRadius: 12, marginTop: 10 },
  addBtnText: { marginLeft: 5, fontSize: 14, fontWeight: '600', color: '#00796B' },
  
  footer: { padding: 20, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#F5F5F7', shadowColor: '#000', shadowOffset: { width:0, height:-5}, shadowOpacity: 0.05, shadowRadius: 10, elevation: 10 },
  warningBanner: { backgroundColor: '#FFF0F0', padding: 15, borderRadius: 12, marginBottom: 15 },
  warningText: { color: '#FF453A', fontWeight: '600', fontSize: 13, lineHeight: 20 },
  successBanner: { backgroundColor: '#E0F7FA', padding: 15, borderRadius: 12, marginBottom: 15 },
  successText: { color: '#00796B', fontWeight: '700', fontSize: 14, textAlign: 'center' },
  
  saveBtn: { backgroundColor: '#121212', padding: 16, borderRadius: 16, alignItems: 'center' },
  saveBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700', letterSpacing: 1 }
});
