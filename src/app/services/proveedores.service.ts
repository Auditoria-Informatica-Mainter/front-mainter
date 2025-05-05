import { Injectable } from '@angular/core';
import { environment } from '../enviroment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProveedoresService {

    private apiUrl = environment.apiUrl + 'proveedores';
  
    constructor(private http: HttpClient) { }
  getProveedores(): Observable<any[]> {
      return this.http.get<any[]>(this.apiUrl);
    }
  
    createProveedor(proveedor: any): Observable<any> {
      return this.http.post<any>(this.apiUrl, proveedor);
    }
  
    updateProveedor(proveedorId: any,proveedor: any): Observable<any> {
      return this.http.put(this.apiUrl + `${proveedorId}/`, proveedor);
    }
  
    getProveedor(proveedorId: any, proveedor: any): Observable<any> {
      return this.http.get(this.apiUrl + `${proveedorId}/`, proveedor);
    }
  
    deleteProveedor(proveedorId: any): Observable<any> {
      return this.http.delete(this.apiUrl + `${proveedorId}/`);
    }
}
