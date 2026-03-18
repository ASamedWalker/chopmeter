export type ReminderType = "low_balance" | "daily_check" | "weekly_report";

export interface ReminderSettings {
  enabled: boolean;
  lowBalanceAlert: boolean;
  lowBalanceThreshold: number;
  dailyCheckReminder: boolean;
  dailyCheckTime: string;
  weeklyReport: boolean;
}

export const DEFAULT_REMINDER_SETTINGS: ReminderSettings = {
  enabled: false,
  lowBalanceAlert: true,
  lowBalanceThreshold: 3,
  dailyCheckReminder: false,
  dailyCheckTime: "18:00",
  weeklyReport: false,
};

/** Request notification permission from the browser */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  const result = await Notification.requestPermission();
  return result === "granted";
}

/** Check current notification permission status */
export function getNotificationStatus():
  | "granted"
  | "denied"
  | "default"
  | "unsupported" {
  if (!("Notification" in window)) return "unsupported";
  return Notification.permission;
}

/** Show a browser notification */
export function showNotification(title: string, body: string, tag?: string) {
  if (Notification.permission !== "granted") return;
  new Notification(title, {
    body,
    icon: "/icons/icon-192x192.png",
    badge: "/icons/icon-192x192.png",
    tag: tag || "chopmeter",
  } as NotificationOptions);
}

/** Check and trigger low balance notification based on days remaining */
export function checkLowBalanceNotification(
  daysLeft: number | null,
  threshold: number
) {
  if (daysLeft === null || daysLeft > threshold) return;
  if (daysLeft <= 0) {
    showNotification(
      "Credit Depleted!",
      "Your electricity credit may have run out. Top up soon!",
      "low-balance"
    );
  } else if (daysLeft <= 1) {
    showNotification(
      "Credit Running Out!",
      "Less than a day of electricity remaining. Top up now!",
      "low-balance"
    );
  } else {
    showNotification(
      "Low Balance Alert",
      `Your electricity credit may run out in ${Math.ceil(daysLeft)} days.`,
      "low-balance"
    );
  }
}

/** Check if a daily reminder is due and show it */
export function checkDailyReminder(scheduledTime: string) {
  const now = new Date();
  const [hours, minutes] = scheduledTime.split(":").map(Number);
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const targetMinutes = hours * 60 + minutes;

  // Show if we're within 30 minutes after the scheduled time
  if (currentMinutes >= targetMinutes && currentMinutes <= targetMinutes + 30) {
    const lastShown = sessionStorage.getItem("chopmeter_daily_reminder_shown");
    const today = now.toDateString();
    if (lastShown === today) return;

    sessionStorage.setItem("chopmeter_daily_reminder_shown", today);
    showNotification(
      "Time to Check Your Meter",
      "Take a quick scan of your prepaid meter to keep your usage tracking accurate.",
      "daily-check"
    );
  }
}

/** Check if a weekly report notification is due (Sundays) */
export function checkWeeklyReport(
  weeklyUsage: number,
  currencySymbol: string,
  dailyBurnRate: number
) {
  const now = new Date();
  if (now.getDay() !== 0) return; // Only on Sundays

  const lastShown = sessionStorage.getItem("chopmeter_weekly_report_shown");
  const thisWeek = `${now.getFullYear()}-W${Math.ceil(
    ((now.getTime() - new Date(now.getFullYear(), 0, 1).getTime()) / 86400000 +
      1) /
      7
  )}`;
  if (lastShown === thisWeek) return;

  sessionStorage.setItem("chopmeter_weekly_report_shown", thisWeek);
  showNotification(
    "Weekly Usage Summary",
    `This week: ${weeklyUsage.toFixed(1)} kWh | Avg: ${currencySymbol} ${dailyBurnRate.toFixed(2)}/day`,
    "weekly-report"
  );
}

/** Check and trigger streak-at-risk reminder (call in evening) */
export function checkStreakReminder(currentStreak: number, scannedToday: boolean) {
  if (scannedToday || currentStreak === 0) return;

  const now = new Date();
  if (now.getHours() < 19) return; // Only remind after 7 PM

  const lastShown = sessionStorage.getItem("chopmeter_streak_reminder_shown");
  const today = now.toDateString();
  if (lastShown === today) return;

  sessionStorage.setItem("chopmeter_streak_reminder_shown", today);
  showNotification(
    `Your ${currentStreak}-day streak is at risk!`,
    "Quick scan to keep your streak alive. Don't let it break!",
    "streak-risk"
  );
}

/** Check for unusual usage spike and notify */
export function checkUsageSpike(todayUsage: number, avgDailyUsage: number) {
  if (avgDailyUsage <= 0 || todayUsage <= 0) return;
  const ratio = todayUsage / avgDailyUsage;
  if (ratio < 2) return; // Only alert at 2x+ normal

  const lastShown = sessionStorage.getItem("chopmeter_spike_shown");
  const today = new Date().toDateString();
  if (lastShown === today) return;

  sessionStorage.setItem("chopmeter_spike_shown", today);
  showNotification(
    "Unusual Usage Detected",
    `Today's usage is ${ratio.toFixed(1)}x your daily average. Check for unusual appliance activity.`,
    "usage-spike"
  );
}
