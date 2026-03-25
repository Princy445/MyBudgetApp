import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { getLocales } from "expo-localization";
import AsyncStorage from "@react-native-async-storage/async-storage";

import en from "./locales/en.json";
import fr from "./locales/fr.json";

const LANGUAGE_KEY = "@mybudget/language";

export const resources = {
  en: { translation: en },
  fr: { translation: fr },
} as const;

export const SUPPORTED_LANGUAGES = [
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
];

export type LanguageCode = "en" | "fr";

export const getStoredLanguage = async (): Promise<LanguageCode | null> => {
  try {
    const stored = await AsyncStorage.getItem(LANGUAGE_KEY);
    if (stored && (stored === "en" || stored === "fr")) {
      return stored;
    }
    return null;
  } catch {
    return null;
  }
};

export const setStoredLanguage = async (language: LanguageCode): Promise<void> => {
  try {
    await AsyncStorage.setItem(LANGUAGE_KEY, language);
  } catch {
    // Ignore storage errors
  }
};

const initI18n = async () => {
  const storedLanguage = await getStoredLanguage();
  const locales = getLocales();
  const deviceLanguage = (locales[0]?.languageCode ?? "en") as LanguageCode;
  const defaultLanguage = storedLanguage || (deviceLanguage === "fr" ? "fr" : "en");

  void i18n.use(initReactI18next).init({
    resources,
    lng: defaultLanguage,
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

  return i18n;
};

export default initI18n;
