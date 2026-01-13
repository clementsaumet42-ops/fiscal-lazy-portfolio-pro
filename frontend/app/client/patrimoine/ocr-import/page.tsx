'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DocumentScanner } from '@/components/ocr/DocumentScanner'
import { ArrowLeft, Building2, Briefcase, Shield, PiggyBank, TrendingUp } from 'lucide-react'
import { TypeEnveloppeAudit } from '@/lib/types/audit'
import { ExtractedLine } from '@/lib/types/ocr'
import { useClientStore } from '@/store/client-store'

const ENVELOPPE_OPTIONS: {
  value: TypeEnveloppeAudit
  label: string
  description: string
  icon: React.ReactNode
}[] = [
  {
    value: 'PEA',
    label: 'PEA - Plan Épargne Actions',
    description: 'Investissements en actions européennes',
    icon: <TrendingUp className="w-6 h-6" />,
  },
  {
    value: 'PER',
    label: 'PER - Plan Épargne Retraite',
    description: 'Épargne retraite avec avantages fiscaux',
    icon: <PiggyBank className="w-6 h-6" />,
  },
  {
    value: 'AV',
    label: 'Assurance Vie',
    description: 'Contrats d\'assurance vie multisupports',
    icon: <Shield className="w-6 h-6" />,
  },
  {
    value: 'CTO',
    label: 'CTO - Compte-Titres Ordinaire',
    description: 'Investissements sans contraintes',
    icon: <Briefcase className="w-6 h-6" />,
  },
  {
    value: 'IS',
    label: 'Société IS',
    description: 'Portefeuille de société à l\'IS',
    icon: <Building2 className="w-6 h-6" />,
  },
]

export default function OCRImportPage() {
  const router = useRouter()
  const { addPlacement } = useClientStore()
  const [selectedType, setSelectedType] = useState<TypeEnveloppeAudit>('PEA')
  const [importedLines, setImportedLines] = useState<ExtractedLine[]>([])
  const [showSuccess, setShowSuccess] = useState(false)

  const handleImportComplete = (lines: ExtractedLine[]) => {
    // Map enveloppe type to placement type
    const typeMap: Record<TypeEnveloppeAudit, 'pea' | 'cto' | 'per' | 'assurance_vie'> = {
      PEA: 'pea',
      CTO: 'cto',
      PER: 'per',
      AV: 'assurance_vie',
      IS: 'cto', // Map IS to CTO for now
    }
    
    // Add each line as a placement
    lines.forEach((line) => {
      const placement = {
        id: `${selectedType}-${line.isin}-${Date.now()}`,
        type: typeMap[selectedType],
        nom: line.fundName,
        etablissement: 'Importé via OCR',
        montant: line.amount,
        frais_annuels: 0, // Will need to be filled in later
        rendement_historique: 0,
        score_qualite: line.confidence * 10, // Convert 0-1 to 0-10
        liquidite: 'moyen_terme' as const,
      }
      
      addPlacement(placement)
    })

    setImportedLines(lines)
    setShowSuccess(true)

    // Show success message and redirect after 2 seconds
    setTimeout(() => {
      router.push('/client/patrimoine/bourse')
    }, 2000)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4 gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour
        </Button>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Import par OCR - Relevés d&apos;Investissement
        </h1>
        <p className="text-gray-600">
          Scannez automatiquement vos relevés de situation pour extraire les données (ISIN, noms de fonds, montants).
        </p>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <Card className="mb-6 border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="font-semibold text-green-900">
                  Import réussi !
                </p>
                <p className="text-sm text-green-800">
                  {importedLines.length} ligne(s) importée(s). Redirection en cours...
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Type Selection */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Type d&apos;enveloppe</CardTitle>
          <CardDescription>
            Sélectionnez le type d&apos;enveloppe fiscale correspondant à vos relevés
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ENVELOPPE_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => setSelectedType(option.value)}
                className={`p-4 border-2 rounded-lg text-left transition-all ${
                  selectedType === option.value
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`${
                      selectedType === option.value
                        ? 'text-blue-600'
                        : 'text-gray-400'
                    }`}
                  >
                    {option.icon}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 mb-1">
                      {option.label}
                    </div>
                    <div className="text-sm text-gray-600">
                      {option.description}
                    </div>
                    {selectedType === option.value && (
                      <Badge className="mt-2 bg-blue-600">Sélectionné</Badge>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Document Scanner */}
      <DocumentScanner
        typeEnveloppe={selectedType}
        onImportComplete={handleImportComplete}
      />

      {/* Info Card */}
      <Card className="mt-6 border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg">À propos de l&apos;extraction OCR</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm text-gray-600">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Données extraites :</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>
                  <strong>Code ISIN</strong> : Identifiant unique du fonds (format : 2 lettres + 10
                  caractères alphanumériques)
                </li>
                <li>
                  <strong>Nom du fonds</strong> : Libellé complet du support d'investissement
                </li>
                <li>
                  <strong>Montant</strong> : Valorisation en euros
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Fonctionnement :</h4>
              <ol className="list-decimal list-inside space-y-1">
                <li>Sélectionnez le type d'enveloppe fiscale</li>
                <li>Téléchargez vos relevés (PDF, PNG, JPG)</li>
                <li>Lancez l'analyse OCR</li>
                <li>Vérifiez et corrigez les données extraites si nécessaire</li>
                <li>Importez dans votre patrimoine</li>
              </ol>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Formats supportés :</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>PDF (documents scannés ou natifs)</li>
                <li>Images PNG, JPG, JPEG</li>
                <li>Résolution recommandée : 300 DPI minimum</li>
              </ul>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-900">
                <strong>Note :</strong> L'OCR utilise Tesseract.js pour l'extraction de texte. Les
                résultats peuvent varier selon la qualité du document. Vérifiez toujours les données
                extraites avant l'import final.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
