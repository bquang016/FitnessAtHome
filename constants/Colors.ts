// constants/Colors.ts
const tintColorLight = '#2f95dc';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    // Nền trắng tinh của màn hình
    text: '#121212',
    background: '#FFFFFF',
    
    // Màu của các mảng tối (như mảng "Statistics" và Card "Universal Fitness Expander")
    darkText: '#FFFFFF',
    darkBackground: '#121212',
    
    // Màu nền xám nhạt cho các panel dữ liệu (như các panel trong "Statistics")
    panelBackground: '#F5F5F7',
    
    // Các màu pastel điểm nhấn
    accentPurple: '#C5A3E5', // Dòng kẻ tím nhạt 45%
    accentBlue: '#9ED7E8',   // Cột xanh nhạt
    accentOrange: '#FFB870', // Panel dưới cùng
    accentTeal: '#33D1C1',   // Chữ "Connected" màu ngọc trai
    
    tint: tintColorLight,
    tabIconDefault: '#8e8e93', // Màu icon tab không active
    tabIconSelected: tintColorDark, // Màu icon tab được chọn
  },
  dark: {
    text: '#fff',
    background: '#121212',
    tint: tintColorDark,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorDark,
  },
};