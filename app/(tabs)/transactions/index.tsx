// MyBudget - Transactions Screen
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, Modal, Alert, Platform,
} from "react-native";
import { useBudget } from "@/hooks/useBudgetContext";
import { useLanguage } from "@/hooks/useLanguageContext";
import Colors from "@/constants/colors";
import { formatCurrency } from "@/constants/currencies";
import { categoryColors, expenseCategories } from "@/constants/categories";
import { ArrowUpLeft, ArrowDownRight, Plus, Search, X, Receipt } from "lucide-react-native";
import React, { useState, useCallback, useMemo } from "react";
import { format, parseISO } from "date-fns";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TransactionsScreen() {
  const { transactions, primaryCurrency, addTransaction, deleteTransaction } = useBudget();
  const { t, language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAmount, setNewAmount] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("food");
  const [transactionType, setTransactionType] = useState<"expense" | "income">("expense");

  const filteredTransactions = useMemo(() => {
    const sorted = [...transactions].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    if (!searchQuery) return sorted;
    const q = searchQuery.toLowerCase();
    return sorted.filter(
      (tx) =>
        tx.description.toLowerCase().includes(q) ||
        tx.category.toLowerCase().includes(q)
    );
  }, [transactions, searchQuery]);

  const handleAddTransaction = useCallback(() => {
    const amount = parseFloat(newAmount.replace(",", "."));
    if (isNaN(amount) || amount <= 0) {
      Alert.alert(t("common.error"), t("transactions.invalidAmount"));
      return;
    }
    addTransaction({
      amount,
      category: transactionType === "expense" ? selectedCategory : "income",
      description:
        newDescription.trim() ||
        (transactionType === "expense" ? t("transactions.expense") : t("transactions.income")),
      date: new Date().toISOString(),
      type: transactionType,
      currency: primaryCurrency,
    });
    setNewAmount("");
    setNewDescription("");
    setShowAddModal(false);
  }, [newAmount, newDescription, selectedCategory, transactionType, primaryCurrency, addTransaction, t]);

  const handleDelete = useCallback((id: string) => {
    if (Platform.OS === "web") {
      deleteTransaction(id);
      return;
    }
    Alert.alert(
      t("transactions.deleteTitle"),
      t("transactions.deleteConfirm"),
      [
        { text: t("common.cancel"), style: "cancel" },
        { text: t("common.delete"), style: "destructive", onPress: () => deleteTransaction(id) },
      ]
    );
  }, [deleteTransaction, t]);

  const renderTransaction = useCallback(
    ({ item }: { item: typeof transactions[0] }) => {
      const isIncome = item.type === "income";
      return (
        <TouchableOpacity
          style={styles.transactionItem}
          onLongPress={() => handleDelete(item.id)}
          activeOpacity={0.7}
        >
          <View style={[styles.iconContainer, {
            backgroundColor: isIncome
              ? Colors.light.success
              : (categoryColors[item.category] || Colors.light.textSecondary),
          }]}>
            {isIncome
              ? <ArrowDownRight color="white" size={20} />
              : <ArrowUpLeft color="white" size={20} />}
          </View>
          <View style={styles.transactionDetails}>
            <Text style={styles.transactionDescription}>{item.description}</Text>
            <Text style={styles.transactionCategory}>
              {isIncome ? t("categories.income") : t(`categories.${item.category}`)}
              {" · "}
              {format(parseISO(item.date), language === "fr" ? "d MMM" : "MMM d")}
            </Text>
          </View>
          <Text style={[styles.transactionAmount,
            { color: isIncome ? Colors.light.success : Colors.light.danger }]}>
            {isIncome ? "+" : "-"}{formatCurrency(item.amount, item.currency)}
          </Text>
        </TouchableOpacity>
      );
    },
    [handleDelete, t, language]
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t("transactions.title")}</Text>
      </View>

      <View style={styles.searchContainer}>
        <Search color={Colors.light.textSecondary} size={20} />
        <TextInput
          style={styles.searchInput}
          placeholder={t("transactions.searchPlaceholder")}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={Colors.light.textSecondary}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <X color={Colors.light.textSecondary} size={20} />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={filteredTransactions}
        renderItem={renderTransaction}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          filteredTransactions.length === 0 && styles.listEmpty,
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Receipt color={Colors.light.border} size={52} />
            <Text style={styles.emptyTitle}>{t("transactions.noTransactions")}</Text>
            <Text style={styles.emptySubtitle}>{t("transactions.noTransactionsHint")}</Text>
          </View>
        }
      />

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowAddModal(true)}
        activeOpacity={0.8}
      >
        <Plus color="white" size={28} />
      </TouchableOpacity>

      {/* Add Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t("transactions.addTransaction")}</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <X color={Colors.light.text} size={24} />
              </TouchableOpacity>
            </View>

            {/* Type selector */}
            <View style={styles.typeSelector}>
              {(["expense", "income"] as const).map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[styles.typeButton, transactionType === type && styles.typeButtonActive]}
                  onPress={() => setTransactionType(type)}
                >
                  <Text style={[
                    styles.typeButtonText,
                    transactionType === type && styles.typeButtonTextActive,
                  ]}>
                    {t(`transactions.${type}`)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Amount */}
            <TextInput
              style={styles.amountInput}
              placeholder="0"
              keyboardType="decimal-pad"
              value={newAmount}
              onChangeText={setNewAmount}
              placeholderTextColor={Colors.light.textSecondary}
            />

            {/* Category chips (only for expense) */}
            {transactionType === "expense" && (
              <FlatList
                horizontal
                data={expenseCategories}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.categoryChip,
                      selectedCategory === item.id && { backgroundColor: categoryColors[item.id] },
                    ]}
                    onPress={() => setSelectedCategory(item.id)}
                  >
                    <Text style={[
                      styles.categoryChipText,
                      selectedCategory === item.id && styles.categoryChipTextActive,
                    ]}>
                      {t(`categories.${item.id}`)}
                    </Text>
                  </TouchableOpacity>
                )}
                keyExtractor={(item) => item.id}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoriesContainer}
              />
            )}

            {/* Description */}
            <TextInput
              style={styles.descriptionInput}
              placeholder={t("transactions.description")}
              value={newDescription}
              onChangeText={setNewDescription}
              placeholderTextColor={Colors.light.textSecondary}
            />

            <TouchableOpacity
              style={[styles.addButton, !newAmount && styles.addButtonDisabled]}
              onPress={handleAddTransaction}
              disabled={!newAmount}
            >
              <Text style={styles.addButtonText}>{t("transactions.add")}</Text>
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
  searchContainer: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: Colors.light.surface, marginHorizontal: 20, marginBottom: 16,
    paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, gap: 12,
  },
  searchInput: { flex: 1, fontSize: 16, color: Colors.light.text },
  listContent: { paddingHorizontal: 20, paddingBottom: 100 },
  listEmpty: { flex: 1 },
  transactionItem: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: Colors.light.surface, padding: 16, borderRadius: 16, marginBottom: 12,
  },
  iconContainer: {
    width: 44, height: 44, borderRadius: 12,
    justifyContent: "center", alignItems: "center",
  },
  transactionDetails: { flex: 1, marginLeft: 12 },
  transactionDescription: { fontSize: 16, fontWeight: "600", color: Colors.light.text },
  transactionCategory: { fontSize: 13, color: Colors.light.textSecondary, marginTop: 2 },
  transactionAmount: { fontSize: 16, fontWeight: "700" },
  emptyState: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 60, gap: 8 },
  emptyTitle: { fontSize: 16, fontWeight: "600", color: Colors.light.text },
  emptySubtitle: { fontSize: 14, color: Colors.light.textSecondary, textAlign: "center" },
  fab: {
    position: "absolute", right: 20, bottom: 24,
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: Colors.light.tint,
    justifyContent: "center", alignItems: "center",
    shadowColor: Colors.light.tint,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 5,
  },
  modalOverlay: {
    flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: Colors.light.surface,
    borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24,
  },
  modalHeader: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", marginBottom: 24,
  },
  modalTitle: { fontSize: 20, fontWeight: "700", color: Colors.light.text },
  typeSelector: {
    flexDirection: "row", backgroundColor: Colors.light.background,
    borderRadius: 12, padding: 4, marginBottom: 20,
  },
  typeButton: { flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: "center" },
  typeButtonActive: {
    backgroundColor: Colors.light.surface,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 4, elevation: 2,
  },
  typeButtonText: { fontSize: 15, fontWeight: "600", color: Colors.light.textSecondary },
  typeButtonTextActive: { color: Colors.light.text },
  amountInput: {
    fontSize: 48, fontWeight: "700", color: Colors.light.text,
    textAlign: "center", marginBottom: 20,
  },
  categoriesContainer: { paddingVertical: 8, marginBottom: 16, gap: 8 },
  categoryChip: {
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20,
    backgroundColor: Colors.light.background, marginRight: 8,
  },
  categoryChipText: { fontSize: 14, fontWeight: "500", color: Colors.light.textSecondary },
  categoryChipTextActive: { color: "white" },
  descriptionInput: {
    backgroundColor: Colors.light.background, borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 14, fontSize: 16,
    color: Colors.light.text, marginBottom: 16,
  },
  addButton: {
    backgroundColor: Colors.light.tint, paddingVertical: 16,
    borderRadius: 12, alignItems: "center",
  },
  addButtonDisabled: { opacity: 0.4 },
  addButtonText: { fontSize: 16, fontWeight: "600", color: "white" },
});
