export interface OrdenProducto {
    id: number;
    cantidad: number;
    descripcion: string;
    estado: string;
    fecha: string;
    usuarioId: number;
    productoId: number;
}

export interface OrdenProductoDTO {
    cantidad: number;
    descripcion: string;
    estado: string;
    fecha: string;
    usuarioId: number;
    productoId: number;
}

export const ESTADOS_ORDEN = [
    'En proceso',
    'En espera',
    'Completado',
    'Cancelado'
] as const; 