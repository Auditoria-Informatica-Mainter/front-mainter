import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../enviroment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl   //url base del backend  private apiUrl = 'http://localhost:8080/mrp/auth';

  constructor(private http: HttpClient) { }

  login(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}auth/login`, { email, password });
  }
  
 // Método de registro (NUEVO)
 registro(nombre: string, apellido: string, telefono: string, email: string, password: string): Observable<any> {
  return this.http.post<any>(`${this.apiUrl}/auth/registro`, {
    nombre,
    apellido,
    telefono,
    email,
    password
  });
}
  private token: string | null = null;



  guardarToken(token: string) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  obtenerToken(): string | null {
    return this.token || localStorage.getItem('token');
  }


  cerrarSesion() {
    localStorage.removeItem('token');
  }

  guardarDatosUsuario(nombre: string, email: string) {
    localStorage.setItem('nombre', nombre);
    localStorage.setItem('email', email);
  }

  obtenerNombre(): string {
    return localStorage.getItem('nombre') || '';
  }

  obtenerEmail(): string {
    return localStorage.getItem('email') || '';
  }
}
