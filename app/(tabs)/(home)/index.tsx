// MyBudget - Dashboard Screen
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions,
} from "react-native";
import { useBudget } from "@/hooks/useBudgetContext";
import { useLanguage } from "@/hooks/useLanguageContext";
import Colors from "@/constants/colors";
import { formatCurrency } from "@/constants/currencies";
import { categoryColors } from "@/constants/categories";
import {
  TrendingUp, TrendingDown, PiggyBank, ArrowUpRight,
  ChevronRight, Bell, Wallet, BarChart3,
} from "lucide-react-native";
import React, { useMemo } from "react";
import { LineChart, PieChart } from "react-native-chart-kit";
import { SafeAreaView } from "react-native-safe-area-context";
import { format, parseISO, subDays, startOfDay } from "date-fns";

const screenWidth = Dimensions.get("window").width;

export default function DashboardScreen() {
  const {
    totalBalance, totalIncome, totalExpenses,
    totalInvestments, totalSavings, expensesByCategory,
    primaryCurrency, transactions, settings,
  } = useBudget();
  const { t, language } = useLanguage();

  const recentTransactions = useMemo(() => {
    return [...transactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [transactions]);

  // Real spending trend: last 7 days from actual transactions
  const spendingTrend = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, i) => subDays(new Date(), 6 - i));
    const labels = days.map((d) =>
      language === "fr"
        ? ["Dim","Lun","Mar","Mer","Jeu","Ven","Sam"][d.getDay()]
        : ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][d.getDay()]
    );
    const data = days.map((d) => {
      const dayStart = startOfDay(d).getTime();
      const dayEnd = dayStart + 86400000;
      return transactions
        .filter((t) => {
          const ts = new Date(t.date).getTime();
          return t.type === "expense" && ts >= dayStart && ts < dayEnd;
        })
        .reduce((acc, t) => acc + t.amount, 0);
    });
    // If all zeros, show empty state instead of broken chart
    const hasData = data.some((v) => v > 0);
    return { labels, datasets: [{ data: hasData ? data : [0, 0, 0, 0, 0, 0, 0] }], hasData };
  }, [transactions, language]);

  const pieChartData = useMemo(() => {
    return expensesByCategory
      .filter((item) => item.amount > 0)
      .map((item) => ({
        name: t(`categories.${item.category}`),
        amount: item.amount,
        color: categoryColors[item.category] || Colors.light.textSecondary,
        legendFontColor: Colors.light.text,
      }));
  }, [expensesByCategory, t]);

  const savingsRate = useMemo(() => {
    if (totalIncome === 0) return 0;
    return Math.max(0, ((totalIncome - totalExpenses) / totalIncome) * 100);
  }, [totalIncome, totalExpenses]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t("dashboard.greeting");
    if (hour < 18) return t("dashboard.greetingAfternoon");
    return t("dashboard.greetingEvening");
  };

  const displayName = settings.name && settings.name.trim() !== ""
    ? settings.name
    : t("dashboard.defaultUserName");

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{getGreeting()},</Text>
            <Text style={styles.userName}>{displayName}</Text>
          </View>
          <View style={styles.notificationButton}>
            <Bell color={Colors.light.textSecondary} size={22} />
          </View>
        </View>

        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>{t("dashboard.totalBalance")}</Text>
          <Text style={styles.balanceAmount}>
            {formatCurrency(totalBalance, primaryCurrency)}
          </Text>
          {totalIncome > 0 && (
            <View style={styles.savingsRateContainer}>
              <Text style={styles.savingsRateText}>
                {t("dashboard.savingsRate", { rate: savingsRate.toFixed(1) })}
              </Text>
            </View>
          )}
        </View>

        {/* Income / Expenses */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: Colors.light.success + "15" }]}>
            <View style={[styles.statIcon, { backgroundColor: Colors.light.success }]}>
              <TrendingUp color="white" size={20} />
            </View>
            <Text style={styles.statLabel}>{t("dashboard.income")}</Text>
            <Text style={[styles.statAmount, { color: Colors.light.success }]}>
              {formatCurrency(totalIncome, primaryCurrency)}
            </Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: Colors.light.danger + "15" }]}>
            <View style={[styles.statIcon, { backgroundColor: Colors.light.danger }]}>
              <TrendingDown color="white" size={20} />
            </View>
            <Text style={styles.statLabel}>{t("dashboard.expenses")}</Text>
            <Text style={[styles.statAmount, { color: Colors.light.danger }]}>
              {formatCurrency(totalExpenses, primaryCurrency)}
            </Text>
          </View>
        </View>

        {/* Spending Overview (Pie) */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t("dashboard.spendingOverview")}</Text>
          </View>
          {pieChartData.length > 0 ? (
            <>
              <PieChart
                data={pieChartData}
                width={screenWidth - 40}
                height={180}
                chartConfig={{ color: (opacity = 1) => `rgba(0,0,0,${opacity})` }}
                accessor="amount"
                backgroundColor="transparent"
                paddingLeft="0"
                hasLegend={false}
              />
              <View style={styles.categoryLegend}>
                {expensesByCategory.slice(0, 4).map((item) => (
                  <View key={item.category} style={styles.legendItem}>
                    <View
                      style={[styles.legendDot, {
                        backgroundColor: categoryColors[item.category] || Colors.light.textSecondary,
                      }]}
                    />
                    <Text style={styles.legendText}>{t(`categories.${item.category}`)}</Text>
                    <Text style={styles.legendAmount}>
                      {formatCurrency(item.amount, primaryCurrency)}
                    </Text>
                  </View>
                ))}
              </View>
            </>
          ) : (
            <View style={styles.emptyState}>
              <BarChart3 color={Colors.light.border} size={48} />
              <Text style={styles.emptyTitle}>{t("dashboard.noExpenses")}</Text>
              <Text style={styles.emptySubtitle}>{t("dashboard.noExpensesHint")}</Text>
            </View>
          )}
        </View>

        {/* Spending Trend (Line) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("dashboard.spendingTrend")}</Text>
          {spendingTrend.hasData ? (
            <View style={styles.chartCard}>
              <LineChart
                data={spendingTrend}
                width={screenWidth - 80}
                height={160}
                chartConfig={{
                  backgroundColor: Colors.light.surface,
                  backgroundGradientFrom: Colors.light.surface,
                  backgroundGradientTo: Colors.light.surface,
                  decimalPlaces: 0,
                  color: () => Colors.light.tint,
                  labelColor: () => Colors.light.textSecondary,
                  propsForDots: { r: "4", strokeWidth: "2", stroke: Colors.light.tint },
                }}
                bezier
                withVerticalLines={false}
                style={{ marginVertical: 8, borderRadius: 16 }}
              />
            </View>
          ) : (
            <View style={[styles.emptyState, { paddingVertical: 24 }]}>
              <Text style={styles.emptySubtitle}>{t("dashboard.noTrendData")}</Text>
            </View>
          )}
        </View>

        {/* Quick Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("dashboard.quickStats")}</Text>
          <View style={styles.quickStats}>
            <View style={styles.quickStatCard}>
              <View style={[styles.quickStatIcon, { backgroundColor: Colors.light.info + "15" }]}>
                <Wallet color={Colors.light.info} size={20} />
              </View>
              <Text style={styles.quickStatValue}>
                {formatCurrency(totalInvestments, primaryCurrency)}
              </Text>
              <Text style={styles.quickStatLabel}>{t("dashboard.investments")}</Text>
            </View>
            <View style={styles.quickStatCard}>
              <View style={[styles.quickStatIcon, { backgroundColor: Colors.light.warning + "15" }]}>
                <PiggyBank color={Colors.light.warning} size={20} />
              </View>
              <Text style={styles.quickStatValue}>
                {formatCurrency(totalSavings, primaryCurrency)}
              </Text>
              <Text style={styles.quickStatLabel}>{t("dashboard.savings")}</Text>
            </View>
          </View>
        </View>

        {/* Recent Transactions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t("dashboard.recentTransactions")}</Text>
          </View>
          {recentTransactions.length > 0 ? (
            <View style={styles.transactionsList}>
              {recentTransactions.map((transaction, index) => {
                const isIncome = transaction.type === "income";
                const isLast = index === recentTransactions.length - 1;
                return (
                  <View
                    key={transaction.id}
                    style={[styles.transactionItem, isLast && { borderBottomWidth: 0 }]}
                  >
                    <View style={[styles.transactionIcon, {
                      backgroundColor: isIncome
                        ? Colors.light.success
                        : (categoryColors[transaction.category] || Colors.light.textSecondary),
                    }]}>
                      {isIncome
                        ? <ArrowUpRight color="white" size={16} />
                        : <TrendingDown color="white" size={16} />}
                    </View>
                    <View style={styles.transactionInfo}>
                      <Text style={styles.transactionTitle}>{transaction.description}</Text>
                      <Text style={styles.transactionCategory}>
                        {isIncome ? t("categories.income") : t(`categories.${transaction.category}`)}
                        {" · "}
                        {format(parseISO(transaction.date), "MMM d")}
                      </Text>
                    </View>
                    <Text style={[styles.transactionAmount,
                      { color: isIncome ? Colors.light.success : Colors.light.danger }]}>
                      {isIncome ? "+" : "-"}
                      {formatCurrency(transaction.amount, transaction.currency)}
                    </Text>
                  </View>
                );
              })}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptySubtitle}>{t("dashboard.noTransactions")}</Text>
            </View>
          )}
        </View>
      </ScrollView>
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
  greeting: { fontSize: 14, color: Colors.light.textSecondary },
  userName: { fontSize: 22, fontWeight: "700", color: Colors.light.text },
  notificationButton: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.light.surface,
    justifyContent: "center", alignItems: "center",
  },
  balanceCard: {
    backgroundColor: Colors.light.tint, marginHorizontal: 20,
    padding: 24, borderRadius: 24, marginBottom: 16,
  },
  balanceLabel: { fontSize: 14, color: "rgba(255,255,255,0.8)", marginBottom: 8 },
  balanceAmount: { fontSize: 36, fontWeight: "700", color: "white" },
  savingsRateContainer: {
    marginTop: 12, backgroundColor: "rgba(255,255,255,0.2)",
    alignSelf: "flex-start", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
  },
  savingsRateText: { fontSize: 13, fontWeight: "600", color: "white" },
  statsRow: { flexDirection: "row", paddingHorizontal: 20, gap: 12, marginBottom: 24 },
  statCard: { flex: 1, padding: 16, borderRadius: 16 },
  statIcon: {
    width: 40, height: 40, borderRadius: 12,
    justifyContent: "center", alignItems: "center", marginBottom: 12,
  },
  statLabel: { fontSize: 13, color: Colors.light.textSecondary, marginBottom: 4 },
  statAmount: { fontSize: 18, fontWeight: "700" },
  section: { marginBottom: 24, paddingHorizontal: 20 },
  sectionHeader: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", marginBottom: 16,
  },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: Colors.light.text, marginBottom: 16 },
  emptyState: {
    alignItems: "center", paddingVertical: 32,
    backgroundColor: Colors.light.surface, borderRadius: 16, gap: 8,
  },
  emptyTitle: { fontSize: 15, fontWeight: "600", color: Colors.light.text },
  emptySubtitle: { fontSize: 13, color: Colors.light.textSecondary, textAlign: "center" },
  categoryLegend: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginTop: 8 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 12, color: Colors.light.textSecondary },
  legendAmount: { fontSize: 12, fontWeight: "600", color: Colors.light.text },
  chartCard: { backgroundColor: Colors.light.surface, borderRadius: 16, padding: 16 },
  quickStats: { flexDirection: "row", gap: 12 },
  quickStatCard: {
    flex: 1, backgroundColor: Colors.light.surface, padding: 16, borderRadius: 16,
  },
  quickStatIcon: {
    width: 40, height: 40, borderRadius: 12,
    justifyContent: "center", alignItems: "center", marginBottom: 12,
  },
  quickStatValue: { fontSize: 18, fontWeight: "700", color: Colors.light.text, marginBottom: 4 },
  quickStatLabel: { fontSize: 13, color: Colors.light.textSecondary },
  transactionsList: { backgroundColor: Colors.light.surface, borderRadius: 16, padding: 16 },
  transactionItem: {
    flexDirection: "row", alignItems: "center", paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: Colors.light.border,
  },
  transactionIcon: {
    width: 40, height: 40, borderRadius: 12,
    justifyContent: "center", alignItems: "center", marginRight: 12,
  },
  transactionInfo: { flex: 1 },
  transactionTitle: { fontSize: 15, fontWeight: "600", color: Colors.light.text },
  transactionCategory: { fontSize: 13, color: Colors.light.textSecondary, marginTop: 2 },
  transactionAmount: { fontSize: 15, fontWeight: "700" },
});
