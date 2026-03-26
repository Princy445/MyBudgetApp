// MyBudget - Tab Layout
import { Tabs } from "expo-router";
import React from "react";
import Colors from "@/constants/colors";
import { useLanguage } from "@/hooks/useLanguageContext";
import { Home, Receipt, Target, TrendingUp } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabLayout() {
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.light.tint,
        tabBarInactiveTintColor: Colors.light.tabIconDefault,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.light.surface,
          borderTopColor: Colors.light.border,
          borderTopWidth: 1,
          height: 56 + insets.bottom,
          paddingBottom: insets.bottom + 4,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="(home)"
        options={{
          title: t("navigation.home"),
          tabBarIcon: ({ color }) => <Home color={color} size={22} />,
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          title: t("navigation.transactions"),
          tabBarIcon: ({ color }) => <Receipt color={color} size={22} />,
        }}
      />
      <Tabs.Screen
        name="budget"
        options={{
          title: t("navigation.budget"),
          tabBarIcon: ({ color }) => <Target color={color} size={22} />,
        }}
      />
      <Tabs.Screen
        name="investments"
        options={{
          title: t("navigation.investments"),
          tabBarIcon: ({ color }) => <TrendingUp color={color} size={22} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}