'use client'

import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

interface Step {
  id: string
  label: string
  path: string
}

const STEPS: Step[] = [
  { id: 'civil', label: 'Civil', path: '/client/bilan/civil' },
  { id: 'fiscal', label: 'Fiscal', path: '/client/bilan/fiscal' },
  { id: 'successoral', label: 'Succession', path: '/client/bilan/successoral' },
  { id: 'liquidites', label: 'Liquidités', path: '/client/patrimoine/liquidites' },
  { id: 'av', label: 'Assurance-vie', path: '/client/patrimoine/assurance-vie' },
  { id: 'bourse', label: 'Bourse', path: '/client/patrimoine/bourse' },
  { id: 'immobilier', label: 'Immobilier', path: '/client/patrimoine/immobilier' },
  { id: 'societe', label: 'Sociétés', path: '/client/patrimoine/societe' },
  { id: 'autres', label: 'Autres', path: '/client/patrimoine/autres' },
  { id: 'synthese', label: 'Synthèse', path: '/client/synthese' },
  { id: 'reco', label: 'Préconisations', path: '/client/recommandations' },
]

export function ProgressBar() {
  const pathname = usePathname()
  
  // Don't show on demarrer page
  if (pathname === '/client/demarrer') {
    return null
  }
  
  const currentStepIndex = STEPS.findIndex(step => pathname.startsWith(step.path))
  const progress = currentStepIndex >= 0 ? ((currentStepIndex + 1) / STEPS.length) * 100 : 0
  
  // Don't show if not on a journey page
  if (currentStepIndex < 0) {
    return null
  }
  
  return (
    <div className="bg-white border-b border-gray-200 py-4 sticky top-0 z-50 shadow-sm">
      <div className="max-w-6xl mx-auto px-6">
        
        {/* Progress bar */}
        <div className="mb-2">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        
        {/* Step indicator */}
        <div className="flex items-center justify-between text-sm">
          <p className="text-gray-600">
            Étape <span className="font-bold text-blue-600">{currentStepIndex + 1}</span> sur {STEPS.length}
          </p>
          {currentStepIndex >= 0 && (
            <p className="text-gray-900 font-medium">
              {STEPS[currentStepIndex].label}
            </p>
          )}
          <p className="text-gray-500">
            {Math.round(progress)}% complété
          </p>
        </div>
        
        {/* Mini stepper (optional, for desktop) */}
        <div className="hidden md:flex gap-1 mt-3">
          {STEPS.map((step, index) => (
            <div
              key={step.id}
              className={cn(
                "flex-1 h-1 rounded-full transition-colors",
                index <= currentStepIndex ? "bg-blue-600" : "bg-gray-200"
              )}
              title={step.label}
            />
          ))}
        </div>
        
      </div>
    </div>
  )
}
