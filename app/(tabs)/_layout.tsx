// app/(tabs)/_layout.tsx
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Tabs } from "expo-router";
import React from "react";
import { StyleSheet, View } from "react-native";
// THÊM IMPORT NÀY:
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/use-color-scheme";

function TabBarIcon(props: {
  name: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  color: string;
}) {
  return (
    <MaterialCommunityIcons size={28} style={{ marginBottom: -3 }} {...props} />
  );
}

// CẬP NHẬT HEADER NÀY
function HomeScreenHeader() {
  // Lấy thông số vùng an toàn (tránh tai thỏ, dynamic island)
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.headerContainer,
        // Tự động đẩy phần đệm phía trên bằng đúng chiều cao của tai thỏ + 10px khoảng cách
        { paddingTop: insets.top + 10 },
      ]}
    >
      <View style={styles.headerContent}>
        {/* Nút quay lại */}
        <MaterialCommunityIcons name="arrow-left" size={24} color="#121212" />

        <View style={styles.headerRightGroup}>
          {/* Nút Lịch */}
          <View style={styles.iconCircle}>
            <MaterialCommunityIcons
              name="calendar-range-outline"
              size={20}
              color="#121212"
            />
          </View>

          {/* Avatar */}
          <MaterialCommunityIcons
            name="account-circle"
            size={40}
            color="#121212"
            style={styles.avatar}
          />
        </View>
      </View>
    </View>
  );
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.tabIconSelected,
        tabBarInactiveTintColor: colors.tabIconDefault,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Trang chủ", // Đã Việt hóa
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="home-variant-outline" color={color} />
          ),
          headerShown: true,
          header: () => <HomeScreenHeader />,
        }}
      />

      <Tabs.Screen
        name="explore"
        options={{
          title: "Tập luyện", // Đã Việt hóa
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="weight-lifter" color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="diet"
        options={{
          title: "Ăn uống", // Đã Việt hóa
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="food-apple-outline" color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Cá nhân", // Đã Việt hóa
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="account-outline" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#121212',
    borderTopWidth: 0,
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    height: 75, // Tăng chiều cao lên một chút cho thoáng
    borderRadius: 35,
    paddingTop: 12, // Đẩy icon xuống giữa
    paddingBottom: 12, // Căn đều khoảng cách đáy
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  tabBarLabel: {
    fontSize: 11,
    marginTop: 4, // Tách chữ ra khỏi icon
    fontWeight: '600',
  },
  headerContainer: {
    paddingBottom: 10,
    paddingHorizontal: 20,
    backgroundColor: "#FFFFFF",
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerRightGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#121212",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#EEEEEE",
  },
  avatar: {},
});
