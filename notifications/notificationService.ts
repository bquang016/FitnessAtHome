// notifications/notificationService.ts
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Cấu hình để thông báo hiện pop-up ngay cả khi đang mở app
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function setupDailyReminders() {
  // 1. Xin quyền gửi thông báo
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') {
    console.log('Failed to get push token for push notification!');
    return;
  }

  // CÀI ĐẶT CHANNEL (Fix lỗi cho các phiên bản SDK mới và Android)
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Lịch trình hàng ngày',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  // 2. Xóa các thông báo cũ để cài lại từ đầu (tránh bị lặp chuông)
  await Notifications.cancelAllScheduledNotificationsAsync();

  // 3. Danh sách 9 mốc thời gian thiết kế riêng cho Ectomorph
  const schedule = [
    { id: 'wake', title: '☀️ Chào buổi sáng!', body: 'Dậy thôi nào, bắt đầu một ngày mới năng động!', hour: 6, minute: 30 },
    { id: 'breakfast', title: '🍳 Giờ ăn sáng', body: 'Nạp năng lượng: Bánh mì bơ đậu phộng + Sữa nhé!', hour: 7, minute: 0 },
    { id: 'snack1', title: '🍌 Bữa phụ sáng', body: 'Giờ giải lao! Ăn 1 quả chuối + nắm hạt nhé.', hour: 10, minute: 0 },
    { id: 'lunch', title: '🍱 Giờ ăn trưa', body: 'Nấu ăn thôi: Cơm + Thịt/Cá + Rau xanh. Cố gắng ăn nhiều lên nhé!', hour: 12, minute: 30 },
    { id: 'snack2', title: '🥛 Bữa phụ chiều', body: 'Uống hộp sữa và ăn nhẹ trước khi học xong nào.', hour: 15, minute: 30 },
    { id: 'workout', title: '💪 WORKOUT TIME!', body: 'Thể lực đang ở mức tốt nhất. Lấy tạ và dây kháng lực ra thôi!', hour: 17, minute: 30 },
    { id: 'dinner', title: '🍲 Giờ ăn tối', body: 'Bữa ăn phục hồi cơ bắp: Cơm + Ức gà/Thịt + Rau.', hour: 18, minute: 30 },
    { id: 'snack3', title: '🥚 Bữa phụ tối', body: 'Ăn 2 quả trứng luộc hoặc ly sữa ấm để nuôi cơ ban đêm.', hour: 21, minute: 30 },
    { id: 'sleep', title: '🌙 Giờ đi ngủ', body: 'Tắt điện thoại, thư giãn để đi ngủ. Giấc ngủ 8 tiếng rất quan trọng để tăng cân!', hour: 22, minute: 30 },
  ];

  // 4. Lên lịch lặp lại hàng ngày
  for (const item of schedule) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: item.title,
        body: item.body,
        sound: true,
      },
      // ĐÃ FIX LỖI TRIGGER TẠI ĐÂY
      trigger: {
        hour: item.hour,
        minute: item.minute,
        repeats: true,
        channelId: 'default',
      } as any,
    });
  }
  console.log("Đã cài đặt xong 9 mốc báo thức hàng ngày!");
}