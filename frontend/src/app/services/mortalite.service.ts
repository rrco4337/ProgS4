import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Api } from './api';
import { ApiResponse, Mortalite } from '../models/elevage.model';

@Injectable({
  providedIn: 'root',
})
export class MortaliteService {
  private endpoint = 'mortalites';

  constructor(private api: Api) {}

  getAll(): Observable<ApiResponse<Mortalite[]>> {
    return this.api.get<ApiResponse<Mortalite[]>>(this.endpoint);
  }

  getByLot(idLot: number): Observable<ApiResponse<Mortalite[]>> {
    return this.api.get<ApiResponse<Mortalite[]>>(`${this.endpoint}/lot/${idLot}`);
  }

  create(mortalite: Partial<Mortalite>): Observable<ApiResponse<Mortalite>> {
    return this.api.post<ApiResponse<Mortalite>>(this.endpoint, mortalite);
  }

  delete(id: number): Observable<ApiResponse<void>> {
    return this.api.delete<ApiResponse<void>>(`${this.endpoint}/${id}`);
  }
}
