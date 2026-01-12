import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { ClientState, ProfilClient, EnveloppeConfig, Allocation, OptimisationResult, BacktestResult } from '@/lib/types'
import { AuditState, DocumentImporte, AnalyseExistant, OptimisationProposee, PlacementExistant, DiagnosticAudit } from '@/lib/types/audit'
import { BilanPatrimonial, SituationPersonnelle, RevenusCharges, PatrimoineExistant, ObjectifsPatrimoniaux } from '@/lib/types/bilan'
import { RecommandationsState, ComparaisonAllocation, PlanAction } from '@/lib/types/recommandations'

interface ClientStore extends ClientState {
  // Workflow classique
  setProfil: (profil: ProfilClient) => void
  setEnveloppes: (enveloppes: EnveloppeConfig[]) => void
  setAllocation: (allocation: Allocation) => void
  setOptimisation: (optimisation: OptimisationResult) => void
  setBacktest: (backtest: BacktestResult) => void
  nextEtape: () => void
  prevEtape: () => void
  reset: () => void
  
  // Workflow bilan patrimonial
  bilan: BilanPatrimonial
  setSituation: (situation: SituationPersonnelle) => void
  setRevenus: (revenus: RevenusCharges) => void
  setPatrimoine: (patrimoine: PatrimoineExistant) => void
  setObjectifs: (objectifs: ObjectifsPatrimoniaux) => void
  setBilan: (bilan: Partial<BilanPatrimonial>) => void
  resetBilan: () => void
  
  // Workflow audit
  audit: AuditState
  addDocument: (doc: DocumentImporte) => void
  removeDocument: (id: string) => void
  updateDocument: (id: string, updates: Partial<DocumentImporte>) => void
  addPlacement: (placement: PlacementExistant) => void
  removePlacement: (id: string) => void
  setAnalyse: (analyse: AnalyseExistant) => void
  setDiagnostic: (diagnostic: DiagnosticAudit) => void
  setOptimisationAudit: (optimisation: OptimisationProposee) => void
  resetAudit: () => void
  
  // Recommandations
  recommandations: RecommandationsState
  setComparaison: (comparaison: ComparaisonAllocation) => void
  setPlanAction: (plan: PlanAction) => void
  validerAction: (actionId: string) => void
  realiserAction: (actionId: string) => void
  resetRecommandations: () => void
}

const initialState: ClientState = {
  profil: null,
  enveloppes: [],
  allocation: null,
  optimisation: null,
  backtest: null,
  etape_actuelle: 1,
}

const initialAuditState: AuditState = {
  documents: [],
  placements: [],
  analyse: undefined,
  diagnostic: undefined,
  optimisation: undefined,
}

const initialBilanState: BilanPatrimonial = {
  situation: null,
  revenus: null,
  patrimoine: null,
  objectifs: null,
}

const initialRecommandationsState: RecommandationsState = {
  comparaison: null,
  plan_action: null,
  actions_validees: [],
  actions_realisees: [],
}

export const useClientStore = create<ClientStore>()(
  persist(
    (set) => ({
      ...initialState,
      audit: initialAuditState,
      bilan: initialBilanState,
      recommandations: initialRecommandationsState,
  
  // Workflow classique
  setProfil: (profil) => set({ profil }),
  
  setEnveloppes: (enveloppes) => set({ enveloppes }),
  
  setAllocation: (allocation) => set({ allocation }),
  
  setOptimisation: (optimisation) => set({ optimisation }),
  
  setBacktest: (backtest) => set({ backtest }),
  
  nextEtape: () => set((state) => ({ 
    etape_actuelle: Math.min(state.etape_actuelle + 1, 6) 
  })),
  
  prevEtape: () => set((state) => ({ 
    etape_actuelle: Math.max(state.etape_actuelle - 1, 1) 
  })),
  
  reset: () => set({ ...initialState, audit: initialAuditState, bilan: initialBilanState, recommandations: initialRecommandationsState }),
  
  // Workflow bilan patrimonial
  setSituation: (situation) => set((state) => ({
    bilan: { ...state.bilan, situation, date_modification: new Date() }
  })),
  
  setRevenus: (revenus) => set((state) => ({
    bilan: { ...state.bilan, revenus, date_modification: new Date() }
  })),
  
  setPatrimoine: (patrimoine) => set((state) => ({
    bilan: { ...state.bilan, patrimoine, date_modification: new Date() }
  })),
  
  setObjectifs: (objectifs) => set((state) => ({
    bilan: { ...state.bilan, objectifs, date_modification: new Date() }
  })),
  
  setBilan: (bilan) => set((state) => ({
    bilan: { 
      ...state.bilan, 
      ...bilan,
      date_modification: new Date()
    }
  })),
  
  resetBilan: () => set({ bilan: initialBilanState }),
  
  // Workflow audit
  addDocument: (doc) => set((state) => ({
    audit: {
      ...state.audit,
      documents: [...state.audit.documents, doc],
    }
  })),
  
  removeDocument: (id) => set((state) => ({
    audit: {
      ...state.audit,
      documents: state.audit.documents.filter(d => d.id !== id),
    }
  })),
  
  updateDocument: (id, updates) => set((state) => ({
    audit: {
      ...state.audit,
      documents: state.audit.documents.map(d => 
        d.id === id ? { ...d, ...updates } : d
      ),
    }
  })),
  
  addPlacement: (placement) => set((state) => ({
    audit: {
      ...state.audit,
      placements: [...(state.audit.placements || []), placement],
    }
  })),
  
  removePlacement: (id) => set((state) => ({
    audit: {
      ...state.audit,
      placements: (state.audit.placements || []).filter(p => p.id !== id),
    }
  })),
  
  setAnalyse: (analyse) => set((state) => ({
    audit: {
      ...state.audit,
      analyse,
    }
  })),
  
  setDiagnostic: (diagnostic) => set((state) => ({
    audit: {
      ...state.audit,
      diagnostic,
    }
  })),
  
  setOptimisationAudit: (optimisation) => set((state) => ({
    audit: {
      ...state.audit,
      optimisation,
    }
  })),
  
  resetAudit: () => set((state) => ({
    audit: initialAuditState,
  })),
  
  // Recommandations
  setComparaison: (comparaison) => set((state) => ({
    recommandations: {
      ...state.recommandations,
      comparaison,
    }
  })),
  
  setPlanAction: (plan_action) => set((state) => ({
    recommandations: {
      ...state.recommandations,
      plan_action,
    }
  })),
  
  validerAction: (actionId) => set((state) => ({
    recommandations: {
      ...state.recommandations,
      actions_validees: [...state.recommandations.actions_validees, actionId],
    }
  })),
  
  realiserAction: (actionId) => set((state) => ({
    recommandations: {
      ...state.recommandations,
      actions_realisees: [...state.recommandations.actions_realisees, actionId],
    }
  })),
  
  resetRecommandations: () => set({ recommandations: initialRecommandationsState }),
}),
    {
      name: 'fiscal-lazy-portfolio-storage',
      version: 1,
    }
  )
)
