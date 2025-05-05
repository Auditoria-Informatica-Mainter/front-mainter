import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, tap } from 'rxjs';
import { environment } from '../enviroment';

@Injectable({
  providedIn: 'root'
})
export class MaterialesService {
  private apiUrl = environment.apiUrl + 'api/materiales';

  constructor(private http: HttpClient) {
    console.log('URL de API de materiales:', this.apiUrl);
  }

  getMateriales(): Observable<any[]> {
    console.log('Llamando a getMateriales:', this.apiUrl);
    return this.http.get<any>(this.apiUrl).pipe(
      tap(response => console.log('Respuesta completa de materiales:', response)),
      map(resp => resp.data)
    );
  }

  getMaterial(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  createMaterial(material: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, material);
  }

  updateMaterial(id: number, material: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, material);
  }

  deleteMaterial(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  XactualizarStock(id: number, cantidad: number): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}/stock`, { id, cantidad });
  }
  actualizarStock(id: number, payload: { cantidad: number }): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/stock`, payload);
  }

  actualizarImagen(id: number, imagen: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}/imagen`, imagen);
  }

  buscarPorNombre(nombre: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/nombre/${nombre}`);
  }

  getPorProveedor(proveedorId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/proveedor/${proveedorId}`);
  }

  getNecesitanReabastecimiento(): Observable<any[]> {
    return this.http.get<any>(`${this.apiUrl}/necesitan-reabastecimiento`).pipe(
      map(resp => resp.data)
    );
  }

  getBajoStock(): Observable<any[]> {
    return this.http.get<any>(`${this.apiUrl}/bajo-stock`).pipe(
      map(resp => resp.data)
    );
  }

  buscar(q: string): Observable<any[]> {
    return this.http.get<any>(`${this.apiUrl}/buscar?q=${q}`).pipe(
      map(resp => resp.data)
    );
  }
}
