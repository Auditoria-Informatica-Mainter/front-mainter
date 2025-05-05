export interface Compra {
  id: number;
  fecha: string | Date;
  estado: string;
  importe_total: number;
  importe_descuento: number;
  proveedorId: number;
  usuarioId: number;
  observaciones?: string;
  // Relaciones
  proveedor?: any;
  usuario?: any;
  detalles?: DetallePedidoCompra[];
}

export interface CompraDTO {
  fecha: string | Date;
  estado: string;
  importe_total: number;
  importe_descuento: number;
  proveedorId: number;
  usuarioId: number;
  observaciones?: string;
}

export interface DetallePedidoCompra {
  id: number;
  compraId: number;
  materialId: number;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  // Relaciones
  material?: any;
  compra?: Compra;
}

export interface DetallePedidoCompraDTO {
  compraId: number;
  materialId: number;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
} 