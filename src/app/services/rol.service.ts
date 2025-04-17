import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Rol } from '../models/rol.model';
import { environment } from '../enviroment';


@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private apiUrl = environment.apiUrl + 'roles/';

  constructor(private http: HttpClient) {}

  // ✅ Get all roles from the backend
  getRoles(): Observable<Rol[]> {
    return this.http.get<Rol[]>(this.apiUrl);
  }

  // ✅ Get a specific role by ID
  getRoleById(id: number): Observable<Rol> {
    return this.http.get<Rol>(`${this.apiUrl}${id}`);
  }

  // ✅ Create a new role
  createRole(role: Rol): Observable<Rol> {
    return this.http.post<Rol>(this.apiUrl, role);
  }

  // ✅ Update an existing role
  updateRole(id: number, role: Rol): Observable<Rol> {
    return this.http.put<Rol>(`${this.apiUrl}${id}`, role);
  }

  // ✅ Delete a role
  deleteRole(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}${id}`);
  }
}
