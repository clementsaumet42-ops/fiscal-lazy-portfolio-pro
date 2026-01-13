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
import { BilanCivil, Enfant } from '@/lib/types/assessment'
import { bilanCivilSchema } from '@/lib/validation/bilan-schemas'
import { formatDate, generateId } from '@/lib/utils/assessment/helpers'
import { User, Heart, Baby, Globe, Plus, Trash2 } from 'lucide-react'

export default function BilanCivilPage() {
  const router = useRouter()
  const { assessment, setBilanCivil } = useClientStore()
  
  const [formData, setFormData] = useState<BilanCivil>(
    assessment.bilan_civil || {
      nom: '',
      prenom: '',
      date_naissance: new Date(),
      lieu_naissance: '',
      nationalite: 'Française',
      situation_familiale: 'Célibataire',
      enfants: [],
      residence_fiscale: 'France',
    }
  )

  const [showAddChild, setShowAddChild] = useState(false)
  const [newChild, setNewChild] = useState<Partial<Enfant>>({
    prenom: '',
    date_naissance: new Date(),
    lien_filiation: 'Légitime',
  })
  
  const [errors, setErrors] = useState<Record<string, string>>({})

  const isMarriedOrPacsed = useMemo(() => {
    return formData.situation_familiale === 'Marié(e)' || formData.situation_familiale === 'Pacsé(e)'
  }, [formData.situation_familiale])

  const handleChange = (field: keyof BilanCivil, value: any) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value }
      // Reset marriage fields if not married/pacsed
      if (field === 'situation_familiale' && value !== 'Marié(e)' && value !== 'Pacsé(e)') {
        updated.regime_matrimonial = undefined
        updated.date_mariage = undefined
      }
      // Reset foreign country if France
      if (field === 'residence_fiscale' && value === 'France') {
        updated.pays_residence_fiscale = undefined
      }
      return updated
    })
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const handleAddChild = () => {
    if (!newChild.prenom) {
      alert('Le prénom de l\'enfant est requis')
      return
    }
    
    const child: Enfant = {
      id: generateId(),
      prenom: newChild.prenom,
      date_naissance: newChild.date_naissance || new Date(),
      lien_filiation: newChild.lien_filiation as 'Légitime' | 'Naturel' | 'Adopté',
    }
    
    setFormData(prev => ({
      ...prev,
      enfants: [...prev.enfants, child],
    }))
    
    setShowAddChild(false)
    setNewChild({ prenom: '', date_naissance: new Date(), lien_filiation: 'Légitime' })
  }

  const handleRemoveChild = (childId: string) => {
    setFormData(prev => ({
      ...prev,
      enfants: prev.enfants.filter(c => c.id !== childId),
    }))
  }

  const handleNext = () => {
    // Validate with Zod
    const result = bilanCivilSchema.safeParse(formData)
    
    if (!result.success) {
      const newErrors: Record<string, string> = {}
      result.error.errors.forEach(err => {
        const field = err.path[0] as string
        newErrors[field] = err.message
      })
      setErrors(newErrors)
      alert('Veuillez corriger les erreurs dans le formulaire')
      return
    }
    
    // Save to store
    setBilanCivil(formData)
    
    // Navigate
    router.push('/client/bilan/fiscal')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F172A] to-[#1E293B] p-6">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <p className="text-[#FFFBEB]/70 text-sm">Étape 2 sur 11</p>
          <h1 className="text-3xl font-bold text-white mt-2">
            👤 État Civil
          </h1>
          <p className="text-[#FFFBEB]/60 mt-2">
            Informations personnelles et situation familiale
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="w-full bg-[#1E293B] rounded-full h-2">
            <div className="bg-[#F59E0B] h-2 rounded-full transition-all duration-300" style={{ width: '18%' }}></div>
          </div>
        </div>

        {/* Personal Information Card */}
        <Card className="bg-[#1E293B] border-[#334155] mb-6">
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-[#F59E0B]" />
              <CardTitle className="text-white">Informations personnelles</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-[#FFFBEB]">Nom *</Label>
                <Input
                  value={formData.nom}
                  onChange={(e) => handleChange('nom', e.target.value)}
                  placeholder="Dupont"
                  className="mt-1 bg-[#0F172A] border-[#334155] text-white"
                />
                {errors.nom && <p className="text-red-400 text-sm mt-1">{errors.nom}</p>}
              </div>
              <div>
                <Label className="text-[#FFFBEB]">Prénom *</Label>
                <Input
                  value={formData.prenom}
                  onChange={(e) => handleChange('prenom', e.target.value)}
                  placeholder="Jean"
                  className="mt-1 bg-[#0F172A] border-[#334155] text-white"
                />
                {errors.prenom && <p className="text-red-400 text-sm mt-1">{errors.prenom}</p>}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-[#FFFBEB]">Date de naissance *</Label>
                <Input
                  type="date"
                  value={formData.date_naissance.toISOString().split('T')[0]}
                  onChange={(e) => handleChange('date_naissance', new Date(e.target.value))}
                  className="mt-1 bg-[#0F172A] border-[#334155] text-white"
                />
              </div>
              <div>
                <Label className="text-[#FFFBEB]">Lieu de naissance *</Label>
                <Input
                  value={formData.lieu_naissance}
                  onChange={(e) => handleChange('lieu_naissance', e.target.value)}
                  placeholder="Paris"
                  className="mt-1 bg-[#0F172A] border-[#334155] text-white"
                />
                {errors.lieu_naissance && <p className="text-red-400 text-sm mt-1">{errors.lieu_naissance}</p>}
              </div>
            </div>
            <div>
              <Label className="text-[#FFFBEB]">Nationalité *</Label>
              <Input
                value={formData.nationalite}
                onChange={(e) => handleChange('nationalite', e.target.value)}
                placeholder="Française"
                className="mt-1 bg-[#0F172A] border-[#334155] text-white"
              />
              {errors.nationalite && <p className="text-red-400 text-sm mt-1">{errors.nationalite}</p>}
            </div>
          </CardContent>
        </Card>

        {/* Family Status Card */}
        <Card className="bg-[#1E293B] border-[#334155] mb-6">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-[#F59E0B]" />
              <CardTitle className="text-white">Situation familiale</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-[#FFFBEB]">Situation familiale *</Label>
              <Select
                value={formData.situation_familiale}
                onChange={(e) => handleChange('situation_familiale', e.target.value)}
                className="mt-1 bg-[#0F172A] border-[#334155] text-white"
              >
                <option value="Célibataire">Célibataire</option>
                <option value="Marié(e)">Marié(e)</option>
                <option value="Pacsé(e)">Pacsé(e)</option>
                <option value="Divorcé(e)">Divorcé(e)</option>
                <option value="Veuf(ve)">Veuf(ve)</option>
              </Select>
            </div>

            {isMarriedOrPacsed && (
              <>
                <div>
                  <Label className="text-[#FFFBEB]">Régime matrimonial *</Label>
                  <Select
                    value={formData.regime_matrimonial || ''}
                    onChange={(e) => handleChange('regime_matrimonial', e.target.value)}
                    className="mt-1 bg-[#0F172A] border-[#334155] text-white"
                  >
                    <option value="">Sélectionner...</option>
                    <option value="Communauté réduite aux acquêts">Communauté réduite aux acquêts</option>
                    <option value="Séparation de biens">Séparation de biens</option>
                    <option value="Communauté universelle">Communauté universelle</option>
                    <option value="Participation aux acquêts">Participation aux acquêts</option>
                  </Select>
                </div>
                <div>
                  <Label className="text-[#FFFBEB]">Date de mariage/PACS</Label>
                  <Input
                    type="date"
                    value={formData.date_mariage?.toISOString().split('T')[0] || ''}
                    onChange={(e) => handleChange('date_mariage', e.target.value ? new Date(e.target.value) : undefined)}
                    className="mt-1 bg-[#0F172A] border-[#334155] text-white"
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Children Section */}
        <Card className="bg-[#1E293B] border-[#334155] mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Baby className="w-5 h-5 text-[#F59E0B]" />
                <CardTitle className="text-white">Enfants</CardTitle>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAddChild(true)}
                className="border-[#F59E0B] text-[#F59E0B] hover:bg-[#F59E0B]/10"
              >
                <Plus className="w-4 h-4 mr-2" />
                Ajouter un enfant
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {showAddChild && (
              <div className="mb-6 p-4 border border-[#F59E0B]/30 rounded-lg bg-[#0F172A]">
                <h4 className="text-white font-semibold mb-4">Nouvel enfant</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <Label className="text-[#FFFBEB]">Prénom *</Label>
                    <Input
                      value={newChild.prenom}
                      onChange={(e) => setNewChild({ ...newChild, prenom: e.target.value })}
                      placeholder="Marie"
                      className="mt-1 bg-[#1E293B] border-[#334155] text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-[#FFFBEB]">Date de naissance *</Label>
                    <Input
                      type="date"
                      value={newChild.date_naissance?.toISOString().split('T')[0]}
                      onChange={(e) => setNewChild({ ...newChild, date_naissance: new Date(e.target.value) })}
                      className="mt-1 bg-[#1E293B] border-[#334155] text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-[#FFFBEB]">Lien de filiation</Label>
                    <Select
                      value={newChild.lien_filiation}
                      onChange={(e) => setNewChild({ ...newChild, lien_filiation: e.target.value as any })}
                      className="mt-1 bg-[#1E293B] border-[#334155] text-white"
                    >
                      <option value="Légitime">Légitime</option>
                      <option value="Naturel">Naturel</option>
                      <option value="Adopté">Adopté</option>
                    </Select>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="bg-[#F59E0B] text-[#0F172A] hover:bg-[#D97706]"
                    onClick={handleAddChild}
                  >
                    Ajouter
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAddChild(false)}
                    className="border-[#334155] text-[#FFFBEB]"
                  >
                    Annuler
                  </Button>
                </div>
              </div>
            )}

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-[#334155]">
                    <TableHead className="text-[#F59E0B]">Prénom</TableHead>
                    <TableHead className="text-[#F59E0B]">Date de naissance</TableHead>
                    <TableHead className="text-[#F59E0B]">Lien de filiation</TableHead>
                    <TableHead className="text-[#F59E0B]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {formData.enfants.length === 0 ? (
                    <TableRow className="border-[#334155]">
                      <TableCell colSpan={4} className="text-center text-[#FFFBEB]/50 py-8">
                        Aucun enfant. Cliquez sur "Ajouter un enfant" pour commencer.
                      </TableCell>
                    </TableRow>
                  ) : (
                    formData.enfants.map(child => (
                      <TableRow key={child.id} className="border-[#334155] hover:bg-[#0F172A]/50">
                        <TableCell className="text-white">{child.prenom}</TableCell>
                        <TableCell className="text-[#FFFBEB]/70">{formatDate(child.date_naissance)}</TableCell>
                        <TableCell className="text-[#FFFBEB]/70">{child.lien_filiation}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveChild(child.id)}
                            className="hover:bg-red-500/10"
                          >
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Tax Residency Card */}
        <Card className="bg-[#1E293B] border-[#334155] mb-6">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-[#F59E0B]" />
              <CardTitle className="text-white">Résidence fiscale</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-[#FFFBEB]">Résidence fiscale *</Label>
              <div className="flex gap-4 mt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value="France"
                    checked={formData.residence_fiscale === 'France'}
                    onChange={(e) => handleChange('residence_fiscale', e.target.value)}
                    className="text-[#F59E0B] focus:ring-[#F59E0B]"
                  />
                  <span className="text-white">France</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value="Étranger"
                    checked={formData.residence_fiscale === 'Étranger'}
                    onChange={(e) => handleChange('residence_fiscale', e.target.value)}
                    className="text-[#F59E0B] focus:ring-[#F59E0B]"
                  />
                  <span className="text-white">Étranger</span>
                </label>
              </div>
            </div>

            {formData.residence_fiscale === 'Étranger' && (
              <div>
                <Label className="text-[#FFFBEB]">Pays de résidence fiscale *</Label>
                <Input
                  value={formData.pays_residence_fiscale || ''}
                  onChange={(e) => handleChange('pays_residence_fiscale', e.target.value)}
                  placeholder="Suisse, Belgique..."
                  className="mt-1 bg-[#0F172A] border-[#334155] text-white"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={() => router.push('/client/prise-connaissance')}
            className="border-[#334155] text-[#FFFBEB]"
          >
            ← Prise de connaissance
          </Button>
          <Button
            className="bg-[#F59E0B] text-[#0F172A] hover:bg-[#D97706]"
            onClick={handleNext}
          >
            Suivant →
          </Button>
        </div>
      </div>
    </div>
  )
}
