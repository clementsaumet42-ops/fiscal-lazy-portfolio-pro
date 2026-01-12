import * as React from 'react'
import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'
import Link from 'next/link'

interface BilanStep {
  number: number
  label: string
  href: string
}

interface BilanStepperProps {
  currentStep: number
}

const BILAN_STEPS: BilanStep[] = [
  { number: 1, label: 'Situation', href: '/client/bilan/situation' },
  { number: 2, label: 'Revenus', href: '/client/bilan/revenus' },
  { number: 3, label: 'Patrimoine', href: '/client/bilan/patrimoine' },
  { number: 4, label: 'Objectifs', href: '/client/bilan/objectifs' },
]

export function BilanStepper({ currentStep }: BilanStepperProps) {
  return (
    <div className="w-full py-6">
      <div className="flex items-center justify-between">
        {BILAN_STEPS.map((step, index) => {
          const isCompleted = step.number < currentStep
          const isCurrent = step.number === currentStep
          
          return (
            <React.Fragment key={step.number}>
              <Link href={step.href} className="flex flex-col items-center">
                <div
                  className={cn(
                    'flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors',
                    isCompleted && 'bg-primary border-primary text-white',
                    isCurrent && 'border-primary text-primary bg-white',
                    !isCompleted && !isCurrent && 'border-gray-300 text-gray-400'
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <span className="text-sm font-semibold">{step.number}</span>
                  )}
                </div>
                <span
                  className={cn(
                    'mt-2 text-xs text-center max-w-[80px]',
                    isCurrent ? 'text-primary font-medium' : 'text-gray-500'
                  )}
                >
                  {step.label}
                </span>
              </Link>
              
              {index < BILAN_STEPS.length - 1 && (
                <div
                  className={cn(
                    'flex-1 h-0.5 mx-2',
                    step.number < currentStep ? 'bg-primary' : 'bg-gray-300'
                  )}
                />
              )}
            </React.Fragment>
          )
        })}
      </div>
    </div>
  )
}
