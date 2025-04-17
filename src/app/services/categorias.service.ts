import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../enviroment';

@Injectable({
  providedIn: 'root'
})
export class CategoriasService {
  private apiUrl = environment.apiUrl + 'categorias/';

  constructor(private http: HttpClient) { }

  getCategorias(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  createCategoria(categoria: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, categoria);
  }

  updateCategoria(categoriaId: any, categoria: any): Observable<any> {
    return this.http.put(this.apiUrl + `${categoriaId}/`, categoria);
  }

  getCategoria(categoriaId: any, categoria: any): Observable<any> {
    return this.http.get(this.apiUrl + `${categoriaId}/`, categoria);
  }

  deleteCategoria(categoriaId: any): Observable<any> {
    return this.http.delete(this.apiUrl + `${categoriaId}/`);
  }
}