import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/elevage.model';
import { Api } from './api';

export interface AutoEclosionResult {
  id_incubation: number;
  id_lot_resultat?: number;
  nombre_poussins?: number;
  race?: string;
  status: 'success' | 'error';
  error?: string;
}

export interface AutoEclosionResponse {
  success: boolean;
  message: string;
  processed: number;
  failed: number;
  results: AutoEclosionResult[];
}

export interface AutoEclosionStatus {
  cronJobActive: boolean;
  isProcessing: boolean;
  nextRuns: string[];
  nextEclosions: {
    id_incubation: number;
    date_eclosion_prevue: string;
    nombre_oeufs: number;
    nom_race: string;
    id_lot_origine: number;
  }[];
  nextEclosionsCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class AutoIncubationService {

  constructor(private api: Api) { }

  /**
   * Déclenche manuellement le traitement des éclosions automatiques
   */
  processAutoEclosions(): Observable<ApiResponse<AutoEclosionResponse>> {
    return this.api.post<ApiResponse<AutoEclosionResponse>>('incubations/auto-eclosion', {});
  }

  /**
   * Récupère le statut du service d'éclosion automatique
   */
  getAutoIncubationStatus(): Observable<ApiResponse<AutoEclosionStatus>> {
    return this.api.get<ApiResponse<AutoEclosionStatus>>('incubations/auto-eclosion/status');
  }
}