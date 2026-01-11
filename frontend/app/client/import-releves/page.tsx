'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useClientStore } from '@/store/client-store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Upload, FileText, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { DocumentImporte, TypeEnveloppeAudit } from '@/lib/types/audit'
import { parseDocument } from '@/lib/utils/document-parser'

const ENVELOPPE_OPTIONS: { value: TypeEnveloppeAudit; label: string; icon: string }[] = [
  { value: 'PEA', label: 'PEA - Plan Épargne Actions', icon: '📈' },
  { value: 'PER', label: 'PER - Plan Épargne Retraite', icon: '🏦' },
  { value: 'AV', label: 'Assurance Vie', icon: '🛡️' },
  { value: 'CTO', label: 'CTO - Compte-Titres Ordinaire', icon: '💼' },
  { value: 'IS', label: 'Société IS', icon: '🏢' },
]

export default function ImportRelevesPage() {
  const router = useRouter()
  const { audit, addDocument, removeDocument, updateDocument } = useClientStore()
  const [isDragging, setIsDragging] = useState(false)
  const [selectedType, setSelectedType] = useState<TypeEnveloppeAudit>('PEA')

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    await processFiles(files)
  }, [selectedType])

  const handleFileInput = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      await processFiles(files)
    }
  }, [selectedType])

  const processFiles = async (files: File[]) => {
    for (const file of files) {
      // Vérifier le type de fichier
      const validTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg']
      if (!validTypes.includes(file.type)) {
        alert(`Type de fichier non supporté: ${file.name}`)
        continue
      }

      // Créer le document
      const doc: DocumentImporte = {
        id: `doc-${Date.now()}-${Math.random()}`,
        nom: file.name,
        type_enveloppe: selectedType,
        date_upload: new Date(),
        statut: 'uploade',
        file,
      }

      addDocument(doc)

      // Analyser le document
      try {
        updateDocument(doc.id, { statut: 'en_cours_analyse' })
        const parsed = await parseDocument(file, selectedType)
        updateDocument(doc.id, { statut: 'analyse' })
      } catch (error) {
        console.error('Erreur parsing:', error)
        updateDocument(doc.id, { statut: 'erreur' })
      }
    }
  }

  const handleRemoveDocument = (id: string) => {
    removeDocument(id)
  }

  const handleAnalyse = () => {
    if (audit.documents.length === 0) {
      alert('Veuillez uploader au moins un document')
      return
    }
    router.push('/client/analyse-existant')
  }

  const getStatusBadge = (statut: DocumentImporte['statut']) => {
    switch (statut) {
      case 'uploade':
        return <Badge className="bg-blue-100 text-blue-800">Uploadé</Badge>
      case 'en_cours_analyse':
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
            En cours...
          </Badge>
        )
      case 'analyse':
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Analysé
          </Badge>
        )
      case 'erreur':
        return (
          <Badge className="bg-red-100 text-red-800">
            <AlertCircle className="w-3 h-3 mr-1" />
            Erreur
          </Badge>
        )
    }
  }

  const getEnveloppeIcon = (type: TypeEnveloppeAudit) => {
    return ENVELOPPE_OPTIONS.find(opt => opt.value === type)?.icon || '📄'
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Import des Relevés d'Épargne
        </h1>
        <p className="text-gray-600">
          Importez les relevés de vos clients pour analyser leur épargne existante et proposer des optimisations.
        </p>
      </div>

      {/* Sélection du type d'enveloppe */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Type d'enveloppe</CardTitle>
          <CardDescription>
            Sélectionnez le type d'enveloppe avant d'uploader les documents
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {ENVELOPPE_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => setSelectedType(option.value)}
                className={`p-4 border-2 rounded-lg text-center transition-all ${
                  selectedType === option.value
                    ? 'border-primary bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-3xl mb-2">{option.icon}</div>
                <div className="text-sm font-medium">{option.value}</div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Zone de drag & drop */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
              isDragging
                ? 'border-primary bg-primary-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold mb-2">
              Glissez-déposez vos fichiers ici
            </h3>
            <p className="text-gray-600 mb-4">
              ou cliquez pour sélectionner des fichiers
            </p>
            <input
              type="file"
              id="file-upload"
              multiple
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={handleFileInput}
              className="hidden"
            />
            <label htmlFor="file-upload">
              <span className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-gray-300 bg-white hover:bg-gray-50 h-10 px-4 py-2 cursor-pointer">
                Sélectionner des fichiers
              </span>
            </label>
            <p className="text-sm text-gray-500 mt-4">
              Formats acceptés : PDF, PNG, JPG (max 10 Mo par fichier)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Liste des documents importés */}
      {audit.documents.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Documents importés ({audit.documents.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {audit.documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <FileText className="w-8 h-8 text-gray-400" />
                    <div className="flex-1">
                      <div className="font-medium">{doc.nom}</div>
                      <div className="text-sm text-gray-600">
                        {getEnveloppeIcon(doc.type_enveloppe)} {doc.type_enveloppe} •{' '}
                        {doc.date_upload.toLocaleDateString('fr-FR')}
                      </div>
                    </div>
                    {getStatusBadge(doc.statut)}
                  </div>
                  <button
                    onClick={() => handleRemoveDocument(doc.id)}
                    className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-600">
          {audit.documents.length} document(s) importé(s)
        </div>
        <Button
          size="lg"
          onClick={handleAnalyse}
          disabled={audit.documents.length === 0}
        >
          Analyser l'épargne existante
        </Button>
      </div>

      {/* Disclaimer */}
      <Card className="mt-6 border-orange-200 bg-orange-50">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-orange-900">
              <strong>Note importante :</strong> Les documents uploadés contiennent des données sensibles.
              Ils sont traités localement et ne sont pas stockés de manière permanente.
              L'audit automatique doit être validé par un expert-comptable.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
