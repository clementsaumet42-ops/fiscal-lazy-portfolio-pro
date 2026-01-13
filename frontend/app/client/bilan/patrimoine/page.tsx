'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useClientStore } from '@/store/client-store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { BilanStepper } from '@/components/bilan/BilanStepper'
import { PatrimoineCard } from '@/components/bilan/PatrimoineCard'
import { PatrimoineExistant } from '@/lib/types/bilan'
import { Home, Wallet, TrendingUp, Plus, X, CheckCircle, Pencil } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { generateId } from '@/lib/utils/assessment/helpers'

export default function PatrimoineExistantPage() {
  const router = useRouter()
  const { bilan, setPatrimoine } = useClientStore()
  
  const [formData, setFormData] = useState<PatrimoineExistant>(
    bilan.patrimoine || {
      immobilier: {
        immobilier_locatif: [],
        scpi: [],
      },
      epargne_liquide: {
        livret_a: 0,
        ldds: 0,
        lep: 0,
        comptes_courants: 0,
      },
      placements_financiers: {
        pea: [],
        cto: [],
        assurance_vie: [],
        per: [],
      },
      autres_actifs: {
        crypto: 0,
        or_metaux_precieux: 0,
        entreprise_valorisation: 0,
        autres: 0,
      },
    }
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setPatrimoine(formData)
    router.push('/client/bilan/objectifs')
  }

  // Calculs
  const patrimoineLiquide = 
    formData.epargne_liquide.livret_a +
    formData.epargne_liquide.ldds +
    formData.epargne_liquide.lep +
    formData.epargne_liquide.comptes_courants

  const patrimoineFinancier =
    formData.placements_financiers.pea.reduce((sum, p) => sum + p.montant, 0) +
    formData.placements_financiers.cto.reduce((sum, p) => sum + p.montant, 0) +
    formData.placements_financiers.assurance_vie.reduce((sum, p) => sum + p.montant, 0) +
    formData.placements_financiers.per.reduce((sum, p) => sum + p.montant, 0)

  const patrimoineAutres =
    formData.autres_actifs.crypto +
    formData.autres_actifs.or_metaux_precieux +
    (formData.autres_actifs.entreprise_valorisation || 0) +
    formData.autres_actifs.autres

  const patrimoineTotal = patrimoineLiquide + patrimoineFinancier + patrimoineAutres

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">📋 Bilan Patrimonial</h1>
        <p className="text-gray-600">Étape 3/4 - Patrimoine existant</p>
      </div>

      <BilanStepper currentStep={3} />
      
      <form onSubmit={handleSubmit} className="space-y-6 mt-8">
        {/* Vue d'ensemble */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <PatrimoineCard
            titre="Épargne liquide"
            montant={patrimoineLiquide}
            pourcentage={(patrimoineLiquide / (patrimoineTotal || 1)) * 100}
            icon="💰"
            variant="success"
          />
          <PatrimoineCard
            titre="Placements financiers"
            montant={patrimoineFinancier}
            pourcentage={(patrimoineFinancier / (patrimoineTotal || 1)) * 100}
            icon="📈"
            variant="default"
          />
          <PatrimoineCard
            titre="Autres actifs"
            montant={patrimoineAutres}
            pourcentage={(patrimoineAutres / (patrimoineTotal || 1)) * 100}
            icon="💎"
            variant="warning"
          />
        </div>

        {/* Épargne liquide */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-green-600" />
              <CardTitle>Épargne liquide et disponible</CardTitle>
            </div>
            <CardDescription>
              Livrets réglementés et comptes courants
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Livret A (€)</label>
                <Input
                  type="number"
                  min="0"
                  step="1000"
                  value={formData.epargne_liquide.livret_a}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    epargne_liquide: { ...prev.epargne_liquide, livret_a: parseFloat(e.target.value) || 0 }
                  }))}
                  placeholder="22950"
                />
                <p className="text-xs text-gray-500 mt-1">Plafond: 22 950 €</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">LDDS (€)</label>
                <Input
                  type="number"
                  min="0"
                  step="1000"
                  value={formData.epargne_liquide.ldds}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    epargne_liquide: { ...prev.epargne_liquide, ldds: parseFloat(e.target.value) || 0 }
                  }))}
                  placeholder="12000"
                />
                <p className="text-xs text-gray-500 mt-1">Plafond: 12 000 €</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">LEP (€)</label>
                <Input
                  type="number"
                  min="0"
                  step="1000"
                  value={formData.epargne_liquide.lep}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    epargne_liquide: { ...prev.epargne_liquide, lep: parseFloat(e.target.value) || 0 }
                  }))}
                  placeholder="10000"
                />
                <p className="text-xs text-gray-500 mt-1">Plafond: 10 000 € (sous conditions)</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Comptes courants (€)</label>
                <Input
                  type="number"
                  min="0"
                  step="1000"
                  value={formData.epargne_liquide.comptes_courants}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    epargne_liquide: { ...prev.epargne_liquide, comptes_courants: parseFloat(e.target.value) || 0 }
                  }))}
                  placeholder="5000"
                />
              </div>
            </div>
            <div className="border-t pt-4">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Total épargne liquide</span>
                <span className="text-xl font-bold text-green-600">{formatCurrency(patrimoineLiquide)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Placements financiers - PEA */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <CardTitle>Placements financiers</CardTitle>
            </div>
            <CardDescription>
              PEA, CTO, Assurance-vie, PER
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* PEA */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold">PEA - Plan d'Épargne en Actions</h4>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      placements_financiers: {
                        ...prev.placements_financiers,
                        pea: [...prev.placements_financiers.pea, { id: generateId(), etablissement: '', montant: 0 }]
                      }
                    }))
                  }}
                >
                  <Plus className="w-4 h-4 mr-1" /> Ajouter PEA
                </Button>
              </div>
              {formData.placements_financiers.pea.length === 0 ? (
                <p className="text-sm text-gray-500 italic">Aucun PEA renseigné</p>
              ) : (
                <div className="space-y-2">
                  {formData.placements_financiers.pea.map((pea: any, index: number) => (
                    <div key={pea.id || index} className="flex gap-2 items-center">
                      <Input
                        placeholder="Établissement"
                        value={pea.etablissement}
                        onChange={(e) => {
                          const newPea = [...formData.placements_financiers.pea]
                          newPea[index] = { ...newPea[index], etablissement: e.target.value }
                          setFormData(prev => ({ ...prev, placements_financiers: { ...prev.placements_financiers, pea: newPea } }))
                        }}
                      />
                      <Input
                        type="number"
                        placeholder="Montant"
                        value={pea.montant}
                        onChange={(e) => {
                          const newPea = [...formData.placements_financiers.pea]
                          newPea[index] = { ...newPea[index], montant: parseFloat(e.target.value) || 0 }
                          setFormData(prev => ({ ...prev, placements_financiers: { ...prev.placements_financiers, pea: newPea } }))
                        }}
                      />
                      {pea.id && pea.etablissement && pea.montant > 0 && (
                        <Button
                          type="button"
                          size="sm"
                          variant={pea.lignes && pea.lignes.length > 0 ? "default" : "outline"}
                          onClick={() => {
                            // Ensure ID exists before navigating
                            if (!pea.id) {
                              const newPea = [...formData.placements_financiers.pea]
                              newPea[index] = { ...newPea[index], id: generateId() }
                              setFormData(prev => ({ ...prev, placements_financiers: { ...prev.placements_financiers, pea: newPea } }))
                              setPatrimoine(formData)
                            }
                            router.push(`/client/bilan/patrimoine/audit/pea/${pea.id}`)
                          }}
                          className="whitespace-nowrap"
                        >
                          {pea.lignes && pea.lignes.length > 0 ? (
                            <>
                              <CheckCircle className="w-4 h-4 mr-1" /> Audité
                            </>
                          ) : (
                            <>
                              <Pencil className="w-4 h-4 mr-1" /> Analyser
                            </>
                          )}
                        </Button>
                      )}
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            placements_financiers: {
                              ...prev.placements_financiers,
                              pea: prev.placements_financiers.pea.filter((_, i) => i !== index)
                            }
                          }))
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Assurance-vie */}
            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold">Assurance-vie</h4>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      placements_financiers: {
                        ...prev.placements_financiers,
                        assurance_vie: [...prev.placements_financiers.assurance_vie, { id: generateId(), etablissement: '', montant: 0 }]
                      }
                    }))
                  }}
                >
                  <Plus className="w-4 h-4 mr-1" /> Ajouter AV
                </Button>
              </div>
              {formData.placements_financiers.assurance_vie.length === 0 ? (
                <p className="text-sm text-gray-500 italic">Aucune assurance-vie renseignée</p>
              ) : (
                <div className="space-y-2">
                  {formData.placements_financiers.assurance_vie.map((av: any, index: number) => (
                    <div key={av.id || index} className="flex gap-2 items-center">
                      <Input
                        placeholder="Établissement"
                        value={av.etablissement}
                        onChange={(e) => {
                          const newAv = [...formData.placements_financiers.assurance_vie]
                          newAv[index] = { ...newAv[index], etablissement: e.target.value }
                          setFormData(prev => ({ ...prev, placements_financiers: { ...prev.placements_financiers, assurance_vie: newAv } }))
                        }}
                      />
                      <Input
                        type="number"
                        placeholder="Montant"
                        value={av.montant}
                        onChange={(e) => {
                          const newAv = [...formData.placements_financiers.assurance_vie]
                          newAv[index] = { ...newAv[index], montant: parseFloat(e.target.value) || 0 }
                          setFormData(prev => ({ ...prev, placements_financiers: { ...prev.placements_financiers, assurance_vie: newAv } }))
                        }}
                      />
                      {av.id && av.etablissement && av.montant > 0 && (
                        <Button
                          type="button"
                          size="sm"
                          variant={av.lignes && av.lignes.length > 0 ? "default" : "outline"}
                          onClick={() => {
                            if (!av.id) {
                              const newAv = [...formData.placements_financiers.assurance_vie]
                              newAv[index] = { ...newAv[index], id: generateId() }
                              setFormData(prev => ({ ...prev, placements_financiers: { ...prev.placements_financiers, assurance_vie: newAv } }))
                              setPatrimoine(formData)
                            }
                            router.push(`/client/bilan/patrimoine/audit/av/${av.id}`)
                          }}
                          className="whitespace-nowrap"
                        >
                          {av.lignes && av.lignes.length > 0 ? (
                            <>
                              <CheckCircle className="w-4 h-4 mr-1" /> Audité
                            </>
                          ) : (
                            <>
                              <Pencil className="w-4 h-4 mr-1" /> Analyser
                            </>
                          )}
                        </Button>
                      )}
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            placements_financiers: {
                              ...prev.placements_financiers,
                              assurance_vie: prev.placements_financiers.assurance_vie.filter((_, i) => i !== index)
                            }
                          }))
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* CTO */}
            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold">CTO - Compte-Titres Ordinaire</h4>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      placements_financiers: {
                        ...prev.placements_financiers,
                        cto: [...prev.placements_financiers.cto, { id: generateId(), etablissement: '', montant: 0 }]
                      }
                    }))
                  }}
                >
                  <Plus className="w-4 h-4 mr-1" /> Ajouter CTO
                </Button>
              </div>
              {formData.placements_financiers.cto.length === 0 ? (
                <p className="text-sm text-gray-500 italic">Aucun CTO renseigné</p>
              ) : (
                <div className="space-y-2">
                  {formData.placements_financiers.cto.map((cto: any, index: number) => (
                    <div key={cto.id || index} className="flex gap-2 items-center">
                      <Input
                        placeholder="Établissement"
                        value={cto.etablissement}
                        onChange={(e) => {
                          const newCto = [...formData.placements_financiers.cto]
                          newCto[index] = { ...newCto[index], etablissement: e.target.value }
                          setFormData(prev => ({ ...prev, placements_financiers: { ...prev.placements_financiers, cto: newCto } }))
                        }}
                      />
                      <Input
                        type="number"
                        placeholder="Montant"
                        value={cto.montant}
                        onChange={(e) => {
                          const newCto = [...formData.placements_financiers.cto]
                          newCto[index] = { ...newCto[index], montant: parseFloat(e.target.value) || 0 }
                          setFormData(prev => ({ ...prev, placements_financiers: { ...prev.placements_financiers, cto: newCto } }))
                        }}
                      />
                      {cto.id && cto.etablissement && cto.montant > 0 && (
                        <Button
                          type="button"
                          size="sm"
                          variant={cto.lignes && cto.lignes.length > 0 ? "default" : "outline"}
                          onClick={() => {
                            if (!cto.id) {
                              const newCto = [...formData.placements_financiers.cto]
                              newCto[index] = { ...newCto[index], id: generateId() }
                              setFormData(prev => ({ ...prev, placements_financiers: { ...prev.placements_financiers, cto: newCto } }))
                              setPatrimoine(formData)
                            }
                            router.push(`/client/bilan/patrimoine/audit/cto/${cto.id}`)
                          }}
                          className="whitespace-nowrap"
                        >
                          {cto.lignes && cto.lignes.length > 0 ? (
                            <>
                              <CheckCircle className="w-4 h-4 mr-1" /> Audité
                            </>
                          ) : (
                            <>
                              <Pencil className="w-4 h-4 mr-1" /> Analyser
                            </>
                          )}
                        </Button>
                      )}
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            placements_financiers: {
                              ...prev.placements_financiers,
                              cto: prev.placements_financiers.cto.filter((_, i) => i !== index)
                            }
                          }))
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* PER */}
            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold">PER - Plan d'Épargne Retraite</h4>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      placements_financiers: {
                        ...prev.placements_financiers,
                        per: [...prev.placements_financiers.per, { id: generateId(), etablissement: '', montant: 0 }]
                      }
                    }))
                  }}
                >
                  <Plus className="w-4 h-4 mr-1" /> Ajouter PER
                </Button>
              </div>
              {formData.placements_financiers.per.length === 0 ? (
                <p className="text-sm text-gray-500 italic">Aucun PER renseigné</p>
              ) : (
                <div className="space-y-2">
                  {formData.placements_financiers.per.map((per: any, index: number) => (
                    <div key={per.id || index} className="flex gap-2 items-center">
                      <Input
                        placeholder="Établissement"
                        value={per.etablissement}
                        onChange={(e) => {
                          const newPer = [...formData.placements_financiers.per]
                          newPer[index] = { ...newPer[index], etablissement: e.target.value }
                          setFormData(prev => ({ ...prev, placements_financiers: { ...prev.placements_financiers, per: newPer } }))
                        }}
                      />
                      <Input
                        type="number"
                        placeholder="Montant"
                        value={per.montant}
                        onChange={(e) => {
                          const newPer = [...formData.placements_financiers.per]
                          newPer[index] = { ...newPer[index], montant: parseFloat(e.target.value) || 0 }
                          setFormData(prev => ({ ...prev, placements_financiers: { ...prev.placements_financiers, per: newPer } }))
                        }}
                      />
                      {per.id && per.etablissement && per.montant > 0 && (
                        <Button
                          type="button"
                          size="sm"
                          variant={per.lignes && per.lignes.length > 0 ? "default" : "outline"}
                          onClick={() => {
                            if (!per.id) {
                              const newPer = [...formData.placements_financiers.per]
                              newPer[index] = { ...newPer[index], id: generateId() }
                              setFormData(prev => ({ ...prev, placements_financiers: { ...prev.placements_financiers, per: newPer } }))
                              setPatrimoine(formData)
                            }
                            router.push(`/client/bilan/patrimoine/audit/per/${per.id}`)
                          }}
                          className="whitespace-nowrap"
                        >
                          {per.lignes && per.lignes.length > 0 ? (
                            <>
                              <CheckCircle className="w-4 h-4 mr-1" /> Audité
                            </>
                          ) : (
                            <>
                              <Pencil className="w-4 h-4 mr-1" /> Analyser
                            </>
                          )}
                        </Button>
                      )}
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            placements_financiers: {
                              ...prev.placements_financiers,
                              per: prev.placements_financiers.per.filter((_, i) => i !== index)
                            }
                          }))
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Total placements financiers</span>
                <span className="text-xl font-bold text-blue-600">{formatCurrency(patrimoineFinancier)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Autres actifs */}
        <Card>
          <CardHeader>
            <CardTitle>Autres actifs</CardTitle>
            <CardDescription>
              Crypto, or, entreprise...
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Cryptomonnaies (€)</label>
                <Input
                  type="number"
                  min="0"
                  step="1000"
                  value={formData.autres_actifs.crypto}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    autres_actifs: { ...prev.autres_actifs, crypto: parseFloat(e.target.value) || 0 }
                  }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Or & métaux précieux (€)</label>
                <Input
                  type="number"
                  min="0"
                  step="1000"
                  value={formData.autres_actifs.or_metaux_precieux}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    autres_actifs: { ...prev.autres_actifs, or_metaux_precieux: parseFloat(e.target.value) || 0 }
                  }))}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total patrimoine */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="py-6">
            <div className="flex justify-between items-center">
              <span className="text-xl font-semibold">Patrimoine total renseigné</span>
              <span className="text-3xl font-bold text-blue-900">
                {formatCurrency(patrimoineTotal)}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Boutons de navigation */}
        <div className="flex justify-between pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/client/bilan/revenus')}
          >
            Retour : Revenus
          </Button>
          <Button type="submit" size="lg">
            Suivant : Objectifs
          </Button>
        </div>
      </form>
    </div>
  )
}
