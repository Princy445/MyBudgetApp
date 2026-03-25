import createContextHook from "@nkzw/create-context-hook";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMemo, useState, useEffect, useCallback } from "react";
import type {
  Transaction,
  Budget,
  Investment,
  SavingsGoal,
  UserSettings,
} from "@/types";
import { convertCurrency } from "@/constants/currencies";

const STORAGE_KEYS = {
  transactions: "@mybudget/transactions",
  budgets: "@mybudget/budgets",
  investments: "@mybudget/investments",
  goals: "@mybudget/goals",
  settings: "@mybudget/settings",
};

const DEFAULT_SETTINGS: UserSettings = {
  primaryCurrency: "MGA",
  darkMode: false,
  notifications: true,
  monthlyBudget: 0,
  name: "",
  email: "",
};

export const [BudgetProvider, useBudget] = createContextHook(function BudgetContext() {
  const queryClient = useQueryClient();
  const [isReady, setIsReady] = useState(false);

  const settingsQuery = useQuery({
    queryKey: ["settings"],
    queryFn: async (): Promise<UserSettings> => {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.settings);
      if (stored) return JSON.parse(stored);
      return DEFAULT_SETTINGS;
    },
  });

  const transactionsQuery = useQuery({
    queryKey: ["transactions"],
    queryFn: async (): Promise<Transaction[]> => {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.transactions);
      if (stored) return JSON.parse(stored);
      return [];
    },
  });

  const budgetsQuery = useQuery({
    queryKey: ["budgets"],
    queryFn: async (): Promise<Budget[]> => {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.budgets);
      if (stored) return JSON.parse(stored);
      return [];
    },
  });

  const investmentsQuery = useQuery({
    queryKey: ["investments"],
    queryFn: async (): Promise<Investment[]> => {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.investments);
      if (stored) return JSON.parse(stored);
      return [];
    },
  });

  const goalsQuery = useQuery({
    queryKey: ["goals"],
    queryFn: async (): Promise<SavingsGoal[]> => {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.goals);
      if (stored) return JSON.parse(stored);
      return [];
    },
  });

  useEffect(() => {
    if (
      transactionsQuery.isSuccess &&
      budgetsQuery.isSuccess &&
      investmentsQuery.isSuccess &&
      goalsQuery.isSuccess &&
      settingsQuery.isSuccess
    ) {
      setIsReady(true);
    }
  }, [
    transactionsQuery.isSuccess,
    budgetsQuery.isSuccess,
    investmentsQuery.isSuccess,
    goalsQuery.isSuccess,
    settingsQuery.isSuccess,
  ]);

  const saveTransactions = useMutation({
    mutationFn: async (data: Transaction[]) => {
      await AsyncStorage.setItem(STORAGE_KEYS.transactions, JSON.stringify(data));
      return data;
    },
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["transactions"] }),
  });

  const saveBudgets = useMutation({
    mutationFn: async (data: Budget[]) => {
      await AsyncStorage.setItem(STORAGE_KEYS.budgets, JSON.stringify(data));
      return data;
    },
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["budgets"] }),
  });

  const saveInvestments = useMutation({
    mutationFn: async (data: Investment[]) => {
      await AsyncStorage.setItem(STORAGE_KEYS.investments, JSON.stringify(data));
      return data;
    },
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["investments"] }),
  });

  const saveGoals = useMutation({
    mutationFn: async (data: SavingsGoal[]) => {
      await AsyncStorage.setItem(STORAGE_KEYS.goals, JSON.stringify(data));
      return data;
    },
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["goals"] }),
  });

  const saveSettings = useMutation({
    mutationFn: async (data: UserSettings) => {
      await AsyncStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(data));
      return data;
    },
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["settings"] }),
  });

  // ── Transactions ──────────────────────────────────────────────────────────

  /**
   * BUG FIX: When adding a transaction, also sync the `spent` field on the
   * matching budget for the current month so that budget progress bars
   * reflect real spending automatically.
   */
  const syncBudgetSpent = useCallback(
    (transactions: Transaction[], budgets: Budget[]): Budget[] => {
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      return budgets.map((budget) => {
        if (budget.month !== currentMonth || budget.year !== currentYear) {
          return budget;
        }
        const spent = transactions
          .filter(
            (t) =>
              t.type === "expense" &&
              t.category === budget.category &&
              new Date(t.date).getMonth() === currentMonth &&
              new Date(t.date).getFullYear() === currentYear
          )
          .reduce((acc, t) => acc + t.amount, 0);
        return { ...budget, spent };
      });
    },
    []
  );

  const addTransaction = useCallback(
    (transaction: Omit<Transaction, "id">) => {
      const newTransaction: Transaction = { ...transaction, id: Date.now().toString() };
      const updatedTransactions = [...(transactionsQuery.data ?? []), newTransaction];
      saveTransactions.mutate(updatedTransactions);

      // Auto-sync budget spent amounts
      const currentBudgets = budgetsQuery.data ?? [];
      const syncedBudgets = syncBudgetSpent(updatedTransactions, currentBudgets);
      saveBudgets.mutate(syncedBudgets);
    },
    [transactionsQuery.data, budgetsQuery.data, saveTransactions, saveBudgets, syncBudgetSpent]
  );

  const deleteTransaction = useCallback(
    (id: string) => {
      const updatedTransactions = (transactionsQuery.data ?? []).filter((t) => t.id !== id);
      saveTransactions.mutate(updatedTransactions);

      // Re-sync budget spent after deletion
      const currentBudgets = budgetsQuery.data ?? [];
      const syncedBudgets = syncBudgetSpent(updatedTransactions, currentBudgets);
      saveBudgets.mutate(syncedBudgets);
    },
    [transactionsQuery.data, budgetsQuery.data, saveTransactions, saveBudgets, syncBudgetSpent]
  );

  // ── Budgets ───────────────────────────────────────────────────────────────

  const addBudget = useCallback(
    (budget: Omit<Budget, "id">) => {
      // Calculate current spent immediately from transactions
      const transactions = transactionsQuery.data ?? [];
      const spent = transactions
        .filter(
          (t) =>
            t.type === "expense" &&
            t.category === budget.category &&
            new Date(t.date).getMonth() === budget.month &&
            new Date(t.date).getFullYear() === budget.year
        )
        .reduce((acc, t) => acc + t.amount, 0);

      const newBudget: Budget = { ...budget, spent, id: Date.now().toString() };
      const updated = [...(budgetsQuery.data ?? []), newBudget];
      saveBudgets.mutate(updated);
    },
    [budgetsQuery.data, transactionsQuery.data, saveBudgets]
  );

  const updateBudget = useCallback(
    (id: string, updates: Partial<Budget>) => {
      const updated = (budgetsQuery.data ?? []).map((b) =>
        b.id === id ? { ...b, ...updates } : b
      );
      saveBudgets.mutate(updated);
    },
    [budgetsQuery.data, saveBudgets]
  );

  const deleteBudget = useCallback(
    (id: string) => {
      const updated = (budgetsQuery.data ?? []).filter((b) => b.id !== id);
      saveBudgets.mutate(updated);
    },
    [budgetsQuery.data, saveBudgets]
  );

  // ── Investments ───────────────────────────────────────────────────────────

  const addInvestment = useCallback(
    (investment: Omit<Investment, "id">) => {
      const newInvestment: Investment = { ...investment, id: Date.now().toString() };
      const updated = [...(investmentsQuery.data ?? []), newInvestment];
      saveInvestments.mutate(updated);
    },
    [investmentsQuery.data, saveInvestments]
  );

  // BUG FIX: Added missing updateInvestment function
  const updateInvestment = useCallback(
    (id: string, updates: Partial<Investment>) => {
      const updated = (investmentsQuery.data ?? []).map((i) =>
        i.id === id ? { ...i, ...updates } : i
      );
      saveInvestments.mutate(updated);
    },
    [investmentsQuery.data, saveInvestments]
  );

  const deleteInvestment = useCallback(
    (id: string) => {
      const updated = (investmentsQuery.data ?? []).filter((i) => i.id !== id);
      saveInvestments.mutate(updated);
    },
    [investmentsQuery.data, saveInvestments]
  );

  // ── Goals ─────────────────────────────────────────────────────────────────

  const addGoal = useCallback(
    (goal: Omit<SavingsGoal, "id">) => {
      const newGoal: SavingsGoal = { ...goal, id: Date.now().toString() };
      const updated = [...(goalsQuery.data ?? []), newGoal];
      saveGoals.mutate(updated);
    },
    [goalsQuery.data, saveGoals]
  );

  const updateGoal = useCallback(
    (id: string, updates: Partial<SavingsGoal>) => {
      const updated = (goalsQuery.data ?? []).map((g) =>
        g.id === id ? { ...g, ...updates } : g
      );
      saveGoals.mutate(updated);
    },
    [goalsQuery.data, saveGoals]
  );

  const deleteGoal = useCallback(
    (id: string) => {
      const updated = (goalsQuery.data ?? []).filter((g) => g.id !== id);
      saveGoals.mutate(updated);
    },
    [goalsQuery.data, saveGoals]
  );

  // ── Settings ──────────────────────────────────────────────────────────────

  const updateSettings = useCallback(
    (updates: Partial<UserSettings>) => {
      const current = settingsQuery.data ?? DEFAULT_SETTINGS;
      saveSettings.mutate({ ...current, ...updates });
    },
    [settingsQuery.data, saveSettings]
  );

  // ── Computed values ───────────────────────────────────────────────────────

  const primaryCurrency = settingsQuery.data?.primaryCurrency ?? "MGA";

  const totalBalance = useMemo(() => {
    const transactions = transactionsQuery.data ?? [];
    return transactions.reduce((acc, t) => {
      const amt = convertCurrency(t.amount, t.currency, primaryCurrency);
      return acc + (t.type === "income" ? amt : -amt);
    }, 0);
  }, [transactionsQuery.data, primaryCurrency]);

  const totalIncome = useMemo(() => {
    return (transactionsQuery.data ?? [])
      .filter((t) => t.type === "income")
      .reduce((acc, t) => acc + convertCurrency(t.amount, t.currency, primaryCurrency), 0);
  }, [transactionsQuery.data, primaryCurrency]);

  const totalExpenses = useMemo(() => {
    return (transactionsQuery.data ?? [])
      .filter((t) => t.type === "expense")
      .reduce((acc, t) => acc + convertCurrency(t.amount, t.currency, primaryCurrency), 0);
  }, [transactionsQuery.data, primaryCurrency]);

  const totalInvestments = useMemo(() => {
    return (investmentsQuery.data ?? []).reduce(
      (acc, i) => acc + convertCurrency(i.currentValue, i.currency, primaryCurrency),
      0
    );
  }, [investmentsQuery.data, primaryCurrency]);

  const totalSavings = useMemo(() => {
    return (goalsQuery.data ?? []).reduce(
      (acc, g) => acc + convertCurrency(g.currentAmount, g.currency, primaryCurrency),
      0
    );
  }, [goalsQuery.data, primaryCurrency]);

  const expensesByCategory = useMemo(() => {
    const expenses = (transactionsQuery.data ?? []).filter((t) => t.type === "expense");
    const grouped: Record<string, number> = {};
    expenses.forEach((t) => {
      const amt = convertCurrency(t.amount, t.currency, primaryCurrency);
      grouped[t.category] = (grouped[t.category] ?? 0) + amt;
    });
    return Object.entries(grouped)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount);
  }, [transactionsQuery.data, primaryCurrency]);

  return useMemo(
    () => ({
      isReady,
      transactions: transactionsQuery.data ?? [],
      budgets: budgetsQuery.data ?? [],
      investments: investmentsQuery.data ?? [],
      goals: goalsQuery.data ?? [],
      settings: settingsQuery.data ?? DEFAULT_SETTINGS,
      primaryCurrency,
      totalBalance,
      totalIncome,
      totalExpenses,
      totalInvestments,
      totalSavings,
      expensesByCategory,
      addTransaction,
      deleteTransaction,
      addBudget,
      updateBudget,
      deleteBudget,
      addInvestment,
      updateInvestment,
      deleteInvestment,
      addGoal,
      updateGoal,
      deleteGoal,
      updateSettings,
      isLoading:
        transactionsQuery.isLoading ||
        budgetsQuery.isLoading ||
        investmentsQuery.isLoading ||
        goalsQuery.isLoading,
    }),
    [
      isReady,
      transactionsQuery.data,
      budgetsQuery.data,
      investmentsQuery.data,
      goalsQuery.data,
      settingsQuery.data,
      primaryCurrency,
      totalBalance,
      totalIncome,
      totalExpenses,
      totalInvestments,
      totalSavings,
      expensesByCategory,
      addTransaction,
      deleteTransaction,
      addBudget,
      updateBudget,
      deleteBudget,
      addInvestment,
      updateInvestment,
      deleteInvestment,
      addGoal,
      updateGoal,
      deleteGoal,
      updateSettings,
      transactionsQuery.isLoading,
      budgetsQuery.isLoading,
      investmentsQuery.isLoading,
      goalsQuery.isLoading,
    ]
  );
});
