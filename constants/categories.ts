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

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export const expenseCategories: Category[] = [
  { id: "food", name: "Food & Dining", icon: "UtensilsCrossed", color: categoryColors.food },
  { id: "transport", name: "Transport", icon: "Car", color: categoryColors.transport },
  { id: "entertainment", name: "Entertainment", icon: "Film", color: categoryColors.entertainment },
  { id: "shopping", name: "Shopping", icon: "ShoppingBag", color: categoryColors.shopping },
  { id: "health", name: "Health", icon: "Heart", color: categoryColors.health },
  { id: "education", name: "Education", icon: "BookOpen", color: categoryColors.education },
  { id: "bills", name: "Bills", icon: "Receipt", color: categoryColors.bills },
  { id: "other", name: "Other", icon: "MoreHorizontal", color: categoryColors.other },
];

export const investmentTypes = [
  { id: "stocks", name: "Stocks", icon: "TrendingUp", color: "#10B981" },
  { id: "crypto", name: "Cryptocurrency", icon: "Bitcoin", color: "#F59E0B" },
  { id: "bonds", name: "Bonds", icon: "Shield", color: "#3B82F6" },
  { id: "savings", name: "Savings", icon: "PiggyBank", color: "#8B5CF6" },
];
