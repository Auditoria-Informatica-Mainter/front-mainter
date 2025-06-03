export interface Pedido {
  id?: number;
  fecha: string;
  descripcion?: string;
  importe_total: number;
  importe_total_desc: number;
  estado: boolean;
  metodo_pago?: MetodoPago;
  usuario?: any;
  detalle_pedidos?: DetallePedido[];
}

export interface PedidoDTO {
  fecha: Date | string;
  descripcion?: string;
  importe_total: number;
  importe_total_desc: number;
  estado: boolean;
  usuario_id?: number;
  metodo_pago_id: number;
}

export interface DetallePedido {
  id?: number;
  cantidad: number;
  estado: boolean;
  importe_total: number;
  importe_total_desc: number;
  precioUnitario: number;
  producto?: any;
  pedido?: Pedido;
}

export interface DetallePedidoDTO {
  productoId: number;
  pedidoId?: number;
  cantidad: number;
  importe_Total: number;
  importe_Total_Desc: number;
  precioUnitario: number;
}

export interface MetodoPago {
  id?: number;
  nombre: string;
  descripcion: string;
}

export interface MetodoPagoDTO {
  nombre: string;
  descripcion: string;
}
