'use client'

import { useState, useEffect } from 'react'
import { Upload, File, Trash2, Eye, FolderOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

const CATEGORIES = {
  identite: { 
    label: 'Identité', 
    color: 'from-blue-500 to-blue-400', 
    icon: '🪪',
    description: 'CNI, Passeport, Livret de famille'
  },
  revenus: { 
    label: 'Revenus', 
    color: 'from-green-500 to-green-400', 
    icon: '💰',
    description: 'Bulletins de salaire, Avis d\'imposition'
  },
  immobilier: { 
    label: 'Immobilier', 
    color: 'from-orange-500 to-orange-400', 
    icon: '🏠',
    description: 'Actes de propriété, Taxe foncière, Baux'
  },
  financier: { 
    label: 'Financier', 
    color: 'from-purple-500 to-purple-400', 
    icon: '💼',
    description: 'Relevés PEA, CTO, AV, Contrats'
  },
  succession: { 
    label: 'Succession', 
    color: 'from-gray-500 to-gray-400', 
    icon: '⚖️',
    description: 'Testament, Donations'
  }
}

export default function DocumentsClientPage({ params }: { params: { id: string } }) {
  const [documents, setDocuments] = useState<any[]>([])
  const [selectedCategory, setSelectedCategory] = useState('revenus')
  const [isUploading, setIsUploading] = useState(false)
  
  useEffect(() => {
    fetchDocuments()
  }, [params.id])
  
  const fetchDocuments = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/ged/client/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setDocuments(data)
      }
    } catch (error) {
      console.error('Erreur chargement documents:', error)
    }
  }
  
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    
    setIsUploading(true)
    
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
          await fetchDocuments()
        }
      } catch (error) {
        console.error('Erreur upload:', error)
      }
    }
    
    setIsUploading(false)
  }
  
  const handleDelete = async (documentId: string) => {
    if (!confirm('Confirmer la suppression de ce document ?')) return
    
    try {
      const response = await fetch(`http://localhost:8000/api/ged/document/${documentId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        await fetchDocuments()
      }
    } catch (error) {
      console.error('Erreur suppression:', error)
    }
  }
  
  return (
    <div className="min-h-screen bg-midnight-950">
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-text-primary mb-2 flex items-center gap-3">
              <FolderOpen className="w-10 h-10 text-gold-500" />
              Gestion Électronique de Documents
            </h1>
            <p className="text-text-secondary">
              Client ID: <span className="text-gold-400 font-mono">{params.id}</span>
            </p>
          </div>
        </div>

        <Card className="bg-midnight-800 border-midnight-700 hover:border-gold-500 transition-all duration-300 shadow-xl p-6 mb-6">
          <h2 className="text-xl font-semibold text-text-primary mb-4">📤 Upload de Documents</h2>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Catégorie de document</label>
              <select 
                value={selectedCategory} 
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-midnight-700 border-midnight-600 text-text-primary rounded-lg px-4 py-2 focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 outline-none transition-all"
              >
                {Object.entries(CATEGORIES).map(([key, cat]) => (
                  <option key={key} value={key}>
                    {cat.icon} {cat.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-text-muted mt-1">
                {CATEGORIES[selectedCategory as keyof typeof CATEGORIES]?.description}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Fichier à uploader</label>
              <label className="flex items-center justify-center gap-2 px-6 py-2 bg-gradient-to-r from-gold-500 to-gold-400 hover:from-gold-400 hover:to-gold-300 text-midnight-900 font-semibold rounded-lg cursor-pointer shadow-lg hover:shadow-gold transition-all duration-300">
                <Upload className="w-5 h-5" />
                {isUploading ? 'Upload en cours...' : 'Choisir un fichier'}
                <input
                  type="file"
                  className="hidden"
                  multiple
                  onChange={handleUpload}
                  disabled={isUploading}
                />
              </label>
              <p className="text-xs text-text-muted mt-1">
                PDF, images, documents Office (max 10 Mo)
              </p>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 gap-4">
          {Object.entries(CATEGORIES).map(([catKey, category]) => {
            const catDocs = documents.filter(d => d.categorie?.includes(catKey))
            
            return (
              <Card key={catKey} className="bg-midnight-800 border-midnight-700 hover:border-gold-500 transition-all duration-300 shadow-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`bg-gradient-to-r ${category.color} text-white px-4 py-2 rounded-lg font-semibold shadow-lg flex items-center gap-2`}>
                      <span className="text-2xl">{category.icon}</span>
                      <span>{category.label}</span>
                    </div>
                    <span className="text-sm text-text-muted">
                      {catDocs.length} document{catDocs.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                {catDocs.length === 0 ? (
                  <div className="text-center py-12 text-text-muted">
                    <File className="w-16 h-16 mx-auto mb-3 text-midnight-600" />
                    <p>Aucun document dans cette catégorie</p>
                    <p className="text-xs mt-1">{category.description}</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {catDocs.map((doc: any) => (
                      <div key={doc.id} className="flex items-center justify-between p-4 bg-midnight-700 rounded-lg hover:bg-midnight-600 border border-midnight-600 hover:border-gold-500/30 transition-all">
                        <div className="flex items-center gap-4">
                          <File className="w-6 h-6 text-gold-400" />
                          <div>
                            <div className="font-medium text-text-primary">{doc.nom_fichier}</div>
                            <div className="text-xs text-text-muted flex gap-3">
                              <span>📅 {new Date(doc.date_upload).toLocaleDateString('fr-FR')}</span>
                              <span>📦 {(doc.taille_octets / 1024).toFixed(0)} Ko</span>
                              {doc.commentaire && <span>💬 {doc.commentaire}</span>}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            className="bg-midnight-700 border-midnight-600 hover:bg-midnight-600 text-text-primary px-3 py-2"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button 
                            onClick={() => handleDelete(doc.id)}
                            className="bg-midnight-700 border-midnight-600 hover:bg-danger/20 text-danger hover:text-danger px-3 py-2"
                          >
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
        </div>

        <Card className="bg-midnight-800 border-gold-500/30 p-6 mt-6">
          <h4 className="font-semibold text-gold-400 mb-3 flex items-center gap-2">
            <span className="text-xl">ℹ️</span>
            Informations GED
          </h4>
          <ul className="text-sm text-text-secondary space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-gold-400">•</span>
              <span>Les documents sont stockés de manière sécurisée et organisés par catégorie</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-gold-400">•</span>
              <span>Formats acceptés: PDF, images (JPG, PNG), documents Office</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-gold-400">•</span>
              <span>Taille maximale par fichier: 10 Mo</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-gold-400">•</span>
              <span>Les métadonnées sont extraites automatiquement</span>
            </li>
          </ul>
        </Card>
      </div>
    </div>
  )
}
