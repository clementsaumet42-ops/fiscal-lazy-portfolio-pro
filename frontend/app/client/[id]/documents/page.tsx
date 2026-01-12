'use client'

import { useState } from 'react'
import { Upload, File, Trash2, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Select } from '@/components/ui/select'

const CATEGORIES = {
  identite: { label: 'Identité', color: 'bg-blue-100', icon: '🆔' },
  revenus: { label: 'Revenus & Impôts', color: 'bg-green-100', icon: '💰' },
  immobilier: { label: 'Immobilier', color: 'bg-orange-100', icon: '🏠' },
  financier: { label: 'Patrimoine Financier', color: 'bg-purple-100', icon: '💼' },
  succession: { label: 'Succession', color: 'bg-gray-100', icon: '⚖️' },
  assurance: { label: 'Assurances', color: 'bg-yellow-100', icon: '🛡️' }
}

export default function DocumentsClientPage({ params }: { params: { id: string } }) {
  const [documents, setDocuments] = useState<any[]>([])
  const [selectedCategory, setSelectedCategory] = useState('revenus')
  
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const formData = new FormData()
      formData.append('client_id', params.id)
      formData.append('categorie', `${selectedCategory}_document`)
      formData.append('fichier', file)
      
      try {
        const response = await fetch('http://localhost:8000/api/ged/upload', {
          method: 'POST',
          body: formData
        })
        
        if (response.ok) {
          const newDoc = await response.json()
          setDocuments([newDoc, ...documents])
        }
      } catch (error) {
        console.error('Erreur upload:', error)
      }
    }
  }
  
  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">📁 Gestion Électronique de Documents (GED)</h1>
        <div className="text-sm text-gray-600">Client ID: {params.id}</div>
      </div>

      <Card className="p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Catégorie de document</label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              {Object.entries(CATEGORIES).map(([key, cat]) => (
                <option key={key} value={key}>
                  {cat.icon} {cat.label}
                </option>
              ))}
            </Select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Fichier à uploader</label>
            <label className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700">
              <Upload className="w-4 h-4" />
              Choisir un fichier
              <input
                type="file"
                className="hidden"
                multiple
                onChange={handleUpload}
              />
            </label>
          </div>
        </div>
      </Card>

      {Object.entries(CATEGORIES).map(([catKey, category]) => {
        const catDocs = documents.filter(d => d.categorie?.includes(catKey))
        
        return (
          <Card key={catKey} className="p-6 mb-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full ${category.color}`}>
                  {category.icon} {category.label}
                </span>
                <span className="text-sm text-gray-500">({catDocs.length})</span>
              </h2>
            </div>

            {catDocs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <File className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>Aucun document dans cette catégorie</p>
              </div>
            ) : (
              <div className="space-y-2">
                {catDocs.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                    <div className="flex items-center gap-3">
                      <File className="w-5 h-5 text-gray-400" />
                      <div>
                        <div className="font-medium">{doc.nom_fichier}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(doc.date_upload).toLocaleDateString('fr-FR')} • {(doc.taille_octets / 1024).toFixed(0)} Ko
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )
      })}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
        <h4 className="font-semibold text-blue-800 mb-2">ℹ️ Informations GED</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Les documents sont stockés de manière sécurisée et organisés par catégorie</li>
          <li>• Formats acceptés: PDF, images (JPG, PNG), documents Office</li>
          <li>• Taille maximale par fichier: 10 Mo</li>
          <li>• Les métadonnées sont extraites automatiquement</li>
        </ul>
      </div>
    </div>
  )
}
