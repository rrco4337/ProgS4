import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Api } from './api';
import { ApiResponse, Oeuf } from '../models/elevage.model';

export interface StockOeuf {
  id_lot: number;
  total_recolte: number;
  total_incube: number;
  total_vendu: number;
  stock_disponible: number;
}

@Injectable({ providedIn: 'root' })
export class OeufService {
  private endpoint = 'oeufs';

  constructor(private api: Api) {}

  getAll(): Observable<ApiResponse<Oeuf[]>> {
    return this.api.get<ApiResponse<Oeuf[]>>(this.endpoint);
  }

  getByLot(idLot: number): Observable<ApiResponse<Oeuf[]>> {
    return this.api.get<ApiResponse<Oeuf[]>>(`${this.endpoint}/lot/${idLot}`);
  }

  getStockByLot(idLot: number): Observable<ApiResponse<StockOeuf>> {
    return this.api.get<ApiResponse<StockOeuf>>(`${this.endpoint}/stock/${idLot}`);
  }

  create(oeuf: Partial<Oeuf>): Observable<ApiResponse<Oeuf>> {
    return this.api.post<ApiResponse<Oeuf>>(this.endpoint, oeuf);
  }

  delete(id: number): Observable<ApiResponse<void>> {
    return this.api.delete<ApiResponse<void>>(`${this.endpoint}/${id}`);
  }
}
