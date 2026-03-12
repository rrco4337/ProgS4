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

  getPoidsActuel(id: number, date?: string): Observable<ApiResponse<PoidsActuelResponse>> {
    const suffix = date ? `?date=${encodeURIComponent(date)}` : '';
    return this.api.get<ApiResponse<PoidsActuelResponse>>(`${this.endpoint}/${id}/poids${suffix}`);
  }

  getSituationGlobale(date?: string): Observable<ApiResponse<SituationGlobale>> {
    const suffix = date ? `?date=${encodeURIComponent(date)}` : '';
    return this.api.get<ApiResponse<SituationGlobale>>(`${this.endpoint}/situation-globale${suffix}`);
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
