import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../enviroment';

@Injectable({
  providedIn: 'root'
})
export class PreProductoService {
  private apiUrl = environment.apiUrl + 'api/preproductos';

  constructor(private http: HttpClient) {}

  getPreProductos(): Observable<any[]> {
    return this.http.get<any>(this.apiUrl).pipe(
      map(resp => resp.data || resp)
    );
  }

  getPreProducto(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  createPreProducto(preproducto: {
    nombre: string;
    descripcion: string;
    tiempo: string;
    stock: number;
    url_Image: string;
  }): Observable<any> {
    return this.http.post<any>(this.apiUrl, preproducto);
  }

  updatePreProducto(id: number, preproducto: {
    nombre: string;
    descripcion: string;
    tiempo: string;
    stock: number;
    url_Image: string;
  }): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, preproducto);
  }

  deletePreProducto(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}