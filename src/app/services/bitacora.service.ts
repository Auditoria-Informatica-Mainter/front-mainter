import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../enviroment';
import { AuthService } from './auth.service';

export interface RegistroBitacora {
  id: number;
  nombreUsuario: string;
  accion: string;
  fecha: Date;
  detalles: string;
  direccionIp: string;
}

export interface BitacoraResponse {
  registros: RegistroBitacora[];
  total: number;
}

export interface BitacoraFiltros {
  texto?: string;
  fechaDesde?: Date;
  fechaHasta?: Date;
  ordenColumna?: string;
  ordenAscendente?: boolean;
  pagina: number;
  registrosPorPagina: number;
}

@Injectable({
  providedIn: 'root'
})
export class BitacoraService {
  private apiUrl = `${environment.apiUrl}bitacoras`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  getBitacora(filtros: BitacoraFiltros): Observable<BitacoraResponse> {
    const token = this.authService.obtenerToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    let params = new HttpParams()
      .set('pagina', filtros.pagina.toString())
      .set('registrosPorPagina', filtros.registrosPorPagina.toString());

    if (filtros.texto) {
      params = params.set('texto', filtros.texto);
    }

    if (filtros.fechaDesde) {
      params = params.set('fechaDesde', filtros.fechaDesde.toISOString());
    }

    if (filtros.fechaHasta) {
      params = params.set('fechaHasta', filtros.fechaHasta.toISOString());
    }

    if (filtros.ordenColumna) {
      params = params.set('ordenColumna', filtros.ordenColumna);
      params = params.set('ordenAscendente', filtros.ordenAscendente?.toString() || 'true');
    }

    return this.http.get<any>(this.apiUrl, { headers, params }).pipe(
      map(resp => {
        if (resp && resp.data) {
          return {
            registros: resp.data,
            total: 10 // o cambia si tienes `resp.total` en tu backend
          };
        } else {
          return { registros: [], total: 0 };
        }
      })
    );
  }

  exportarBitacora(filtros: Omit<BitacoraFiltros, 'pagina' | 'registrosPorPagina'>): Observable<Blob> {
    const token = this.authService.obtenerToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    let params = new HttpParams();

    if (filtros.texto) {
      params = params.set('texto', filtros.texto);
    }

    if (filtros.fechaDesde) {
      params = params.set('fechaDesde', filtros.fechaDesde.toISOString());
    }

    if (filtros.fechaHasta) {
      params = params.set('fechaHasta', filtros.fechaHasta.toISOString());
    }

    if (filtros.ordenColumna) {
      params = params.set('ordenColumna', filtros.ordenColumna);
      params = params.set('ordenAscendente', filtros.ordenAscendente?.toString() || 'true');
    }

    return this.http.get(`${this.apiUrl}/exportar`, {
      headers,
      params,
      responseType: 'blob'
    });
  }
}
