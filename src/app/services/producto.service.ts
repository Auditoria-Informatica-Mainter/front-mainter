import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, tap } from 'rxjs';
import { environment } from '../enviroment';
@Injectable({
  providedIn: 'root'
})
export class ProductoService {

  private apiUrl = environment.apiUrl + 'api/productos';
  
    constructor(private http: HttpClient) {}
  
    getProductos(): Observable<any[]> {
      return this.http.get<any[]>(this.apiUrl); // ← NADA de .pipe(map(...))
    }
}
