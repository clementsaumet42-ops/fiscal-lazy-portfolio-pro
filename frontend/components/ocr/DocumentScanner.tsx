'use client'

import { useState, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Upload,
  FileText,
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
  Scan,
  Edit2,
  Save,
  Download,
} from 'lucide-react'
import { processDocumentOCR, validateISIN, formatAmount } from '@/lib/utils/ocr'
import { ExtractedLine, OCRStatus } from '@/lib/types/ocr'
import { TypeEnveloppeAudit } from '@/lib/types/audit'

interface DocumentScannerProps {
  onImportComplete?: (lines: ExtractedLine[]) => void
  typeEnveloppe: TypeEnveloppeAudit
}

interface DocumentState {
  id: string
  file: File
  preview?: string
  status: OCRStatus
  progress: number
  result: {
    text: string
    confidence: number
    lines: ExtractedLine[]
    errors: string[]
  } | null
  error: string | null
}

export function DocumentScanner({ onImportComplete, typeEnveloppe }: DocumentScannerProps) {
  const [documents, setDocuments] = useState<DocumentState[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [editingLine, setEditingLine] = useState<{ docId: string; lineIndex: number } | null>(null)
  const [editValues, setEditValues] = useState<Partial<ExtractedLine>>({})

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
  }, [])

  const handleFileInput = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      await processFiles(files)
    }
  }, [])

  const processFiles = async (files: File[]) => {
    for (const file of files) {
      // Validate file type
      const validTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg']
      if (!validTypes.includes(file.type)) {
        alert(`Type de fichier non supporté: ${file.name}`)
        continue
      }

      // Create document state
      const docId = `doc-${Date.now()}-${Math.random()}`
      const newDoc: DocumentState = {
        id: docId,
        file,
        status: 'idle',
        progress: 0,
        result: null,
        error: null,
      }

      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (e) => {
          setDocuments((prev) =>
            prev.map((doc) =>
              doc.id === docId ? { ...doc, preview: e.target?.result as string } : doc
            )
          )
        }
        reader.readAsDataURL(file)
      }

      setDocuments((prev) => [...prev, newDoc])
    }
  }

  const handleScanDocument = async (docId: string) => {
    const doc = documents.find((d) => d.id === docId)
    if (!doc) return

    // Update status to processing
    setDocuments((prev) =>
      prev.map((d) => (d.id === docId ? { ...d, status: 'processing' as OCRStatus, progress: 0 } : d))
    )

    try {
      // Process with OCR
      const result = await processDocumentOCR(doc.file, (progress) => {
        setDocuments((prev) =>
          prev.map((d) => (d.id === docId ? { ...d, progress } : d))
        )
      })

      // Update with result
      setDocuments((prev) =>
        prev.map((d) =>
          d.id === docId
            ? { ...d, status: 'success' as OCRStatus, progress: 100, result }
            : d
        )
      )
    } catch (error) {
      // Update with error
      setDocuments((prev) =>
        prev.map((d) =>
          d.id === docId
            ? {
                ...d,
                status: 'error' as OCRStatus,
                error: error instanceof Error ? error.message : 'Erreur inconnue',
              }
            : d
        )
      )
    }
  }

  const handleRemoveDocument = (docId: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== docId))
  }

  const handleEditLine = (docId: string, lineIndex: number) => {
    const doc = documents.find((d) => d.id === docId)
    if (!doc?.result) return

    const line = doc.result.lines[lineIndex]
    setEditingLine({ docId, lineIndex })
    setEditValues(line)
  }

  const handleSaveLine = (docId: string, lineIndex: number) => {
    setDocuments((prev) =>
      prev.map((d) => {
        if (d.id !== docId || !d.result) return d

        const newLines = [...d.result.lines]
        newLines[lineIndex] = { ...newLines[lineIndex], ...editValues }

        return {
          ...d,
          result: {
            ...d.result,
            lines: newLines,
          },
        }
      })
    )

    setEditingLine(null)
    setEditValues({})
  }

  const handleDeleteLine = (docId: string, lineIndex: number) => {
    setDocuments((prev) =>
      prev.map((d) => {
        if (d.id !== docId || !d.result) return d

        const newLines = d.result.lines.filter((_, i) => i !== lineIndex)

        return {
          ...d,
          result: {
            ...d.result,
            lines: newLines,
          },
        }
      })
    )
  }

  const handleImportAll = () => {
    const allLines: ExtractedLine[] = []

    documents.forEach((doc) => {
      if (doc.result?.lines) {
        allLines.push(...doc.result.lines)
      }
    })

    if (allLines.length === 0) {
      alert('Aucune donnée à importer')
      return
    }

    onImportComplete?.(allLines)
  }

  const getStatusBadge = (status: OCRStatus, error?: string | null) => {
    switch (status) {
      case 'idle':
        return <Badge variant="secondary">En attente</Badge>
      case 'processing':
        return (
          <Badge className="bg-blue-100 text-blue-800">
            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
            Analyse en cours...
          </Badge>
        )
      case 'success':
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Analysé
          </Badge>
        )
      case 'error':
        return (
          <Badge className="bg-red-100 text-red-800">
            <AlertCircle className="w-3 h-3 mr-1" />
            Erreur
          </Badge>
        )
    }
  }

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scan className="w-5 h-5" />
            Import par OCR
          </CardTitle>
          <CardDescription>
            Téléchargez vos relevés de situation ({typeEnveloppe}) pour extraction automatique des données
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
              isDragging
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold mb-2">
              Glissez-déposez vos fichiers ici
            </h3>
            <p className="text-gray-600 mb-4">ou cliquez pour sélectionner des fichiers</p>
            <input
              type="file"
              id="file-upload"
              multiple
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={handleFileInput}
              className="hidden"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <Button variant="outline" type="button">
                Sélectionner des fichiers
              </Button>
            </label>
            <p className="text-sm text-gray-500 mt-4">
              Formats acceptés : PDF, PNG, JPG (max 10 Mo par fichier)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Documents List */}
      {documents.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Documents ({documents.length})</CardTitle>
              <Button
                onClick={handleImportAll}
                disabled={documents.every((d) => d.status !== 'success')}
                className="gap-2"
              >
                <Download className="w-4 h-4" />
                Importer tout
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {documents.map((doc) => (
                <div key={doc.id} className="border rounded-lg p-4 space-y-4">
                  {/* Document Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <FileText className="w-8 h-8 text-gray-400" />
                      <div className="flex-1">
                        <div className="font-medium">{doc.file.name}</div>
                        <div className="text-sm text-gray-600">
                          {(doc.file.size / 1024).toFixed(0)} Ko
                        </div>
                      </div>
                      {getStatusBadge(doc.status, doc.error)}
                    </div>
                    <div className="flex items-center gap-2">
                      {doc.status === 'idle' && (
                        <Button
                          size="sm"
                          onClick={() => handleScanDocument(doc.id)}
                          className="gap-2"
                        >
                          <Scan className="w-4 h-4" />
                          Analyser
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemoveDocument(doc.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {doc.status === 'processing' && (
                    <div className="space-y-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${doc.progress}%` }}
                        />
                      </div>
                      <p className="text-sm text-gray-600 text-center">
                        Analyse OCR en cours... {doc.progress}%
                      </p>
                    </div>
                  )}

                  {/* Error Display */}
                  {doc.status === 'error' && doc.error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-sm text-red-800">{doc.error}</p>
                    </div>
                  )}

                  {/* Results Table */}
                  {doc.result && doc.result.lines.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                          {doc.result.lines.length} ligne(s) extraite(s) • Confiance:{' '}
                          {(doc.result.confidence * 100).toFixed(0)}%
                        </div>
                      </div>

                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>ISIN</TableHead>
                            <TableHead>Nom du fonds</TableHead>
                            <TableHead className="text-right">Montant</TableHead>
                            <TableHead className="text-center">Confiance</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {doc.result.lines.map((line, index) => {
                            const isEditing =
                              editingLine?.docId === doc.id &&
                              editingLine?.lineIndex === index
                            const isValidISIN = validateISIN(line.isin)

                            return (
                              <TableRow key={index}>
                                <TableCell className="font-mono">
                                  {isEditing ? (
                                    <Input
                                      value={editValues.isin || line.isin}
                                      onChange={(e) =>
                                        setEditValues({ ...editValues, isin: e.target.value })
                                      }
                                      className="h-8"
                                    />
                                  ) : (
                                    <div className="flex items-center gap-2">
                                      {line.isin}
                                      {!isValidISIN && (
                                        <AlertCircle className="w-4 h-4 text-orange-500" />
                                      )}
                                    </div>
                                  )}
                                </TableCell>
                                <TableCell>
                                  {isEditing ? (
                                    <Input
                                      value={editValues.fundName || line.fundName}
                                      onChange={(e) =>
                                        setEditValues({ ...editValues, fundName: e.target.value })
                                      }
                                      className="h-8"
                                    />
                                  ) : (
                                    line.fundName
                                  )}
                                </TableCell>
                                <TableCell className="text-right">
                                  {isEditing ? (
                                    <Input
                                      type="number"
                                      value={editValues.amount ?? line.amount}
                                      onChange={(e) => {
                                        const value = parseFloat(e.target.value)
                                        setEditValues({
                                          ...editValues,
                                          amount: isNaN(value) ? 0 : value,
                                        })
                                      }}
                                      className="h-8 text-right"
                                    />
                                  ) : (
                                    formatAmount(line.amount)
                                  )}
                                </TableCell>
                                <TableCell className="text-center">
                                  <Badge
                                    variant={
                                      line.confidence > 0.8
                                        ? 'default'
                                        : line.confidence > 0.5
                                        ? 'secondary'
                                        : 'destructive'
                                    }
                                  >
                                    {(line.confidence * 100).toFixed(0)}%
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    {isEditing ? (
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => handleSaveLine(doc.id, index)}
                                      >
                                        <Save className="w-4 h-4" />
                                      </Button>
                                    ) : (
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => handleEditLine(doc.id, index)}
                                      >
                                        <Edit2 className="w-4 h-4" />
                                      </Button>
                                    )}
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handleDeleteLine(doc.id, index)}
                                    >
                                      <X className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            )
                          })}
                        </TableBody>
                      </Table>

                      {/* Warnings */}
                      {doc.result.errors.length > 0 && (
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                          <div className="flex gap-2">
                            <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                            <div className="space-y-1">
                              <p className="text-sm font-medium text-orange-900">
                                Avertissements :
                              </p>
                              {doc.result.errors.map((error, i) => (
                                <p key={i} className="text-sm text-orange-800">
                                  • {error}
                                </p>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* No results */}
                  {doc.result && doc.result.lines.length === 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <p className="text-sm text-yellow-800">
                        Aucune donnée extraite. Le document ne contient peut-être pas de codes ISIN
                        ou de montants reconnaissables.
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Help Card */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900 space-y-2">
              <p>
                <strong>Conseils pour de meilleurs résultats :</strong>
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>Utilisez des documents de bonne qualité (scan haute résolution)</li>
                <li>Assurez-vous que le texte est lisible et non flouté</li>
                <li>Évitez les documents avec des fonds colorés ou des motifs complexes</li>
                <li>Vérifiez et corrigez les données extraites avant l&apos;import</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
