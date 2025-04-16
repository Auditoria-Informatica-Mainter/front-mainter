import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Usuario, UsuarioDTO } from '../../models/usuario.model';


@Injectable({
  providedIn: 'root'
})
export class UserService {
  private baseUrl = 'http://localhost:8080/user'; // Cambia si tu backend tiene otra URL base

  constructor(private http: HttpClient) {}

  listarUsuarios(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(`${this.baseUrl}`);
  }

  buscarUsuarios(search: string): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(`${this.baseUrl}?search=${search}`);
  }

  obtenerUsuario(id: number): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.baseUrl}/${id}`);
  }

  registrarUsuario(usuario: UsuarioDTO): Observable<Usuario> {
    return this.http.post<Usuario>(`${this.baseUrl}`, usuario);
  }

  actualizarUsuario(id: number, usuario: UsuarioDTO): Observable<Usuario> {
    return this.http.patch<Usuario>(`${this.baseUrl}/${id}`, usuario);
  }

  desactivarUsuario(id: number): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${id}/desactivar`, {});
  }

  activarUsuario(id: number): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${id}/activar`, {});
  }
}
