import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, tap } from 'rxjs';
import { environment } from '../enviroment';
import { DetallePedidoCompra, DetallePedidoCompraDTO } from '../models/compra.model';

@Injectable({
  providedIn: 'root'
})
export class DetallePedidoCompraService {
  private apiUrl = environment.apiUrl + 'api/compras-detalle';

  constructor(private http: HttpClient) {}

  getDetallesPedidos(): Observable<DetallePedidoCompra[]> {
    return this.http.get<any>(this.apiUrl).pipe(
      tap(response => console.log('Detalles de Pedidos:', response)),
      map(resp => resp.data)
    );
  }

  getDetallePedido(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map(resp => resp.data)
    );
  }

  createDetallePedido(detalle: DetallePedidoCompraDTO): Observable<any> {
    return this.http.post<any>(this.apiUrl, detalle);
  }

  updateDetallePedido(id: number, detalle: DetallePedidoCompraDTO): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, detalle);
  }

  deleteDetallePedido(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  getDetallesPorCompra(compraId: number): Observable<DetallePedidoCompra[]> {
    return this.http.get<any>(`${this.apiUrl}/compra/${compraId}`).pipe(
      map(resp => resp.data)
    );
  }

  getDetallesPorMaterial(materialId: number): Observable<DetallePedidoCompra[]> {
    return this.http.get<any>(`${this.apiUrl}/material/${materialId}`).pipe(
      map(resp => resp.data)
    );
  }
} 