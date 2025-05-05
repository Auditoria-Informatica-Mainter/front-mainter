export interface Compra {
  id?: number;
  fecha: string;
  total: number;
  estado: string;
  proveedorId: number;
  observaciones?: string;
  // Relaciones
  proveedor?: any;
  detalles?: DetallePedidoCompra[];
}

export interface CompraDTO {
  fecha: string;
  total: number;
  estado: string;
  proveedorId: number;
  observaciones?: string;
}

export interface DetallePedidoCompra {
  id?: number;
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