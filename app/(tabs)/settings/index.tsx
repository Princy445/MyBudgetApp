// MyBudget - Settings Screen
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Switch, Modal, TextInput, Alert,
} from "react-native";
import { useBudget } from "@/hooks/useBudgetContext";
import { useLanguage, type LanguageCode } from "@/hooks/useLanguageContext";
import Colors from "@/constants/colors";
import { currencies } from "@/constants/currencies";
import {
  ChevronRight, Bell, Moon, Shield, HelpCircle,
  User, Wallet, Globe, X, Edit3,
} from "lucide-react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SettingsScreen() {
  const { settings, updateSettings, primaryCurrency } = useBudget();
  const { t, language, setLanguage, getLanguageName, supportedLanguages } = useLanguage();
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [editName, setEditName] = useState(settings.name || "");
  const [editEmail, setEditEmail] = useState(settings.email || "");

  const displayName = settings.name?.trim() || t("settings.noName");
  const displayEmail = settings.email?.trim() || t("settings.noEmail");

  const handleSaveProfile = () => {
    updateSettings({ name: editName.trim(), email: editEmail.trim() });
    setShowProfileModal(false);
  };

  const settingItems = [
    {
      icon: Wallet,
      title: t("settings.primaryCurrency"),
      subtitle: currencies.find((c) => c.code === primaryCurrency)?.name || primaryCurrency,
      onPress: () => setShowCurrencyModal(true),
      showValue: true,
      value: primaryCurrency,
    },
    {
      icon: Globe,
      title: t("settings.language"),
      subtitle: t("settings.languageSubtitle"),
      onPress: () => setShowLanguageModal(true),
      showValue: true,
      value: getLanguageName(language),
    },
    {
      icon: Bell,
      title: t("settings.notifications"),
      subtitle: t("settings.notificationsSubtitle"),
      toggle: true,
      value: settings.notifications,
      onToggle: (value: boolean) => updateSettings({ notifications: value }),
    },
    {
      icon: Moon,
      title: t("settings.darkMode"),
      subtitle: t("settings.darkModeSubtitle"),
      toggle: true,
      value: settings.darkMode,
      onToggle: (value: boolean) => updateSettings({ darkMode: value }),
    },
    {
      icon: Shield,
      title: t("settings.security"),
      subtitle: t("settings.securitySubtitle"),
      onPress: () => {},
    },
    {
      icon: HelpCircle,
      title: t("settings.help"),
      subtitle: t("settings.helpSubtitle"),
      onPress: () => {},
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>{t("settings.title")}</Text>
        </View>

        {/* Profile Card */}
        <TouchableOpacity style={styles.profileCard} onPress={() => {
          setEditName(settings.name || "");
          setEditEmail(settings.email || "");
          setShowProfileModal(true);
        }}>
          <View style={styles.avatar}>
            <User color={Colors.light.tint} size={32} />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{displayName}</Text>
            <Text style={styles.profileEmail}>{displayEmail}</Text>
          </View>
          <Edit3 color={Colors.light.textSecondary} size={20} />
        </TouchableOpacity>

        {/* Settings list */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("common.preferences")}</Text>
          <View style={styles.settingsList}>
            {settingItems.map((item, index) => (
              <TouchableOpacity
                key={item.title}
                style={[
                  styles.settingItem,
                  index === settingItems.length - 1 && styles.settingItemLast,
                ]}
                onPress={item.onPress}
                disabled={item.toggle}
                activeOpacity={item.toggle ? 1 : 0.7}
              >
                <View style={styles.settingLeft}>
                  <View style={styles.settingIcon}>
                    <item.icon color={Colors.light.tint} size={20} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.settingTitle}>{item.title}</Text>
                    <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
                  </View>
                </View>
                {item.toggle ? (
                  <Switch
                    value={item.value as boolean}
                    onValueChange={item.onToggle}
                    trackColor={{ false: Colors.light.border, true: Colors.light.tint }}
                    thumbColor="#fff"
                  />
                ) : (
                  <View style={styles.settingRight}>
                    {item.showValue && (
                      <Text style={styles.settingValue}>{item.value as string}</Text>
                    )}
                    <ChevronRight color={Colors.light.textSecondary} size={20} />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("settings.about")}</Text>
          <View style={styles.aboutCard}>
            <View style={styles.aboutRow}>
              <Text style={styles.aboutLabel}>{t("settings.version")}</Text>
              <Text style={styles.aboutValue}>1.0.0</Text>
            </View>
            <View style={[styles.aboutRow, { borderBottomWidth: 0 }]}>
              <Text style={styles.aboutLabel}>{t("settings.build")}</Text>
              <Text style={styles.aboutValue}>2026.03.25</Text>
            </View>
          </View>
        </View>

        <Text style={styles.footer}>{t("settings.footer", { version: "1.0.0" })}</Text>
      </ScrollView>

      {/* Profile Modal */}
      <Modal visible={showProfileModal} animationType="slide" transparent onRequestClose={() => setShowProfileModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t("settings.editProfile")}</Text>
              <TouchableOpacity onPress={() => setShowProfileModal(false)}>
                <X color={Colors.light.text} size={24} />
              </TouchableOpacity>
            </View>
            <Text style={styles.inputLabel}>{t("settings.yourName")}</Text>
            <TextInput
              style={styles.modalInput}
              value={editName}
              onChangeText={setEditName}
              placeholder={t("settings.namePlaceholder")}
              placeholderTextColor={Colors.light.textSecondary}
            />
            <Text style={styles.inputLabel}>{t("settings.yourEmail")}</Text>
            <TextInput
              style={styles.modalInput}
              value={editEmail}
              onChangeText={setEditEmail}
              placeholder={t("settings.emailPlaceholder")}
              placeholderTextColor={Colors.light.textSecondary}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TouchableOpacity style={styles.saveButton} onPress={handleSaveProfile}>
              <Text style={styles.saveButtonText}>{t("common.save")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Currency Modal */}
      <Modal visible={showCurrencyModal} animationType="slide" transparent onRequestClose={() => setShowCurrencyModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: "80%" }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t("settings.selectCurrency")}</Text>
              <TouchableOpacity onPress={() => setShowCurrencyModal(false)}>
                <Text style={styles.modalDone}>{t("common.done")}</Text>
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {currencies.map((currency) => (
                <TouchableOpacity
                  key={currency.code}
                  style={[styles.pickItem, primaryCurrency === currency.code && styles.pickItemActive]}
                  onPress={() => { updateSettings({ primaryCurrency: currency.code }); setShowCurrencyModal(false); }}
                >
                  <Text style={styles.pickFlag}>{currency.flag}</Text>
                  <View style={styles.pickInfo}>
                    <Text style={styles.pickName}>{currency.name}</Text>
                    <Text style={styles.pickCode}>{currency.code}</Text>
                  </View>
                  {primaryCurrency === currency.code && (
                    <View style={styles.checkmark}><Text style={styles.checkmarkText}>✓</Text></View>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Language Modal */}
      <Modal visible={showLanguageModal} animationType="slide" transparent onRequestClose={() => setShowLanguageModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t("settings.selectLanguage")}</Text>
              <TouchableOpacity onPress={() => setShowLanguageModal(false)}>
                <Text style={styles.modalDone}>{t("common.done")}</Text>
              </TouchableOpacity>
            </View>
            {supportedLanguages.map((lang) => (
              <TouchableOpacity
                key={lang.code}
                style={[styles.pickItem, language === lang.code && styles.pickItemActive]}
                onPress={() => { setLanguage(lang.code as LanguageCode); setShowLanguageModal(false); }}
              >
                <Text style={styles.pickFlag}>{lang.flag}</Text>
                <View style={styles.pickInfo}>
                  <Text style={styles.pickName}>{lang.name}</Text>
                  <Text style={styles.pickCode}>{lang.code.toUpperCase()}</Text>
                </View>
                {language === lang.code && (
                  <View style={styles.checkmark}><Text style={styles.checkmarkText}>✓</Text></View>
                )}
              </TouchableOpacity>
            ))}
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
  profileCard: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: Colors.light.surface, marginHorizontal: 20,
    padding: 16, borderRadius: 16, marginBottom: 24,
  },
  avatar: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: Colors.light.tint + "20",
    justifyContent: "center", alignItems: "center",
  },
  profileInfo: { flex: 1, marginLeft: 16 },
  profileName: { fontSize: 18, fontWeight: "600", color: Colors.light.text },
  profileEmail: { fontSize: 14, color: Colors.light.textSecondary, marginTop: 2 },
  section: { marginBottom: 24, paddingHorizontal: 20 },
  sectionTitle: {
    fontSize: 13, fontWeight: "600", color: Colors.light.textSecondary,
    textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 12,
  },
  settingsList: {
    backgroundColor: Colors.light.surface, borderRadius: 16, overflow: "hidden",
  },
  settingItem: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    padding: 16, borderBottomWidth: 1, borderBottomColor: Colors.light.border,
  },
  settingItemLast: { borderBottomWidth: 0 },
  settingLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  settingIcon: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: Colors.light.background,
    justifyContent: "center", alignItems: "center", marginRight: 12,
  },
  settingTitle: { fontSize: 16, fontWeight: "600", color: Colors.light.text },
  settingSubtitle: { fontSize: 13, color: Colors.light.textSecondary, marginTop: 2 },
  settingRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  settingValue: { fontSize: 15, fontWeight: "600", color: Colors.light.tint },
  aboutCard: { backgroundColor: Colors.light.surface, borderRadius: 16, overflow: "hidden" },
  aboutRow: {
    flexDirection: "row", justifyContent: "space-between",
    padding: 16, borderBottomWidth: 1, borderBottomColor: Colors.light.border,
  },
  aboutLabel: { fontSize: 15, color: Colors.light.text },
  aboutValue: { fontSize: 15, fontWeight: "500", color: Colors.light.textSecondary },
  footer: {
    textAlign: "center", fontSize: 12,
    color: Colors.light.textSecondary, marginBottom: 32, paddingHorizontal: 20,
  },
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
  modalDone: { fontSize: 16, fontWeight: "600", color: Colors.light.tint },
  inputLabel: { fontSize: 13, fontWeight: "600", color: Colors.light.textSecondary, marginBottom: 6 },
  modalInput: {
    backgroundColor: Colors.light.background, borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 14, fontSize: 16,
    color: Colors.light.text, marginBottom: 16,
  },
  saveButton: {
    backgroundColor: Colors.light.tint, paddingVertical: 16, borderRadius: 12, alignItems: "center",
  },
  saveButtonText: { fontSize: 16, fontWeight: "600", color: "white" },
  pickItem: {
    flexDirection: "row", alignItems: "center",
    padding: 14, borderRadius: 12, marginBottom: 6,
  },
  pickItemActive: { backgroundColor: Colors.light.background },
  pickFlag: { fontSize: 24, marginRight: 12 },
  pickInfo: { flex: 1 },
  pickName: { fontSize: 16, fontWeight: "600", color: Colors.light.text },
  pickCode: { fontSize: 13, color: Colors.light.textSecondary, marginTop: 2 },
  checkmark: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: Colors.light.tint, justifyContent: "center", alignItems: "center",
  },
  checkmarkText: { color: "white", fontSize: 14, fontWeight: "700" },
});
