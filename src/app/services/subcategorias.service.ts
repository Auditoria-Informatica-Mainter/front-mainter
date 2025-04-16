import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../enviroment';

@Injectable({
  providedIn: 'root'
})
export class SubcategoriasService {
  private apiUrl = environment.apiUrl + 'subcategorias/';

  constructor(private http: HttpClient) { }

  getSubcategorias(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  createSubcategoria(subcategoria: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, subcategoria);
  }

  updateSubcategoria(subcategoriaId: any, subcategoria: any): Observable<any> {
    return this.http.put(this.apiUrl + `${subcategoriaId}/`, subcategoria);
  }

  getSubcategoria(subcategoriaId: any, subcategoria: any): Observable<any> {
    return this.http.get(this.apiUrl + `${subcategoriaId}/`, subcategoria);
  }

  deleteSubcategoria(subcategoriaId: any): Observable<any> {
    return this.http.delete(this.apiUrl + `${subcategoriaId}/`);
  }
}