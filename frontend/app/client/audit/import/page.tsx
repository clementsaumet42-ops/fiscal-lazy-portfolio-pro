'use client'

import { useRouter } from 'next/navigation'
import { useClientStore } from '@/store/client-store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ArrowRight, FileText, Upload } from 'lucide-react'

export default function AuditImportPage() {
  const router = useRouter()
  const { audit } = useClientStore()

  const handleContinue = () => {
    // For MVP, we'll generate mock data
    router.push('/client/audit/analyse')
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">🔍 Audit de l'Épargne</h1>
        <p className="text-gray-600">Étape 1/3 - Import de documents</p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-primary" />
            <CardTitle>Importer vos relevés d'épargne</CardTitle>
          </div>
          <CardDescription>
            Téléchargez vos relevés bancaires, contrats d'assurance-vie, et autres documents
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-900 mb-2">
              Glissez-déposez vos fichiers ici
            </p>
            <p className="text-sm text-gray-600 mb-4">
              ou cliquez pour sélectionner
            </p>
            <Button variant="outline">
              <FileText className="w-4 h-4 mr-2" />
              Parcourir les fichiers
            </Button>
          </div>

          <div className="mt-6">
            <h3 className="font-semibold mb-3">Formats acceptés</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <span className="text-green-600">✓</span> PDF
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-600">✓</span> JPG/PNG
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-600">✓</span> Excel
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-600">✓</span> CSV
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documents importés */}
      {audit.documents.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Documents importés ({audit.documents.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {audit.documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-3 border rounded hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <div>
                      <div className="font-medium">{doc.nom}</div>
                      <div className="text-sm text-gray-600">{doc.type_enveloppe}</div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Supprimer
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Option MVP : Utiliser données du bilan */}
      <Card className="bg-blue-50 border-blue-200 mb-6">
        <CardContent className="py-4">
          <h3 className="font-semibold text-blue-900 mb-2">💡 Mode rapide (MVP)</h3>
          <p className="text-sm text-blue-700 mb-3">
            Pour ce MVP, vous pouvez passer directement à l'analyse en utilisant les données
            du bilan patrimonial. L'extraction automatique sera ajoutée dans une version future.
          </p>
          <Button onClick={handleContinue} className="bg-blue-600 hover:bg-blue-700">
            Utiliser les données du bilan
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={() => router.push('/client/parcours')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour au parcours
        </Button>
        <Button onClick={handleContinue}>
          Suivant : Analyse
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  )
}
