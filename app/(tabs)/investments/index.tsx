// MyBudget - Investments Screen
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Modal, Alert, Platform, Dimensions,
} from "react-native";
import { useBudget } from "@/hooks/useBudgetContext";
import { useLanguage } from "@/hooks/useLanguageContext";
import Colors from "@/constants/colors";
import { formatCurrency } from "@/constants/currencies";
import { investmentTypes } from "@/constants/categories";
import {
  Plus, X, TrendingUp, TrendingDown, Wallet, Trash2, BarChart3, Edit3,
} from "lucide-react-native";
import React, { useState, useCallback, useMemo } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { LineChart } from "react-native-gifted-charts";
import type { Investment } from "@/types";

const screenWidth = Dimensions.get("window").width;

export default function InvestmentsScreen() {
  const { investments, totalInvestments, primaryCurrency, addInvestment, updateInvestment, deleteInvestment } = useBudget();
  const { t } = useLanguage();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingInvestment, setEditingInvestment] = useState<Investment | null>(null);
  const [newName, setNewName] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [newCurrentValue, setNewCurrentValue] = useState("");
  const [newType, setNewType] = useState("stocks");

  const totalInvested = useMemo(
    () => investments.reduce((a, i) => a + i.amount, 0),
    [investments]
  );

  const totalReturn = useMemo(() => {
    if (totalInvested === 0) return 0;
    return ((totalInvestments - totalInvested) / totalInvested) * 100;
  }, [totalInvestments, totalInvested]);

  const investmentsByType = useMemo(() => {
    const grouped: Record<string, { total: number; current: number; count: number }> = {};
    investments.forEach((inv) => {
      if (!grouped[inv.type]) grouped[inv.type] = { total: 0, current: 0, count: 0 };
      grouped[inv.type].total += inv.amount;
      grouped[inv.type].current += inv.currentValue;
      grouped[inv.type].count += 1;
    });
    return grouped;
  }, [investments]);

  // Chart: real data per investment
  const hasChartData = investments.length >= 2;
  const chartData = useMemo(() => {
    if (!hasChartData) return null;
    const displayed = investments.slice(0, 6);
    return displayed.map((i) => ({
      value: i.currentValue,
      label: i.name.length > 6 ? i.name.slice(0, 5) + "…" : i.name,
    }));
  }, [investments, hasChartData]);

  const openAdd = () => {
    setEditingInvestment(null);
    setNewName(""); setNewAmount(""); setNewCurrentValue(""); setNewType("stocks");
    setShowAddModal(true);
  };

  const openEdit = (inv: Investment) => {
    setEditingInvestment(inv);
    setNewName(inv.name);
    setNewAmount(inv.amount.toString());
    setNewCurrentValue(inv.currentValue.toString());
    setNewType(inv.type);
    setShowAddModal(true);
  };

  const handleSave = useCallback(() => {
    const amount = parseFloat(newAmount.replace(",", "."));
    const current = parseFloat((newCurrentValue || newAmount).replace(",", "."));
    if (!newName.trim() || isNaN(amount) || amount <= 0) return;

    if (editingInvestment) {
      updateInvestment(editingInvestment.id, {
        name: newName.trim(),
        type: newType,
        amount,
        currentValue: isNaN(current) ? amount : current,
      });
    } else {
      addInvestment({
        name: newName.trim(),
        type: newType,
        amount,
        currentValue: isNaN(current) ? amount : current,
        purchaseDate: new Date().toISOString().split("T")[0],
        currency: primaryCurrency,
      });
    }
    setNewName(""); setNewAmount(""); setNewCurrentValue(""); setNewType("stocks");
    setShowAddModal(false);
  }, [newName, newAmount, newCurrentValue, newType, primaryCurrency, editingInvestment, addInvestment, updateInvestment]);

  const handleDelete = useCallback((id: string) => {
    if (Platform.OS === "web") { deleteInvestment(id); return; }
    Alert.alert(t("common.delete"), t("investments.deleteConfirm"), [
      { text: t("common.cancel"), style: "cancel" },
      { text: t("common.delete"), style: "destructive", onPress: () => deleteInvestment(id) },
    ]);
  }, [deleteInvestment, t]);

  const isPositive = totalReturn >= 0;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>{t("investments.title")}</Text>
          <TouchableOpacity style={styles.addBtn} onPress={openAdd}>
            <Plus color="white" size={22} />
          </TouchableOpacity>
        </View>

        {/* Portfolio summary card */}
        <View style={styles.portfolioCard}>
          <Text style={styles.portfolioLabel}>{t("investments.totalPortfolio")}</Text>
          <Text style={styles.portfolioAmount}>{formatCurrency(totalInvestments, primaryCurrency)}</Text>
          {investments.length > 0 && (
            <View style={[styles.returnBadge, { backgroundColor: isPositive ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.15)" }]}>
              {isPositive
                ? <TrendingUp color="white" size={14} />
                : <TrendingDown color="white" size={14} />}
              <Text style={styles.returnText}>
                {isPositive ? "+" : ""}{totalReturn.toFixed(2)}% {t("investments.allTimeLabel")}
              </Text>
            </View>
          )}
        </View>

        {/* Chart */}
        {hasChartData && chartData && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t("investments.performance")}</Text>
            <View style={styles.chartCard}>
              <LineChart
                data={chartData}
                width={screenWidth - 80}
                height={160}
                color={Colors.light.tint}
                thickness={2}
                curved
                hideDataPoints={false}
                dataPointsColor={Colors.light.tint}
                xAxisLabelTextStyle={{ color: Colors.light.textSecondary, fontSize: 11 }}
                yAxisTextStyle={{ color: Colors.light.textSecondary, fontSize: 11 }}
                noOfSections={4}
                areaChart
                startFillColor={Colors.light.tint + "40"}
                endFillColor={Colors.light.tint + "05"}
              />
            </View>
          </View>
        )}

        {/* Asset allocation by type */}
        {Object.keys(investmentsByType).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t("investments.assetAllocation")}</Text>
            <View style={styles.allocationList}>
              {Object.entries(investmentsByType).map(([type, data]) => {
                const typeDef = investmentTypes.find((it) => it.id === type);
                const pct = totalInvestments > 0
                  ? ((data.current / totalInvestments) * 100).toFixed(1)
                  : "0";
                const ret = data.total > 0
                  ? (((data.current - data.total) / data.total) * 100).toFixed(2)
                  : "0.00";
                const pos = data.current >= data.total;
                return (
                  <View key={type} style={styles.allocationItem}>
                    <View style={[styles.allocationDot, { backgroundColor: typeDef?.color ?? Colors.light.tint }]} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.allocationType}>
                        {t(`investments.investmentTypes.${type}` as any) ?? type}
                      </Text>
                      <Text style={styles.allocationCount}>
                        {data.count} {data.count === 1 ? t("investments.asset") : t("investments.assets")}
                      </Text>
                    </View>
                    <View style={{ alignItems: "flex-end" }}>
                      <Text style={styles.allocationValue}>{pct}%</Text>
                      <Text style={[styles.allocationReturn, { color: pos ? Colors.light.success : Colors.light.danger }]}>
                        {pos ? "+" : ""}{ret}%
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* My Assets list */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("investments.myAssets")}</Text>
          {investments.length === 0 ? (
            <View style={styles.emptyState}>
              <BarChart3 color={Colors.light.border} size={52} />
              <Text style={styles.emptyTitle}>{t("investments.noInvestments")}</Text>
              <Text style={styles.emptySubtitle}>{t("investments.noInvestmentsHint")}</Text>
              <TouchableOpacity style={styles.emptyAddBtn} onPress={openAdd}>
                <Text style={styles.emptyAddBtnText}>{t("investments.addInvestment")}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.assetsList}>
              {investments.map((inv) => {
                const gain = inv.currentValue - inv.amount;
                const gainPct = inv.amount > 0 ? ((gain / inv.amount) * 100).toFixed(2) : "0.00";
                const pos = gain >= 0;
                const typeDef = investmentTypes.find((it) => it.id === inv.type);
                return (
                  <View key={inv.id} style={styles.assetCard}>
                    <View style={[styles.assetIcon, { backgroundColor: (typeDef?.color ?? Colors.light.tint) + "20" }]}>
                      <Wallet color={typeDef?.color ?? Colors.light.tint} size={20} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.assetName}>{inv.name}</Text>
                      <Text style={styles.assetType}>
                        {t(`investments.investmentTypes.${inv.type}` as any) ?? inv.type}
                      </Text>
                      <Text style={styles.assetInvested}>
                        {t("investments.invested")}: {formatCurrency(inv.amount, inv.currency)}
                      </Text>
                    </View>
                    <View style={{ alignItems: "flex-end" }}>
                      <Text style={styles.assetValue}>{formatCurrency(inv.currentValue, inv.currency)}</Text>
                      <Text style={[styles.assetGain, { color: pos ? Colors.light.success : Colors.light.danger }]}>
                        {pos ? "+" : ""}{gainPct}%
                      </Text>
                      <View style={styles.assetActions}>
                        <TouchableOpacity onPress={() => openEdit(inv)} style={styles.iconBtn}>
                          <Edit3 color={Colors.light.textSecondary} size={15} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleDelete(inv.id)} style={styles.iconBtn}>
                          <Trash2 color={Colors.light.danger} size={15} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Add / Edit Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingInvestment ? t("common.edit") : t("investments.addInvestment")}
              </Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <X color={Colors.light.text} size={24} />
              </TouchableOpacity>
            </View>

            {/* Type selector */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
              <View style={styles.typeRow}>
                {investmentTypes.map((type) => (
                  <TouchableOpacity
                    key={type.id}
                    style={[styles.typeChip, newType === type.id && { backgroundColor: type.color }]}
                    onPress={() => setNewType(type.id)}
                  >
                    <Text style={[styles.typeChipText, newType === type.id && { color: "white" }]}>
                      {t(`investments.investmentTypes.${type.id}` as any) ?? type.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <TextInput
              style={styles.modalInput}
              value={newName}
              onChangeText={setNewName}
              placeholder={t("investments.assetName")}
              placeholderTextColor={Colors.light.textSecondary}
            />
            <TextInput
              style={styles.modalInput}
              keyboardType="decimal-pad"
              value={newAmount}
              onChangeText={setNewAmount}
              placeholder={t("investments.amountInvested")}
              placeholderTextColor={Colors.light.textSecondary}
            />
            <TextInput
              style={styles.modalInput}
              keyboardType="decimal-pad"
              value={newCurrentValue}
              onChangeText={setNewCurrentValue}
              placeholder={t("investments.currentValueOptional")}
              placeholderTextColor={Colors.light.textSecondary}
            />

            <TouchableOpacity
              style={[styles.saveBtn, (!newName || !newAmount) && styles.saveBtnDisabled]}
              onPress={handleSave}
              disabled={!newName || !newAmount}
            >
              <Text style={styles.saveBtnText}>{t("common.save")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background },
  scrollContent: { paddingBottom: 32 },
  header: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 20,
  },
  title: { fontSize: 28, fontWeight: "700", color: Colors.light.text },
  addBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.light.tint,
    justifyContent: "center", alignItems: "center",
  },
  portfolioCard: {
    backgroundColor: Colors.light.tint, marginHorizontal: 20,
    padding: 24, borderRadius: 24, marginBottom: 24,
  },
  portfolioLabel: { fontSize: 14, color: "rgba(255,255,255,0.8)", marginBottom: 8 },
  portfolioAmount: { fontSize: 36, fontWeight: "700", color: "white" },
  returnBadge: {
    flexDirection: "row", alignItems: "center", gap: 6,
    alignSelf: "flex-start", paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 20, marginTop: 12,
  },
  returnText: { fontSize: 13, fontWeight: "600", color: "white" },
  section: { marginBottom: 24, paddingHorizontal: 20 },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: Colors.light.text, marginBottom: 16 },
  chartCard: { backgroundColor: Colors.light.surface, borderRadius: 16, padding: 16 },
  allocationList: { backgroundColor: Colors.light.surface, borderRadius: 16, padding: 16, gap: 16 },
  allocationItem: { flexDirection: "row", alignItems: "center", gap: 12 },
  allocationDot: { width: 12, height: 12, borderRadius: 6 },
  allocationType: { fontSize: 15, fontWeight: "600", color: Colors.light.text },
  allocationCount: { fontSize: 12, color: Colors.light.textSecondary },
  allocationValue: { fontSize: 15, fontWeight: "700", color: Colors.light.text },
  allocationReturn: { fontSize: 13, fontWeight: "500" },
  emptyState: {
    alignItems: "center", paddingVertical: 40,
    backgroundColor: Colors.light.surface, borderRadius: 16, gap: 8,
  },
  emptyTitle: { fontSize: 16, fontWeight: "600", color: Colors.light.text },
  emptySubtitle: { fontSize: 14, color: Colors.light.textSecondary, textAlign: "center", paddingHorizontal: 20 },
  emptyAddBtn: {
    marginTop: 8, paddingHorizontal: 20, paddingVertical: 10,
    backgroundColor: Colors.light.tint, borderRadius: 12,
  },
  emptyAddBtnText: { color: "white", fontWeight: "600", fontSize: 14 },
  assetsList: { gap: 12 },
  assetCard: {
    flexDirection: "row", alignItems: "flex-start",
    backgroundColor: Colors.light.surface, padding: 16, borderRadius: 16, gap: 12,
  },
  assetIcon: {
    width: 44, height: 44, borderRadius: 12,
    justifyContent: "center", alignItems: "center",
  },
  assetName: { fontSize: 15, fontWeight: "600", color: Colors.light.text },
  assetType: { fontSize: 12, color: Colors.light.textSecondary, marginTop: 2 },
  assetInvested: { fontSize: 12, color: Colors.light.textSecondary, marginTop: 2 },
  assetValue: { fontSize: 16, fontWeight: "700", color: Colors.light.text },
  assetGain: { fontSize: 13, fontWeight: "500", marginTop: 2 },
  assetActions: { flexDirection: "row", gap: 8, marginTop: 6 },
  iconBtn: { padding: 4 },
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
  typeRow: { flexDirection: "row", gap: 8 },
  typeChip: {
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20,
    backgroundColor: Colors.light.background,
  },
  typeChipText: { fontSize: 14, fontWeight: "500", color: Colors.light.textSecondary },
  modalInput: {
    backgroundColor: Colors.light.background, borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 14, fontSize: 16,
    color: Colors.light.text, marginBottom: 12,
  },
  saveBtn: {
    backgroundColor: Colors.light.tint, paddingVertical: 16,
    borderRadius: 12, alignItems: "center", marginTop: 8,
  },
  saveBtnDisabled: { opacity: 0.4 },
  saveBtnText: { fontSize: 16, fontWeight: "600", color: "white" },
});