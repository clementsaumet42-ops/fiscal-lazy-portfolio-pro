# Documentation Fiscalité - Calculs TCO Professionnels

## Vue d'ensemble

Ce document décrit les calculs fiscaux professionnels conformes au Code Général des Impôts (CGI) utilisés pour déterminer le Total Cost of Ownership (TCO) de chaque enveloppe d'épargne.

## Références CGI

Tous les calculs sont basés sur des articles précis du CGI, accessibles sur [Légifrance](https://www.legifrance.gouv.fr/).

---

## 1. Plan d'Épargne en Actions (PEA)

### Règles fiscales (CGI Art. 150-0 A)

#### Avant 5 ans d'ancienneté
- **Imposition** : Barème progressif de l'IR (selon TMI) + Prélèvements sociaux 17.2%
- **Conséquence** : Retrait = clôture du PEA
- **Article** : CGI Art. 150-0 A

**Exemple TMI 30%** :
```
Plus-value : 10 000€
Fiscalité : 10 000€ × (30% + 17.2%) = 4 720€
Taux effectif : 47.2%
```

#### Après 5 ans d'ancienneté
- **Exonération d'IR** : Les plus-values sont exonérées d'impôt sur le revenu
- **Prélèvements sociaux** : 17.2% restent dus
- **Article** : CGI Art. 150-0 A, 1 ter

**Exemple** :
```
Plus-value : 10 000€
Fiscalité : 10 000€ × 17.2% = 1 720€
Taux effectif : 17.2%
```

### Calcul TCO PEA

```typescript
// Frais de gestion
TER moyen : 0.3% (moyenne marché ETF)
Frais annuels = Valorisation × 0.003

// Drag fiscal
Si ancienneté < 5 ans :
  Drag = Plus-value × (TMI + 0.172)
Sinon :
  Drag = Plus-value × 0.172

// Coût d'opportunité
Opportunité = Valorisation × 1.5%

TCO Total = Frais + Drag + Opportunité
```

### Tableau comparatif

| Ancienneté | TMI 11% | TMI 30% | TMI 41% | TMI 45% |
|------------|---------|---------|---------|---------|
| < 5 ans    | 28.2%   | 47.2%   | 58.2%   | 62.2%   |
| ≥ 5 ans    | 17.2%   | 17.2%   | 17.2%   | 17.2%   |

**Conclusion** : Le PEA est optimal après 5 ans, quel que soit la TMI.

---

## 2. Compte-Titres Ordinaire (CTO)

### Règles fiscales (CGI Art. 200 A)

#### Option 1 : Prélèvement Forfaitaire Unique (PFU)
- **Taux** : 30% flat (12.8% IR + 17.2% PS)
- **Défaut** : Appliqué automatiquement
- **Article** : CGI Art. 200 A

**Exemple** :
```
Plus-value ou dividende : 5 000€
Fiscalité : 5 000€ × 30% = 1 500€
```

#### Option 2 : Barème progressif de l'IR
- **Taux** : TMI + 17.2% PS
- **Conditions** : Option irrévocable pour l'année, s'applique à tous les revenus mobiliers
- **Intérêt** : Si TMI < 11%, le barème est plus avantageux que le PFU
- **Article** : CGI Art. 200 A, 2

**Exemple TMI 11%** :
```
Plus-value : 5 000€
Option barème : 5 000€ × (11% + 17.2%) = 1 410€
PFU : 5 000€ × 30% = 1 500€
Économie : 90€
```

### Calcul TCO CTO

```typescript
// Frais de gestion
TER moyen : 0.2% (frais courtage faibles)
Frais annuels = Valorisation × 0.002

// Drag fiscal (sur dividendes estimés à 2%)
Dividendes = Valorisation × 0.02
Si option barème :
  Drag = Dividendes × (TMI + 0.172)
Sinon :
  Drag = Dividendes × 0.30

// Coût d'opportunité
Opportunité = Valorisation × 1%

TCO Total = Frais + Drag + Opportunité
```

### Comparaison PFU vs Barème

| TMI | PFU | Barème | Optimal |
|-----|-----|--------|---------|
| 0%  | 30% | 17.2%  | Barème  |
| 11% | 30% | 28.2%  | Barème  |
| 30% | 30% | 47.2%  | PFU     |
| 41% | 30% | 58.2%  | PFU     |
| 45% | 30% | 62.2%  | PFU     |

**Recommandation** : TMI ≤ 11% → Option barème. TMI ≥ 30% → Conserver le PFU.

---

## 3. Assurance-Vie

### Règles fiscales (CGI Art. 125-0 A)

#### Rachats avant 4 ans
- **IR** : 35%
- **PS** : 17.2%
- **Total** : 52.2%
- **Article** : CGI Art. 125-0 A, II-2°

#### Rachats entre 4 et 8 ans
- **IR** : 15%
- **PS** : 17.2%
- **Total** : 32.2%
- **Article** : CGI Art. 125-0 A, II-2°

#### Rachats après 8 ans
- **IR** : 7.5% (après abattement)
- **PS** : 17.2%
- **Total** : 24.7%
- **Abattement** : 4 600€ (célibataire) ou 9 200€ (couple)
- **Article** : CGI Art. 125-0 A, III-1°

**Exemple après 8 ans (couple)** :
```
Plus-value rachat : 15 000€
Abattement couple : 9 200€
Plus-value imposable : 15 000€ - 9 200€ = 5 800€
IR : 5 800€ × 7.5% = 435€
PS : 5 800€ × 17.2% = 998€
Total fiscalité : 1 433€
Taux effectif : 9.5% (1 433€ / 15 000€)
```

#### Prélèvements sociaux annuels sur fonds euros
- **Taux** : 17.2% sur les intérêts
- **Fréquence** : Annuels (prélevés automatiquement)
- **Article** : CGI Art. 125-0 A

### Calcul TCO Assurance-Vie

```typescript
// Frais de gestion
TER moyen : 1.5% (frais sur UC + gestion)
Frais annuels = Valorisation × 0.015

// Drag fiscal rachat (selon ancienneté)
Plus-value = Valorisation - Versements
Si ancienneté < 4 ans :
  Drag rachat = Plus-value × 0.522
Sinon si ancienneté < 8 ans :
  Drag rachat = Plus-value × 0.322
Sinon :
  Abattement = 4600€ (célib.) ou 9200€ (couple)
  PV imposable = max(0, Plus-value - Abattement)
  Drag rachat = PV imposable × 0.247

// Drag fiscal PS annuels (fonds euros)
Montant FE = Valorisation × (% Fonds Euros)
Drag PS = Montant FE × 0.015 × 0.172

// Total drag fiscal
Drag total = Drag rachat + Drag PS

// Coût d'opportunité
Opportunité = Valorisation × 2%

TCO Total = Frais + Drag total + Opportunité
```

### Tableau évolution fiscalité

| Ancienneté | Célibataire | Couple | Économie couple |
|------------|-------------|--------|-----------------|
| < 4 ans    | 52.2%       | 52.2%  | -               |
| 4-8 ans    | 32.2%       | 32.2%  | -               |
| > 8 ans (10k€ PV) | 24.7% | 16.9% | 7.8 points |

**Stratégie** : Attendre 8 ans minimum avant rachat pour bénéficier de l'abattement.

---

## 4. Plan d'Épargne Retraite (PER)

### Règles fiscales

#### Avantage à l'entrée (CGI Art. 163 quatervicies)
- **Déduction IR** : Versements déductibles du revenu imposable
- **Plafond** : 10% des revenus professionnels (min 4 052€, max 32 909€ pour 2024)
- **Économie IR** : Versement déductible × TMI

**Exemple TMI 30%, revenus 60 000€** :
```
Plafond PER : min(60 000€ × 10%, 32 909€) = 6 000€
Versement : 6 000€
Économie IR : 6 000€ × 30% = 1 800€
Coût net : 6 000€ - 1 800€ = 4 200€
```

#### Sortie en capital (CGI Art. 163 quatervicies)
- **Imposition** : Barème progressif de l'IR
- **PS** : 17.2% (sur plus-values uniquement)

#### Sortie en rente (CGI Art. 158, 5)
- **Imposition** : Fraction imposable selon âge de liquidation
  - < 50 ans : 70%
  - 50-59 ans : 50%
  - 60-69 ans : 40%
  - ≥ 70 ans : 30%

### Calcul TCO PER

```typescript
// Frais de gestion
TER moyen : 1.2% (frais spécifiques retraite)
Frais annuels = Valorisation × 0.012

// Avantage fiscal entrée (économie IR)
Économie IR = min(Versement, Plafond) × TMI

// Drag fiscal sortie (estimé)
// Valorisation future = Versement × 2 (hypothèse)
Drag sortie = Valorisation future × TMI

// Coût d'opportunité
Opportunité = Valorisation × 1.5%

// TCO ajusté (hors économie IR entrée)
TCO = Frais + Opportunité
```

### Analyse rentabilité PER

Le PER est rentable si :
```
Économie IR entrée > (Frais cumulés + Drag sortie)
```

**Tableau selon TMI** :

| TMI | Économie 10k€ | Intérêt |
|-----|---------------|---------|
| 0%  | 0€            | ❌ Aucun |
| 11% | 1 100€        | ⚠️ Faible |
| 30% | 3 000€        | ✅ Bon |
| 41% | 4 100€        | ✅ Excellent |
| 45% | 4 500€        | ✅ Excellent |

**Recommandations** :
- **TMI ≥ 30%** : PER très avantageux, maximiser les versements
- **TMI 11%** : PER peu intéressant, privilégier PEA ou assurance-vie
- **TMI 0%** : PER inutile fiscalement

**Sortie optimale** :
- Si TMI retraite < TMI actuelle : sortie en capital
- Si revenus stables : sortie en rente (fraction imposable réduite)

---

## 5. Exemples Concrets

### Cas 1 : Jeune investisseur (TMI 11%, PEA 2 ans)

```
Situation :
- Célibataire, 30 ans, TMI 11%
- PEA : 50 000€, ouvert depuis 2 ans
- Plus-value latente : 5 000€

Calcul TCO :
- Frais : 50 000€ × 0.3% = 150€/an
- Drag fiscal : 5 000€ × (11% + 17.2%) = 1 410€
- Opportunité : 50 000€ × 1.5% = 750€
- TCO : 2 310€/an

Recommandation :
Conserver le PEA 3 ans de plus pour atteindre 5 ans d'ancienneté.
Économie future : 1 410€ - (5 000€ × 17.2%) = 550€/an
```

### Cas 2 : Cadre senior (TMI 41%, CTO vs PEA)

```
Situation :
- Marié, 45 ans, TMI 41%
- CTO : 100 000€, PV latente 20 000€
- PEA ancien (> 5 ans) : 80 000€, PV 15 000€

TCO CTO :
- Frais : 100 000€ × 0.2% = 200€
- Drag fiscal dividendes : (100k × 2%) × 30% = 600€
- Opportunité : 100 000€ × 1% = 1 000€
- TCO : 1 800€/an

TCO PEA :
- Frais : 80 000€ × 0.3% = 240€
- Drag fiscal (> 5 ans) : 15 000€ × 17.2% = 2 580€
- Opportunité : 80 000€ × 1.5% = 1 200€
- TCO : 4 020€/an

Recommandation :
Transférer 70k€ du CTO vers le PEA (dans limite plafond 150k€).
Économie estimée : 1 260€/an
```

### Cas 3 : Préparation retraite (TMI 30%, PER vs AV)

```
Situation :
- Couple, 50 ans, TMI 30%
- Revenus : 80 000€/an
- Capacité épargne : 10 000€/an

Option 1 : PER
- Versement : 10 000€
- Économie IR : 10 000€ × 30% = 3 000€
- Coût net : 7 000€
- Avantage : Déduction immédiate

Option 2 : Assurance-vie (> 8 ans)
- Versement : 10 000€
- Coût net : 10 000€
- Avantage : Abattement 9 200€ couple

Analyse 15 ans :
PER :
  Versements nets : 7 000€ × 15 = 105 000€
  Valorisation estimée : 180 000€
  Sortie capital TMI 30% : -54 000€
  Net final : 126 000€

AV :
  Versements : 10 000€ × 15 = 150 000€
  Valorisation estimée : 240 000€
  Rachat (PV 90k) : -(90k - 9.2k) × 24.7% = -20 000€
  Net final : 220 000€

Recommandation :
Panacher 60% AV / 40% PER pour optimiser fiscalité et liquidité.
```

---

## 6. Synthèse des Calculs

### Formule générale TCO

```
TCO = Frais de gestion + Drag fiscal + Coût d'opportunité

Où :
- Frais de gestion = TER × Valorisation
- Drag fiscal = fonction(Enveloppe, Ancienneté, TMI, Situation familiale)
- Coût d'opportunité = % × Valorisation (écart vs allocation optimale)
```

### TER moyens par enveloppe

| Enveloppe | TER moyen | Fourchette |
|-----------|-----------|------------|
| PEA       | 0.30%     | 0.10% - 0.80% |
| CTO       | 0.20%     | 0.05% - 0.50% |
| AV        | 1.50%     | 0.50% - 3.00% |
| PER       | 1.20%     | 0.50% - 2.50% |

### Taux effectifs fiscalité

| Enveloppe | Min | Max | Optimal |
|-----------|-----|-----|---------|
| PEA       | 17.2% (> 5 ans) | 62.2% (< 5 ans, TMI 45%) | > 5 ans |
| CTO       | 17.2% (TMI 0%, barème) | 30% (PFU) | TMI ≤ 11% barème |
| AV        | ~10% (> 8 ans, couple) | 52.2% (< 4 ans) | > 8 ans |
| PER       | Négatif (TMI 45%) | 0% (TMI 0%) | TMI ≥ 30% |

---

## 7. Sources et Conformité

### Références légales
- Code Général des Impôts : [www.legifrance.gouv.fr](https://www.legifrance.gouv.fr/)
- Bulletin Officiel des Finances Publiques (BOFiP)
- Loi de finances 2024

### Barèmes 2024
- Tranches IR : 0%, 11%, 30%, 41%, 45%
- Prélèvements sociaux : 17.2%
- PFU : 30%
- Plafonds PEA : 150 000€
- Plafonds PER : 10% revenus (min 4 052€, max 32 909€)
- Abattement AV > 8 ans : 4 600€ / 9 200€

### Mises à jour
Ce document est mis à jour annuellement selon la loi de finances en vigueur.

**Dernière mise à jour** : Janvier 2024
**Version** : 1.0

---

## Support

Pour toute question sur les calculs fiscaux ou leur implémentation technique, consulter :
- `frontend/lib/utils/fiscal-calculator.ts` : Fonctions de calcul
- `frontend/lib/constants/references-cgi.ts` : Références CGI
- `frontend/lib/types/situation-fiscale.ts` : Types TypeScript
