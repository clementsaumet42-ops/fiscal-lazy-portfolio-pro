# 🎯 Intégration de l'Audit de l'Épargne - Documentation d'Implémentation

## 📋 Vue d'Ensemble

Cette implémentation intègre directement l'audit de l'épargne dans le workflow du bilan patrimonial pour les enveloppes AV, CTO, PEA et PER. Le système permet l'upload de relevés PDF, la saisie manuelle ligne par ligne, et le calcul automatique du TCO (Total Cost of Ownership).

## 🏗️ Architecture Implémentée

### Workflow en 3 Étapes

```
1. BILAN PATRIMONIAL (Vue d'ensemble)
   ↓ Clic sur bouton "Analyser" pour une enveloppe
2. DÉTAIL ENVELOPPE (avec upload PDF + saisie manuelle)
   ↓ Validation
3. CALCUL TCO AUTOMATIQUE (frais + drag fiscal + coût d'opportunité)
```

## 📁 Fichiers Créés/Modifiés

### 1. Nouveaux Types TypeScript

**Fichier**: `frontend/lib/types/bilan-audit.ts`

Types créés:
- `LigneAudit`: Représente une ligne de placement avec ISIN, nom, quantité, PRU, cours actuel, valorisation, plus-value latente
- `DocumentAudit`: Métadonnées pour les documents uploadés (PDF, Excel, CSV)
- `TCOCalculation`: Résultats du calcul TCO (frais, drag fiscal, coût d'opportunité, total)
- `PEAAvecAudit`, `CTOAvecAudit`, `AssuranceVieAvecAudit`, `PERAvecAudit`: Enveloppes enrichies avec données d'audit

### 2. Calculateur TCO

**Fichier**: `frontend/lib/utils/tco-calculator.ts`

Fonctions:
- `calculateTCO()`: Calcule le TCO basé sur le type d'enveloppe et les lignes
  - Frais de gestion moyens: PEA 0.3%, CTO 0.2%, AV 1.5%, PER 1.2%
  - Drag fiscal: CTO 30% flat tax sur dividendes estimés, AV 17.2% sur fonds euros
  - Coût d'opportunité: 2% de différence vs ETF optimal
- `formatTCOSummary()`: Formatte le TCO pour affichage

### 3. Store Zustand Enrichi

**Fichier**: `frontend/store/client-store.ts`

Nouvelles méthodes:
- `updatePEAAudit(id, audit)`: Met à jour l'audit d'un PEA
- `updateCTOAudit(id, audit)`: Met à jour l'audit d'un CTO
- `updateAVAudit(id, audit)`: Met à jour l'audit d'une Assurance-vie
- `updatePERAudit(id, audit)`: Met à jour l'audit d'un PER

Chaque méthode:
- Trouve l'enveloppe par ID
- Fusionne les données d'audit (lignes, document, TCO)
- Persiste automatiquement via `zustand/persist` dans localStorage

### 4. Page Patrimoine Améliorée

**Fichier**: `frontend/app/client/bilan/patrimoine/page.tsx`

Modifications:
- Import de `generateId()` pour créer des IDs uniques
- Import des icônes `CheckCircle` et `Pencil`
- Ajout d'IDs uniques lors de la création de nouvelles enveloppes
- Ajout de boutons "Analyser" pour chaque enveloppe PEA/CTO/AV/PER
- Affichage conditionnel:
  - Badge "Audité ✓" (variant="default") si `lignes.length > 0`
  - Bouton "Analyser" (variant="outline") sinon
- Ajout des sections CTO et PER qui étaient manquantes dans l'UI

### 5. Page d'Audit Complète

**Fichier**: `frontend/app/client/bilan/patrimoine/audit/[type]/[id]/page.tsx`

Structure de la page:

#### Étape 1: Upload de Document
- Zone de drag & drop pour PDF/Excel/CSV
- Affichage du document uploadé avec nom et date
- Bouton pour supprimer le document
- Note explicative pour le MVP (OCR en V2)
- Bouton pour passer à la saisie manuelle

#### Étape 2: Saisie Manuelle
- Tableau éditable avec colonnes:
  - ISIN (optionnel)
  - Nom du titre
  - Quantité
  - PRU (Prix de Revient Unitaire)
  - Cours actuel
  - Valorisation (calculée automatiquement)
  - +/- Value (calculée automatiquement)
  - Actions (bouton supprimer)
- Bouton "Ajouter une ligne"
- Auto-calcul en temps réel:
  - `valorisation = quantite * cours_actuel`
  - `plus_value_latente = (cours_actuel - pru) * quantite`
- Total valorisation et total +/- value en pied de tableau

#### Étape 3: TCO Calculé Automatiquement
- Affichage en grille 2x2 avec 4 métriques:
  - Frais de gestion annuels
  - Drag fiscal annuel
  - Coût d'opportunité
  - TCO Total (mis en évidence avec gradient bleu)
- Note explicative sur le calcul TCO
- Mise à jour en temps réel à chaque modification

#### Actions
- Bouton "Annuler": Retour sans sauvegarder
- Bouton "Valider l'audit": Sauvegarde dans le store + calcul TCO + retour

### 6. Types de Bilan Enrichis

**Fichier**: `frontend/lib/types/bilan.ts`

Modifications:
- Import des types d'audit (`LigneAudit`, `DocumentAudit`, `TCOCalculation`)
- Ajout de champs optionnels dans `PatrimoineExistant.placements_financiers`:
  - `id?: string`: Identifiant unique de l'enveloppe
  - `lignes?: LigneAudit[]`: Lignes d'audit saisies
  - `document?: DocumentAudit`: Document uploadé
  - `tco?: TCOCalculation`: Résultat du calcul TCO

## 🎨 Design & UX

### Palette de Couleurs
- Midnight Blue (#1e3a8a): Couleur principale
- Gold (#d4af37): Accents
- Blue-50 à Blue-600: Dégradés pour les cards
- Green: Indicateurs positifs (audité, plus-values)
- Red: Indicateurs négatifs (moins-values)
- Yellow: Alertes et notes

### Composants Utilisés
- `Card`, `CardHeader`, `CardTitle`, `CardContent`: Structure
- `Button`: Actions (variants: default, outline)
- `Input`: Saisie de données
- Icons Lucide: `Upload`, `Plus`, `Trash2`, `Save`, `CheckCircle`, `Pencil`, `ArrowLeft`, `AlertCircle`, `FileText`, `X`

### Responsive Design
- Grille responsive pour les métriques TCO (1 col mobile, 2 cols desktop)
- Tableau avec scroll horizontal pour les petits écrans
- Boutons adaptés aux différentes tailles d'écran

## 🔄 Flux de Données

### 1. Ajout d'une Enveloppe
```typescript
// Page patrimoine
setFormData(prev => ({
  ...prev,
  placements_financiers: {
    ...prev.placements_financiers,
    pea: [...prev.placements_financiers.pea, { 
      id: generateId(), // ID unique généré
      etablissement: '', 
      montant: 0 
    }]
  }
}))
```

### 2. Navigation vers l'Audit
```typescript
router.push(`/client/bilan/patrimoine/audit/pea/${pea.id}`)
// Route dynamique: [type]/[id]
```

### 3. Sauvegarde de l'Audit
```typescript
const tco = calculateTCO(lignes, 'PEA')
const audit = { lignes, document, tco }
updatePEAAudit(id, audit)
router.back()
```

### 4. Persistance Automatique
- Zustand avec middleware `persist`
- Stockage dans `localStorage`
- Récupération automatique au rechargement

## 📊 Calcul du TCO

### Formule Globale
```
TCO Total = Frais Gestion + Drag Fiscal + Coût Opportunité
```

### Détails par Enveloppe

#### PEA
- Frais gestion: 0.3% de la valorisation
- Drag fiscal: 0€ (fiscalité avantageuse après 5 ans)
- Coût opportunité: 2% de la valorisation

#### CTO
- Frais gestion: 0.2% de la valorisation
- Drag fiscal: 30% flat tax sur 2% de dividendes estimés = 0.6%
- Coût opportunité: 2% de la valorisation

#### Assurance-vie
- Frais gestion: 1.5% de la valorisation
- Drag fiscal: 17.2% prélèvements sociaux sur 1.5% fonds euros = 0.258%
- Coût opportunité: 2% de la valorisation

#### PER
- Frais gestion: 1.2% de la valorisation
- Drag fiscal: 0€ (sortie en rente ou capital)
- Coût opportunité: 2% de la valorisation

### Exemple de Calcul
```typescript
// Portefeuille CTO de 100 000€
Frais gestion: 100 000 * 0.002 = 200€
Drag fiscal: 100 000 * 0.02 * 0.30 = 600€
Coût opportunité: 100 000 * 0.02 = 2 000€
TCO Total: 2 800€/an
```

## 🧪 Tests Manuels Recommandés

### Checklist de Test

1. **Création d'Enveloppe**
   - [ ] Créer un PEA avec établissement et montant
   - [ ] Vérifier que le bouton "Analyser" apparaît
   - [ ] Vérifier que l'ID est bien généré

2. **Navigation vers l'Audit**
   - [ ] Cliquer sur "Analyser"
   - [ ] Vérifier la redirection vers `/audit/pea/{id}`
   - [ ] Vérifier le titre "Audit PEA"

3. **Upload de Document**
   - [ ] Uploader un PDF
   - [ ] Vérifier l'affichage du nom et date
   - [ ] Supprimer le document
   - [ ] Vérifier la réinitialisation

4. **Saisie Manuelle**
   - [ ] Ajouter 3 lignes
   - [ ] Saisir ISIN, nom, quantité, PRU, cours actuel
   - [ ] Vérifier calcul auto de valorisation
   - [ ] Vérifier calcul auto de plus-value
   - [ ] Supprimer une ligne
   - [ ] Vérifier mise à jour des totaux

5. **Calcul TCO**
   - [ ] Vérifier affichage des 4 métriques
   - [ ] Modifier une ligne
   - [ ] Vérifier recalcul automatique du TCO

6. **Sauvegarde**
   - [ ] Cliquer sur "Valider l'audit"
   - [ ] Vérifier retour à la page patrimoine
   - [ ] Vérifier badge "Audité ✓" sur l'enveloppe

7. **Modification d'Audit**
   - [ ] Cliquer à nouveau sur "Audité"
   - [ ] Vérifier chargement des lignes existantes
   - [ ] Vérifier chargement du document
   - [ ] Modifier les lignes
   - [ ] Valider et vérifier persistance

8. **Persistance**
   - [ ] Rafraîchir la page
   - [ ] Vérifier que l'audit est toujours présent
   - [ ] Vérifier le badge "Audité ✓"

9. **Tests Multi-Enveloppes**
   - [ ] Répéter avec CTO
   - [ ] Répéter avec Assurance-vie
   - [ ] Répéter avec PER
   - [ ] Vérifier que les TCO diffèrent selon le type

## 🚀 Évolutions Futures

### V2: OCR Automatique
- Intégration de PyPDF2 ou Tesseract
- Extraction automatique des lignes depuis PDF
- Pré-remplissage du tableau

### V3: API d'Agrégateurs
- Connexion Budget Insight / Linxo
- Import automatique des positions
- Synchronisation temps réel

### V4: Alertes Intelligentes
- Détection frais trop élevés
- Comparaison avec benchmarks
- Suggestions d'optimisation

### V5: Comparateur
- Comparaison avec courtiers low-cost
- Simulation économies potentielles
- Recommandations personnalisées

## 📝 Notes Techniques

### Gestion des IDs
- Utilisation de `generateId()` pour éviter les collisions
- Format: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
- IDs persistés dans le store Zustand

### Routage Dynamique Next.js
- Pattern: `[type]/[id]`
- Types acceptés: pea, cto, av, per
- ID: identifiant unique de l'enveloppe

### TypeScript
- Interfaces strictes pour type safety
- Types optionnels pour rétrocompatibilité
- Union types pour enveloppe_type

### Performance
- Calculs TCO en temps réel (lightweight)
- Pas de debounce nécessaire
- Store Zustand optimisé

## 🎓 Utilisation

### Pour Ajouter une Nouvelle Enveloppe à Auditer

1. Créer les types dans `bilan-audit.ts`
2. Ajouter la méthode `updateXXXAudit` dans le store
3. Ajouter la section dans la page patrimoine
4. Le routage dynamique gère automatiquement le type

### Pour Modifier le Calcul TCO

Éditer `frontend/lib/utils/tco-calculator.ts`:
```typescript
const fraisGestionMoyens = {
  PEA: 0.003,  // Modifier ici
  CTO: 0.002,
  AV: 0.015,
  PER: 0.012,
}
```

## ✅ Résultat Final

L'intégration est complète et fonctionnelle:
- ✅ Types TypeScript créés
- ✅ Calculateur TCO implémenté
- ✅ Store Zustand enrichi
- ✅ Page patrimoine mise à jour
- ✅ Page d'audit complète créée
- ✅ Navigation dynamique configurée
- ✅ Persistance automatique active

Le workflow complet permet maintenant:
1. De créer une enveloppe (PEA/CTO/AV/PER)
2. De l'auditer en détail avec saisie manuelle
3. De calculer le TCO automatiquement
4. De sauvegarder et visualiser le statut "Audité"
5. De modifier l'audit à tout moment
