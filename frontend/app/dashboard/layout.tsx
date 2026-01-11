import Link from 'next/link'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-blue-600">
            Fiscal Lazy Portfolio Pro
          </Link>
          <nav className="flex gap-4">
            <Link href="/dashboard" className="text-gray-700 hover:text-blue-600">
              Dashboard
            </Link>
            <Link href="/client/profil" className="text-gray-700 hover:text-blue-600">
              Nouveau Client
            </Link>
          </nav>
        </div>
      </header>
      <main>{children}</main>
    </div>
  )
}
