# Conformité Juridique - Fiscal Lazy Portfolio Pro

## ⚖️ Cadre Légal et Réglementaire

Cette documentation détaille la conformité juridique de Fiscal Lazy Portfolio Pro avec le droit fiscal français.

### 📚 Références Légales Principales

#### 1. Plan d'Épargne en Actions (PEA)

**Code Général des Impôts - Article 150-0 A**

##### Plafond de Versements
- **PEA classique**: 150,000€ (Art. 150-0 A, I-1°)
- **PEA-PME**: 225,000€ (cumulable)

##### Éligibilité des Titres
Les titres éligibles au PEA doivent respecter (Art. 150-0 A, 2°):
- Actions de sociétés ayant leur siège dans l'UE/EEE
- Parts d'OPCVM/FCP investis à ≥75% en actions éligibles
- ETF domiciliés en UE investissant ≥75% en actions UE

##### Fiscalité des Retraits
- **Retrait avant 5 ans** (Art. 150-0 A, II-1°):
  - Clôture automatique du plan
  - Plus-values taxées à l'IR selon TMI
  - + Prélèvements sociaux 17.2%
  
- **Retrait après 5 ans** (Art. 150-0 A, II-5°):
  - Exonération totale d'impôt sur le revenu
  - Uniquement prélèvements sociaux 17.2%
  - Plan maintenu ouvert

**Implémentation dans la plateforme:**
```python
# backend/src/models/enveloppe.py - Classe PEA
def get_fiscalite_retrait(self, montant_retrait, tmi):
    anciennete = self.get_anciennete_annees()
    if anciennete < 5:
        # Taxation IR + PS + clôture
    else:
        # Exonération IR, uniquement PS
```

**Vérifications automatiques:**
- ✅ Contrôle plafond 150k€
- ✅ Vérification éligibilité ETFs (≥75% actions UE)
- ✅ Alerte si retrait <5 ans
- ✅ Calcul fiscal conforme CGI

---

#### 2. Assurance-Vie

**Code Général des Impôts - Articles 125-0 A et 990 I**

##### Fiscalité selon Ancienneté

**Contrat < 4 ans** (Art. 125-0 A, II-1°):
- Taxation: 35% OU IR (au choix) + 17.2% PS

**Contrat 4-8 ans** (Art. 125-0 A, II-2°):
- Taxation: 15% OU IR (au choix) + 17.2% PS

**Contrat > 8 ans** (Art. 125-0 A, II-5°):
- Taxation: 7.5% après abattement + 17.2% PS
- **Abattement annuel** (Art. 990 I):
  - 4,600€ (personne seule)
  - 9,200€ (couple marié/pacsé)

##### Cas Particuliers
- Versements avant 27/09/2017: ancien régime fiscal plus avantageux
- Versements après 150k€: taxation 12.8% au lieu de 7.5% (>8 ans)

**Implémentation:**
```python
# backend/src/legal/fiscal_rules.py
def calculer_fiscalite_av(montant_retrait, plus_value, 
                          anciennete_annees, tmi, couple):
    if anciennete_annees >= 8:
        abattement = 9200 if couple else 4600
        # Application abattement et taux 7.5%
```

---

#### 3. Compte-Titres Ordinaire (CTO)

**Code Général des Impôts - Article 200 A**

##### Prélèvement Forfaitaire Unique (PFU) - "Flat Tax"
- **Taux global**: 30% (Art. 200 A, 2)
  - Impôt sur le revenu: 12.8%
  - Prélèvements sociaux: 17.2%

##### Option pour le Barème Progressif
Le contribuable peut opter pour:
- Taxation au barème progressif de l'IR
- + Prélèvements sociaux 17.2%
- Option globale pour tous revenus du capital de l'année

##### Tax-Loss Harvesting
- Report des moins-values sur 10 ans (Art. 150-0 D, 12)
- Compensation gains/pertes de l'année
- Stratégie fiscale légale

**Implémentation:**
```python
# backend/src/optimization/tax_loss_harvesting.py
class TaxLossHarvester:
    def identifier_opportunites_tlh(positions_cto):
        # Identification positions en moins-value
        # Suggestion ETF de remplacement (éviter wash sale)
```

---

#### 4. Plan d'Épargne Retraite (PER)

**Code Général des Impôts - Article 163 quatervicies**

##### Déduction des Versements
- Versements déductibles du revenu imposable
- **Plafond**: 10% des revenus professionnels (max 35,194€ en 2024)
- Report plafonds non utilisés sur 3 ans

##### Fiscalité de Sortie
**Sortie en capital:**
- Versements déductibles: taxation à l'IR
- Plus-values: régime Assurance-Vie >8 ans

**Sortie en rente:**
- Taxation comme pension de retraite

**Cas de déblocage anticipé:**
- Achat résidence principale
- Décès du conjoint
- Invalidité
- Surendettement

---

#### 5. Sociétés à l'Impôt sur les Sociétés (IS)

**Code Général des Impôts - Article 209-0 A**
**BOFiP - IS-BASE-10-20-10**

##### OPCVM Actions (≥90% actions)
**Règles spécifiques** (Art. 209-0 A):
- Taxation **uniquement à la réalisation** (pas de mark-to-market)
- Pas de taxation latente annuelle
- Taux IS appliqué : 25% (ou 15% si PME)
- **IMPORTANT : PAS de QPFC 12%** (réservée aux titres de participation directs, pas aux OPCVM)

**Note critique :**
- La QPFC 12% (Quote-Part pour Frais et Charges - CGI Art. 219 I-a quinquies) ne s'applique qu'aux titres de participation détenus directement
- Les OPCVM/ETF ne bénéficient PAS de la QPFC, même avec détention >2 ans
- Taxation pleine à 25% (ou 15% PME) sur les plus-values réalisées

**Exemple (100% actions) :**
```
Plus-value réalisée: 100,000€
Taux IS: 25%
Impôt dû: 100,000 × 25% = 25,000€
(PAS de déduction QPFC 12%)
```

##### OPCVM Obligations (<90% actions)
- Taxation **annuelle des plus-values latentes** (mark-to-market)
- Très pénalisant : taxation même sans cession
- Taux IS : 25% (ou 15% si PME)
- Pas de QPFC applicable

**Exemple (0% actions) :**
```
Plus-value latente annuelle: 10,000€
Taux IS: 25%
Impôt annuel dû: 10,000 × 25% = 2,500€
(Taxation chaque année, même sans vente)
```

##### Optimisation pour obligations en société IS
- **Recommandation : Contrats de capitalisation**
- Évite la taxation latente annuelle
- Taxation différée à la sortie
- Plus avantageux que les OPCVM obligations

##### Comparaison seuils PEA vs IS

| Critère | PEA (Personne Physique) | Société IS |
|---------|-------------------------|------------|
| Seuil actions | ≥75% UE | ≥90% tous pays |
| Base légale | CGI 150-0 A | CGI 209-0 A |
| Exemple ETF 80% actions | ✅ Eligible PEA | ❌ Taxation latente IS |

##### Cas particulier : ETF 80% actions
- Eligible PEA (≥75%)
- NON eligible OPCVM Actions IS (<90%)
- Taxation latente annuelle en société IS
- Pénalisant pour les sociétés

##### Taux d'IS
- **Taux standard**: 25% (Art. 219, I)
- **Taux PME**: 15% sur premiers 38,120€ de bénéfice (Art. 219, I-b)
  - Conditions: CA <10M€, détenu ≥75% par personnes physiques

**Implémentation:**
```python
# backend/src/models/societe_is.py
class SocieteIS(BaseModel):
    def calcul_fiscalite_opcvm(self, isin, pourcentage_actions,
                               plus_value_latente, plus_value_realisee):
        # Seuil IS : 90% (pas 75%)
        is_opcvm_actions = pourcentage_actions >= 90.0
        
        if is_opcvm_actions:
            # Taxation à la réalisation
            # PAS de QPFC pour OPCVM
            impot = plus_value_realisee * (self.taux_is / 100)
        else:
            # Taxation latente annuelle
            impot = plus_value_latente * (self.taux_is / 100)
```

**Tests de validation:**
- ✅ `test_fiscalite_opcvm_actions_100_pourcent`
- ✅ `test_fiscalite_opcvm_actions_realisation`
- ✅ `test_fiscalite_opcvm_obligations_mark_to_market`
- ✅ `test_fiscalite_opcvm_80_pourcent_actions`
- ✅ `test_fiscalite_opcvm_90_pourcent_seuil`

---

### 🔍 Contrôles de Conformité Automatiques

#### Module ComplianceEngine
Le moteur de conformité vérifie automatiquement:

1. **PEA**:
   - Respect plafond 150k€
   - Éligibilité des ETFs (≥75% actions UE)
   - Alerte si retrait <5 ans

2. **Assurance-Vie**:
   - Optimisation fiscale selon ancienneté
   - Application correcte des abattements
   - Conseils sur timing retraits

3. **CTO**:
   - Détection opportunités tax-loss harvesting
   - Suggestion ETFs de remplacement

4. **Société IS**:
   - Vérification classification OPCVM (Actions vs Obligations)
   - Calcul QPFC si conditions remplies
   - Alerte taxation latente OPCVM Obligations

#### Génération de Rapports
```python
# backend/src/legal/compliance_engine.py
engine = ComplianceEngine()
rapport = engine.generer_rapport_conformite(enveloppes, positions, etfs_db)
```

Le rapport inclut:
- ✅ Statut de conformité (Conforme / Non conforme)
- ⚠️ Alertes critiques (actions requises)
- 💡 Avertissements (optimisations possibles)
- 📋 Recommandations d'actions

---

### 📖 Sources Officielles

#### Base de Connaissance Légale Intégrée

**Code Général des Impôts (CGI):**
- Disponible sur Légifrance
- Extraits intégrés: `data/legal/cgi_extracts.json`
- 7 articles principaux documentés

**Bulletin Officiel des Finances Publiques (BOFiP):**
- Doctrine administrative
- 5 références intégrées: `data/legal/bofip_updates.json`

**Jurisprudence:**
- Conseil d'État
- Cour de Cassation
- 5 décisions référencées: `data/legal/jurisprudence.json`

---

### ⚠️ Disclaimer Légal

**AVERTISSEMENT IMPORTANT:**

Ce logiciel est fourni à titre **informatif et éducatif uniquement**. Il ne constitue **en aucun cas**:
- Un conseil financier personnalisé
- Un conseil juridique
- Un conseil fiscal
- Une recommandation d'investissement

**Responsabilités:**
- Les utilisateurs doivent **consulter des experts-comptables qualifiés** avant toute décision
- Les calculs fiscaux sont indicatifs et peuvent nécessiter validation
- Le droit fiscal évolue: vérifier la législation en vigueur
- Les développeurs ne sont **pas responsables** des pertes financières ou problèmes juridiques

**Public cible:**
Ce logiciel est destiné aux **experts-comptables professionnels** qui possèdent:
- Les connaissances juridiques nécessaires
- La capacité d'interpréter et valider les résultats
- La responsabilité professionnelle adéquate

---

### ✅ Certification de Conformité

**Version**: 1.0.0  
**Date de révision**: Janvier 2026  
**Législation applicable**: Droit fiscal français 2024-2026

**Validation:**
- ✅ CGI Art. 150-0 A (PEA): Conforme
- ✅ CGI Art. 125-0 A, 990 I (AV): Conforme
- ✅ CGI Art. 200 A (CTO): Conforme
- ✅ CGI Art. 163 quatervicies (PER): Conforme
- ✅ CGI Art. 209-0 A (Société IS): **Conforme - Corrections critiques appliquées**

**Tests de non-régression:**
- 19 tests unitaires validant la conformité juridique
- Tests spécifiques seuil 90% OPCVM Actions IS
- Tests absence QPFC 12% pour OPCVM
- Tests cas limites (80% actions, 90% seuil exact)
- Vérifications automatiques dans CI/CD

---

**Contact légal**: Pour toute question juridique, consulter un avocat fiscaliste ou expert-comptable inscrit à l'Ordre des Experts-Comptables.

**Mise à jour**: Cette documentation doit être révisée à chaque modification législative (Loi de Finances, etc.).
