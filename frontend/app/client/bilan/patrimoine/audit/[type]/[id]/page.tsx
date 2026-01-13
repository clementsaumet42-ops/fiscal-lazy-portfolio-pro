'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useClientStore } from '@/store/client-store'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Upload, Plus, Trash2, Save, AlertCircle, FileText, CheckCircle, X, ArrowLeft } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { generateId } from '@/lib/utils/assessment/helpers'
import { calculateTCO } from '@/lib/utils/tco-calculator'
import type { LigneAudit, DocumentAudit } from '@/lib/types/bilan-audit'

export default function AuditEnveloppePage() {
  const router = useRouter()
  const params = useParams()
  const { type, id } = params as { type: string, id: string }
  
  const { bilan, updatePEAAudit, updateCTOAudit, updateAVAudit, updatePERAudit } = useClientStore()

  const [uploadedDocument, setUploadedDocument] = useState<DocumentAudit | null>(null)
  const [lignes, setLignes] = useState<LigneAudit[]>([])
  const [showManualEntry, setShowManualEntry] = useState(false)

  // Charger les données existantes si disponibles
  useEffect(() => {
    if (bilan.patrimoine) {
      let enveloppe: any = null
      
      if (type === 'pea') {
        enveloppe = bilan.patrimoine.placements_financiers?.pea?.find((p: any) => p.id === id)
      } else if (type === 'cto') {
        enveloppe = bilan.patrimoine.placements_financiers?.cto?.find((c: any) => c.id === id)
      } else if (type === 'av') {
        enveloppe = bilan.patrimoine.placements_financiers?.assurance_vie?.find((av: any) => av.id === id)
      } else if (type === 'per') {
        enveloppe = bilan.patrimoine.placements_financiers?.per?.find((p: any) => p.id === id)
      }

      if (enveloppe) {
        setLignes(enveloppe.lignes || [])
        setUploadedDocument(enveloppe.document || null)
        if (enveloppe.lignes && enveloppe.lignes.length > 0) {
          setShowManualEntry(true)
        }
      }
    }
  }, [bilan, type, id])

  // Cleanup blob URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      if (uploadedDocument?.url.startsWith('blob:')) {
        URL.revokeObjectURL(uploadedDocument.url)
      }
    }
  }, [uploadedDocument])

  const handleFileUpload = async (file: File) => {
    const newDocument: DocumentAudit = {
      id: generateId(),
      nom: file.name,
      type: file.name.split('.').pop() as any,
      url: URL.createObjectURL(file),
      date_upload: new Date().toISOString(),
      statut: 'en_attente',
      enveloppe_type: type.toUpperCase() as 'PEA' | 'CTO' | 'AV' | 'PER',
      enveloppe_id: id,
    }
    
    setUploadedDocument(newDocument)
    setShowManualEntry(true)
  }

  const addLigne = () => {
    setLignes([
      ...lignes,
      {
        id: generateId(),
        nom: '',
        quantite: 0,
        pru: 0,
        cours_actuel: 0,
        valorisation: 0,
        plus_value_latente: 0,
      },
    ])
  }

  const updateLigne = (index: number, field: keyof LigneAudit, value: any) => {
    const newLignes = [...lignes]
    newLignes[index] = { ...newLignes[index], [field]: value }
    
    // Auto-calcul valorisation et plus-value
    if (['quantite', 'pru', 'cours_actuel'].includes(field)) {
      const ligne = newLignes[index]
      ligne.valorisation = ligne.quantite * ligne.cours_actuel
      ligne.plus_value_latente = (ligne.cours_actuel - ligne.pru) * ligne.quantite
    }
    
    setLignes(newLignes)
  }

  const removeLigne = (index: number) => {
    setLignes(lignes.filter((_, i) => i !== index))
  }

  const handleSave = () => {
    const tco = calculateTCO(lignes, type.toUpperCase() as 'PEA' | 'CTO' | 'AV' | 'PER')
    
    const audit = {
      lignes,
      document: uploadedDocument || undefined,
      tco,
    }

    // Sauvegarder dans le store selon le type
    if (type === 'pea') {
      updatePEAAudit(id, audit)
    } else if (type === 'cto') {
      updateCTOAudit(id, audit)
    } else if (type === 'av') {
      updateAVAudit(id, audit)
    } else if (type === 'per') {
      updatePERAudit(id, audit)
    }

    router.back()
  }

  const tco = lignes.length > 0 
    ? calculateTCO(lignes, type.toUpperCase() as 'PEA' | 'CTO' | 'AV' | 'PER')
    : null

  const typeLabels = {
    pea: 'PEA',
    cto: 'CTO',
    av: 'Assurance-vie',
    per: 'PER',
  }

  const valorisationTotale = lignes.reduce((sum, l) => sum + l.valorisation, 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Retour au patrimoine
          </Button>
          <h1 className="text-3xl font-bold mb-2">
            🔍 Audit {typeLabels[type as keyof typeof typeLabels]}
          </h1>
          <p className="text-gray-600">
            Importez votre relevé et détaillez vos positions pour calculer le TCO
          </p>
        </div>

        {/* Étape 1: Upload PDF */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">1</span>
              Importer le relevé de compte
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!uploadedDocument ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="mb-4 text-gray-600">
                  Glissez-déposez votre relevé PDF ou cliquez pour parcourir
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  Formats acceptés: PDF, JPG, PNG, Excel, CSV
                </p>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.xlsx,.csv"
                  onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                  className="hidden"
                  id="file-upload"
                />
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => document.getElementById('file-upload')?.click()}
                >
                  📎 Parcourir les fichiers
                </Button>
              </div>
            ) : (
              <div className="p-4 bg-green-50 border border-green-200 rounded flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="w-8 h-8 text-green-600" />
                  <div>
                    <p className="font-medium">{uploadedDocument.nom}</p>
                    <p className="text-sm text-gray-500">
                      Uploadé le {new Date(uploadedDocument.date_upload).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setUploadedDocument(null)
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}

            {!showManualEntry && !uploadedDocument && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-900">
                  <p className="font-medium mb-1">ℹ️ Pour ce MVP</p>
                  <p>L'extraction automatique des données (OCR) sera ajoutée en V2. Pour l'instant, vous devez saisir manuellement les lignes ci-dessous.</p>
                </div>
              </div>
            )}

            {!showManualEntry && (
              <div className="mt-4 text-center">
                <Button
                  variant="outline"
                  onClick={() => setShowManualEntry(true)}
                >
                  Passer à la saisie manuelle →
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Étape 2: Saisie manuelle */}
        {showManualEntry && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">2</span>
                Détail des positions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Button
                  onClick={addLigne}
                  variant="outline"
                  size="sm"
                >
                  <Plus className="w-4 h-4 mr-2" /> Ajouter une ligne
                </Button>
              </div>

              {lignes.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>Aucune ligne ajoutée. Cliquez sur "Ajouter une ligne" pour commencer.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border p-2 text-left text-sm font-medium">ISIN</th>
                        <th className="border p-2 text-left text-sm font-medium">Nom</th>
                        <th className="border p-2 text-left text-sm font-medium">Quantité</th>
                        <th className="border p-2 text-left text-sm font-medium">PRU (€)</th>
                        <th className="border p-2 text-left text-sm font-medium">Cours actuel (€)</th>
                        <th className="border p-2 text-left text-sm font-medium">Valorisation</th>
                        <th className="border p-2 text-left text-sm font-medium">+/- Value</th>
                        <th className="border p-2 text-center text-sm font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lignes.map((ligne, index) => (
                        <tr key={ligne.id} className="hover:bg-gray-50">
                          <td className="border p-2">
                            <Input
                              placeholder="FR0000..."
                              value={ligne.isin || ''}
                              onChange={(e) => updateLigne(index, 'isin', e.target.value)}
                              className="text-sm"
                            />
                          </td>
                          <td className="border p-2">
                            <Input
                              placeholder="Nom du titre"
                              value={ligne.nom}
                              onChange={(e) => updateLigne(index, 'nom', e.target.value)}
                              className="text-sm"
                            />
                          </td>
                          <td className="border p-2">
                            <Input
                              type="number"
                              step="1"
                              min="0"
                              value={ligne.quantite}
                              onChange={(e) => updateLigne(index, 'quantite', parseFloat(e.target.value) || 0)}
                              className="text-sm w-24"
                            />
                          </td>
                          <td className="border p-2">
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              value={ligne.pru}
                              onChange={(e) => updateLigne(index, 'pru', parseFloat(e.target.value) || 0)}
                              className="text-sm w-24"
                            />
                          </td>
                          <td className="border p-2">
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              value={ligne.cours_actuel}
                              onChange={(e) => updateLigne(index, 'cours_actuel', parseFloat(e.target.value) || 0)}
                              className="text-sm w-24"
                            />
                          </td>
                          <td className="border p-2 text-right font-medium">
                            {formatCurrency(ligne.valorisation)}
                          </td>
                          <td className={`border p-2 text-right font-medium ${ligne.plus_value_latente >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {ligne.plus_value_latente >= 0 ? '+' : ''}{formatCurrency(ligne.plus_value_latente)}
                          </td>
                          <td className="border p-2 text-center">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeLigne(index)}
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-blue-50 font-bold">
                        <td colSpan={5} className="border p-2 text-right">Total valorisation:</td>
                        <td className="border p-2 text-right">{formatCurrency(valorisationTotale)}</td>
                        <td className="border p-2 text-right text-green-600">
                          {formatCurrency(lignes.reduce((sum, l) => sum + l.plus_value_latente, 0))}
                        </td>
                        <td className="border p-2"></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Étape 3: TCO calculé automatiquement */}
        {tco && (
          <Card className="mb-6 bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">3</span>
                Total Cost of Ownership (TCO) - Calculé automatiquement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="p-4 bg-white rounded-lg shadow-sm">
                  <p className="text-sm text-gray-600 mb-1">Frais de gestion annuels</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(tco.frais_totaux_annuels)}</p>
                </div>
                <div className="p-4 bg-white rounded-lg shadow-sm">
                  <p className="text-sm text-gray-600 mb-1">Drag fiscal annuel</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(tco.drag_fiscal_annuel)}</p>
                </div>
                <div className="p-4 bg-white rounded-lg shadow-sm">
                  <p className="text-sm text-gray-600 mb-1">Coût d'opportunité</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(tco.cout_opportunite)}</p>
                </div>
                <div className="p-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-md">
                  <p className="text-sm text-blue-100 mb-1">TCO Total annuel</p>
                  <p className="text-3xl font-bold text-white">{formatCurrency(tco.tco_total)}</p>
                </div>
              </div>
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div className="text-sm text-yellow-900">
                    <p className="font-medium mb-1">💡 À propos du calcul TCO</p>
                    <p>Les taux utilisés sont des moyennes du marché. Le calcul peut être affiné selon votre établissement et votre TMI (Tranche Marginale d'Imposition).</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex gap-4 justify-between">
          <Button
            variant="outline"
            size="lg"
            onClick={() => router.back()}
          >
            Annuler
          </Button>
          <Button
            size="lg"
            onClick={handleSave}
            disabled={lignes.length === 0}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Save className="w-4 h-4 mr-2" />
            Valider l'audit
          </Button>
        </div>
      </div>
    </div>
  )
}
