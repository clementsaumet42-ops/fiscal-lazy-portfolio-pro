/**
 * Parseur de documents pour l'extraction de données de relevés
 * Version MVP avec données de démonstration + OCR
 */

import { ReleveParse, PositionExtraite, TypeEnveloppeAudit } from '../types/audit';
import { processDocumentOCR } from './ocr';

/**
 * Parse un document uploadé (PDF ou image)
 * Peut utiliser OCR (Tesseract.js) ou générer des données de démonstration
 * 
 * @param file - Fichier à parser
 * @param type_enveloppe - Type d'enveloppe fiscale
 * @param useOCR - Si true, utilise OCR réel, sinon génère données démo (default: false)
 * @returns Données extraites du relevé
 */
export async function parseDocument(
  file: File, 
  type_enveloppe: TypeEnveloppeAudit,
  useOCR: boolean = false
): Promise<ReleveParse> {
  if (useOCR && (file.type.startsWith('image/') || file.type === 'application/pdf')) {
    try {
      // Use real OCR
      const ocrResult = await processDocumentOCR(file);
      
      // Convert OCR result to ReleveParse format
      const positions: PositionExtraite[] = ocrResult.lines.map(line => ({
        nom_support: line.fundName,
        isin: line.isin,
        montant: line.amount,
        frais: 0, // Will need to be filled manually
        categorie: 'Non classé',
      }));
      
      const montant_total = positions.reduce((sum, pos) => sum + pos.montant, 0);
      
      return {
        type_enveloppe,
        date_valorisation: new Date(),
        montant_total,
        positions,
        frais_detectes: generateDemoFrais(type_enveloppe),
      };
    } catch (error) {
      console.error('OCR failed, falling back to demo data:', error);
      // Fall back to demo data on error
    }
  }
  
  // Default: Generate demo data
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const positions = generateDemoPositions(type_enveloppe);
  const montant_total = positions.reduce((sum, pos) => sum + pos.montant, 0);
  
  return {
    type_enveloppe,
    date_valorisation: new Date(),
    montant_total,
    positions,
    frais_detectes: generateDemoFrais(type_enveloppe),
  };
}

/**
 * Génère des positions de démonstration selon le type d'enveloppe
 */
function generateDemoPositions(type_enveloppe: TypeEnveloppeAudit): PositionExtraite[] {
  const templates: Record<TypeEnveloppeAudit, PositionExtraite[]> = {
    PEA: [
      {
        nom_support: "Amundi CAC 40 UCITS ETF",
        isin: "FR0007052782",
        montant: 15000 + Math.random() * 5000,
        frais: 0.25,
        categorie: "Actions France"
      },
      {
        nom_support: "Lyxor PEA Europe STOXX 600",
        isin: "FR0011871110",
        montant: 20000 + Math.random() * 5000,
        frais: 0.20,
        categorie: "Actions Europe"
      },
      {
        nom_support: "Fonds Actions Françaises XYZ",
        isin: "FR0010345678",
        montant: 10000 + Math.random() * 5000,
        frais: 1.5,
        categorie: "Actions France"
      },
    ],
    
    CTO: [
      {
        nom_support: "iShares Core MSCI World",
        isin: "IE00B4L5Y983",
        montant: 12000 + Math.random() * 3000,
        frais: 0.20,
        categorie: "Actions Monde"
      },
      {
        nom_support: "Vanguard S&P 500",
        isin: "IE00B3XXRP09",
        montant: 8000 + Math.random() * 2000,
        frais: 0.07,
        categorie: "Actions USA"
      },
    ],
    
    AV: [
      {
        nom_support: "Fonds Euro Sécurité",
        montant: 30000 + Math.random() * 10000,
        frais: 0.8,
        categorie: "Fonds Euro"
      },
      {
        nom_support: "UC Actions Internationales",
        isin: "FR0011234567",
        montant: 15000 + Math.random() * 5000,
        frais: 1.8,
        categorie: "Actions Monde"
      },
      {
        nom_support: "UC Obligations Euro",
        isin: "LU0987654321",
        montant: 10000 + Math.random() * 3000,
        frais: 1.2,
        categorie: "Obligations"
      },
    ],
    
    PER: [
      {
        nom_support: "Fonds PER Actions Dynamique",
        isin: "FR0012345678",
        montant: 25000 + Math.random() * 10000,
        frais: 1.5,
        categorie: "Actions Monde"
      },
      {
        nom_support: "Fonds PER Obligations",
        isin: "FR0098765432",
        montant: 15000 + Math.random() * 5000,
        frais: 1.0,
        categorie: "Obligations"
      },
    ],
    
    IS: [
      {
        nom_support: "OPCVM Actions Europe",
        isin: "FR0011111111",
        montant: 50000 + Math.random() * 20000,
        frais: 1.2,
        categorie: "Actions Europe"
      },
      {
        nom_support: "OPCVM Obligations Diversifiées",
        isin: "LU0222222222",
        montant: 30000 + Math.random() * 10000,
        frais: 0.9,
        categorie: "Obligations"
      },
    ],
  };
  
  return templates[type_enveloppe] || templates.CTO;
}

/**
 * Génère des frais de démonstration selon le type d'enveloppe
 */
function generateDemoFrais(type_enveloppe: TypeEnveloppeAudit) {
  const fraisTemplates: Record<TypeEnveloppeAudit, { gestion?: number; uc?: number; arbitrage?: number }> = {
    PEA: {
      gestion: 0.4,
    },
    CTO: {
      gestion: 0.2,
    },
    AV: {
      gestion: 0.8,
      uc: 0.5,
      arbitrage: 0.5,
    },
    PER: {
      gestion: 0.7,
      uc: 0.6,
    },
    IS: {
      gestion: 0.5,
    },
  };
  
  return fraisTemplates[type_enveloppe] || { gestion: 0.5 };
}

/**
 * Extrait les montants d'un texte (regex euro)
 */
export function extractMontants(text: string): number[] {
  // Pattern pour capturer les montants en euros
  // Exemples: "1 234,56 €", "1234.56€", "1.234,56 EUR"
  const patterns = [
    /(\d{1,3}(?:[\s.]?\d{3})*(?:,\d{2})?)\s*€/g,
    /(\d{1,3}(?:[\s.]?\d{3})*(?:,\d{2})?)\s*EUR/gi,
  ];
  
  const montants: number[] = [];
  
  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      // Convertir le texte en nombre
      const montantStr = match[1]
        .replace(/\s/g, '')  // Supprimer les espaces
        .replace(/\./g, '')  // Supprimer les points (séparateurs de milliers)
        .replace(',', '.');  // Remplacer virgule par point décimal
      
      const montant = parseFloat(montantStr);
      if (!isNaN(montant)) {
        montants.push(montant);
      }
    }
  }
  
  return montants;
}

/**
 * Extrait les codes ISIN d'un texte
 */
export function extractISINs(text: string): string[] {
  // Pattern ISIN: 2 lettres + 10 caractères alphanumériques
  const pattern = /\b[A-Z]{2}[A-Z0-9]{10}\b/g;
  const matches = text.match(pattern);
  return matches || [];
}

/**
 * Détecte le type d'enveloppe depuis le contenu du document
 */
export function detectEnveloppeType(text: string): TypeEnveloppeAudit | null {
  const textLower = text.toLowerCase();
  
  if (textLower.includes('plan d\'épargne en actions') || textLower.includes('pea')) {
    return 'PEA';
  }
  if (textLower.includes('plan d\'épargne retraite') || textLower.includes('per')) {
    return 'PER';
  }
  if (textLower.includes('assurance vie') || textLower.includes('assurance-vie')) {
    return 'AV';
  }
  if (textLower.includes('compte-titres') || textLower.includes('compte titres')) {
    return 'CTO';
  }
  if (textLower.includes('société') && textLower.includes('is')) {
    return 'IS';
  }
  
  return null;
}
