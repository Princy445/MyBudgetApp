# MyBudget

Une application mobile de gestion de budget personnel, multilingue et multi-devises, développée avec React Native et Expo.

## À propos de l'application

MyBudget vous aide à garder le contrôle de vos finances personnelles. Suivez vos revenus et dépenses, définissez des budgets par catégorie, fixez des objectifs d'épargne et surveillez vos investissements — le tout dans une interface claire et intuitive, disponible en français et en anglais.

## Fonctionnalités

- **Tableau de bord** — Vue d'ensemble de votre solde, revenus, dépenses, graphique de tendance sur 7 jours et répartition des dépenses par catégorie
- **Transactions** — Ajout rapide de dépenses et de revenus, recherche, suppression par appui long
- **Budget** — Définissez des limites de dépenses par catégorie (alimentation, transport, loisirs…) et suivez votre progression en temps réel. Le montant dépensé se synchronise automatiquement avec vos transactions
- **Objectifs d'épargne** — Créez des objectifs avec un montant cible et une échéance, et visualisez votre progression
- **Investissements** — Suivez votre portefeuille (actions, crypto, obligations, épargne) et consultez votre rendement global
- **Paramètres** — Profil utilisateur, devise principale (10 devises supportées), langue (FR / EN), mode sombre, notifications

## Technologies

- **React Native** — Développement mobile cross-platform
- **Expo / Expo Router** — Navigation par fichiers, compatible iOS, Android et Web
- **TypeScript** — Typage statique
- **React Query (@tanstack/react-query)** — Gestion du state serveur et cache
- **AsyncStorage** — Persistance locale des données
- **i18next** — Internationalisation (français, anglais)
- **Lucide React Native** — Icônes

## Structure du projet

```
├── app/
│   ├── (tabs)/
│   │   ├── (home)/index.tsx      # Tableau de bord
│   │   ├── transactions/index.tsx # Transactions
│   │   ├── budget/index.tsx       # Budget & objectifs d'épargne
│   │   ├── investments/index.tsx  # Investissements
│   │   ├── settings/index.tsx     # Paramètres
│   │   └── _layout.tsx            # Navigation par onglets
│   └── _layout.tsx                # Layout racine (providers)
├── assets/images/                 # Icônes et splash screen
├── constants/
│   ├── colors.ts                  # Palette de couleurs
│   ├── currencies.ts              # Devises et conversion
│   └── categories.ts              # Catégories de dépenses
├── hooks/
│   ├── useBudgetContext.tsx        # State global budget (React Query + AsyncStorage)
│   └── useLanguageContext.tsx      # Context langue
├── i18n/locales/
│   ├── en.json                    # Traductions anglaises
│   └── fr.json                    # Traductions françaises
├── types/index.tsx                # Types TypeScript
├── app.json                       # Configuration Expo
└── package.json
```

## Installation et lancement

**Prérequis** : Node.js (v18+) et Bun ou npm

```bash
# 1. Cloner le dépôt
git clone <YOUR_GIT_URL>
cd MyBudgetApp

# 2. Installer les dépendances
bun install
# ou : npm install

# 3. Lancer en mode développement (web)
bun run web
# ou : npx expo start --web

# 4. Lancer sur iOS Simulator
bun run start
# puis appuyer sur "i" dans le terminal

# 5. Lancer sur Android Emulator
bun run start
# puis appuyer sur "a" dans le terminal
```

## Tester sur mobile

1. Installer **Expo Go** sur votre téléphone ([iOS](https://apps.apple.com/app/expo-go/id982107779) / [Android](https://play.google.com/store/apps/details?id=host.exp.exponent))
2. Lancer `bun run start` et scanner le QR code

## Déploiement

```bash
# Installer EAS CLI
bun i -g @expo/eas-cli

# Build iOS
eas build --platform ios

# Build Android
eas build --platform android

# Publier sur le web
eas build --platform web
```

## Dépannage

- **L'app ne se charge pas sur mobile** : vérifiez que votre téléphone et votre ordinateur sont sur le même réseau Wi-Fi, ou utilisez `bun run start -- --tunnel`
- **Erreur de build** : videz le cache avec `bunx expo start --clear`, puis supprimez `node_modules` et relancez `bun install`

## Licence

Ce projet est à usage personnel. Tous droits réservés.
