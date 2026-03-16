import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Api } from './api';
import { ApiResponse, Incubation } from '../models/elevage.model';

@Injectable({ providedIn: 'root' })
export class IncubationService {
  private endpoint = 'incubations';

  constructor(private api: Api) {}

  getAll(): Observable<ApiResponse<Incubation[]>> {
    return this.api.get<ApiResponse<Incubation[]>>(this.endpoint);
  }

  create(incubation: { id_oeuf: number; date_debut: string; nombre_oeufs: number }): Observable<ApiResponse<Incubation>> {
    return this.api.post<ApiResponse<Incubation>>(this.endpoint, incubation);
  }

  ecloter(id: number, data: { oeufs_pourris: number; pourcentage_male: number }): Observable<ApiResponse<{ id_lot_resultat: number; nombre_poussins: number; nb_femelles: number; nb_males: number; oeufs_pourris: number; pourcentage_male: number }>> {
    return this.api.post<ApiResponse<{ id_lot_resultat: number; nombre_poussins: number; nb_femelles: number; nb_males: number; oeufs_pourris: number; pourcentage_male: number }>>(
      `${this.endpoint}/${id}/ecloter`, data
    );
  }

  delete(id: number): Observable<ApiResponse<void>> {
    return this.api.delete<ApiResponse<void>>(`${this.endpoint}/${id}`);
  }
}
