import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../enviroment';
import { Pedido, PedidoDTO } from '../models/pedido.model';

export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class PedidoService {
  private apiUrl = `${environment.apiUrl}api/pedidos`;

  constructor(private http: HttpClient) { }

  // Obtener todos los pedidos
  listarPedidos(): Observable<ApiResponse<Pedido[]>> {
    return this.http.get<ApiResponse<Pedido[]>>(this.apiUrl);
  }

  // Obtener pedido por ID
  obtenerPedido(id: number): Observable<ApiResponse<Pedido>> {
    return this.http.get<ApiResponse<Pedido>>(`${this.apiUrl}/${id}`);
  }

  // Crear nuevo pedido
  crearPedido(pedidoDTO: PedidoDTO): Observable<ApiResponse<Pedido>> {
    return this.http.post<ApiResponse<Pedido>>(this.apiUrl, pedidoDTO);
  }

  // Actualizar pedido
  actualizarPedido(id: number, pedidoDTO: PedidoDTO): Observable<ApiResponse<Pedido>> {
    return this.http.put<ApiResponse<Pedido>>(`${this.apiUrl}/${id}`, pedidoDTO);
  }

  // Eliminar pedido
  eliminarPedido(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }
  // Obtener pedidos por estado
  obtenerPedidosPorEstado(estado: boolean): Observable<ApiResponse<Pedido[]>> {
    return this.http.get<ApiResponse<Pedido[]>>(`${this.apiUrl}/estado/${estado}`);
  }

  // Obtener productos de un pedido con información completa
  obtenerProductosPedido(id: number): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/${id}/productos`);
  }
}
