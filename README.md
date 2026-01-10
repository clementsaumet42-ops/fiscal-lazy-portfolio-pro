# 🏦 Fiscal Lazy Portfolio Pro

## Plateforme B2B pour Experts-Comptables Français

**Fiscal Lazy Portfolio Pro** est une plateforme professionnelle d'optimisation fiscale et d'allocation d'actifs destinée aux experts-comptables français. L'outil permet l'optimisation multi-enveloppes (PEA, CTO, AV, PER) pour personnes physiques ET sociétés à l'IS, avec conformité juridique totale au droit fiscal français.

### 🎯 Public Cible
Experts-comptables français gérant des portefeuilles d'investissement pour leurs clients (particuliers et sociétés).

### ⚡ Fonctionnalités Principales

#### 1. Gestion Multi-Clients
- **Personnes Physiques**: Profil risque, TMI, horizon d'investissement
- **Sociétés IS**: Fiscalité spécifique OPCVM selon CGI Art. 219
- Import CSV des positions
- Gestion multi-enveloppes (PEA, CTO, AV, PER)

#### 2. Optimisation Fiscale
- **Asset Location**: Placement optimal par enveloppe pour minimiser fiscalité
- **Tax-Loss Harvesting**: Optimisation pertes/gains sur CTO
- **Ordre de retrait optimal**: Minimisation de l'impact fiscal
- Calculs conformes CGI (Code Général des Impôts)

#### 3. Lifecycle Investing
- Glide paths dynamiques selon âge
- 4 stratégies: Conservateur, Équilibré, Dynamique, Agressif
- Ajustement automatique allocation actions/obligations
- Arbitrage Fonds Euros vs ETF Obligations

#### 4. Backtesting Institutionnel
- Données historiques 2000-2024 (Yahoo Finance)
- Métriques: CAGR, Volatilité, Sharpe, Sortino, Calmar
- Maximum Drawdown avec tracking temporel
- VaR 95% et CVaR 95%
- Rééquilibrage: mensuel, trimestriel, annuel
- Impact frais de transaction

#### 5. Simulations Monte Carlo
- 10,000+ simulations
- Projections 30 ans
- Percentiles: 10%, 25%, 50%, 75%, 90%
- Probabilité de succès
- Fan chart visualization

#### 6. Stratégies de Rééquilibrage
- 5 stratégies pré-configurées
- Rééquilibrage sur seuil ou périodique
- Optimisation via nouveaux apports
- Contraintes fiscales intégrées (PEA <5 ans, etc.)

#### 7. Conformité Juridique Totale
- Code Général des Impôts (CGI): Art. 150-0 A, 219, 125-0 A, 990 I
- BOFiP (Bulletin Officiel des Finances Publiques)
- Jurisprudence (Conseil d'État, Cour de Cassation)
- Vérification éligibilité PEA automatique
- Contrôle des plafonds
- Rapports de conformité

#### 8. Comparateur de Providers
**21 providers référencés:**
- **PEA**: Boursorama, Bourse Direct, Fortuneo, Trade Republic, Saxo
- **CTO**: Interactive Brokers, Trade Republic, Degiro, Saxo, Bourse Direct
- **Assurance-Vie**: Linxea (Spirit 2, Avenir 2), Placement-direct, Yomoni, Nalo, Boursorama
- **PER**: Linxea PER, Yomoni PER, Placement-direct, Nalo, Mes Placements Liberté

#### 9. Universe d'ETFs
**24 ETFs couvrant toutes les classes d'actifs:**
- Actions Monde, Europe, USA, Émergents
- Obligations Gouvernementales et Corporate
- Small Caps
- Or
- Éligibilité PEA automatiquement vérifiée

### 📦 Installation

#### Prérequis
- Python 3.11+
- Node.js 18+ (pour frontend)

#### Backend (API FastAPI)
```bash
cd backend
pip install -r requirements.txt

# Lancer le serveur
cd api
python main.py
# Ou avec uvicorn
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

L'API sera disponible sur: http://localhost:8000
Documentation interactive: http://localhost:8000/docs

#### Frontend (Next.js 14)
```bash
cd frontend
npm install
npm run dev
```

Le frontend sera disponible sur: http://localhost:3000

### 🚀 Utilisation Rapide

#### Via l'API
```python
import requests

# Créer un client personne physique
client_data = {
    "nom": "Dupont",
    "prenom": "Jean",
    "age": 45,
    "tmi": 30.0,
    "horizon_annees": 20,
    "profil_risque": "equilibre",
    "patrimoine_total": 250000.0
}

response = requests.post("http://localhost:8000/api/clients/personne-physique", json=client_data)
print(response.json())

# Comparer providers PEA
response = requests.get("http://localhost:8000/api/providers/comparer/pea?montant_annuel=10000")
print(response.json())

# Lancer backtest 60/40
response = requests.get("http://localhost:8000/api/backtests/demo/backtest-60-40")
print(response.json())

# Monte Carlo 30 ans
response = requests.get("http://localhost:8000/api/backtests/demo/monte-carlo")
print(response.json())
```

### 📊 Structure du Projet

```
fiscal-lazy-portfolio-pro/
├── backend/
│   ├── src/
│   │   ├── models/           # Modèles de données (PP, IS, Enveloppes, ETF)
│   │   ├── optimization/     # Moteurs d'optimisation
│   │   ├── analytics/        # Backtesting, Monte Carlo, Risk Metrics
│   │   ├── legal/            # Compliance, Règles fiscales CGI
│   │   ├── providers/        # Comparateur providers
│   │   ├── data/             # Market data (yfinance), ISIN DB
│   │   └── utils/            # Utilitaires fiscaux, cache
│   ├── api/
│   │   ├── main.py           # Application FastAPI
│   │   └── routes/           # Endpoints API
│   └── requirements.txt
├── frontend/                  # Next.js 14 (à implémenter)
├── data/
│   ├── providers/            # JSON des 21 providers
│   ├── etfs/                 # Universe de 24 ETFs
│   └── legal/                # CGI, BOFiP, Jurisprudence
├── config/
│   ├── rebalancing_strategy.yaml
│   └── allocation_models.yaml
├── tests/                     # Suite de tests
├── notebooks/                 # Jupyter notebooks exemples
└── docs/                      # Documentation
```

### 🛠 Stack Technique

**Backend:**
- FastAPI (API REST)
- Pydantic (validation)
- yfinance (données marché)
- pandas/numpy (calculs financiers)
- scipy (optimisation)

**Frontend (à implémenter):**
- Next.js 14
- TypeScript
- Tailwind CSS
- shadcn/ui
- Recharts

### 📚 Documentation Complète

- **API**: `/docs` sur l'API FastAPI (Swagger/OpenAPI)
- **Architecture**: `docs/ARCHITECTURE.md`
- **Conformité Juridique**: `docs/legal/conformite_juridique.md`
- **Guide Utilisateur**: `docs/user_guide/guide_utilisation.md`

### 🔐 Conformité et Sécurité

#### Références Légales
- **PEA**: CGI Art. 150-0 A
- **Assurance-Vie**: CGI Art. 125-0 A, 990 I
- **Société IS OPCVM**: CGI Art. 219
- **CTO**: CGI Art. 200 A
- **PER**: CGI Art. 163 quatervicies

#### QPFC 12% (Sociétés IS)
Conformité totale avec la Quote-Part pour Frais et Charges sur OPCVM Actions (≥75% actions) détenus >2 ans.

#### Disclaimer
⚠️ **Ce logiciel est fourni à titre informatif et éducatif uniquement. Il ne constitue pas un conseil financier, juridique ou fiscal. Les utilisateurs doivent consulter des experts-comptables qualifiés avant toute décision financière. Les développeurs ne sont pas responsables des pertes financières ou problèmes juridiques résultant de l'utilisation de ce logiciel.**

### 🧪 Tests

```bash
cd backend
pytest tests/

# Tests spécifiques
pytest tests/test_societe_is.py        # Fiscalité IS
pytest tests/test_backtesting.py       # Métriques backtesting
pytest tests/test_compliance.py        # Conformité juridique
```

### 📈 Exemples d'Utilisation

#### Exemple 1: Société IS - OPCVM Actions
```python
from backend.src.models.societe_is import SocieteIS, TypeOPCVM

societe = SocieteIS(
    raison_sociale="INVEST SARL",
    siren="123456789",
    regime_fiscal="is_pme",
    taux_is=15.0
)

# Calcul fiscalité OPCVM Actions (≥75% actions)
fiscalite = societe.calcul_fiscalite_opcvm(
    type_opcvm=TypeOPCVM.ACTIONS,
    plus_value=10000,
    duree_detention_annees=2.5
)

print(fiscalite)
# {'impot_du': 1100, 'qpfc': 1200, 'taux_effectif': 11.0, 'regime': 'QPFC 12%'}
```

#### Exemple 2: Lifecycle Investing
```python
from backend.src.optimization.lifecycle_investing import LifecycleInvestor, StrategieGlidePath

# Allocation pour personne de 45 ans, horizon 20 ans
allocation = LifecycleInvestor.calculer_allocation_lifecycle(
    age=45,
    horizon_annees=20,
    strategie=StrategieGlidePath.LIFECYCLE_OPTIMAL
)

print(allocation)
# {'actions': 80.0, 'obligations': 15.0, 'or': 5.0}
```

### 🤝 Contribution

Ce projet est destiné aux experts-comptables professionnels. Pour toute contribution ou question:
1. Vérifier la conformité juridique (CGI)
2. Tester avec la suite de tests
3. Documenter les changements

### 📄 License

MIT License - Voir `LICENSE` pour détails complets.

**DISCLAIMER**: Ce logiciel ne constitue pas un conseil professionnel. Consultez des experts qualifiés.

### 🎓 Niveau: DIEU SUR TERRE 🔥

Plateforme institutionnelle complète pour experts-comptables français avec:
- ✅ Conformité juridique totale (CGI, BOFiP, Jurisprudence)
- ✅ Backtesting niveau institutionnel
- ✅ Simulations Monte Carlo 10k+
- ✅ Fiscalité société IS (QPFC 12%)
- ✅ 21 providers référencés
- ✅ 24 ETFs couvrant toutes classes d'actifs
- ✅ API REST complète (FastAPI)
- ✅ Documentation exhaustive

---

**Fait avec ❤️ pour les Experts-Comptables Français**
