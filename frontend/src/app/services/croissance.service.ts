import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Api } from './api';
import { ApiResponse, Croissance } from '../models/elevage.model';

@Injectable({
  providedIn: 'root',
})
export class CroissanceService {
  private endpoint = 'croissance';

  constructor(private api: Api) {}

  getAll(): Observable<ApiResponse<Croissance[]>> {
    return this.api.get<ApiResponse<Croissance[]>>(this.endpoint);
  }

  getByRace(idRace: number): Observable<ApiResponse<Croissance[]>> {
    return this.api.get<ApiResponse<Croissance[]>>(`${this.endpoint}/race/${idRace}`);
  }

  create(croissance: Partial<Croissance>): Observable<ApiResponse<Croissance>> {
    return this.api.post<ApiResponse<Croissance>>(this.endpoint, croissance);
  }

  update(id: number, croissance: Partial<Croissance>): Observable<ApiResponse<Croissance>> {
    return this.api.put<ApiResponse<Croissance>>(`${this.endpoint}/${id}`, croissance);
  }

  delete(id: number): Observable<ApiResponse<void>> {
    return this.api.delete<ApiResponse<void>>(`${this.endpoint}/${id}`);
  }
}
