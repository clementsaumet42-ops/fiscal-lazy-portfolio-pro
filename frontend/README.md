# Fiscal Lazy Portfolio Pro - Frontend

Application frontend Next.js 14 pour la plateforme d'optimisation fiscale de portefeuilles.

## 🚀 Démarrage rapide

### Prérequis

- Node.js 18+ 
- npm ou yarn

### Installation

```bash
cd frontend
npm install
```

### Configuration

Créer un fichier `.env.local` avec:

```bash
NEXT_PUBLIC_API_URL=https://fiscal-lazy-portfolio-pro-production.up.railway.app
```

### Développement

```bash
npm run dev
```

L'application sera disponible sur http://localhost:3000

### Build de production

```bash
npm run build
npm start
```

## 📁 Structure du projet

```
frontend/
├── app/                      # Pages Next.js 14 (App Router)
│   ├── page.tsx             # Page d'accueil
│   ├── layout.tsx           # Layout racine
│   ├── globals.css          # Styles globaux
│   ├── client/              # Parcours client (6 étapes)
│   │   ├── profil/
│   │   ├── enveloppes/
│   │   ├── allocation/
│   │   ├── optimisation/
│   │   ├── backtest/
│   │   └── rapport/
│   └── dashboard/           # Dashboard expert-comptable
├── components/
│   ├── ui/                  # Composants UI (button, card, input, etc.)
│   ├── charts/              # Graphiques (PieChart, LineChart, BarChart)
│   └── layout/              # Header, Footer, Navigation
├── lib/
│   ├── api-client.ts        # Client API axios
│   ├── types.ts             # Types TypeScript
│   └── utils.ts             # Fonctions utilitaires
└── store/
    └── client-store.ts      # State management (Zustand)
```

## 🎯 Fonctionnalités

### Parcours client en 6 étapes

1. **Profil client**: Collecte des informations personnelles et fiscales
2. **Choix des enveloppes**: Sélection PEA, CTO, Assurance-vie, PER
3. **Allocation d'actifs**: Répartition actions/obligations/cash avec sliders
4. **Optimisation fiscale**: Calcul de l'allocation optimale par enveloppe
5. **Backtest**: Simulation historique sur 10 ans
6. **Rapport final**: Récapitulatif et export PDF/Excel

### Dashboard expert-comptable

- Statistiques globales (simulations, clients, économies fiscales)
- Simulations récentes
- Répartition par enveloppe
- Top économies fiscales

## 🛠 Stack technique

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui inspired
- **Charts**: Recharts
- **State**: Zustand
- **Forms**: React Hook Form + Zod
- **HTTP**: Axios

## 📊 API Backend

L'application communique avec le backend FastAPI :
- Production: https://fiscal-lazy-portfolio-pro-production.up.railway.app
- Documentation API: /docs

### Endpoints principaux

- `POST /api/clients/personne-physique` - Créer un client
- `POST /api/optimization/allocation-cible` - Allocation cible
- `POST /api/optimization/asset-location` - Optimisation fiscale
- `POST /api/backtests/backtest` - Lancer un backtest
- `GET /api/providers/universe/etfs` - Liste des ETFs

## 🎨 Design System

### Couleurs

- **Primary**: Blue (#3b82f6) - Actions principales
- **Secondary**: Green (#10b981) - Succès, économies fiscales
- **Warning**: Orange (#f59e0b) - Alertes
- **Danger**: Red (#ef4444) - Erreurs

### Typographie

- Font: Inter (avec fallback système)
- Titres: font-bold text-3xl
- Corps: text-base

## 📱 Responsive

- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)

## ♿ Accessibilité

- Labels sur tous les inputs
- Contraste WCAG AA
- Navigation au clavier
- ARIA attributes

## 🔒 Sécurité

- Validation des formulaires (React Hook Form + Zod)
- Sanitization des inputs
- HTTPS uniquement
- CORS configuré

## 📄 License

MIT License - Voir LICENSE pour plus de détails

## ⚠️ Disclaimer

Ce logiciel est fourni à titre informatif uniquement. Il ne constitue pas un conseil financier, juridique ou fiscal. Consultez des experts qualifiés avant toute décision financière.
