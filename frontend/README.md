# Frontend - Fiscal Lazy Portfolio Pro

Application Next.js 14 pour l'optimisation fiscale et l'allocation d'actifs.

## 🚀 Installation

```bash
# Installer les dépendances
npm install

# Lancer en développement
npm run dev

# Build pour production
npm run build

# Lancer en production
npm start
```

L'application sera disponible sur [http://localhost:3000](http://localhost:3000)

## 📦 Stack Technique

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui + Radix UI
- **Charts**: Recharts
- **Forms**: React Hook Form + Zod
- **API Client**: Axios
- **PDF**: jsPDF + html2canvas

## 🏗️ Structure du Projet

```
frontend/
├── app/                      # Pages Next.js (App Router)
│   ├── layout.tsx           # Layout principal
│   ├── page.tsx             # Page d'accueil
│   ├── client/              # Parcours client (6 étapes)
│   │   ├── profil/          # Étape 1: Profil client
│   │   ├── enveloppes/      # Étape 2: Choix enveloppes
│   │   ├── allocation/      # Étape 3: Allocation d'actifs
│   │   ├── optimisation/    # Étape 4: Optimisation fiscale
│   │   ├── backtests/       # Étape 5: Backtests
│   │   └── rapport/         # Étape 6: Génération rapport
│   └── dashboard/           # Dashboard expert-comptable
├── components/
│   ├── ui/                  # Components shadcn/ui
│   ├── layout/              # Header, Footer, Sidebar
│   ├── client/              # Components spécifiques client
│   └── dashboard/           # Components dashboard
├── lib/
│   ├── api/                 # API client et endpoints
│   │   ├── client.ts        # Configuration Axios
│   │   ├── types.ts         # Types TypeScript
│   │   └── endpoints/       # Modules API
│   ├── utils/               # Utilitaires
│   │   ├── format.ts        # Formatage
│   │   ├── validation.ts    # Schémas Zod
│   │   └── pdf.ts           # Génération PDF
│   └── constants.ts         # Constantes
├── styles/
│   └── globals.css          # Styles globaux Tailwind
└── public/                  # Assets statiques
```

## 🎯 Fonctionnalités

### Parcours Client (6 étapes)

1. **Profil Client**: Informations personnelles et fiscales
2. **Enveloppes**: Sélection PEA, CTO, Assurance Vie, Société IS
3. **Allocation**: Stratégie d'investissement et allocation d'actifs
4. **Optimisation**: Stratégies d'optimisation fiscale
5. **Backtests**: Performance historique et simulations Monte Carlo
6. **Rapport**: Génération et export PDF

### Dashboard

- Vue d'ensemble des clients
- KPIs (AUM total, performance moyenne)
- Graphiques de performance
- Liste des clients récents
- Statistiques détaillées

## 🔗 API Backend

L'application se connecte à l'API FastAPI:
- Production: `https://fiscal-lazy-portfolio-pro-production.up.railway.app`
- Local: `http://localhost:8000`

Configurer l'URL dans `.env.local`:
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 🎨 Design System

- **Couleurs**: Bleu (#3b82f6), Indigo (#6366f1), Vert, Orange, Rouge
- **Typographie**: Inter (Next.js default)
- **Spacing**: Tailwind (4px grid)
- **Components**: shadcn/ui (réutilisables et personnalisables)

## 📱 Responsive

L'application est entièrement responsive:
- Mobile-first design
- Breakpoints Tailwind (sm, md, lg, xl)
- Navigation adaptative

## 🛠️ Développement

### Ajouter un composant shadcn/ui

Les composants UI sont déjà inclus. Pour en ajouter d'autres:
```bash
npx shadcn-ui@latest add [component-name]
```

### Structure des données

Les données client sont stockées dans `localStorage`:
- `client_profil`: Profil du client
- `client_enveloppes`: Enveloppes sélectionnées
- `client_allocation`: Allocation calculée
- `client_backtest`: Résultats backtest

## 📄 License

MIT License

---

**Fait avec ❤️ pour les Experts-Comptables Français**
