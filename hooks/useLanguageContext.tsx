import createContextHook from "@nkzw/create-context-hook";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { getLocales } from "expo-localization";
import i18n from "i18next";

const LANGUAGE_KEY = "@mybudget/language";

export type LanguageCode = "en" | "fr";

export const SUPPORTED_LANGUAGES = [
  { code: "en" as LanguageCode, name: "English", flag: "🇬🇧" },
  { code: "fr" as LanguageCode, name: "Français", flag: "🇫🇷" },
];

export const [LanguageProvider, useLanguage] = createContextHook(function LanguageContext() {
  const queryClient = useQueryClient();
  const { t, i18n: i18nInstance } = useTranslation();

  // Language query
  const languageQuery = useQuery({
    queryKey: ["language"],
    queryFn: async (): Promise<LanguageCode> => {
      const stored = await AsyncStorage.getItem(LANGUAGE_KEY);
      if (stored && (stored === "en" || stored === "fr")) {
        return stored;
      }
      const locales = getLocales();
      const deviceLang = locales[0]?.languageCode;
      return deviceLang === "fr" ? "fr" : "en";
    },
  });

  // Save language mutation
  const saveLanguage = useMutation({
    mutationFn: async (lang: LanguageCode) => {
      await AsyncStorage.setItem(LANGUAGE_KEY, lang);
      return lang;
    },
    onSuccess: (lang) => {
      void i18n.changeLanguage(lang);
      void queryClient.invalidateQueries({ queryKey: ["language"] });
    },
  });

  // Initialize i18n language on mount
  useEffect(() => {
    if (languageQuery.data && i18n.language !== languageQuery.data) {
      void i18n.changeLanguage(languageQuery.data);
    }
  }, [languageQuery.data]);

  const currentLanguage = languageQuery.data ?? "en";

  const setLanguage = useCallback((lang: LanguageCode) => {
    saveLanguage.mutate(lang);
  }, [saveLanguage]);

  const getLanguageName = useCallback((code: LanguageCode) => {
    return SUPPORTED_LANGUAGES.find((l) => l.code === code)?.name ?? code;
  }, []);

  const getLanguageFlag = useCallback((code: LanguageCode) => {
    return SUPPORTED_LANGUAGES.find((l) => l.code === code)?.flag ?? "🏳️";
  }, []);

  return useMemo(
    () => ({
      language: currentLanguage,
      setLanguage,
      getLanguageName,
      getLanguageFlag,
      t,
      i18n: i18nInstance,
      isLoading: languageQuery.isLoading || saveLanguage.isPending,
      supportedLanguages: SUPPORTED_LANGUAGES,
    }),
    [
      currentLanguage,
      setLanguage,
      getLanguageName,
      getLanguageFlag,
      t,
      i18nInstance,
      languageQuery.isLoading,
      saveLanguage.isPending,
    ]
  );
});
