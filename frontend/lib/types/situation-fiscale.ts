/**
 * Types pour la situation fiscale du client
 */

export type TMI = 0 | 0.11 | 0.30 | 0.41 | 0.45;

export interface SituationFiscale {
  tmi: TMI;
  rfr: number;
  nbPartsFiscales: number;
  situationFamiliale: 'celibataire' | 'marie' | 'pacse' | 'divorce' | 'veuf';
  optionBaremeProgressif: boolean;
  plafonds: {
    pea: number;
    per_deductible: number;
  };
}

export const BAREMES_IR_2024: Record<TMI, { min: number; max: number }> = {
  0: { min: 0, max: 11294 },
  0.11: { min: 11295, max: 28797 },
  0.30: { min: 28798, max: 82341 },
  0.41: { min: 82342, max: 177106 },
  0.45: { min: 177107, max: Infinity }
};
