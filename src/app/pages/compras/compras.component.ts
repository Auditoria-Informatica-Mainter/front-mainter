import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ComprasService } from '../../services/compras.service';
import { DetallePedidoCompraService } from '../../services/detalle-pedido-compra.service';
import { ProveedoresService } from '../../services/proveedores.service';
import { MaterialesService } from '../../services/materiales.service';
import { Compra, CompraDTO, DetallePedidoCompra, DetallePedidoCompraDTO } from '../../models/compra.model';

@Component({
  selector: 'app-compras',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './compras.component.html'
})
export class ComprasComponent implements OnInit {
  compras: Compra[] = [];
  proveedores: any[] = [];
  materiales: any[] = [];
  detallesCompra: DetallePedidoCompra[] = [];
  
  compraSeleccionada: Compra | null = null;
  detalleSeleccionado: DetallePedidoCompra | null = null;
  
  nuevaCompra: CompraDTO = {
    fecha: new Date().toISOString().split('T')[0],
    total: 0,
    estado: 'PENDIENTE',
    proveedorId: 0,
    observaciones: ''
  };
  
  nuevoDetalle: DetallePedidoCompraDTO = {
    compraId: 0,
    materialId: 0,
    cantidad: 1,
    precioUnitario: 0,
    subtotal: 0
  };
  
  // Estados para filtrado
  estadosFiltro: string[] = ['PENDIENTE', 'APROBADO', 'RECHAZADO', 'COMPLETADO'];
  estadoSeleccionado: string = '';
  proveedorSeleccionadoId: number = 0;
  
  // Modales
  isModalRegistroCompraOpen: boolean = false;
  isModalDetalleCompraOpen: boolean = false;
  isModalNuevoDetalleOpen: boolean = false;
  isModalEditarCompraOpen: boolean = false;
  
  constructor(
    private comprasService: ComprasService,
    private detallePedidoCompraService: DetallePedidoCompraService,
    private proveedoresService: ProveedoresService,
    private materialesService: MaterialesService
  ) {}
  
  ngOnInit(): void {
    this.obtenerCompras();
    this.obtenerProveedores();
    this.obtenerMateriales();
  }
  
  obtenerCompras(): void {
    this.comprasService.getCompras().subscribe(data => {
      this.compras = data;
    });
  }
  
  obtenerProveedores(): void {
    this.proveedoresService.getProveedores().subscribe(data => {
      this.proveedores = data;
    });
  }
  
  obtenerMateriales(): void {
    this.materialesService.getMateriales().subscribe(data => {
      this.materiales = data;
    });
  }
  
  registrarCompra(): void {
    this.comprasService.createCompra(this.nuevaCompra).subscribe(response => {
      this.obtenerCompras();
      this.cerrarModalRegistroCompra();
      this.limpiarFormularioCompra();
    });
  }
  
  actualizarCompra(): void {
    if (!this.compraSeleccionada || !this.compraSeleccionada.id) return;
    
    const compraDTO: CompraDTO = {
      fecha: this.compraSeleccionada.fecha,
      total: this.compraSeleccionada.total,
      estado: this.compraSeleccionada.estado,
      proveedorId: this.compraSeleccionada.proveedorId,
      observaciones: this.compraSeleccionada.observaciones
    };
    
    this.comprasService.updateCompra(this.compraSeleccionada.id, compraDTO).subscribe(() => {
      this.obtenerCompras();
      this.cerrarModalEditarCompra();
    });
  }
  
  eliminarCompra(id: number): void {
    if (confirm('¿Está seguro de eliminar esta compra?')) {
      this.comprasService.deleteCompra(id).subscribe(() => {
        this.obtenerCompras();
      });
    }
  }
  
  verDetallesCompra(compra: Compra): void {
    this.compraSeleccionada = compra;
    this.detallePedidoCompraService.getDetallesPorCompra(compra.id!).subscribe(detalles => {
      this.detallesCompra = detalles;
      this.abrirModalDetalleCompra();
    });
  }
  
  registrarDetalle(): void {
    if (!this.compraSeleccionada || !this.compraSeleccionada.id) return;
    
    this.nuevoDetalle.compraId = this.compraSeleccionada.id;
    this.nuevoDetalle.subtotal = this.nuevoDetalle.cantidad * this.nuevoDetalle.precioUnitario;
    
    this.detallePedidoCompraService.createDetallePedido(this.nuevoDetalle).subscribe(() => {
      // Actualizar el total de la compra
      this.actualizarTotalCompra();
      // Recargar los detalles
      this.detallePedidoCompraService.getDetallesPorCompra(this.compraSeleccionada!.id!).subscribe(detalles => {
        this.detallesCompra = detalles;
      });
      this.cerrarModalNuevoDetalle();
      this.limpiarFormularioDetalle();
    });
  }
  
  eliminarDetalle(id: number): void {
    if (confirm('¿Está seguro de eliminar este detalle?')) {
      this.detallePedidoCompraService.deleteDetallePedido(id).subscribe(() => {
        // Actualizar el total de la compra
        this.actualizarTotalCompra();
        // Recargar los detalles
        this.detallePedidoCompraService.getDetallesPorCompra(this.compraSeleccionada!.id!).subscribe(detalles => {
          this.detallesCompra = detalles;
        });
      });
    }
  }
  
  actualizarTotalCompra(): void {
    if (!this.compraSeleccionada || !this.compraSeleccionada.id) return;
    
    // Calcular el total a partir de los detalles
    let total = 0;
    this.detallesCompra.forEach(detalle => {
      total += detalle.subtotal;
    });
    
    // Actualizar el campo total de la compra
    const compraActualizada: CompraDTO = {
      fecha: this.compraSeleccionada.fecha,
      total: total,
      estado: this.compraSeleccionada.estado,
      proveedorId: this.compraSeleccionada.proveedorId,
      observaciones: this.compraSeleccionada.observaciones
    };
    
    this.comprasService.updateCompra(this.compraSeleccionada.id, compraActualizada).subscribe(() => {
      // Actualizar la compra seleccionada con el nuevo total
      this.compraSeleccionada!.total = total;
      // Recargar todas las compras
      this.obtenerCompras();
    });
  }
  
  filtrarPorEstado(): void {
    if (!this.estadoSeleccionado) {
      this.obtenerCompras();
      return;
    }
    
    this.comprasService.getComprasPorEstado(this.estadoSeleccionado).subscribe(data => {
      this.compras = data;
    });
  }
  
  filtrarPorProveedor(): void {
    if (!this.proveedorSeleccionadoId) {
      this.obtenerCompras();
      return;
    }
    
    this.comprasService.getComprasPorProveedor(this.proveedorSeleccionadoId).subscribe(data => {
      this.compras = data;
    });
  }
  
  cambiarEstadoCompra(compra: Compra, nuevoEstado: string): void {
    const compraDTO: CompraDTO = {
      fecha: compra.fecha,
      total: compra.total,
      estado: nuevoEstado,
      proveedorId: compra.proveedorId,
      observaciones: compra.observaciones
    };
    
    this.comprasService.updateCompra(compra.id!, compraDTO).subscribe(() => {
      this.obtenerCompras();
    });
  }
  
  // Funciones para modales
  abrirModalRegistroCompra(): void {
    this.limpiarFormularioCompra();
    this.isModalRegistroCompraOpen = true;
  }
  
  cerrarModalRegistroCompra(): void {
    this.isModalRegistroCompraOpen = false;
  }
  
  abrirModalDetalleCompra(): void {
    this.isModalDetalleCompraOpen = true;
  }
  
  cerrarModalDetalleCompra(): void {
    this.isModalDetalleCompraOpen = false;
    this.compraSeleccionada = null;
    this.detallesCompra = [];
  }
  
  abrirModalNuevoDetalle(): void {
    this.limpiarFormularioDetalle();
    this.isModalNuevoDetalleOpen = true;
  }
  
  cerrarModalNuevoDetalle(): void {
    this.isModalNuevoDetalleOpen = false;
  }
  
  abrirModalEditarCompra(compra: Compra): void {
    this.compraSeleccionada = {...compra};
    this.isModalEditarCompraOpen = true;
  }
  
  cerrarModalEditarCompra(): void {
    this.isModalEditarCompraOpen = false;
    this.compraSeleccionada = null;
  }
  
  // Funciones auxiliares
  limpiarFormularioCompra(): void {
    this.nuevaCompra = {
      fecha: new Date().toISOString().split('T')[0],
      total: 0,
      estado: 'PENDIENTE',
      proveedorId: 0,
      observaciones: ''
    };
  }
  
  limpiarFormularioDetalle(): void {
    this.nuevoDetalle = {
      compraId: this.compraSeleccionada?.id || 0,
      materialId: 0,
      cantidad: 1,
      precioUnitario: 0,
      subtotal: 0
    };
  }
  
  calcularSubtotal(): void {
    this.nuevoDetalle.subtotal = this.nuevoDetalle.cantidad * this.nuevoDetalle.precioUnitario;
  }
  
  getNombreProveedor(proveedorId: number): string {
    const proveedor = this.proveedores.find(p => p.id === proveedorId);
    return proveedor ? proveedor.nombre : 'No especificado';
  }
  
  getNombreMaterial(materialId: number): string {
    const material = this.materiales.find(m => m.id === materialId);
    return material ? material.nombre : 'No especificado';
  }
  
  obtenerColorEstado(estado: string): string {
    switch (estado) {
      case 'PENDIENTE':
        return 'bg-yellow-100 text-yellow-800';
      case 'APROBADO':
        return 'bg-green-100 text-green-800';
      case 'RECHAZADO':
        return 'bg-red-100 text-red-800';
      case 'COMPLETADO':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }
} 