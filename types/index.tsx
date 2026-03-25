export interface Transaction {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
  type: "income" | "expense";
  currency: string;
}

export interface Budget {
  id: string;
  category: string;
  amount: number;
  spent: number;
  month: number;
  year: number;
}

export interface Investment {
  id: string;
  name: string;
  type: string;
  amount: number;
  currentValue: number;
  purchaseDate: string;
  currency: string;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  currency: string;
}

export interface UserSettings {
  primaryCurrency: string;
  darkMode: boolean;
  notifications: boolean;
  monthlyBudget: number;
  name: string;
  email: string;
}
