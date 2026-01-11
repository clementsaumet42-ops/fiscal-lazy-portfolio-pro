import { create } from 'zustand'
import { ClientState, ProfilClient, EnveloppeConfig, Allocation, OptimisationResult, BacktestResult } from '@/lib/types'

interface ClientStore extends ClientState {
  setProfil: (profil: ProfilClient) => void
  setEnveloppes: (enveloppes: EnveloppeConfig[]) => void
  setAllocation: (allocation: Allocation) => void
  setOptimisation: (optimisation: OptimisationResult) => void
  setBacktest: (backtest: BacktestResult) => void
  nextEtape: () => void
  prevEtape: () => void
  reset: () => void
}

const initialState: ClientState = {
  profil: null,
  enveloppes: [],
  allocation: null,
  optimisation: null,
  backtest: null,
  etape_actuelle: 1,
}

export const useClientStore = create<ClientStore>((set) => ({
  ...initialState,
  
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
  
  reset: () => set(initialState),
}))
