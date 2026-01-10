# Architecture - Fiscal Lazy Portfolio Pro

## Vue d'ensemble

Fiscal Lazy Portfolio Pro est une application B2B en architecture 3-tiers:

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js 14)                     │
│  - Interface experts-comptables                              │
│  - Dashboard, Charts, Forms                                  │
│  - TypeScript + Tailwind + shadcn/ui                         │
└──────────────────┬──────────────────────────────────────────┘
                   │ HTTP/REST
┌──────────────────▼──────────────────────────────────────────┐
│                  BACKEND (FastAPI/Python)                    │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              API Routes (REST endpoints)               │ │
│  │  /api/clients  /api/portfolios  /api/optimization     │ │
│  │  /api/backtests  /api/compliance  /api/providers      │ │
│  └────────────────┬───────────────────────────────────────┘ │
│                   │                                          │
│  ┌────────────────▼───────────────────────────────────────┐ │
│  │                  Business Logic                        │ │
│  │  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐ │ │
│  │  │ Optimization │  │  Analytics   │  │Legal/Compliance│ │
│  │  │ - Asset Alloc│  │ - Backtesting│  │ - Fiscal Rules│ │
│  │  │ - Asset Loc  │  │ - Monte Carlo│  │ - CGI Checks │ │
│  │  │ - Lifecycle  │  │ - Risk Metrics│ │ - PEA Verif  │ │
│  │  │ - Rebalancing│  │ - Performance│  │ - Compliance │ │
│  │  │ - Withdrawal │  │ - Drawdown   │  │   Engine     │ │
│  │  │ - TLH        │  │              │  │              │ │
│  │  └─────────────┘  └──────────────┘  └──────────────┘ │ │
│  └────────────────┬───────────────────────────────────────┘ │
│                   │                                          │
│  ┌────────────────▼───────────────────────────────────────┐ │
│  │                   Data Layer                           │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │ │
│  │  │ Market Data  │  │  Providers   │  │   Models    │ │ │
│  │  │  (yfinance)  │  │  Comparator  │  │ - Personne  │ │ │
│  │  │              │  │  Cost Calc   │  │ - Société IS│ │ │
│  │  │  ISIN DB     │  │  Recommender │  │ - Enveloppes│ │ │
│  │  │              │  │              │  │ - ETF       │ │ │
│  │  └──────────────┘  └──────────────┘  └─────────────┘ │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────────────┐
│                     DATA FILES                               │
│  - providers/ (21 providers JSON)                           │
│  - etfs/ (24 ETFs universe)                                 │
│  - legal/ (CGI, BOFiP, Jurisprudence)                       │
│  - config/ (YAML strategies)                                │
└─────────────────────────────────────────────────────────────┘
```

## Modules Principaux

### 1. Models (`backend/src/models/`)
Modèles de données Pydantic pour validation stricte:
- **PersonnePhysique**: Client particulier
- **SocieteIS**: Client société à l'IS
- **Enveloppes**: PEA, CTO, AV, PER avec calculs fiscaux
- **ETF**: Modèle ETF avec éligibilités
- **Position**: Position de portefeuille

### 2. Optimization (`backend/src/optimization/`)
Moteurs d'optimisation:
- **AssetAllocator**: Allocations stratégiques (4 profils)
- **AssetLocator**: Placement optimal fiscalement
- **LifecycleInvestor**: Glide paths dynamiques
- **RebalancingEngine**: 5 stratégies de rééquilibrage
- **WithdrawalOptimizer**: Ordre de retrait optimal
- **TaxLossHarvester**: Tax-loss harvesting CTO

### 3. Analytics (`backend/src/analytics/`)
Analyses quantitatives:
- **BacktestEngine**: Backtesting avec métriques institutionnelles
- **MonteCarloSimulator**: Simulations 10k+ trajectoires
- **RiskMetrics**: VaR, CVaR, Beta, Tracking Error
- **DrawdownAnalyzer**: Analyse des drawdowns
- **PerformanceAnalyzer**: Métriques de performance

### 4. Legal (`backend/src/legal/`)
Conformité juridique:
- **FiscalRules**: Implémentation CGI (PEA, AV, CTO, PER, IS)
- **ComplianceEngine**: Vérification conformité automatique

### 5. Providers (`backend/src/providers/`)
Comparaison courtiers/assureurs:
- **ProviderComparator**: Comparaison 21 providers
- **CostCalculator**: Calcul coûts détaillés
- **ProviderRecommender**: Recommandations personnalisées

### 6. Data (`backend/src/data/`)
Gestion données:
- **MarketDataProvider**: yfinance integration
- **ISINDatabase**: Base 24 ETFs

## Flux de Données

### Flux 1: Création Client
```
Frontend → POST /api/clients/personne-physique
        → Validation Pydantic (PersonnePhysique)
        → Stockage en mémoire (remplacer par DB en prod)
        → Return client_id
```

### Flux 2: Backtest
```
Frontend → POST /api/backtests/backtest
        → BacktestEngine.backtester_allocation()
        → Téléchargement prix (yfinance ou synthétique)
        → Calcul métriques (CAGR, Sharpe, Sortino, etc.)
        → Return résultats JSON
```

### Flux 3: Vérification Conformité
```
Frontend → POST /api/compliance/verifier
        → ComplianceEngine.verifier_conformite_portefeuille()
        → Vérification PEA (éligibilité, plafonds)
        → Vérification AV (ancienneté, fiscalité)
        → Vérification CTO (TLH opportunités)
        → Return alertes + avertissements + recommandations
```

## Choix Techniques

### Backend: Python + FastAPI
**Pourquoi Python?**
- Écosystème finance: pandas, numpy, scipy
- yfinance pour données marché
- Pydantic pour validation stricte
- Jupyter pour analyses exploratoires

**Pourquoi FastAPI?**
- Performance (async)
- Documentation auto (Swagger/OpenAPI)
- Validation native (Pydantic)
- Typage fort

### Frontend: Next.js 14
**Pourquoi Next.js?**
- SSR/SSG pour SEO
- React Server Components
- App Router
- Performance optimale

**Pourquoi TypeScript?**
- Typage fort (sécurité)
- IntelliSense
- Refactoring sûr

### Stockage: JSON + YAML
**Phase 1 (actuelle):**
- JSON pour providers, ETFs, legal
- YAML pour config
- Stockage mémoire clients/portfolios

**Phase 2 (production):**
- PostgreSQL pour clients/portfolios
- Redis pour cache
- JSON/YAML pour référentiels statiques

## Scalabilité

### Actuelle (MVP)
- Mono-instance
- Stockage mémoire
- Sans authentification
- Adapté: experts-comptables individuels (<100 clients)

### Production
```
┌─────────────────────────────────────────────────┐
│              Load Balancer (nginx)              │
└───┬──────────────────────────────────────┬──────┘
    │                                      │
┌───▼─────────────┐              ┌────────▼────────┐
│  FastAPI Node 1 │              │ FastAPI Node 2  │
└───┬─────────────┘              └────────┬────────┘
    │                                     │
    └───────────────┬─────────────────────┘
                    │
        ┌───────────▼──────────────┐
        │   PostgreSQL (clients)   │
        └──────────────────────────┘
                    │
        ┌───────────▼──────────────┐
        │   Redis (cache)          │
        └──────────────────────────┘
```

## Sécurité

### Actuel
- CORS configuré
- Validation Pydantic
- Pas d'injection SQL (pas de SQL direct)

### Production
- Authentification JWT
- RBAC (Role-Based Access Control)
- HTTPS obligatoire
- Rate limiting
- Audit logs
- Encryption at rest (données clients)

## Performance

### Optimisations Actuelles
- Cache (CacheManager)
- Validation Pydantic rapide
- Calculs vectorisés (numpy/pandas)

### Benchmarks Estimés
- Backtest 1000 jours: ~500ms
- Monte Carlo 10k simulations: ~2s
- Vérification conformité: ~50ms
- Comparaison providers: ~10ms

## Extension Future

### Fonctionnalités Additionnelles
1. **Multi-devise**: Support USD, CHF, etc.
2. **Actions individuelles**: Au-delà des ETFs
3. **Options/Dérivés**: Couverture
4. **Crypto**: Intégration BTC/ETH
5. **API Bancaires**: Agrégation automatique (Budget Insight, Plaid)
6. **IA/ML**: Prédictions rendements, détection anomalies

### Intégrations
- **Outils comptables**: Sage, Cegid, ACD
- **Déclarations fiscales**: IFU automatique
- **Reporting**: Excel, PDF, PowerBI

---

**Version**: 1.0.0  
**Date**: Janvier 2026  
**Auteur**: Fiscal Lazy Portfolio Pro Team
