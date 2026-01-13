import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { ClientState, ProfilClient, EnveloppeConfig, Allocation, OptimisationResult, BacktestResult } from '@/lib/types'
import { AuditState, DocumentImporte, AnalyseExistant, OptimisationProposee, PlacementExistant, DiagnosticAudit } from '@/lib/types/audit'
import { BilanPatrimonial, SituationPersonnelle, RevenusCharges, PatrimoineExistant, ObjectifsPatrimoniaux } from '@/lib/types/bilan'
import { RecommandationsState, ComparaisonAllocation, PlanAction } from '@/lib/types/recommandations'
import { 
  ClientAssessment, 
  PriseConnaissance, 
  BilanCivil, 
  BilanFiscal, 
  BilanSuccessoral,
  Liquidites,
  ContratAssuranceVie,
  SupportUC,
  EnveloppeBourse,
  SupportBourse,
  BienImmobilier,
  SocieteIS,
  AutresActifs,
  AllocationGlobale
} from '@/lib/types/assessment'

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
  
  // Professional Assessment Workflow
  assessment: ClientAssessment
  setPriseConnaissance: (data: PriseConnaissance) => void
  setBilanCivil: (data: BilanCivil) => void
  setBilanFiscal: (data: BilanFiscal) => void
  setBilanSuccessoral: (data: BilanSuccessoral) => void
  setLiquidites: (data: Liquidites) => void
  addAssuranceVie: (contrat: ContratAssuranceVie) => void
  updateAssuranceVie: (id: string, data: Partial<ContratAssuranceVie>) => void
  removeAssuranceVie: (id: string) => void
  addSupportAV: (contratId: string, support: SupportUC) => void
  removeSupportAV: (contratId: string, supportId: string) => void
  addEnveloppeBourse: (enveloppe: EnveloppeBourse) => void
  updateEnveloppeBourse: (id: string, data: Partial<EnveloppeBourse>) => void
  removeEnveloppeBourse: (id: string) => void
  addSupportBourse: (enveloppeId: string, support: SupportBourse) => void
  removeSupportBourse: (enveloppeId: string, supportId: string) => void
  addBienImmobilier: (bien: BienImmobilier) => void
  updateBienImmobilier: (id: string, data: Partial<BienImmobilier>) => void
  removeBienImmobilier: (id: string) => void
  addSocieteIS: (societe: SocieteIS) => void
  updateSocieteIS: (id: string, data: Partial<SocieteIS>) => void
  removeSocieteIS: (id: string) => void
  setAutresActifs: (data: AutresActifs) => void
  getPatrimoineBrut: () => number
  getPatrimoineNet: () => number
  getAllocation: () => AllocationGlobale
  resetAssessment: () => void
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

const initialAssessmentState: ClientAssessment = {
  prise_connaissance: null,
  bilan_civil: null,
  bilan_fiscal: null,
  bilan_successoral: null,
  liquidites: null,
  assurances_vie: [],
  enveloppes_bourse: [],
  biens_immobiliers: [],
  societes_is: [],
  autres_actifs: null,
}

export const useClientStore = create<ClientStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      audit: initialAuditState,
      bilan: initialBilanState,
      recommandations: initialRecommandationsState,
      assessment: initialAssessmentState,
  
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
  
  // Professional Assessment Workflow
  setPriseConnaissance: (data) => set((state) => ({
    assessment: {
      ...state.assessment,
      prise_connaissance: data,
      date_modification: new Date(),
    }
  })),
  
  setBilanCivil: (data) => set((state) => ({
    assessment: {
      ...state.assessment,
      bilan_civil: data,
      date_modification: new Date(),
    }
  })),
  
  setBilanFiscal: (data) => set((state) => ({
    assessment: {
      ...state.assessment,
      bilan_fiscal: data,
      date_modification: new Date(),
    }
  })),
  
  setBilanSuccessoral: (data) => set((state) => ({
    assessment: {
      ...state.assessment,
      bilan_successoral: data,
      date_modification: new Date(),
    }
  })),
  
  setLiquidites: (data) => set((state) => ({
    assessment: {
      ...state.assessment,
      liquidites: data,
      date_modification: new Date(),
    }
  })),
  
  addAssuranceVie: (contrat) => set((state) => ({
    assessment: {
      ...state.assessment,
      assurances_vie: [...state.assessment.assurances_vie, contrat],
      date_modification: new Date(),
    }
  })),
  
  updateAssuranceVie: (id, data) => set((state) => ({
    assessment: {
      ...state.assessment,
      assurances_vie: state.assessment.assurances_vie.map(av =>
        av.id === id ? { ...av, ...data } : av
      ),
      date_modification: new Date(),
    }
  })),
  
  removeAssuranceVie: (id) => set((state) => ({
    assessment: {
      ...state.assessment,
      assurances_vie: state.assessment.assurances_vie.filter(av => av.id !== id),
      date_modification: new Date(),
    }
  })),
  
  addSupportAV: (contratId, support) => set((state) => ({
    assessment: {
      ...state.assessment,
      assurances_vie: state.assessment.assurances_vie.map(av =>
        av.id === contratId
          ? { ...av, supports_uc: [...av.supports_uc, support] }
          : av
      ),
      date_modification: new Date(),
    }
  })),
  
  removeSupportAV: (contratId, supportId) => set((state) => ({
    assessment: {
      ...state.assessment,
      assurances_vie: state.assessment.assurances_vie.map(av =>
        av.id === contratId
          ? { ...av, supports_uc: av.supports_uc.filter(s => s.id !== supportId) }
          : av
      ),
      date_modification: new Date(),
    }
  })),
  
  addEnveloppeBourse: (enveloppe) => set((state) => ({
    assessment: {
      ...state.assessment,
      enveloppes_bourse: [...state.assessment.enveloppes_bourse, enveloppe],
      date_modification: new Date(),
    }
  })),
  
  updateEnveloppeBourse: (id, data) => set((state) => ({
    assessment: {
      ...state.assessment,
      enveloppes_bourse: state.assessment.enveloppes_bourse.map(env =>
        env.id === id ? { ...env, ...data } : env
      ),
      date_modification: new Date(),
    }
  })),
  
  removeEnveloppeBourse: (id) => set((state) => ({
    assessment: {
      ...state.assessment,
      enveloppes_bourse: state.assessment.enveloppes_bourse.filter(env => env.id !== id),
      date_modification: new Date(),
    }
  })),
  
  addSupportBourse: (enveloppeId, support) => set((state) => ({
    assessment: {
      ...state.assessment,
      enveloppes_bourse: state.assessment.enveloppes_bourse.map(env =>
        env.id === enveloppeId
          ? { ...env, supports: [...env.supports, support] }
          : env
      ),
      date_modification: new Date(),
    }
  })),
  
  removeSupportBourse: (enveloppeId, supportId) => set((state) => ({
    assessment: {
      ...state.assessment,
      enveloppes_bourse: state.assessment.enveloppes_bourse.map(env =>
        env.id === enveloppeId
          ? { ...env, supports: env.supports.filter(s => s.id !== supportId) }
          : env
      ),
      date_modification: new Date(),
    }
  })),
  
  addBienImmobilier: (bien) => set((state) => ({
    assessment: {
      ...state.assessment,
      biens_immobiliers: [...state.assessment.biens_immobiliers, bien],
      date_modification: new Date(),
    }
  })),
  
  updateBienImmobilier: (id, data) => set((state) => ({
    assessment: {
      ...state.assessment,
      biens_immobiliers: state.assessment.biens_immobiliers.map(bien =>
        bien.id === id ? { ...bien, ...data } : bien
      ),
      date_modification: new Date(),
    }
  })),
  
  removeBienImmobilier: (id) => set((state) => ({
    assessment: {
      ...state.assessment,
      biens_immobiliers: state.assessment.biens_immobiliers.filter(bien => bien.id !== id),
      date_modification: new Date(),
    }
  })),
  
  addSocieteIS: (societe) => set((state) => ({
    assessment: {
      ...state.assessment,
      societes_is: [...state.assessment.societes_is, societe],
      date_modification: new Date(),
    }
  })),
  
  updateSocieteIS: (id, data) => set((state) => ({
    assessment: {
      ...state.assessment,
      societes_is: state.assessment.societes_is.map(soc =>
        soc.id === id ? { ...soc, ...data } : soc
      ),
      date_modification: new Date(),
    }
  })),
  
  removeSocieteIS: (id) => set((state) => ({
    assessment: {
      ...state.assessment,
      societes_is: state.assessment.societes_is.filter(soc => soc.id !== id),
      date_modification: new Date(),
    }
  })),
  
  setAutresActifs: (data) => set((state) => ({
    assessment: {
      ...state.assessment,
      autres_actifs: data,
      date_modification: new Date(),
    }
  })),
  
  getPatrimoineBrut: () => {
    const a = get().assessment
    
    let total = 0
    
    // Liquidités
    if (a.liquidites) {
      total += a.liquidites.comptes_courants.reduce((sum: number, c) => sum + c.montant, 0)
      total += a.liquidites.livret_a.montant
      total += a.liquidites.ldds.montant
      total += a.liquidites.lep?.montant || 0
      total += a.liquidites.autres_livrets.reduce((sum: number, l) => sum + l.montant, 0)
    }
    
    // Assurances vie
    total += a.assurances_vie.reduce((sum: number, av) => sum + av.montant_total, 0)
    
    // Enveloppes bourse
    total += a.enveloppes_bourse.reduce((sum: number, env) => sum + env.montant_total_valorise, 0)
    
    // Immobilier
    total += a.biens_immobiliers.reduce((sum: number, bien) => sum + bien.valeur_venale, 0)
    
    // Sociétés IS
    total += a.societes_is.reduce((sum: number, soc) => sum + soc.valeur_titres, 0)
    
    // Autres actifs
    if (a.autres_actifs) {
      total += a.autres_actifs.crypto_monnaies.reduce((sum: number, c) => sum + c.valeur_totale, 0)
      total += a.autres_actifs.metaux_precieux.reduce((sum: number, m) => sum + m.valeur_totale, 0)
      total += a.autres_actifs.oeuvres_art.reduce((sum: number, o) => sum + o.valeur_estimee, 0)
      total += a.autres_actifs.vehicules_collection.reduce((sum: number, v) => sum + v.valeur_estimee, 0)
    }
    
    return total
  },
  
  getPatrimoineNet: () => {
    const state = get()
    const brut = state.getPatrimoineBrut()
    
    // Calculate total debt (passifs)
    const passifs = state.assessment.biens_immobiliers.reduce((sum: number, bien) => {
      return sum + (bien.pret?.capital_restant_du || 0)
    }, 0)
    
    return brut - passifs
  },
  
  getAllocation: () => {
    const a = get().assessment
    
    let liquidites = 0
    let immobilier = 0
    let assurance_vie = 0
    let enveloppes_boursieres = 0
    let societes_is = 0
    let autres_actifs = 0
    
    // Liquidités
    if (a.liquidites) {
      liquidites += a.liquidites.comptes_courants.reduce((sum: number, c) => sum + c.montant, 0)
      liquidites += a.liquidites.livret_a.montant
      liquidites += a.liquidites.ldds.montant
      liquidites += a.liquidites.lep?.montant || 0
      liquidites += a.liquidites.autres_livrets.reduce((sum: number, l) => sum + l.montant, 0)
    }
    
    // Assurances vie
    assurance_vie = a.assurances_vie.reduce((sum: number, av) => sum + av.montant_total, 0)
    
    // Enveloppes bourse
    enveloppes_boursieres = a.enveloppes_bourse.reduce((sum: number, env) => sum + env.montant_total_valorise, 0)
    
    // Immobilier
    immobilier = a.biens_immobiliers.reduce((sum: number, bien) => sum + bien.valeur_venale, 0)
    
    // Sociétés IS
    societes_is = a.societes_is.reduce((sum: number, soc) => sum + soc.valeur_titres, 0)
    
    // Autres actifs
    if (a.autres_actifs) {
      autres_actifs += a.autres_actifs.crypto_monnaies.reduce((sum: number, c) => sum + c.valeur_totale, 0)
      autres_actifs += a.autres_actifs.metaux_precieux.reduce((sum: number, m) => sum + m.valeur_totale, 0)
      autres_actifs += a.autres_actifs.oeuvres_art.reduce((sum: number, o) => sum + o.valeur_estimee, 0)
      autres_actifs += a.autres_actifs.vehicules_collection.reduce((sum: number, v) => sum + v.valeur_estimee, 0)
    }
    
    const total = liquidites + immobilier + assurance_vie + enveloppes_boursieres + societes_is + autres_actifs
    
    return {
      liquidites,
      immobilier,
      assurance_vie,
      enveloppes_boursieres,
      societes_is,
      autres_actifs,
      total,
    }
  },
  
  resetAssessment: () => set({ assessment: initialAssessmentState }),
}),
    {
      name: 'fiscal-lazy-portfolio-storage',
      version: 1,
    }
  )
)
