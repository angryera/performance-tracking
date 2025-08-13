import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

export function getGradeColor(grade: string): string {
  switch (grade.toUpperCase()) {
    case "A":
      return "text-green-600 bg-green-100";
    case "B":
      return "text-blue-600 bg-blue-100";
    case "C":
      return "text-yellow-600 bg-yellow-100";
    case "D":
      return "text-orange-600 bg-orange-100";
    case "F":
      return "text-red-600 bg-red-100";
    default:
      return "text-gray-600 bg-gray-100";
  }
}

export const getMessageAge = (timestamp: string) => {
  try {
    const messageTime = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - messageTime.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);

    if (diffSeconds < 60) return `${diffSeconds}s ago`;
    if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`;
    return `${Math.floor(diffSeconds / 3600)}h ago`;
  } catch (error) {
    return "Unknown";
  }
};

export const formatTimestamp = (timestamp: string) => {
  try {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) {
      return "Invalid timestamp";
    }
    return date.toLocaleTimeString();
  } catch (error) {
    return "Invalid timestamp";
  }
};
