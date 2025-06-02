import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../enviroment';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class OrdenProductoService {
  private apiUrl = environment.apiUrl + 'api/orden-producto';

  constructor(private http: HttpClient) { }

  getOrdenesProductos(): Observable<any[]> {
    return this.http.get<any>(this.apiUrl);
  }

  createOrdenProducto(ordenProducto: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, ordenProducto);
  }

  updateOrdenProducto(id: number, ordenProducto: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, ordenProducto);
  }

  getOrdenProducto(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  deleteOrdenProducto(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
