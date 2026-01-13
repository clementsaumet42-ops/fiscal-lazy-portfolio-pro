'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useClientStore } from '@/store/client-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { AutresActifs, CryptoMonnaie, MetalPrecieux, OeuvreArt, VehiculeCollection } from '@/lib/types/assessment'
import { formatCurrency, formatDate, generateId } from '@/lib/utils/assessment/helpers'
import { Coins, Plus, Trash2, Gem, Palette, Car } from 'lucide-react'

export default function AutresActifsPage() {
  const router = useRouter()
  const { assessment, setAutresActifs } = useClientStore()
  
  const [formData, setFormData] = useState<AutresActifs>(
    assessment.autres_actifs || {
      crypto_monnaies: [],
      metaux_precieux: [],
      oeuvres_art: [],
      vehicules_collection: [],
    }
  )

  // Crypto
  const [showAddCrypto, setShowAddCrypto] = useState(false)
  const [newCrypto, setNewCrypto] = useState<Partial<CryptoMonnaie>>({
    nom: '', quantite: 0, valeur_unitaire: 0, valeur_totale: 0
  })

  // Metal
  const [showAddMetal, setShowAddMetal] = useState(false)
  const [newMetal, setNewMetal] = useState<Partial<MetalPrecieux>>({
    type: 'Or', quantite_grammes: 0, valeur_totale: 0
  })

  // Art
  const [showAddArt, setShowAddArt] = useState(false)
  const [newArt, setNewArt] = useState<Partial<OeuvreArt>>({
    description: '', valeur_estimee: 0, date_acquisition: new Date()
  })

  // Vehicle
  const [showAddVehicle, setShowAddVehicle] = useState(false)
  const [newVehicle, setNewVehicle] = useState<Partial<VehiculeCollection>>({
    modele: '', annee: new Date().getFullYear(), valeur_estimee: 0
  })

  const handleAddCrypto = () => {
    if (!newCrypto.nom) return
    const crypto: CryptoMonnaie = {
      id: generateId(),
      nom: newCrypto.nom,
      quantite: newCrypto.quantite || 0,
      valeur_unitaire: newCrypto.valeur_unitaire || 0,
      valeur_totale: (newCrypto.quantite || 0) * (newCrypto.valeur_unitaire || 0),
    }
    setFormData(prev => ({ ...prev, crypto_monnaies: [...prev.crypto_monnaies, crypto] }))
    setShowAddCrypto(false)
    setNewCrypto({ nom: '', quantite: 0, valeur_unitaire: 0, valeur_totale: 0 })
  }

  const handleAddMetal = () => {
    const metal: MetalPrecieux = {
      id: generateId(),
      type: newMetal.type as any,
      quantite_grammes: newMetal.quantite_grammes || 0,
      valeur_totale: newMetal.valeur_totale || 0,
    }
    setFormData(prev => ({ ...prev, metaux_precieux: [...prev.metaux_precieux, metal] }))
    setShowAddMetal(false)
    setNewMetal({ type: 'Or', quantite_grammes: 0, valeur_totale: 0 })
  }

  const handleAddArt = () => {
    if (!newArt.description) return
    const art: OeuvreArt = {
      id: generateId(),
      description: newArt.description,
      valeur_estimee: newArt.valeur_estimee || 0,
      date_acquisition: newArt.date_acquisition || new Date(),
    }
    setFormData(prev => ({ ...prev, oeuvres_art: [...prev.oeuvres_art, art] }))
    setShowAddArt(false)
    setNewArt({ description: '', valeur_estimee: 0, date_acquisition: new Date() })
  }

  const handleAddVehicle = () => {
    if (!newVehicle.modele) return
    const vehicle: VehiculeCollection = {
      id: generateId(),
      modele: newVehicle.modele,
      annee: newVehicle.annee || new Date().getFullYear(),
      valeur_estimee: newVehicle.valeur_estimee || 0,
    }
    setFormData(prev => ({ ...prev, vehicules_collection: [...prev.vehicules_collection, vehicle] }))
    setShowAddVehicle(false)
    setNewVehicle({ modele: '', annee: new Date().getFullYear(), valeur_estimee: 0 })
  }

  const totalAutres = useMemo(() => {
    const crypto = formData.crypto_monnaies.reduce((sum, c) => sum + c.valeur_totale, 0)
    const metaux = formData.metaux_precieux.reduce((sum, m) => sum + m.valeur_totale, 0)
    const art = formData.oeuvres_art.reduce((sum, o) => sum + o.valeur_estimee, 0)
    const vehicles = formData.vehicules_collection.reduce((sum, v) => sum + v.valeur_estimee, 0)
    return crypto + metaux + art + vehicles
  }, [formData])

  const handleNext = () => {
    setAutresActifs(formData)
    router.push('/client/synthese')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F172A] to-[#1E293B] p-6">
      <div className="container mx-auto max-w-5xl">
        <div className="mb-8">
          <p className="text-[#FFFBEB]/70 text-sm">Étape 9 sur 11</p>
          <h1 className="text-3xl font-bold text-white mt-2">💎 Autres Actifs</h1>
          <p className="text-[#FFFBEB]/60 mt-2">Cryptomonnaies, métaux précieux, œuvres d'art, véhicules de collection</p>
        </div>

        <div className="mb-8">
          <div className="w-full bg-[#1E293B] rounded-full h-2">
            <div className="bg-[#F59E0B] h-2 rounded-full transition-all duration-300" style={{ width: '81%' }}></div>
          </div>
        </div>

        {/* Crypto */}
        <Card className="mb-6 bg-[#1E293B] border-[#334155]">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-[#F59E0B]" />
                <CardTitle className="text-white">Cryptomonnaies</CardTitle>
              </div>
              <Button variant="outline" size="sm" onClick={() => setShowAddCrypto(true)} className="border-[#F59E0B] text-[#F59E0B]">
                <Plus className="w-4 h-4 mr-2" />Ajouter
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {showAddCrypto && (
              <div className="mb-4 p-4 border border-[#F59E0B]/30 rounded-lg bg-[#0F172A]">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <Label className="text-[#FFFBEB]">Nom *</Label>
                    <Input value={newCrypto.nom} onChange={(e) => setNewCrypto({ ...newCrypto, nom: e.target.value })} placeholder="Bitcoin, Ethereum..." className="mt-1 bg-[#1E293B] border-[#334155] text-white" />
                  </div>
                  <div>
                    <Label className="text-[#FFFBEB]">Quantité</Label>
                    <Input type="number" step="0.00000001" value={newCrypto.quantite} onChange={(e) => {
                      const q = parseFloat(e.target.value) || 0
                      setNewCrypto({ ...newCrypto, quantite: q, valeur_totale: q * (newCrypto.valeur_unitaire || 0) })
                    }} className="mt-1 bg-[#1E293B] border-[#334155] text-white" />
                  </div>
                  <div>
                    <Label className="text-[#FFFBEB]">Valeur unitaire (€)</Label>
                    <Input type="number" value={newCrypto.valeur_unitaire} onChange={(e) => {
                      const v = parseFloat(e.target.value) || 0
                      setNewCrypto({ ...newCrypto, valeur_unitaire: v, valeur_totale: (newCrypto.quantite || 0) * v })
                    }} className="mt-1 bg-[#1E293B] border-[#334155] text-white" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" className="bg-[#F59E0B] text-[#0F172A]" onClick={handleAddCrypto}>Ajouter</Button>
                  <Button variant="outline" size="sm" onClick={() => setShowAddCrypto(false)} className="border-[#334155] text-white">Annuler</Button>
                </div>
              </div>
            )}
            <Table>
              <TableHeader>
                <TableRow className="border-[#334155]">
                  <TableHead className="text-[#F59E0B]">Nom</TableHead>
                  <TableHead className="text-[#F59E0B] text-right">Quantité</TableHead>
                  <TableHead className="text-[#F59E0B] text-right">Valeur unitaire</TableHead>
                  <TableHead className="text-[#F59E0B] text-right">Valeur totale</TableHead>
                  <TableHead className="text-[#F59E0B]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {formData.crypto_monnaies.length === 0 ? (
                  <TableRow className="border-[#334155]">
                    <TableCell colSpan={5} className="text-center text-[#FFFBEB]/50 py-4">Aucune cryptomonnaie</TableCell>
                  </TableRow>
                ) : (
                  formData.crypto_monnaies.map(crypto => (
                    <TableRow key={crypto.id} className="border-[#334155]">
                      <TableCell className="text-white">{crypto.nom}</TableCell>
                      <TableCell className="text-right text-white">{crypto.quantite}</TableCell>
                      <TableCell className="text-right text-white">{formatCurrency(crypto.valeur_unitaire)}</TableCell>
                      <TableCell className="text-right font-semibold text-white">{formatCurrency(crypto.valeur_totale)}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => setFormData(prev => ({ ...prev, crypto_monnaies: prev.crypto_monnaies.filter(c => c.id !== crypto.id) }))} className="hover:bg-red-500/10">
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Metals */}
        <Card className="mb-6 bg-[#1E293B] border-[#334155]">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gem className="w-5 h-5 text-[#F59E0B]" />
                <CardTitle className="text-white">Métaux précieux</CardTitle>
              </div>
              <Button variant="outline" size="sm" onClick={() => setShowAddMetal(true)} className="border-[#F59E0B] text-[#F59E0B]">
                <Plus className="w-4 h-4 mr-2" />Ajouter
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {showAddMetal && (
              <div className="mb-4 p-4 border border-[#F59E0B]/30 rounded-lg bg-[#0F172A]">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <Label className="text-[#FFFBEB]">Type</Label>
                    <Select value={newMetal.type} onChange={(e) => setNewMetal({ ...newMetal, type: e.target.value as any })} className="mt-1 bg-[#1E293B] border-[#334155] text-white">
                      <option value="Or">Or</option>
                      <option value="Argent">Argent</option>
                      <option value="Platine">Platine</option>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-[#FFFBEB]">Quantité (grammes)</Label>
                    <Input type="number" value={newMetal.quantite_grammes} onChange={(e) => setNewMetal({ ...newMetal, quantite_grammes: parseFloat(e.target.value) || 0 })} className="mt-1 bg-[#1E293B] border-[#334155] text-white" />
                  </div>
                  <div>
                    <Label className="text-[#FFFBEB]">Valeur totale (€)</Label>
                    <Input type="number" value={newMetal.valeur_totale} onChange={(e) => setNewMetal({ ...newMetal, valeur_totale: parseFloat(e.target.value) || 0 })} className="mt-1 bg-[#1E293B] border-[#334155] text-white" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" className="bg-[#F59E0B] text-[#0F172A]" onClick={handleAddMetal}>Ajouter</Button>
                  <Button variant="outline" size="sm" onClick={() => setShowAddMetal(false)} className="border-[#334155] text-white">Annuler</Button>
                </div>
              </div>
            )}
            <Table>
              <TableHeader>
                <TableRow className="border-[#334155]">
                  <TableHead className="text-[#F59E0B]">Type</TableHead>
                  <TableHead className="text-[#F59E0B] text-right">Quantité (g)</TableHead>
                  <TableHead className="text-[#F59E0B] text-right">Valeur totale</TableHead>
                  <TableHead className="text-[#F59E0B]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {formData.metaux_precieux.length === 0 ? (
                  <TableRow className="border-[#334155]">
                    <TableCell colSpan={4} className="text-center text-[#FFFBEB]/50 py-4">Aucun métal précieux</TableCell>
                  </TableRow>
                ) : (
                  formData.metaux_precieux.map(metal => (
                    <TableRow key={metal.id} className="border-[#334155]">
                      <TableCell className="text-white">{metal.type}</TableCell>
                      <TableCell className="text-right text-white">{metal.quantite_grammes} g</TableCell>
                      <TableCell className="text-right font-semibold text-white">{formatCurrency(metal.valeur_totale)}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => setFormData(prev => ({ ...prev, metaux_precieux: prev.metaux_precieux.filter(m => m.id !== metal.id) }))} className="hover:bg-red-500/10">
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Art */}
        <Card className="mb-6 bg-[#1E293B] border-[#334155]">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Palette className="w-5 h-5 text-[#F59E0B]" />
                <CardTitle className="text-white">Œuvres d'art</CardTitle>
              </div>
              <Button variant="outline" size="sm" onClick={() => setShowAddArt(true)} className="border-[#F59E0B] text-[#F59E0B]">
                <Plus className="w-4 h-4 mr-2" />Ajouter
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {showAddArt && (
              <div className="mb-4 p-4 border border-[#F59E0B]/30 rounded-lg bg-[#0F172A]">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <Label className="text-[#FFFBEB]">Description *</Label>
                    <Input value={newArt.description} onChange={(e) => setNewArt({ ...newArt, description: e.target.value })} placeholder="Tableau de..." className="mt-1 bg-[#1E293B] border-[#334155] text-white" />
                  </div>
                  <div>
                    <Label className="text-[#FFFBEB]">Valeur estimée (€)</Label>
                    <Input type="number" value={newArt.valeur_estimee} onChange={(e) => setNewArt({ ...newArt, valeur_estimee: parseFloat(e.target.value) || 0 })} className="mt-1 bg-[#1E293B] border-[#334155] text-white" />
                  </div>
                  <div>
                    <Label className="text-[#FFFBEB]">Date d'acquisition</Label>
                    <Input type="date" value={newArt.date_acquisition?.toISOString().split('T')[0]} onChange={(e) => setNewArt({ ...newArt, date_acquisition: new Date(e.target.value) })} className="mt-1 bg-[#1E293B] border-[#334155] text-white" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" className="bg-[#F59E0B] text-[#0F172A]" onClick={handleAddArt}>Ajouter</Button>
                  <Button variant="outline" size="sm" onClick={() => setShowAddArt(false)} className="border-[#334155] text-white">Annuler</Button>
                </div>
              </div>
            )}
            <Table>
              <TableHeader>
                <TableRow className="border-[#334155]">
                  <TableHead className="text-[#F59E0B]">Description</TableHead>
                  <TableHead className="text-[#F59E0B] text-right">Valeur estimée</TableHead>
                  <TableHead className="text-[#F59E0B]">Date d'acquisition</TableHead>
                  <TableHead className="text-[#F59E0B]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {formData.oeuvres_art.length === 0 ? (
                  <TableRow className="border-[#334155]">
                    <TableCell colSpan={4} className="text-center text-[#FFFBEB]/50 py-4">Aucune œuvre d'art</TableCell>
                  </TableRow>
                ) : (
                  formData.oeuvres_art.map(art => (
                    <TableRow key={art.id} className="border-[#334155]">
                      <TableCell className="text-white">{art.description}</TableCell>
                      <TableCell className="text-right font-semibold text-white">{formatCurrency(art.valeur_estimee)}</TableCell>
                      <TableCell className="text-[#FFFBEB]/70">{formatDate(art.date_acquisition)}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => setFormData(prev => ({ ...prev, oeuvres_art: prev.oeuvres_art.filter(o => o.id !== art.id) }))} className="hover:bg-red-500/10">
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Vehicles */}
        <Card className="mb-6 bg-[#1E293B] border-[#334155]">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Car className="w-5 h-5 text-[#F59E0B]" />
                <CardTitle className="text-white">Véhicules de collection</CardTitle>
              </div>
              <Button variant="outline" size="sm" onClick={() => setShowAddVehicle(true)} className="border-[#F59E0B] text-[#F59E0B]">
                <Plus className="w-4 h-4 mr-2" />Ajouter
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {showAddVehicle && (
              <div className="mb-4 p-4 border border-[#F59E0B]/30 rounded-lg bg-[#0F172A]">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <Label className="text-[#FFFBEB]">Modèle *</Label>
                    <Input value={newVehicle.modele} onChange={(e) => setNewVehicle({ ...newVehicle, modele: e.target.value })} placeholder="Porsche 911..." className="mt-1 bg-[#1E293B] border-[#334155] text-white" />
                  </div>
                  <div>
                    <Label className="text-[#FFFBEB]">Année</Label>
                    <Input type="number" min="1900" max={new Date().getFullYear()} value={newVehicle.annee} onChange={(e) => setNewVehicle({ ...newVehicle, annee: parseInt(e.target.value) || new Date().getFullYear() })} className="mt-1 bg-[#1E293B] border-[#334155] text-white" />
                  </div>
                  <div>
                    <Label className="text-[#FFFBEB]">Valeur estimée (€)</Label>
                    <Input type="number" value={newVehicle.valeur_estimee} onChange={(e) => setNewVehicle({ ...newVehicle, valeur_estimee: parseFloat(e.target.value) || 0 })} className="mt-1 bg-[#1E293B] border-[#334155] text-white" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" className="bg-[#F59E0B] text-[#0F172A]" onClick={handleAddVehicle}>Ajouter</Button>
                  <Button variant="outline" size="sm" onClick={() => setShowAddVehicle(false)} className="border-[#334155] text-white">Annuler</Button>
                </div>
              </div>
            )}
            <Table>
              <TableHeader>
                <TableRow className="border-[#334155]">
                  <TableHead className="text-[#F59E0B]">Modèle</TableHead>
                  <TableHead className="text-[#F59E0B]">Année</TableHead>
                  <TableHead className="text-[#F59E0B] text-right">Valeur estimée</TableHead>
                  <TableHead className="text-[#F59E0B]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {formData.vehicules_collection.length === 0 ? (
                  <TableRow className="border-[#334155]">
                    <TableCell colSpan={4} className="text-center text-[#FFFBEB]/50 py-4">Aucun véhicule de collection</TableCell>
                  </TableRow>
                ) : (
                  formData.vehicules_collection.map(vehicle => (
                    <TableRow key={vehicle.id} className="border-[#334155]">
                      <TableCell className="text-white">{vehicle.modele}</TableCell>
                      <TableCell className="text-[#FFFBEB]/70">{vehicle.annee}</TableCell>
                      <TableCell className="text-right font-semibold text-white">{formatCurrency(vehicle.valeur_estimee)}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => setFormData(prev => ({ ...prev, vehicules_collection: prev.vehicules_collection.filter(v => v.id !== vehicle.id) }))} className="hover:bg-red-500/10">
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Summary */}
        <Card className="bg-gradient-to-r from-[#F59E0B]/20 to-[#F59E0B]/5 border-[#F59E0B]/50 mb-6">
          <CardContent className="pt-6 text-center">
            <p className="text-sm text-[#FFFBEB]/70 mb-2">Total Autres Actifs</p>
            <p className="text-5xl font-bold text-[#F59E0B]">{formatCurrency(totalAutres)}</p>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <Button variant="outline" onClick={() => router.push('/client/patrimoine/societe')} className="border-[#334155] text-white">← Société IS</Button>
          <Button className="bg-[#F59E0B] text-[#0F172A] hover:bg-[#D97706]" size="lg" onClick={handleNext}>Suivant : Synthèse →</Button>
        </div>
      </div>
    </div>
  )
}
