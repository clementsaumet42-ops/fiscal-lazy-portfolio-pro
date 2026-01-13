'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useClientStore } from '@/store/client-store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { AutresActifs, CryptoMonnaie, MetalPrecieux, OeuvreArt, VehiculeCollection } from '@/lib/types/assessment'
import { generateId, formatCurrency, formatDate } from '@/lib/utils/assessment/helpers'
import { Gem, Plus, Trash2, Bitcoin, Palette, Car } from 'lucide-react'

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

  const [showAddCrypto, setShowAddCrypto] = useState(false)
  const [showAddMetal, setShowAddMetal] = useState(false)
  const [showAddOeuvre, setShowAddOeuvre] = useState(false)
  const [showAddVehicule, setShowAddVehicule] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setAutresActifs(formData)
    router.push('/client/synthese')
  }

  // Crypto
  const addCrypto = (nom: string, quantite: number, valeur_unitaire: number) => {
    const crypto: CryptoMonnaie = {
      id: generateId(),
      nom,
      quantite,
      valeur_unitaire,
      valeur_totale: quantite * valeur_unitaire,
    }
    setFormData(prev => ({
      ...prev,
      crypto_monnaies: [...prev.crypto_monnaies, crypto]
    }))
  }

  const removeCrypto = (id: string) => {
    setFormData(prev => ({
      ...prev,
      crypto_monnaies: prev.crypto_monnaies.filter(c => c.id !== id)
    }))
  }

  // Métaux précieux
  const addMetal = (type: 'Or' | 'Argent' | 'Platine', quantite_grammes: number, valeur_totale: number) => {
    const metal: MetalPrecieux = {
      id: generateId(),
      type,
      quantite_grammes,
      valeur_totale,
    }
    setFormData(prev => ({
      ...prev,
      metaux_precieux: [...prev.metaux_precieux, metal]
    }))
  }

  const removeMetal = (id: string) => {
    setFormData(prev => ({
      ...prev,
      metaux_precieux: prev.metaux_precieux.filter(m => m.id !== id)
    }))
  }

  // Œuvres d'art
  const addOeuvre = (description: string, valeur_estimee: number, date_acquisition: Date) => {
    const oeuvre: OeuvreArt = {
      id: generateId(),
      description,
      valeur_estimee,
      date_acquisition,
    }
    setFormData(prev => ({
      ...prev,
      oeuvres_art: [...prev.oeuvres_art, oeuvre]
    }))
  }

  const removeOeuvre = (id: string) => {
    setFormData(prev => ({
      ...prev,
      oeuvres_art: prev.oeuvres_art.filter(o => o.id !== id)
    }))
  }

  // Véhicules de collection
  const addVehicule = (modele: string, annee: number, valeur_estimee: number) => {
    const vehicule: VehiculeCollection = {
      id: generateId(),
      modele,
      annee,
      valeur_estimee,
    }
    setFormData(prev => ({
      ...prev,
      vehicules_collection: [...prev.vehicules_collection, vehicule]
    }))
  }

  const removeVehicule = (id: string) => {
    setFormData(prev => ({
      ...prev,
      vehicules_collection: prev.vehicules_collection.filter(v => v.id !== id)
    }))
  }

  // Calculate total
  const totalAutres = useMemo(() => {
    const cryptoTotal = formData.crypto_monnaies.reduce((sum, c) => sum + c.valeur_totale, 0)
    const metalTotal = formData.metaux_precieux.reduce((sum, m) => sum + m.valeur_totale, 0)
    const oeuvreTotal = formData.oeuvres_art.reduce((sum, o) => sum + o.valeur_estimee, 0)
    const vehiculeTotal = formData.vehicules_collection.reduce((sum, v) => sum + v.valeur_estimee, 0)
    return cryptoTotal + metalTotal + oeuvreTotal + vehiculeTotal
  }, [formData])

  return (
    <div className="min-h-screen bg-midnight">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            💎 Autres Actifs
          </h1>
          <p className="text-cream/70 text-lg">
            Étape 10/11 - Crypto, métaux, œuvres d'art, véhicules de collection
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="w-full bg-midnight-lighter rounded-full h-2">
            <div className="bg-gold h-2 rounded-full transition-all duration-300" style={{ width: '90%' }}></div>
          </div>
          <p className="text-cream/70 text-sm mt-2">Progression: 10 sur 11 étapes</p>
        </div>

        {/* Summary Card */}
        <Card className="bg-midnight-light border-midnight-lighter mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gold/10 rounded-lg">
                <Gem className="w-8 h-8 text-gold" />
              </div>
              <div>
                <p className="text-cream/70">Total autres actifs</p>
                <p className="text-4xl font-bold text-gold">
                  {formatCurrency(totalAutres)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Cryptomonnaies */}
          <Card className="bg-midnight-light border-midnight-lighter">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bitcoin className="w-6 h-6 text-gold" />
                  <CardTitle className="text-white">Cryptomonnaies</CardTitle>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddCrypto(!showAddCrypto)}
                  className="border-gold text-gold"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {showAddCrypto && (
                <div className="mb-4 p-4 border border-gold/30 rounded-lg bg-midnight">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                    <Input id="crypto-nom" placeholder="Bitcoin, Ethereum..." />
                    <Input id="crypto-qte" type="number" step="0.00000001" placeholder="Quantité" />
                    <Input id="crypto-valeur" type="number" step="0.01" placeholder="Valeur unitaire (€)" />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="gold"
                      size="sm"
                      onClick={() => {
                        const nom = (document.getElementById('crypto-nom') as HTMLInputElement).value
                        const qte = parseFloat((document.getElementById('crypto-qte') as HTMLInputElement).value)
                        const valeur = parseFloat((document.getElementById('crypto-valeur') as HTMLInputElement).value)
                        if (nom && qte && valeur) {
                          addCrypto(nom, qte, valeur)
                          setShowAddCrypto(false)
                        }
                      }}
                    >
                      Ajouter
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={() => setShowAddCrypto(false)}>Annuler</Button>
                  </div>
                </div>
              )}

              <Table className="bg-[#1E293B]">
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-gold">Actif</TableHead>
                    <TableHead className="text-gold text-right">Quantité</TableHead>
                    <TableHead className="text-gold text-right">Valeur unitaire</TableHead>
                    <TableHead className="text-gold text-right">Valeur totale</TableHead>
                    <TableHead className="text-gold"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {formData.crypto_monnaies.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-cream/50 py-8">Aucune cryptomonnaie</TableCell>
                    </TableRow>
                  ) : (
                    formData.crypto_monnaies.map(crypto => (
                      <TableRow key={crypto.id} className="hover:bg-midnight-lighter/50">
                        <TableCell className="text-white font-semibold">{crypto.nom}</TableCell>
                        <TableCell className="text-right text-white">{crypto.quantite}</TableCell>
                        <TableCell className="text-right text-white">{formatCurrency(crypto.valeur_unitaire)}</TableCell>
                        <TableCell className="text-right text-gold font-semibold">{formatCurrency(crypto.valeur_totale)}</TableCell>
                        <TableCell>
                          <Button type="button" variant="ghost" size="sm" onClick={() => removeCrypto(crypto.id)} className="hover:bg-red-500/10">
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

          {/* Métaux précieux */}
          <Card className="bg-midnight-light border-midnight-lighter">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Gem className="w-6 h-6 text-gold" />
                  <CardTitle className="text-white">Métaux précieux</CardTitle>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddMetal(!showAddMetal)}
                  className="border-gold text-gold"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {showAddMetal && (
                <div className="mb-4 p-4 border border-gold/30 rounded-lg bg-midnight">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                    <Select id="metal-type">
                      <option value="Or">Or</option>
                      <option value="Argent">Argent</option>
                      <option value="Platine">Platine</option>
                    </Select>
                    <Input id="metal-qte" type="number" placeholder="Quantité (grammes)" />
                    <Input id="metal-valeur" type="number" placeholder="Valeur totale (€)" />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="gold"
                      size="sm"
                      onClick={() => {
                        const type = (document.getElementById('metal-type') as HTMLSelectElement).value as any
                        const qte = parseFloat((document.getElementById('metal-qte') as HTMLInputElement).value)
                        const valeur = parseFloat((document.getElementById('metal-valeur') as HTMLInputElement).value)
                        if (type && qte && valeur) {
                          addMetal(type, qte, valeur)
                          setShowAddMetal(false)
                        }
                      }}
                    >
                      Ajouter
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={() => setShowAddMetal(false)}>Annuler</Button>
                  </div>
                </div>
              )}

              <Table className="bg-[#1E293B]">
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-gold">Type</TableHead>
                    <TableHead className="text-gold text-right">Quantité (g)</TableHead>
                    <TableHead className="text-gold text-right">Valeur totale</TableHead>
                    <TableHead className="text-gold"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {formData.metaux_precieux.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-cream/50 py-8">Aucun métal précieux</TableCell>
                    </TableRow>
                  ) : (
                    formData.metaux_precieux.map(metal => (
                      <TableRow key={metal.id} className="hover:bg-midnight-lighter/50">
                        <TableCell className="text-white font-semibold">{metal.type}</TableCell>
                        <TableCell className="text-right text-white">{metal.quantite_grammes} g</TableCell>
                        <TableCell className="text-right text-gold font-semibold">{formatCurrency(metal.valeur_totale)}</TableCell>
                        <TableCell>
                          <Button type="button" variant="ghost" size="sm" onClick={() => removeMetal(metal.id)} className="hover:bg-red-500/10">
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

          {/* Œuvres d'art */}
          <Card className="bg-midnight-light border-midnight-lighter">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Palette className="w-6 h-6 text-gold" />
                  <CardTitle className="text-white">Œuvres d'art</CardTitle>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddOeuvre(!showAddOeuvre)}
                  className="border-gold text-gold"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {showAddOeuvre && (
                <div className="mb-4 p-4 border border-gold/30 rounded-lg bg-midnight">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                    <Input id="oeuvre-desc" placeholder="Description" />
                    <Input id="oeuvre-valeur" type="number" placeholder="Valeur estimée (€)" />
                    <Input id="oeuvre-date" type="date" />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="gold"
                      size="sm"
                      onClick={() => {
                        const desc = (document.getElementById('oeuvre-desc') as HTMLInputElement).value
                        const valeur = parseFloat((document.getElementById('oeuvre-valeur') as HTMLInputElement).value)
                        const date = new Date((document.getElementById('oeuvre-date') as HTMLInputElement).value)
                        if (desc && valeur) {
                          addOeuvre(desc, valeur, date)
                          setShowAddOeuvre(false)
                        }
                      }}
                    >
                      Ajouter
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={() => setShowAddOeuvre(false)}>Annuler</Button>
                  </div>
                </div>
              )}

              <Table className="bg-[#1E293B]">
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-gold">Description</TableHead>
                    <TableHead className="text-gold">Date acquisition</TableHead>
                    <TableHead className="text-gold text-right">Valeur estimée</TableHead>
                    <TableHead className="text-gold"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {formData.oeuvres_art.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-cream/50 py-8">Aucune œuvre d'art</TableCell>
                    </TableRow>
                  ) : (
                    formData.oeuvres_art.map(oeuvre => (
                      <TableRow key={oeuvre.id} className="hover:bg-midnight-lighter/50">
                        <TableCell className="text-white font-semibold">{oeuvre.description}</TableCell>
                        <TableCell className="text-white">{formatDate(oeuvre.date_acquisition)}</TableCell>
                        <TableCell className="text-right text-gold font-semibold">{formatCurrency(oeuvre.valeur_estimee)}</TableCell>
                        <TableCell>
                          <Button type="button" variant="ghost" size="sm" onClick={() => removeOeuvre(oeuvre.id)} className="hover:bg-red-500/10">
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

          {/* Véhicules de collection */}
          <Card className="bg-midnight-light border-midnight-lighter">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Car className="w-6 h-6 text-gold" />
                  <CardTitle className="text-white">Véhicules de collection</CardTitle>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddVehicule(!showAddVehicule)}
                  className="border-gold text-gold"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {showAddVehicule && (
                <div className="mb-4 p-4 border border-gold/30 rounded-lg bg-midnight">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                    <Input id="vehicule-modele" placeholder="Modèle" />
                    <Input id="vehicule-annee" type="number" placeholder="Année" />
                    <Input id="vehicule-valeur" type="number" placeholder="Valeur estimée (€)" />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="gold"
                      size="sm"
                      onClick={() => {
                        const modele = (document.getElementById('vehicule-modele') as HTMLInputElement).value
                        const annee = parseInt((document.getElementById('vehicule-annee') as HTMLInputElement).value)
                        const valeur = parseFloat((document.getElementById('vehicule-valeur') as HTMLInputElement).value)
                        if (modele && annee && valeur) {
                          addVehicule(modele, annee, valeur)
                          setShowAddVehicule(false)
                        }
                      }}
                    >
                      Ajouter
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={() => setShowAddVehicule(false)}>Annuler</Button>
                  </div>
                </div>
              )}

              <Table className="bg-[#1E293B]">
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-gold">Modèle</TableHead>
                    <TableHead className="text-gold">Année</TableHead>
                    <TableHead className="text-gold text-right">Valeur estimée</TableHead>
                    <TableHead className="text-gold"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {formData.vehicules_collection.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-cream/50 py-8">Aucun véhicule de collection</TableCell>
                    </TableRow>
                  ) : (
                    formData.vehicules_collection.map(vehicule => (
                      <TableRow key={vehicule.id} className="hover:bg-midnight-lighter/50">
                        <TableCell className="text-white font-semibold">{vehicule.modele}</TableCell>
                        <TableCell className="text-white">{vehicule.annee}</TableCell>
                        <TableCell className="text-right text-gold font-semibold">{formatCurrency(vehicule.valeur_estimee)}</TableCell>
                        <TableCell>
                          <Button type="button" variant="ghost" size="sm" onClick={() => removeVehicule(vehicule.id)} className="hover:bg-red-500/10">
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

          {/* Navigation */}
          <div className="flex justify-between pt-6 border-t border-midnight-lighter">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/client/patrimoine/societes-is')}
            >
              ← Retour
            </Button>
            <Button type="submit" variant="gold" size="lg">
              Suivant : Synthèse →
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
