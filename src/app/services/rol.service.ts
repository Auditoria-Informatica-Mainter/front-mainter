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
  private apiUrl = environment.apiUrl;  // Asegúrate que coincide con tu backend: /mrp/roles

  constructor(private http: HttpClient, private authService: AuthService) {}

  // ✅ Obtener todos los roles con token JWT
  getRoles(): Observable<Rol[]> {
    const token = this.authService.obtenerToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    
    return this.http.get<any>(`${this.apiUrl}roles`, { headers }).pipe(
      map(resp => resp.data)
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
