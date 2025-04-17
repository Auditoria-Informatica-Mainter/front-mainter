import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Rol } from '../models/rol.model';
import { environment } from '../enviroment';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private apiUrl = environment.apiUrl;  // URL base del backend

  constructor(private http: HttpClient, private authService: AuthService) {}

  // ✅ Obtener todos los roles con token JWT
  getRoles(): Observable<Rol[]> {
    const token = this.authService.obtenerToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    console.log('Token usado para getRoles:', token);
    
    return this.http.get<any>(`${this.apiUrl}roles`, { headers }).pipe(
      map(resp => {
        console.log('Respuesta original de roles:', resp);
        // Verificar si la respuesta tiene el formato esperado (con propiedad data)
        if (resp && resp.data && Array.isArray(resp.data)) {
          return resp.data;
        } else if (Array.isArray(resp)) {
          return resp;
        } else {
          console.error('Formato de respuesta inesperado en getRoles:', resp);
          return [];
        }
      })
    );
  }
  
  

  // ✅ Obtener un rol por su ID
  getRoleById(id: number): Observable<Rol> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.authService.obtenerToken()}`
    });

    return this.http.get<Rol>(`${this.apiUrl}/${id}`, { headers });
  }

  // ✅ Crear un nuevo rol
  createRole(role: Rol): Observable<Rol> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.authService.obtenerToken()}`
    });

    return this.http.post<Rol>(this.apiUrl, role, { headers });
  }

  // ✅ Actualizar un rol existente
  updateRole(id: number, role: Rol): Observable<Rol> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.authService.obtenerToken()}`
    });

    return this.http.put<Rol>(`${this.apiUrl}/${id}`, role, { headers });
  }

  // ✅ Eliminar un rol
  deleteRole(id: number): Observable<void> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.authService.obtenerToken()}`
    });

    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers });
  }
}
