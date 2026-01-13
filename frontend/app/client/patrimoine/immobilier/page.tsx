'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useClientStore } from '@/store/client-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { BienImmobilier } from '@/lib/types/assessment'
import { formatCurrency, formatDate, generateId } from '@/lib/utils/assessment/helpers'
import { Home, Plus, Trash2, Building } from 'lucide-react'

export default function ImmobilierPage() {
  const router = useRouter()
  const { assessment, addBienImmobilier, updateBienImmobilier, removeBienImmobilier } = useClientStore()
  
  const [selectedBien, setSelectedBien] = useState<string | null>(
    assessment.biens_immobiliers.length > 0 ? assessment.biens_immobiliers[0].id : null
  )
  
  const [showAddBien, setShowAddBien] = useState(false)
  const [newBien, setNewBien] = useState<Partial<BienImmobilier>>({
    type: 'Résidence principale',
    adresse: '',
    valeur_venale: 0,
    pret: null,
  })

  const currentBien = assessment.biens_immobiliers.find(b => b.id === selectedBien)

  const handleAddBien = () => {
    if (!newBien.adresse) {
      alert('L\'adresse est requise')
      return
    }

    const bien: BienImmobilier = {
      id: generateId(),
      type: newBien.type as any,
      adresse: newBien.adresse,
      valeur_venale: newBien.valeur_venale || 0,
      pret: null,
    }

    addBienImmobilier(bien)
    setSelectedBien(bien.id)
    setShowAddBien(false)
    setNewBien({ type: 'Résidence principale', adresse: '', valeur_venale: 0, pret: null })
  }

  const handleTogglePret = (enabled: boolean) => {
    if (!selectedBien) return
    
    if (enabled) {
      updateBienImmobilier(selectedBien, {
        pret: {
          existe: true,
          capital_restant_du: 0,
          mensualite: 0,
          taux: 0,
          echeance_finale: new Date(),
          assurance_mensuelle: 0,
        }
      })
    } else {
      updateBienImmobilier(selectedBien, { pret: null })
    }
  }

  const totals = useMemo(() => {
    const totalValeur = assessment.biens_immobiliers.reduce((sum, b) => sum + b.valeur_venale, 0)
    const totalEmprunts = assessment.biens_immobiliers.reduce((sum, b) => sum + (b.pret?.capital_restant_du || 0), 0)
    const netValue = totalValeur - totalEmprunts
    const revenus = assessment.biens_immobiliers.reduce((sum, b) => sum + (b.revenus_locatifs?.revenus_nets_annuels || 0), 0)
    
    return { totalValeur, totalEmprunts, netValue, revenus }
  }, [assessment.biens_immobiliers])

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F172A] to-[#1E293B] p-6">
      <div className="container mx-auto max-w-5xl">
        <div className="mb-8">
          <p className="text-[#FFFBEB]/70 text-sm">Étape 7 sur 11</p>
          <h1 className="text-3xl font-bold text-white mt-2">🏠 Immobilier</h1>
          <p className="text-[#FFFBEB]/60 mt-2">Biens immobiliers et SCPI</p>
        </div>

        <div className="mb-8">
          <div className="w-full bg-[#1E293B] rounded-full h-2">
            <div className="bg-[#F59E0B] h-2 rounded-full transition-all duration-300" style={{ width: '63%' }}></div>
          </div>
        </div>

        {/* Property Selector */}
        <div className="mb-6 flex gap-4 flex-wrap">
          {assessment.biens_immobiliers.map(bien => (
            <Button
              key={bien.id}
              variant={selectedBien === bien.id ? 'default' : 'outline'}
              onClick={() => setSelectedBien(bien.id)}
              className={selectedBien === bien.id ? 'bg-[#F59E0B] text-[#0F172A]' : 'border-[#334155] text-white'}
            >
              <Home className="w-4 h-4 mr-2" />
              {bien.type}
            </Button>
          ))}
          <Button
            variant="outline"
            onClick={() => setShowAddBien(!showAddBien)}
            className="border-[#F59E0B] text-[#F59E0B]"
          >
            <Plus className="w-4 h-4 mr-2" />
            Ajouter un bien
          </Button>
        </div>

        {/* Add Property Form */}
        {showAddBien && (
          <Card className="mb-6 bg-[#1E293B] border-[#F59E0B]/30">
            <CardHeader>
              <CardTitle className="text-white">Nouveau bien immobilier</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <Label className="text-[#FFFBEB]">Type de bien *</Label>
                  <Select
                    value={newBien.type}
                    onChange={(e) => setNewBien({ ...newBien, type: e.target.value as any })}
                    className="mt-1 bg-[#0F172A] border-[#334155] text-white"
                  >
                    <option value="Résidence principale">Résidence principale</option>
                    <option value="Résidence secondaire">Résidence secondaire</option>
                    <option value="Locatif">Locatif</option>
                    <option value="SCI">SCI</option>
                    <option value="SCPI">SCPI</option>
                  </Select>
                </div>
                <div>
                  <Label className="text-[#FFFBEB]">Adresse *</Label>
                  <Input
                    value={newBien.adresse}
                    onChange={(e) => setNewBien({ ...newBien, adresse: e.target.value })}
                    placeholder="12 rue de la République, 75001 Paris"
                    className="mt-1 bg-[#0F172A] border-[#334155] text-white"
                  />
                </div>
                <div>
                  <Label className="text-[#FFFBEB]">Valeur vénale (€)</Label>
                  <Input
                    type="number"
                    value={newBien.valeur_venale}
                    onChange={(e) => setNewBien({ ...newBien, valeur_venale: parseFloat(e.target.value) || 0 })}
                    className="mt-1 bg-[#0F172A] border-[#334155] text-white"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button className="bg-[#F59E0B] text-[#0F172A]" onClick={handleAddBien}>Ajouter</Button>
                <Button variant="outline" onClick={() => setShowAddBien(false)} className="border-[#334155] text-white">Annuler</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Current Property Display */}
        {currentBien ? (
          <>
            <Card className="mb-6 bg-[#1E293B] border-[#334155]">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-white text-2xl flex items-center gap-2">
                      <Building className="w-6 h-6 text-[#F59E0B]" />
                      {currentBien.type}
                    </CardTitle>
                    <p className="text-[#FFFBEB]/70 mt-1">{currentBien.adresse}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-[#F59E0B]">{formatCurrency(currentBien.valeur_venale)}</p>
                    <p className="text-[#FFFBEB]/70 text-sm">Valeur vénale</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-[#FFFBEB]">Valeur vénale (€)</Label>
                  <Input
                    type="number"
                    value={currentBien.valeur_venale}
                    onChange={(e) => updateBienImmobilier(currentBien.id, { valeur_venale: parseFloat(e.target.value) || 0 })}
                    className="mt-1 bg-[#0F172A] border-[#334155] text-white"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Loan Section */}
            <Card className="mb-6 bg-[#1E293B] border-[#334155]">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white">Financement</CardTitle>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={currentBien.pret !== null}
                      onChange={(e) => handleTogglePret(e.target.checked)}
                      className="w-4 h-4 text-[#F59E0B] focus:ring-[#F59E0B]"
                    />
                    <Label className="text-[#FFFBEB]">Ce bien est financé par un prêt</Label>
                  </div>
                </div>
              </CardHeader>
              {currentBien.pret && (
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-[#FFFBEB]">Capital restant dû (€)</Label>
                      <Input
                        type="number"
                        value={currentBien.pret.capital_restant_du || 0}
                        onChange={(e) => updateBienImmobilier(currentBien.id, {
                          pret: { ...currentBien.pret, capital_restant_du: parseFloat(e.target.value) || 0 }
                        })}
                        className="mt-1 bg-[#0F172A] border-[#334155] text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-[#FFFBEB]">Mensualité (€)</Label>
                      <Input
                        type="number"
                        value={currentBien.pret.mensualite || 0}
                        onChange={(e) => updateBienImmobilier(currentBien.id, {
                          pret: { ...currentBien.pret, mensualite: parseFloat(e.target.value) || 0 }
                        })}
                        className="mt-1 bg-[#0F172A] border-[#334155] text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-[#FFFBEB]">Taux d'intérêt (%)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={currentBien.pret.taux || 0}
                        onChange={(e) => updateBienImmobilier(currentBien.id, {
                          pret: { ...currentBien.pret, taux: parseFloat(e.target.value) || 0 }
                        })}
                        className="mt-1 bg-[#0F172A] border-[#334155] text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-[#FFFBEB]">Échéance finale</Label>
                      <Input
                        type="date"
                        value={currentBien.pret.echeance_finale?.toISOString().split('T')[0] || ''}
                        onChange={(e) => updateBienImmobilier(currentBien.id, {
                          pret: { ...currentBien.pret, echeance_finale: new Date(e.target.value) }
                        })}
                        className="mt-1 bg-[#0F172A] border-[#334155] text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-[#FFFBEB]">Assurance emprunteur (€/mois)</Label>
                      <Input
                        type="number"
                        value={currentBien.pret.assurance_mensuelle || 0}
                        onChange={(e) => updateBienImmobilier(currentBien.id, {
                          pret: { ...currentBien.pret, assurance_mensuelle: parseFloat(e.target.value) || 0 }
                        })}
                        className="mt-1 bg-[#0F172A] border-[#334155] text-white"
                      />
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>

            {/* Rental Income (if Locatif) */}
            {currentBien.type === 'Locatif' && (
              <Card className="mb-6 bg-[#1E293B] border-[#334155]">
                <CardHeader>
                  <CardTitle className="text-white">Revenus locatifs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-[#FFFBEB]">Loyer mensuel (€)</Label>
                      <Input
                        type="number"
                        value={currentBien.revenus_locatifs?.loyer_mensuel || 0}
                        onChange={(e) => {
                          const loyer = parseFloat(e.target.value) || 0
                          const charges = currentBien.revenus_locatifs?.charges_mensuelles || 0
                          const taxe = currentBien.revenus_locatifs?.taxe_fonciere_annuelle || 0
                          const revenus_nets_annuels = (loyer - charges) * 12 - taxe
                          updateBienImmobilier(currentBien.id, {
                            revenus_locatifs: {
                              loyer_mensuel: loyer,
                              charges_mensuelles: charges,
                              taxe_fonciere_annuelle: taxe,
                              revenus_nets_annuels,
                            }
                          })
                        }}
                        className="mt-1 bg-[#0F172A] border-[#334155] text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-[#FFFBEB]">Charges mensuelles (€)</Label>
                      <Input
                        type="number"
                        value={currentBien.revenus_locatifs?.charges_mensuelles || 0}
                        onChange={(e) => {
                          const loyer = currentBien.revenus_locatifs?.loyer_mensuel || 0
                          const charges = parseFloat(e.target.value) || 0
                          const taxe = currentBien.revenus_locatifs?.taxe_fonciere_annuelle || 0
                          const revenus_nets_annuels = (loyer - charges) * 12 - taxe
                          updateBienImmobilier(currentBien.id, {
                            revenus_locatifs: {
                              loyer_mensuel: loyer,
                              charges_mensuelles: charges,
                              taxe_fonciere_annuelle: taxe,
                              revenus_nets_annuels,
                            }
                          })
                        }}
                        className="mt-1 bg-[#0F172A] border-[#334155] text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-[#FFFBEB]">Taxe foncière annuelle (€)</Label>
                      <Input
                        type="number"
                        value={currentBien.revenus_locatifs?.taxe_fonciere_annuelle || 0}
                        onChange={(e) => {
                          const loyer = currentBien.revenus_locatifs?.loyer_mensuel || 0
                          const charges = currentBien.revenus_locatifs?.charges_mensuelles || 0
                          const taxe = parseFloat(e.target.value) || 0
                          const revenus_nets_annuels = (loyer - charges) * 12 - taxe
                          updateBienImmobilier(currentBien.id, {
                            revenus_locatifs: {
                              loyer_mensuel: loyer,
                              charges_mensuelles: charges,
                              taxe_fonciere_annuelle: taxe,
                              revenus_nets_annuels,
                            }
                          })
                        }}
                        className="mt-1 bg-[#0F172A] border-[#334155] text-white"
                      />
                    </div>
                  </div>
                  <div className="mt-4 p-4 bg-[#F59E0B]/10 rounded-lg border border-[#F59E0B]/30">
                    <p className="text-sm text-[#FFFBEB]/70">Revenus nets annuels</p>
                    <p className="text-3xl font-bold text-[#F59E0B]">
                      {formatCurrency(currentBien.revenus_locatifs?.revenus_nets_annuels || 0)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* SCPI Details */}
            {currentBien.type === 'SCPI' && (
              <Card className="mb-6 bg-[#1E293B] border-[#334155]">
                <CardHeader>
                  <CardTitle className="text-white">Détails SCPI</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-[#FFFBEB]">Nom de la SCPI</Label>
                      <Input
                        value={currentBien.scpi?.nom_scpi || ''}
                        onChange={(e) => updateBienImmobilier(currentBien.id, {
                          scpi: { ...currentBien.scpi, nom_scpi: e.target.value } as any
                        })}
                        placeholder="Corum Origin..."
                        className="mt-1 bg-[#0F172A] border-[#334155] text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-[#FFFBEB]">Nombre de parts</Label>
                      <Input
                        type="number"
                        value={currentBien.scpi?.nombre_parts || 0}
                        onChange={(e) => {
                          const parts = parseFloat(e.target.value) || 0
                          const valeur = currentBien.scpi?.valeur_part || 0
                          updateBienImmobilier(currentBien.id, {
                            scpi: { ...currentBien.scpi, nombre_parts: parts } as any,
                            valeur_venale: parts * valeur,
                          })
                        }}
                        className="mt-1 bg-[#0F172A] border-[#334155] text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-[#FFFBEB]">Valeur par part (€)</Label>
                      <Input
                        type="number"
                        value={currentBien.scpi?.valeur_part || 0}
                        onChange={(e) => {
                          const valeur = parseFloat(e.target.value) || 0
                          const parts = currentBien.scpi?.nombre_parts || 0
                          updateBienImmobilier(currentBien.id, {
                            scpi: { ...currentBien.scpi, valeur_part: valeur } as any,
                            valeur_venale: parts * valeur,
                          })
                        }}
                        className="mt-1 bg-[#0F172A] border-[#334155] text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-[#FFFBEB]">Rendement annuel (%)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={currentBien.scpi?.rendement_annuel || 0}
                        onChange={(e) => updateBienImmobilier(currentBien.id, {
                          scpi: { ...currentBien.scpi, rendement_annuel: parseFloat(e.target.value) || 0 } as any
                        })}
                        className="mt-1 bg-[#0F172A] border-[#334155] text-white"
                      />
                    </div>
                  </div>
                  {currentBien.scpi && (
                    <div className="mt-4 grid grid-cols-2 gap-4">
                      <div className="p-4 bg-[#F59E0B]/10 rounded-lg border border-[#F59E0B]/30">
                        <p className="text-sm text-[#FFFBEB]/70">Valeur totale</p>
                        <p className="text-2xl font-bold text-[#F59E0B]">
                          {formatCurrency(currentBien.valeur_venale)}
                        </p>
                      </div>
                      <div className="p-4 bg-[#F59E0B]/10 rounded-lg border border-[#F59E0B]/30">
                        <p className="text-sm text-[#FFFBEB]/70">Revenus annuels estimés</p>
                        <p className="text-2xl font-bold text-[#F59E0B]">
                          {formatCurrency(currentBien.valeur_venale * (currentBien.scpi.rendement_annuel / 100))}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </>
        ) : (
          <Card className="bg-[#1E293B] border-[#334155]">
            <CardContent className="py-12 text-center">
              <Home className="w-16 h-16 text-[#F59E0B]/50 mx-auto mb-4" />
              <p className="text-[#FFFBEB]/70 text-lg">
                Aucun bien immobilier. Cliquez sur "Ajouter un bien" pour commencer.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Summary Card */}
        <Card className="bg-gradient-to-r from-[#F59E0B]/20 to-[#F59E0B]/5 border-[#F59E0B]/50 mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-[#FFFBEB]/70">Valeur immobilière totale</p>
                <p className="text-2xl font-bold text-white">{formatCurrency(totals.totalValeur)}</p>
              </div>
              <div>
                <p className="text-sm text-[#FFFBEB]/70">Emprunts restants</p>
                <p className="text-2xl font-bold text-orange-400">{formatCurrency(totals.totalEmprunts)}</p>
              </div>
              <div>
                <p className="text-sm text-[#FFFBEB]/70">Patrimoine immobilier net</p>
                <p className="text-3xl font-bold text-[#F59E0B]">{formatCurrency(totals.netValue)}</p>
              </div>
              <div>
                <p className="text-sm text-[#FFFBEB]/70">Revenus locatifs annuels</p>
                <p className="text-2xl font-bold text-green-400">{formatCurrency(totals.revenus)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={() => router.push('/client/patrimoine/bourse')}
            className="border-[#334155] text-white"
          >
            ← Enveloppes Boursières
          </Button>
          <Button
            className="bg-[#F59E0B] text-[#0F172A] hover:bg-[#D97706]"
            onClick={() => router.push('/client/patrimoine/societe')}
          >
            Suivant →
          </Button>
        </div>
      </div>
    </div>
  )
}
