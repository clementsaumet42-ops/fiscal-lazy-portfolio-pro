import type { Metadata } from 'next'
import '../styles/globals.css'

export const metadata: Metadata = {
  title: 'Fiscal Lazy Portfolio Pro',
  description: 'Plateforme d\'optimisation fiscale pour experts-comptables',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className="font-sans">{children}</body>
    </html>
  )
}
