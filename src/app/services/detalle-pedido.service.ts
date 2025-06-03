import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../enviroment';
import { DetallePedido, DetallePedidoDTO } from '../models/pedido.model';

export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class DetallePedidoService {
  private apiUrl = `${environment.apiUrl}api/detalle_pedido`;

  constructor(private http: HttpClient) { }

  // Obtener todos los detalles
  listarDetalles(): Observable<ApiResponse<DetallePedido[]>> {
    return this.http.get<ApiResponse<DetallePedido[]>>(this.apiUrl);
  }

  // Obtener detalle por ID
  obtenerDetalle(id: number): Observable<ApiResponse<DetallePedido>> {
    return this.http.get<ApiResponse<DetallePedido>>(`${this.apiUrl}/${id}`);
  }  // Crear nuevo detalle
  crearDetalle(detalleDTO: DetallePedidoDTO): Observable<ApiResponse<DetallePedido>> {
    // 🔍 Validar que todos los campos necesarios estén presentes
    if (!detalleDTO.pedidoId || detalleDTO.pedidoId <= 0) {
      console.error('❌ Error: crearDetalle - pedidoId es inválido:', detalleDTO.pedidoId);
    }

    if (!detalleDTO.productoId || detalleDTO.productoId <= 0) {
      console.error('❌ Error: crearDetalle - productoId es inválido:', detalleDTO.productoId);
    }

    if (!detalleDTO.cantidad || detalleDTO.cantidad <= 0) {
      console.error('❌ Error: crearDetalle - cantidad es inválida:', detalleDTO.cantidad);
    }

    if (detalleDTO.precioUnitario === undefined || detalleDTO.precioUnitario === null) {
      console.error('❌ Error: crearDetalle - precioUnitario es undefined o null');
      detalleDTO.precioUnitario = 0;
    }

    if (detalleDTO.importe_Total === undefined || detalleDTO.importe_Total === null) {
      console.error('❌ Error: crearDetalle - importe_Total es undefined o null');
      detalleDTO.importe_Total = detalleDTO.cantidad * (detalleDTO.precioUnitario || 0);
    }    console.log('📤 Enviando petición de creación de detalle (DTO original):', detalleDTO);
    console.log('📍 URL de la API:', this.apiUrl);

    // 🔧 SOLUCIÓN: Adaptar los campos para que coincidan EXACTAMENTE con el backend
    const detalleAdaptado = {
      productoId: detalleDTO.productoId,
      pedidoId: detalleDTO.pedidoId,
      cantidad: detalleDTO.cantidad,
      importe_Total: detalleDTO.importe_Total || 0,
      importe_Total_Desc: detalleDTO.importe_Total_Desc || 0,
      precioUnitario: detalleDTO.precioUnitario || 0
    };

    console.log('🚀 Datos adaptados para el backend (formato exacto):', detalleAdaptado);return this.http.post<ApiResponse<DetallePedido>>(this.apiUrl, detalleAdaptado).pipe(
      tap((response: ApiResponse<DetallePedido>) => console.log('✅ Respuesta del servidor al crear detalle:', response))
    );
  }  // Actualizar detalle
  actualizarDetalle(id: number, detalleDTO: DetallePedidoDTO): Observable<ApiResponse<DetallePedido>> {
    // 🔧 SOLUCIÓN: Adaptar los campos para que coincidan EXACTAMENTE con el backend
    const detalleAdaptado = {
      productoId: detalleDTO.productoId,
      pedidoId: detalleDTO.pedidoId,
      cantidad: detalleDTO.cantidad,
      importe_Total: detalleDTO.importe_Total || 0,
      importe_Total_Desc: detalleDTO.importe_Total_Desc || 0,
      precioUnitario: detalleDTO.precioUnitario || 0
    };

    console.log('Actualizando detalle con datos adaptados (formato exacto):', detalleAdaptado);
    return this.http.put<ApiResponse<DetallePedido>>(`${this.apiUrl}/${id}`, detalleAdaptado);
  }

  // Actualizar estado del detalle
  actualizarDetalleEstado(id: number, estado: boolean): Observable<ApiResponse<DetallePedido>> {
    return this.http.put<ApiResponse<DetallePedido>>(`${this.apiUrl}/Estado/${id}/${estado}`, {});
  }

  // Eliminar detalle
  eliminarDetalle(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }
  // Obtener detalles por pedido
  obtenerPorPedido(pedidoId: number): Observable<ApiResponse<DetallePedido[]>> {
    console.log(`Solicitando detalles para el pedido ID ${pedidoId}`);
    console.log(`URL de consulta: ${this.apiUrl}/pedido/${pedidoId}`);
    return this.http.get<ApiResponse<DetallePedido[]>>(`${this.apiUrl}/pedido/${pedidoId}`);
  }

  // Obtener detalles por producto
  obtenerPorProducto(productoId: number): Observable<ApiResponse<DetallePedido[]>> {
    return this.http.get<ApiResponse<DetallePedido[]>>(`${this.apiUrl}/producto/${productoId}`);
  }
}
