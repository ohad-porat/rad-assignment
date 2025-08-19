export const generateRandomPastTimestamp = (maxDaysAgo: number) => {
  return new Date(Date.now() - Math.random() * maxDaysAgo * 24 * 60 * 60 * 1000).toISOString();
};

export const getRandomItem = <T>(items: readonly T[]): T => {
  return items[Math.floor(Math.random() * items.length)];
};

export const formatDateKey = (date: Date): string => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;
};

export const formatTimestamp = (timestamp: string): string => {
  const date = new Date(timestamp);
  return date.toLocaleString("en-US", {
    month: "numeric",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};
