import * as React from 'react'
import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'

interface StepperProps {
  currentStep: number
  totalSteps: number
  steps: string[]
}

export function Stepper({ currentStep, totalSteps, steps }: StepperProps) {
  return (
    <div className="w-full py-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const stepNumber = index + 1
          const isCompleted = stepNumber < currentStep
          const isCurrent = stepNumber === currentStep
          
          return (
            <React.Fragment key={stepNumber}>
              <div className="flex flex-col items-center">
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
                    <span className="text-sm font-semibold">{stepNumber}</span>
                  )}
                </div>
                <span
                  className={cn(
                    'mt-2 text-xs text-center max-w-[100px]',
                    isCurrent ? 'text-primary font-medium' : 'text-gray-500'
                  )}
                >
                  {step}
                </span>
              </div>
              
              {stepNumber < totalSteps && (
                <div
                  className={cn(
                    'flex-1 h-0.5 mx-4',
                    stepNumber < currentStep ? 'bg-primary' : 'bg-gray-300'
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
