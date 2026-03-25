// MyBudget - Color Scheme
const tintColorLight = "#10B981"; // Emerald green for trust and growth
const tintColorDark = "#34D399"; // Lighter emerald for dark mode

export default {
  light: {
    text: "#1F2937",
    textSecondary: "#6B7280",
    background: "#F9FAFB",
    surface: "#FFFFFF",
    tint: tintColorLight,
    tabIconDefault: "#9CA3AF",
    tabIconSelected: tintColorLight,
    border: "#E5E7EB",
    success: "#10B981",
    warning: "#F59E0B",
    danger: "#EF4444",
    info: "#3B82F6",
    chart: ["#10B981", "#3B82F6", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"],
  },
  dark: {
    text: "#F9FAFB",
    textSecondary: "#9CA3AF",
    background: "#111827",
    surface: "#1F2937",
    tint: tintColorDark,
    tabIconDefault: "#6B7280",
    tabIconSelected: tintColorDark,
    border: "#374151",
    success: "#34D399",
    warning: "#FBBF24",
    danger: "#F87171",
    info: "#60A5FA",
    chart: ["#34D399", "#60A5FA", "#FBBF24", "#F87171", "#A78BFA", "#F472B6"],
  },
};

export const categoryColors: Record<string, string> = {
  food: "#10B981",
  transport: "#3B82F6",
  entertainment: "#F59E0B",
  shopping: "#EF4444",
  health: "#8B5CF6",
  education: "#EC4899",
  bills: "#6366F1",
  other: "#9CA3AF",
};
