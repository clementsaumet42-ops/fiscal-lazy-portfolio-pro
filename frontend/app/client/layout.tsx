'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { STEPS } from '@/lib/constants'
import { cn } from '@/lib/utils'

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  
  const currentStepIndex = STEPS.findIndex(step => pathname.startsWith(step.path))

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="text-2xl font-bold text-blue-600">
            Fiscal Lazy Portfolio Pro
          </Link>
        </div>
      </header>

      {/* Stepper */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="flex items-center">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center font-semibold",
                      index <= currentStepIndex
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-500"
                    )}
                  >
                    {step.id}
                  </div>
                  <span
                    className={cn(
                      "ml-2 text-sm font-medium",
                      index <= currentStepIndex
                        ? "text-blue-600"
                        : "text-gray-500"
                    )}
                  >
                    {step.name}
                  </span>
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={cn(
                      "w-12 h-1 mx-4",
                      index < currentStepIndex
                        ? "bg-blue-600"
                        : "bg-gray-200"
                    )}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <main>{children}</main>
    </div>
  )
}
