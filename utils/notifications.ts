import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function requestNotificationPermission(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') return false;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('budget', {
      name: 'Budget Alerts',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
    });
  }
  return true;
}

export async function scheduleBudgetWarning(
  categoryName: string,
  percentage: number
): Promise<void> {
  const granted = await requestNotificationPermission();
  if (!granted) return;

  const isExceeded = percentage >= 100;
  await Notifications.scheduleNotificationAsync({
    content: {
      title: isExceeded ? '🚨 Budget Exceeded!' : '⚠️ Budget Warning',
      body: isExceeded
        ? `You've exceeded your ${categoryName} budget.`
        : `You've used ${Math.round(percentage)}% of your ${categoryName} budget.`,
      data: { categoryName, percentage },
      sound: true,
    },
    trigger: null, // immediate
  });
}

export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
