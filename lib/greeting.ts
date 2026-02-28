/**
 * Returns a time-of-day greeting string.
 * 5:00-11:59 → "Good morning"
 * 12:00-16:59 → "Good afternoon"
 * 17:00-4:59 → "Good evening"
 */
export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "Good morning";
  if (hour >= 12 && hour < 17) return "Good afternoon";
  return "Good evening";
}
