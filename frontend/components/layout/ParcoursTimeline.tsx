import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle, Circle, Clock } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface Phase {
  id: string
  titre: string
  emoji: string
  etapes: number
  href: string
  status: 'completed' | 'in_progress' | 'pending'
}

interface ParcoursTimelineProps {
  phases: Phase[]
}

export function ParcoursTimeline({ phases }: ParcoursTimelineProps) {
  return (
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {phases.map((phase, index) => {
          const isCompleted = phase.status === 'completed'
          const isInProgress = phase.status === 'in_progress'
          const isPending = phase.status === 'pending'

          return (
            <Link key={phase.id} href={phase.href}>
              <Card
                className={cn(
                  'transition-all hover:shadow-lg cursor-pointer',
                  isCompleted && 'border-green-500 bg-green-50',
                  isInProgress && 'border-blue-500 bg-blue-50 ring-2 ring-blue-200',
                  isPending && 'border-gray-300 bg-gray-50'
                )}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="text-4xl">{phase.emoji}</div>
                      <div>
                        <h3 className="font-semibold text-lg">{phase.titre}</h3>
                        <p className="text-sm text-gray-600">{phase.etapes} étapes</p>
                      </div>
                    </div>
                    <div>
                      {isCompleted && (
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      )}
                      {isInProgress && (
                        <Clock className="w-6 h-6 text-blue-600 animate-pulse" />
                      )}
                      {isPending && (
                        <Circle className="w-6 h-6 text-gray-400" />
                      )}
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-4">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Progression</span>
                      <span>
                        {isCompleted ? '100%' : isInProgress ? '50%' : '0%'}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={cn(
                          'h-2 rounded-full transition-all',
                          isCompleted && 'bg-green-600 w-full',
                          isInProgress && 'bg-blue-600 w-1/2',
                          isPending && 'bg-gray-300 w-0'
                        )}
                      />
                    </div>
                  </div>

                  {/* Status badge */}
                  <div className="mt-4">
                    {isCompleted && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        ✅ Terminé
                      </span>
                    )}
                    {isInProgress && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        🔄 En cours
                      </span>
                    )}
                    {isPending && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        ⭕ À faire
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
