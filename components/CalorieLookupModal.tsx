import React, { useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Platform, KeyboardAvoidingView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import mockFoods from '../data/vietnamese_foods.json';

interface Props {
  visible: boolean;
  onClose: () => void;
  onAddFood: (kcal: number, item?: any) => void;
}

export default function CalorieLookupModal({ visible, onClose, onAddFood }: Props) {
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');

  const filteredData = mockFoods.filter(item => 
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (item: any) => {
    onAddFood(item.kcal, item);
    onClose();
    setSearch('');
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <KeyboardAvoidingView 
        style={styles.modalOverlay} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={[styles.modalContainer, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 }]}>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <MaterialCommunityIcons name="close" size={28} color="#121212" />
          </TouchableOpacity>

          <Text style={styles.title}>Tìm kiếm món ăn</Text>
          <Text style={styles.subtitle}>Công cụ tra cứu và cộng dồn Calo</Text>

          <View style={styles.searchContainer}>
            <MaterialCommunityIcons name="magnify" size={24} color="#8E8E93" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Nhập tên món Việt (vd: Phở bò, Xôi...)"
              placeholderTextColor="#8E8E93"
              value={search}
              onChangeText={setSearch}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')}>
                <MaterialCommunityIcons name="close-circle" size={20} color="#8E8E93" />
              </TouchableOpacity>
            )}
          </View>

          <FlatList
            data={filteredData}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.foodCard} onPress={() => handleSelect(item)}>
                <View style={styles.foodInfo}>
                  <Text style={styles.foodName}>{item.name}</Text>
                  <Text style={styles.foodMacros}>
                    {item.unit} • P: {item.protein}g | C: {item.carb}g | F: {item.fat}g
                  </Text>
                </View>
                <View style={styles.calorieBadge}>
                  <Text style={styles.calorieText}>+{item.kcal}</Text>
                  <Text style={styles.kcalLabel}>kcal</Text>
                </View>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <Text style={styles.emptyText}>Không tìm thấy món ăn phù hợp.</Text>
            }
          />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    height: '90%',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 20,
  },
  closeBtn: {
    alignSelf: 'flex-end',
    padding: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#121212',
    marginTop: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 20,
    marginTop: 5,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F7',
    borderRadius: 16,
    paddingHorizontal: 15,
    height: 50,
    marginBottom: 20,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#121212',
  },
  foodCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F7',
  },
  foodInfo: {
    flex: 1,
  },
  foodName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#121212',
    marginBottom: 4,
  },
  foodMacros: {
    fontSize: 13,
    color: '#8E8E93',
  },
  calorieBadge: {
    backgroundColor: '#FFB870',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: 'center',
  },
  calorieText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#121212',
  },
  kcalLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#121212',
    opacity: 0.8,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    color: '#8E8E93',
    fontSize: 15,
  }
});
