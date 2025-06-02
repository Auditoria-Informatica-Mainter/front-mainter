import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../enviroment';
import { Maquinaria } from '../models/preMaquinaria.model';

@Injectable({
  providedIn: 'root'
})
export class MaquinariaService {
  private apiUrl = environment.apiUrl + 'api/maquinarias';

  constructor(private http: HttpClient) {}

  obtenerTodas(): Observable<Maquinaria[]> {
    return this.http.get<Maquinaria[]>(this.apiUrl);
  }

  obtenerPorId(id: number): Observable<Maquinaria> {
    return this.http.get<Maquinaria>(`${this.apiUrl}/${id}`);
  }

  obtenerDisponibles(): Observable<Maquinaria[]> {
    return this.http.get<Maquinaria[]>(`${this.apiUrl}/disponibles`);
  }
}


