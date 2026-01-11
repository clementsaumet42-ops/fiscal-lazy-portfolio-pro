import { create } from 'zustand'
import { ClientState, ProfilClient, EnveloppeConfig, Allocation, OptimisationResult, BacktestResult } from '@/lib/types'
import { AuditState, DocumentImporte, AnalyseExistant, OptimisationProposee } from '@/lib/types/audit'

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
  
  // Workflow audit
  audit: AuditState
  addDocument: (doc: DocumentImporte) => void
  removeDocument: (id: string) => void
  updateDocument: (id: string, updates: Partial<DocumentImporte>) => void
  setAnalyse: (analyse: AnalyseExistant) => void
  setOptimisationAudit: (optimisation: OptimisationProposee) => void
  resetAudit: () => void
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
  analyse: undefined,
  optimisation: undefined,
}

export const useClientStore = create<ClientStore>((set) => ({
  ...initialState,
  audit: initialAuditState,
  
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
  
  reset: () => set({ ...initialState, audit: initialAuditState }),
  
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
  
  setAnalyse: (analyse) => set((state) => ({
    audit: {
      ...state.audit,
      analyse,
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
}))
