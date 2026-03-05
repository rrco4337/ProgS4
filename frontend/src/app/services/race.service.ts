import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Api } from './api';
import { ApiResponse, Race } from '../models/elevage.model';

@Injectable({
  providedIn: 'root',
})
export class RaceService {
  private endpoint = 'races';

  constructor(private api: Api) {}

  getAll(): Observable<ApiResponse<Race[]>> {
    return this.api.get<ApiResponse<Race[]>>(this.endpoint);
  }

  getById(id: number): Observable<ApiResponse<Race>> {
    return this.api.get<ApiResponse<Race>>(`${this.endpoint}/${id}`);
  }

  getCroissance(id: number): Observable<ApiResponse<any[]>> {
    return this.api.get<ApiResponse<any[]>>(`${this.endpoint}/${id}/croissance`);
  }

  create(race: Partial<Race>): Observable<ApiResponse<Race>> {
    return this.api.post<ApiResponse<Race>>(this.endpoint, race);
  }

  update(id: number, race: Partial<Race>): Observable<ApiResponse<Race>> {
    return this.api.put<ApiResponse<Race>>(`${this.endpoint}/${id}`, race);
  }

  delete(id: number): Observable<ApiResponse<void>> {
    return this.api.delete<ApiResponse<void>>(`${this.endpoint}/${id}`);
  }
}
