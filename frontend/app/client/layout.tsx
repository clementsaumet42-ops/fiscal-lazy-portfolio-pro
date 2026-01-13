import { ProgressBar } from '@/components/parcours/ProgressBar'

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <ProgressBar />
      <main>{children}</main>
    </div>
  )
}
