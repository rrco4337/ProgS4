import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Api } from './api';
import { ApiResponse, VenteOeuf } from '../models/elevage.model';

@Injectable({ providedIn: 'root' })
export class VenteOeufService {
  private endpoint = 'ventes-oeufs';

  constructor(private api: Api) {}

  getAll(): Observable<ApiResponse<VenteOeuf[]>> {
    return this.api.get<ApiResponse<VenteOeuf[]>>(this.endpoint);
  }

  getByLot(idLot: number): Observable<ApiResponse<VenteOeuf[]>> {
    return this.api.get<ApiResponse<VenteOeuf[]>>(`${this.endpoint}/lot/${idLot}`);
  }

  create(vente: { id_lot: number; date_vente: string; nombre_oeufs: number; prix_unitaire: number }): Observable<ApiResponse<VenteOeuf>> {
    return this.api.post<ApiResponse<VenteOeuf>>(this.endpoint, vente);
  }

  delete(id: number): Observable<ApiResponse<void>> {
    return this.api.delete<ApiResponse<void>>(`${this.endpoint}/${id}`);
  }
}
