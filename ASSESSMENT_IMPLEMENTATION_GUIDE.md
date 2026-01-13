# Professional Client Assessment Workflow - Implementation Guide

## Overview
This document provides implementation guidance for the remaining pages of the Professional Client Assessment Workflow.

## Core Architecture ✅ COMPLETE

### 1. Types & Validation ✅
- **Location**: `frontend/lib/types/assessment.ts`
- **Validation**: `frontend/lib/validation/bilan-schemas.ts`
- All TypeScript interfaces defined for the 11-step workflow

### 2. Zustand Store ✅
- **Location**: `frontend/store/client-store.ts`
- Extended with complete assessment state management
- Methods for CRUD operations on all asset types
- Computed properties: `getPatrimoineBrut()`, `getPatrimoineNet()`, `getAllocation()`

### 3. Utility Functions ✅
- **Location**: `frontend/lib/utils/assessment/helpers.ts`
- Currency formatting, date parsing, performance calculations
- ISIN validation, TMI color coding

### 4. UI Components ✅
- Table, Label, Textarea components added to `components/ui/`
- Existing: Button, Card, Input, Select, Badge
- Design system: Midnight blue (#0F172A) + Gold (#F59E0B)

## Pages Implementation Status

### ✅ Phase 1: Initial Discovery
- **`/client/prise-connaissance/page.tsx`** - COMPLETE
  - Simple form with 4 select fields + notes
  - Saves to `assessment.prise_connaissance`
  - Routes to `/client/bilan/civil`

### 🔧 Phase 2: Bilan Patrimonial (To Implement)

#### `/client/bilan/civil/page.tsx`
**Purpose**: Detailed civil status with family information

**Key Features**:
- Personal info: nom, prénom, date_naissance, lieu_naissance, nationalité
- Family: situation_familiale, régime_matrimonial (conditional), date_mariage (conditional)
- **Dynamic children array**: Add/remove with `generateId()` from helpers
- Tax residency: residence_fiscale, pays (conditional)

**Implementation Pattern**:
```tsx
const [enfants, setEnfants] = useState<Enfant[]>([])

const addEnfant = () => {
  setEnfants([...enfants, {
    id: generateId(),
    prenom: '',
    date_naissance: new Date(),
    lien_filiation: 'Légitime'
  }])
}

const removeEnfant = (id: string) => {
  setEnfants(enfants.filter(e => e.id !== id))
}
```

#### `/client/bilan/fiscal/page.tsx`
**Purpose**: Comprehensive fiscal information

**Structure** (Multi-section collapsible):
1. **Revenus** (Income)
   - Salaires, BIC/BNC/BA, Fonciers (with sub-fields), Mobiliers (dividendes, intérêts)
   - Plus-values (mobilières, immobilières)
2. **Charges déductibles** (Deductions)
   - Pensions alimentaires, dons, emploi domicile
   - Investissements défiscalisation (Pinel, Malraux, Girardin)
3. **Fiscalité** (Taxes)
   - TMI selector with color-coding using `getTMIColor(tmi)`
   - IR année précédente, IFI, prélèvements sociaux
   - Nombre parts fiscales

**Auto-calculations**:
- `revenus_fonciers.revenus_nets = loyers_bruts - charges_deductibles`
- `revenus_mobiliers.total = dividendes + interets`

#### `/client/bilan/successoral/page.tsx`
**Purpose**: Estate planning and transmission

**Key Features**:
- Testament existence + conditional fields (type, date, notaire)
- **Dynamic donations array**: Similar to enfants pattern
- AV beneficiaries: Link to existing contracts via contrat_id
- Transmission objectives + free text

### 🔧 Phase 3: Asset Tracking (To Implement - CRITICAL)

#### `/client/patrimoine/liquidites/page.tsx`
**Purpose**: Liquid assets tracking

**Structure**:
- Comptes courants (dynamic array)
- Livret A, LDDS, LEP (fixed fields with montant + taux)
- Autres livrets (dynamic array)

**Total Calculation**:
Display sum of all liquidites at top of page using store's `getPatrimoineBrut()`

#### `/client/patrimoine/assurance-vie/page.tsx` 
**Purpose**: Life insurance contracts with detailed UC tracking

**CRITICAL REQUIREMENTS** (Template for Bourse page):
1. **Master Level**: List of contracts
   - Add/Edit/Delete contracts
   - Each contract shows: établissement, numéro, date_souscription, montant_total

2. **Detail Level**: Supports UC (Units of Account)
   - **Professional-grade table** with columns:
     - Nom support | ISIN | Catégorie | Montant investi | Valeur actuelle | Perf € | Perf % | Frais gestion % | Date achat | Actions
   - Add/Remove support lines dynamically
   - **Auto-calculate** contract-level totals:
     ```tsx
     const montant_total = montant_fonds_euro + supports_uc.reduce((sum, s) => sum + s.valeur_actuelle, 0)
     const performance_globale = supports_uc.reduce((sum, s) => sum + s.performance_euros, 0)
     ```

3. **Summary Cards**:
   - Total value (large, gold)
   - Total performance (€ and %)
   - Annual fees total

4. **UI Pattern**:
   ```tsx
   <Table className="bg-midnight-light">
     <TableHeader>
       <TableRow>
         <TableHead>Support</TableHead>
         {/* ... other headers ... */}
         <TableHead>Actions</TableHead>
       </TableRow>
     </TableHeader>
     <TableBody>
       {supports.map(support => (
         <TableRow key={support.id} className="hover:bg-midnight-lighter/50">
           {/* ... cells ... */}
           <TableCell>
             <Button variant="ghost" size="sm" onClick={() => removeSupport(support.id)}>
               <Trash2 className="w-4 h-4 text-red-400" />
             </Button>
           </TableCell>
         </TableRow>
       ))}
     </TableBody>
   </Table>
   ```

#### `/client/patrimoine/bourse/page.tsx` ⭐ **MOST CRITICAL**
**Purpose**: Securities accounts (PEA/CTO/PER) - SAME DETAIL AS AV

**MUST HAVE EXACT SAME STRUCTURE AS ASSURANCE-VIE**:

1. **Envelope Selector**: Choose PEA/CTO/PER type
2. **Account Header Card**: Similar to AV contract card
3. **Holdings Table** (LIKE A TRADING PLATFORM):

```tsx
<Table className="bg-[#1E293B]">
  <TableHead>
    <TableRow>
      <TableHeader>Support</TableHeader>
      <TableHeader>ISIN</TableHeader>
      <TableHeader>Type</TableHeader>
      <TableHeader>Qté</TableHeader>
      <TableHeader>PRU</TableHeader>
      <TableHeader>Cours</TableHeader>
      <TableHeader>Valeur</TableHeader>
      <TableHeader>+/- Value</TableHeader>
      <TableHeader>Perf %</TableHeader>
      <TableHeader>TER</TableHeader>
      <TableHeader></TableHeader>
    </TableRow>
  </TableHead>
  <TableBody>
    {supports.map(support => (
      <TableRow key={support.id}>
        <TableCell>
          <div>
            <p className="font-semibold">{support.nom}</p>
            <p className="text-xs text-gray-400">{support.zone_geo}</p>
          </div>
        </TableCell>
        <TableCell className="font-mono text-xs">{support.isin}</TableCell>
        <TableCell>
          <Badge variant={support.type === 'ETF' ? 'default' : 'secondary'}>
            {support.type}
          </Badge>
        </TableCell>
        <TableCell>{support.quantite}</TableCell>
        <TableCell>{formatCurrency(support.pru)}</TableCell>
        <TableCell>{formatCurrency(support.valeur_actuelle)}</TableCell>
        <TableCell className="font-semibold">
          {formatCurrency(support.valeur_totale_ligne)}
        </TableCell>
        <TableCell className={support.plus_value_latente_euros >= 0 ? 'text-green-400' : 'text-red-400'}>
          {formatCurrency(support.plus_value_latente_euros)}
        </TableCell>
        <TableCell className={support.plus_value_latente_pct >= 0 ? 'text-[#F59E0B]' : 'text-red-400'}>
          {support.plus_value_latente_pct >= 0 ? '+' : ''}{support.plus_value_latente_pct.toFixed(2)}%
        </TableCell>
        <TableCell>{support.frais_ter}%</TableCell>
        <TableCell>
          <Button variant="ghost" size="sm" onClick={() => removeLine(support.id)}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

4. **Add Support Modal/Form**:
   - Fields: nom, ISIN (with validation using `isValidISIN()`), type, zone_geo
   - Position: quantité, PRU, valeur_actuelle
   - **Auto-calculate**: 
     ```tsx
     valeur_totale_ligne = quantite * valeur_actuelle
     plus_value_latente_euros = valeur_totale_ligne - (quantite * pru)
     plus_value_latente_pct = ((valeur_actuelle - pru) / pru) * 100
     ```
   - Fees: TER%, courtage
   - Date achat

5. **Summary Cards** (3 cards in a row):
   - Total valorisé
   - Performance globale (€ and %)
   - Frais annuels totaux

6. **PER-Specific Fields** (conditional):
   - Déductibilité IR
   - Plafond déduction restant

#### `/client/patrimoine/immobilier/page.tsx`
**Purpose**: Real estate properties

**Structure**:
- Dynamic array of properties
- For each: type, adresse, valeur_venale
- **Conditional sections**:
  - If `pret.existe`: Show loan details (capital_restant_du, mensualité, taux, échéance)
  - If `type === 'Locatif'`: Show rental income breakdown
  - If `type === 'SCPI'`: Show SCPI-specific fields

#### `/client/patrimoine/societe/page.tsx`
**Purpose**: Corporate holdings (simplified, no Pacte Dutreil)

**Fields**:
- Raison sociale, forme juridique, % détention
- Valeur titres, dividendes annuels, date création

#### `/client/patrimoine/autres/page.tsx`
**Purpose**: Other assets (crypto, gold, art, vehicles)

**Structure**: 4 dynamic arrays (one for each category)

### 🔧 Phase 4: Synthesis (To Implement)

#### `/client/synthese/page.tsx`
**Purpose**: Complete wealth visualization

**Components**:
1. **Patrimoine Summary Card**:
   ```tsx
   const brut = getPatrimoineBrut()
   const net = getPatrimoineNet()
   const passifs = brut - net
   ```

2. **Allocation Pie Chart** (using Recharts):
   ```tsx
   import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
   
   const allocation = getAllocation()
   const data = [
     { name: 'Liquidités', value: allocation.liquidites },
     { name: 'Immobilier', value: allocation.immobilier },
     { name: 'Assurance-Vie', value: allocation.assurance_vie },
     { name: 'Enveloppes boursières', value: allocation.enveloppes_boursieres },
     { name: 'Sociétés IS', value: allocation.societes_is },
     { name: 'Autres actifs', value: allocation.autres_actifs },
   ]
   ```

3. **Breakdown Table**: All asset classes with amounts and %
4. **Fiscal Summary**: TMI, IR estimated, IFI if applicable
5. **Estate Planning Status**: Testament, donations, abattements
6. **Export Buttons**: PDF and Excel (placeholder buttons)

## Design System Reference

### Colors
```css
--midnight-blue: #0F172A
--midnight-blue-light: #1E293B
--midnight-blue-lighter: #334155
--gold: #F59E0B
--gold-dark: #D97706
--gold-light: #FCD34D
--cream: #FFFBEB
```

### Component Patterns

**Card**:
```tsx
<Card className="bg-midnight-light border-midnight-lighter">
  <CardHeader>
    <CardTitle className="text-white flex items-center gap-2">
      <Icon className="w-5 h-5 text-gold" />
      Titre
    </CardTitle>
  </CardHeader>
  <CardContent>{/* content */}</CardContent>
</Card>
```

**Button Gold**:
```tsx
<Button variant="gold" size="lg">
  Suivant →
</Button>
```

**Input with Label**:
```tsx
<div>
  <Label htmlFor="field">Label *</Label>
  <Input
    id="field"
    value={value}
    onChange={(e) => setValue(e.target.value)}
    required
    className="mt-1"
  />
</div>
```

## Navigation Flow

```
/client/prise-connaissance ✅
  ↓
/client/bilan/civil
  ↓
/client/bilan/fiscal
  ↓
/client/bilan/successoral
  ↓
/client/patrimoine/liquidites
  ↓
/client/patrimoine/assurance-vie
  ↓
/client/patrimoine/bourse ⭐ CRITICAL
  ↓
/client/patrimoine/immobilier
  ↓
/client/patrimoine/societe
  ↓
/client/patrimoine/autres
  ↓
/client/synthese
```

## Store Usage Examples

### Saving Data
```tsx
import { useClientStore } from '@/store/client-store'

const { setBilanCivil, addEnveloppeBourse, addSupportBourse } = useClientStore()

// Save civil status
setBilanCivil(formData)

// Add new bourse envelope
const newEnveloppe: EnveloppeBourse = {
  id: generateId(),
  type: 'PEA',
  // ... other fields
  supports: [],
  montant_total_valorise: 0,
  performance_globale_euros: 0,
  performance_globale_pct: 0,
  frais_annuels_totaux: 0,
  date_ouverture: new Date()
}
addEnveloppeBourse(newEnveloppe)

// Add support to existing envelope
addSupportBourse(enveloppeId, newSupport)
```

### Reading Data
```tsx
const { assessment, getPatrimoineBrut, getAllocation } = useClientStore()

const brut = getPatrimoineBrut()
const allocation = getAllocation()
const civilData = assessment.bilan_civil
```

## Testing Checklist

- [ ] All pages compile without errors
- [ ] Navigation flow works correctly
- [ ] Data persists in Zustand store
- [ ] Auto-calculations work correctly
- [ ] Dynamic arrays (add/remove) function properly
- [ ] Conditional fields show/hide correctly
- [ ] Mobile responsive layout
- [ ] All validations work
- [ ] Bourse page has SAME detail level as Assurance-Vie

## Priority Order for Implementation

1. **High Priority** (Core functionality):
   - `/client/bilan/civil/page.tsx` - Foundation for family info
   - `/client/patrimoine/bourse/page.tsx` ⭐ - Critical requirement
   - `/client/synthese/page.tsx` - Shows it all works

2. **Medium Priority** (Complete the flow):
   - `/client/bilan/fiscal/page.tsx` - Tax calculations
   - `/client/patrimoine/assurance-vie/page.tsx` - Template for Bourse
   - `/client/patrimoine/liquidites/page.tsx` - Simpler starting point

3. **Lower Priority** (Nice to have):
   - `/client/bilan/successoral/page.tsx` - Estate planning
   - `/client/patrimoine/immobilier/page.tsx` - Real estate
   - `/client/patrimoine/societe/page.tsx` - Corporate
   - `/client/patrimoine/autres/page.tsx` - Other assets
