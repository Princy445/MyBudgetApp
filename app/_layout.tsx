// MyBudget - Root Layout
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState } from "react";
import { LogBox, Platform } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { I18nextProvider } from "react-i18next";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { BudgetProvider } from "@/hooks/useBudgetContext";
import { LanguageProvider } from "@/hooks/useLanguageContext";
import { resources } from "@/i18n";

if (Platform.OS !== "web") {
  LogBox.ignoreLogs([
    "Invalid DOM property",
    "Unknown event handler property",
  ]);
}

void SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

// Initialize i18n
void i18n.use(initReactI18next).init({
  resources,
  lng: "en",
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
});

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerBackTitle: "Back" }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    void SplashScreen.hideAsync();
    setIsReady(true);
  }, []);

  if (!isReady) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <I18nextProvider i18n={i18n}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <LanguageProvider>
            <BudgetProvider>
              <RootLayoutNav />
            </BudgetProvider>
          </LanguageProvider>
        </GestureHandlerRootView>
      </I18nextProvider>
    </QueryClientProvider>
  );
}
