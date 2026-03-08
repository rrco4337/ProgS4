import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Api } from './api';
import { ApiResponse, Lot, PoidsActuelResponse, SituationGlobale } from '../models/elevage.model';

@Injectable({
  providedIn: 'root',
})
export class LotService {
  private endpoint = 'lots';

  constructor(private api: Api) {}

  getAll(): Observable<ApiResponse<Lot[]>> {
    return this.api.get<ApiResponse<Lot[]>>(this.endpoint);
  }

  getById(id: number): Observable<ApiResponse<Lot>> {
    return this.api.get<ApiResponse<Lot>>(`${this.endpoint}/${id}`);
  }

  getPoidsActuel(id: number): Observable<ApiResponse<PoidsActuelResponse>> {
    return this.api.get<ApiResponse<PoidsActuelResponse>>(`${this.endpoint}/${id}/poids`);
  }

  getSituationGlobale(): Observable<ApiResponse<SituationGlobale>> {
    return this.api.get<ApiResponse<SituationGlobale>>(`${this.endpoint}/situation-globale`);
  }

  create(lot: Partial<Lot>): Observable<ApiResponse<Lot>> {
    return this.api.post<ApiResponse<Lot>>(this.endpoint, lot);
  }

  update(id: number, lot: Partial<Lot>): Observable<ApiResponse<Lot>> {
    return this.api.put<ApiResponse<Lot>>(`${this.endpoint}/${id}`, lot);
  }

  delete(id: number): Observable<ApiResponse<void>> {
    return this.api.delete<ApiResponse<void>>(`${this.endpoint}/${id}`);
  }
}
