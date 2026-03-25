// MyBudget - Budget Screen
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Modal, Alert, Platform,
} from "react-native";
import { useBudget } from "@/hooks/useBudgetContext";
import { useLanguage } from "@/hooks/useLanguageContext";
import Colors from "@/constants/colors";
import { formatCurrency } from "@/constants/currencies";
import { categoryColors, expenseCategories } from "@/constants/categories";
import { Plus, X, Target, AlertCircle, PiggyBank, Trash2 } from "lucide-react-native";
import React, { useState, useCallback, useMemo } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import type { Budget, SavingsGoal } from "@/types";

export default function BudgetScreen() {
  const { budgets, goals, primaryCurrency, addBudget, updateBudget, deleteBudget, addGoal, updateGoal, deleteGoal } = useBudget();
  const { t } = useLanguage();

  // Budget modal state
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [budgetCategory, setBudgetCategory] = useState("food");
  const [budgetAmount, setBudgetAmount] = useState("");

  // Goal modal state
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);
  const [goalName, setGoalName] = useState("");
  const [goalTarget, setGoalTarget] = useState("");
  const [goalCurrent, setGoalCurrent] = useState("");
  const [goalDeadline, setGoalDeadline] = useState("");

  const totalBudget = useMemo(() => budgets.reduce((a, b) => a + b.amount, 0), [budgets]);
  const totalSpent = useMemo(() => budgets.reduce((a, b) => a + b.spent, 0), [budgets]);
  const isOverBudget = totalSpent > totalBudget && totalBudget > 0;
  const remainingAmount = totalBudget - totalSpent;

  // Budget CRUD
  const openAddBudget = () => {
    setEditingBudget(null);
    setBudgetAmount("");
    setBudgetCategory("food");
    setShowBudgetModal(true);
  };

  const openEditBudget = (budget: Budget) => {
    setEditingBudget(budget);
    setBudgetCategory(budget.category);
    setBudgetAmount(budget.amount.toString());
    setShowBudgetModal(true);
  };

  const handleSaveBudget = useCallback(() => {
    const amount = parseFloat(budgetAmount.replace(",", "."));
    if (isNaN(amount) || amount <= 0) return;

    if (editingBudget) {
      updateBudget(editingBudget.id, { amount });
    } else {
      const existing = budgets.find(
        (b) => b.category === budgetCategory &&
          b.month === new Date().getMonth() &&
          b.year === new Date().getFullYear()
      );
      if (existing) {
        updateBudget(existing.id, { amount });
      } else {
        addBudget({
          category: budgetCategory,
          amount,
          spent: 0,
          month: new Date().getMonth(),
          year: new Date().getFullYear(),
        });
      }
    }
    setShowBudgetModal(false);
  }, [budgetAmount, budgetCategory, editingBudget, budgets, updateBudget, addBudget]);

  const handleDeleteBudget = useCallback((id: string) => {
    if (Platform.OS === "web") { deleteBudget(id); return; }
    Alert.alert(t("common.delete"), t("budget.deleteBudgetConfirm"), [
      { text: t("common.cancel"), style: "cancel" },
      { text: t("common.delete"), style: "destructive", onPress: () => deleteBudget(id) },
    ]);
  }, [deleteBudget, t]);

  // Goal CRUD
  const openAddGoal = () => {
    setEditingGoal(null);
    setGoalName(""); setGoalTarget(""); setGoalCurrent(""); setGoalDeadline("");
    setShowGoalModal(true);
  };

  const openEditGoal = (goal: SavingsGoal) => {
    setEditingGoal(goal);
    setGoalName(goal.name);
    setGoalTarget(goal.targetAmount.toString());
    setGoalCurrent(goal.currentAmount.toString());
    setGoalDeadline(goal.deadline);
    setShowGoalModal(true);
  };

  const handleSaveGoal = useCallback(() => {
    const target = parseFloat(goalTarget.replace(",", "."));
    const current = parseFloat(goalCurrent.replace(",", ".") || "0");
    if (!goalName.trim() || isNaN(target) || target <= 0) return;

    if (editingGoal) {
      updateGoal(editingGoal.id, {
        name: goalName.trim(),
        targetAmount: target,
        currentAmount: Math.min(current, target),
        deadline: goalDeadline,
      });
    } else {
      addGoal({
        name: goalName.trim(),
        targetAmount: target,
        currentAmount: Math.min(current, target),
        deadline: goalDeadline,
        currency: primaryCurrency,
      });
    }
    setShowGoalModal(false);
  }, [goalName, goalTarget, goalCurrent, goalDeadline, editingGoal, updateGoal, addGoal, primaryCurrency]);

  const handleDeleteGoal = useCallback((id: string) => {
    if (Platform.OS === "web") { deleteGoal(id); return; }
    Alert.alert(t("common.delete"), t("budget.deleteGoalConfirm"), [
      { text: t("common.cancel"), style: "cancel" },
      { text: t("common.delete"), style: "destructive", onPress: () => deleteGoal(id) },
    ]);
  }, [deleteGoal, t]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>{t("budget.title")}</Text>
        </View>

        {/* Overview card */}
        {totalBudget > 0 && (
          <View style={styles.overviewCard}>
            <Text style={styles.overviewLabel}>{t("budget.monthlyBudget")}</Text>
            <Text style={styles.overviewAmount}>{formatCurrency(totalBudget, primaryCurrency)}</Text>
            <View style={styles.spentRow}>
              <Text style={styles.spentLabel}>{t("budget.spentSoFar")}</Text>
              <Text style={styles.spentAmount}>{formatCurrency(totalSpent, primaryCurrency)}</Text>
            </View>
            <View style={styles.progressContainer}>
              <View style={[styles.progressBar, {
                width: `${Math.min((totalSpent / totalBudget) * 100, 100)}%` as any,
                backgroundColor: isOverBudget ? Colors.light.danger : Colors.light.tint,
              }]} />
            </View>
            <Text style={[styles.remainingText,
              { color: isOverBudget ? Colors.light.danger : Colors.light.success }]}>
              {isOverBudget
                ? t("budget.overBudget", { amount: formatCurrency(Math.abs(remainingAmount), primaryCurrency) })
                : t("budget.remaining", { amount: formatCurrency(remainingAmount, primaryCurrency) })}
            </Text>
          </View>
        )}

        {/* Category Budgets */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t("budget.categoryBudgets")}</Text>
            <TouchableOpacity style={styles.addButton} onPress={openAddBudget}>
              <Plus color={Colors.light.tint} size={20} />
            </TouchableOpacity>
          </View>
          {budgets.length === 0 ? (
            <View style={styles.emptyState}>
              <Target color={Colors.light.border} size={48} />
              <Text style={styles.emptyTitle}>{t("budget.noBudgets")}</Text>
              <Text style={styles.emptySubtitle}>{t("budget.noBudgetsHint")}</Text>
              <TouchableOpacity style={styles.emptyAddButton} onPress={openAddBudget}>
                <Text style={styles.emptyAddButtonText}>{t("budget.addBudget")}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.budgetsList}>
              {budgets.map((budget) => {
                const progress = budget.amount > 0 ? (budget.spent / budget.amount) * 100 : 0;
                const over = budget.spent > budget.amount;
                return (
                  <TouchableOpacity key={budget.id} style={styles.budgetCard} onPress={() => openEditBudget(budget)}>
                    <View style={styles.budgetHeader}>
                      <View style={styles.budgetCategory}>
                        <View style={[styles.categoryIcon,
                          { backgroundColor: categoryColors[budget.category] || Colors.light.textSecondary }]}>
                          <Target color="white" size={16} />
                        </View>
                        <Text style={styles.categoryName}>{t(`categories.${budget.category}`)}</Text>
                      </View>
                      <View style={styles.budgetActions}>
                        {over && <AlertCircle color={Colors.light.danger} size={18} />}
                        <TouchableOpacity onPress={() => handleDeleteBudget(budget.id)} style={styles.deleteBtn}>
                          <Trash2 color={Colors.light.textSecondary} size={16} />
                        </TouchableOpacity>
                      </View>
                    </View>
                    <View style={styles.budgetDetails}>
                      <View>
                        <Text style={styles.spentValue}>{formatCurrency(budget.spent, primaryCurrency)}</Text>
                        <Text style={styles.budgetOf}>{t("budget.of")} {formatCurrency(budget.amount, primaryCurrency)}</Text>
                      </View>
                      <Text style={[styles.percentage, { color: over ? Colors.light.danger : Colors.light.success }]}>
                        {progress.toFixed(0)}%
                      </Text>
                    </View>
                    <View style={styles.progressBackground}>
                      <View style={[styles.progressFill, {
                        width: `${Math.min(progress, 100)}%` as any,
                        backgroundColor: over ? Colors.light.danger : (categoryColors[budget.category] || Colors.light.tint),
                      }]} />
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        {/* Savings Goals */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t("budget.savingsGoals")}</Text>
            <TouchableOpacity style={styles.addButton} onPress={openAddGoal}>
              <Plus color={Colors.light.tint} size={20} />
            </TouchableOpacity>
          </View>
          {goals.length === 0 ? (
            <View style={styles.emptyState}>
              <PiggyBank color={Colors.light.border} size={48} />
              <Text style={styles.emptyTitle}>{t("budget.noGoals")}</Text>
              <Text style={styles.emptySubtitle}>{t("budget.noGoalsHint")}</Text>
              <TouchableOpacity style={styles.emptyAddButton} onPress={openAddGoal}>
                <Text style={styles.emptyAddButtonText}>{t("budget.addGoal")}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.goalsList}>
              {goals.map((goal) => {
                const progress = goal.targetAmount > 0
                  ? Math.min((goal.currentAmount / goal.targetAmount) * 100, 100)
                  : 0;
                return (
                  <TouchableOpacity key={goal.id} style={styles.goalCard} onPress={() => openEditGoal(goal)}>
                    <View style={styles.goalHeader}>
                      <View>
                        <Text style={styles.goalName}>{goal.name}</Text>
                        {goal.deadline ? (
                          <Text style={styles.goalDeadline}>{t("budget.target")}: {goal.deadline}</Text>
                        ) : null}
                      </View>
                      <TouchableOpacity onPress={() => handleDeleteGoal(goal.id)} style={styles.deleteBtn}>
                        <Trash2 color={Colors.light.textSecondary} size={16} />
                      </TouchableOpacity>
                    </View>
                    <View style={styles.goalProgress}>
                      <View style={styles.goalAmounts}>
                        <Text style={styles.goalCurrent}>{formatCurrency(goal.currentAmount, goal.currency)}</Text>
                        <Text style={styles.goalTarget}>{t("budget.of")} {formatCurrency(goal.targetAmount, goal.currency)}</Text>
                      </View>
                      <Text style={styles.goalPercentage}>{progress.toFixed(0)}%</Text>
                    </View>
                    <View style={styles.progressBackground}>
                      <View style={[styles.progressFill, {
                        width: `${progress}%` as any,
                        backgroundColor: Colors.light.tint,
                      }]} />
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Budget Modal */}
      <Modal visible={showBudgetModal} animationType="slide" transparent onRequestClose={() => setShowBudgetModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingBudget ? t("budget.editBudget") : t("budget.addBudget")}
              </Text>
              <TouchableOpacity onPress={() => setShowBudgetModal(false)}>
                <X color={Colors.light.text} size={24} />
              </TouchableOpacity>
            </View>
            {!editingBudget && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
                <View style={styles.categoryRow}>
                  {expenseCategories.map((cat) => (
                    <TouchableOpacity
                      key={cat.id}
                      style={[styles.categoryChip, budgetCategory === cat.id && { backgroundColor: categoryColors[cat.id] }]}
                      onPress={() => setBudgetCategory(cat.id)}
                    >
                      <Text style={[styles.categoryChipText, budgetCategory === cat.id && { color: "white" }]}>
                        {t(`categories.${cat.id}`)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            )}
            {editingBudget && (
              <Text style={styles.modalLabel}>{t(`categories.${editingBudget.category}`)}</Text>
            )}
            <TextInput
              style={styles.modalInput}
              keyboardType="decimal-pad"
              value={budgetAmount}
              onChangeText={setBudgetAmount}
              placeholder={t("transactions.amount")}
              placeholderTextColor={Colors.light.textSecondary}
            />
            <TouchableOpacity
              style={[styles.saveButton, !budgetAmount && styles.saveButtonDisabled]}
              onPress={handleSaveBudget}
              disabled={!budgetAmount}
            >
              <Text style={styles.saveButtonText}>{t("common.save")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Goal Modal */}
      <Modal visible={showGoalModal} animationType="slide" transparent onRequestClose={() => setShowGoalModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingGoal ? t("budget.editGoal") : t("budget.addGoal")}
              </Text>
              <TouchableOpacity onPress={() => setShowGoalModal(false)}>
                <X color={Colors.light.text} size={24} />
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.modalInput}
              value={goalName}
              onChangeText={setGoalName}
              placeholder={t("budget.goalName")}
              placeholderTextColor={Colors.light.textSecondary}
            />
            <TextInput
              style={styles.modalInput}
              keyboardType="decimal-pad"
              value={goalTarget}
              onChangeText={setGoalTarget}
              placeholder={t("budget.targetAmount")}
              placeholderTextColor={Colors.light.textSecondary}
            />
            <TextInput
              style={styles.modalInput}
              keyboardType="decimal-pad"
              value={goalCurrent}
              onChangeText={setGoalCurrent}
              placeholder={t("budget.currentAmount")}
              placeholderTextColor={Colors.light.textSecondary}
            />
            <TextInput
              style={styles.modalInput}
              value={goalDeadline}
              onChangeText={setGoalDeadline}
              placeholder={t("budget.deadlinePlaceholder")}
              placeholderTextColor={Colors.light.textSecondary}
            />
            <TouchableOpacity
              style={[styles.saveButton, (!goalName || !goalTarget) && styles.saveButtonDisabled]}
              onPress={handleSaveGoal}
              disabled={!goalName || !goalTarget}
            >
              <Text style={styles.saveButtonText}>{t("common.save")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
  title: { fontSize: 28, fontWeight: "700", color: Colors.light.text },
  overviewCard: {
    backgroundColor: Colors.light.surface, marginHorizontal: 20,
    padding: 20, borderRadius: 20, marginBottom: 24,
  },
  overviewLabel: { fontSize: 14, color: Colors.light.textSecondary, marginBottom: 4 },
  overviewAmount: { fontSize: 32, fontWeight: "700", color: Colors.light.text, marginBottom: 16 },
  spentRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
  spentLabel: { fontSize: 14, color: Colors.light.textSecondary },
  spentAmount: { fontSize: 14, fontWeight: "600", color: Colors.light.text },
  progressContainer: {
    height: 8, backgroundColor: Colors.light.background, borderRadius: 4,
    overflow: "hidden", marginBottom: 8,
  },
  progressBar: { height: "100%", borderRadius: 4 },
  remainingText: { fontSize: 13, fontWeight: "500" },
  section: { marginBottom: 24, paddingHorizontal: 20 },
  sectionHeader: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", marginBottom: 16,
  },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: Colors.light.text },
  addButton: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.light.surface,
    justifyContent: "center", alignItems: "center",
  },
  emptyState: {
    alignItems: "center", paddingVertical: 32,
    backgroundColor: Colors.light.surface, borderRadius: 16, gap: 8,
  },
  emptyTitle: { fontSize: 15, fontWeight: "600", color: Colors.light.text },
  emptySubtitle: { fontSize: 13, color: Colors.light.textSecondary },
  emptyAddButton: {
    marginTop: 8, paddingHorizontal: 20, paddingVertical: 10,
    backgroundColor: Colors.light.tint, borderRadius: 12,
  },
  emptyAddButtonText: { color: "white", fontWeight: "600", fontSize: 14 },
  budgetsList: { gap: 12 },
  budgetCard: { backgroundColor: Colors.light.surface, padding: 16, borderRadius: 16 },
  budgetHeader: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", marginBottom: 12,
  },
  budgetCategory: { flexDirection: "row", alignItems: "center", gap: 10 },
  budgetActions: { flexDirection: "row", alignItems: "center", gap: 10 },
  categoryIcon: {
    width: 36, height: 36, borderRadius: 10,
    justifyContent: "center", alignItems: "center",
  },
  categoryName: { fontSize: 15, fontWeight: "600", color: Colors.light.text },
  deleteBtn: { padding: 4 },
  budgetDetails: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "flex-end", marginBottom: 12,
  },
  spentValue: { fontSize: 20, fontWeight: "700", color: Colors.light.text },
  budgetOf: { fontSize: 13, color: Colors.light.textSecondary, marginTop: 2 },
  percentage: { fontSize: 18, fontWeight: "700" },
  progressBackground: {
    height: 6, backgroundColor: Colors.light.background, borderRadius: 3, overflow: "hidden",
  },
  progressFill: { height: "100%", borderRadius: 3 },
  goalsList: { gap: 12 },
  goalCard: { backgroundColor: Colors.light.surface, padding: 16, borderRadius: 16 },
  goalHeader: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "flex-start", marginBottom: 12,
  },
  goalName: { fontSize: 16, fontWeight: "600", color: Colors.light.text },
  goalDeadline: { fontSize: 13, color: Colors.light.textSecondary, marginTop: 2 },
  goalProgress: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", marginBottom: 12,
  },
  goalAmounts: { flexDirection: "row", alignItems: "baseline", gap: 6 },
  goalCurrent: { fontSize: 18, fontWeight: "700", color: Colors.light.text },
  goalTarget: { fontSize: 13, color: Colors.light.textSecondary },
  goalPercentage: { fontSize: 16, fontWeight: "600", color: Colors.light.tint },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalContent: {
    backgroundColor: Colors.light.surface,
    borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24,
  },
  modalHeader: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", marginBottom: 20,
  },
  modalTitle: { fontSize: 20, fontWeight: "700", color: Colors.light.text },
  modalLabel: { fontSize: 15, color: Colors.light.textSecondary, marginBottom: 12 },
  categoryScroll: { marginBottom: 16 },
  categoryRow: { flexDirection: "row", gap: 8 },
  categoryChip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    backgroundColor: Colors.light.background,
  },
  categoryChipText: { fontSize: 13, fontWeight: "500", color: Colors.light.textSecondary },
  modalInput: {
    backgroundColor: Colors.light.background, borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 14, fontSize: 16,
    color: Colors.light.text, marginBottom: 12,
  },
  saveButton: {
    backgroundColor: Colors.light.tint, paddingVertical: 16,
    borderRadius: 12, alignItems: "center", marginTop: 8,
  },
  saveButtonDisabled: { opacity: 0.4 },
  saveButtonText: { fontSize: 16, fontWeight: "600", color: "white" },
});
