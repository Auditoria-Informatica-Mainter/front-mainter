import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ComprasService } from '../../services/compras.service';
import { DetallePedidoCompraService } from '../../services/detalle-pedido-compra.service';
import { ProveedoresService } from '../../services/proveedores.service';
import { MaterialesService } from '../../services/materiales.service';
import { AuthService } from '../../services/auth.service';
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
  
  // Nueva compra y sus detalles
  nuevaCompra: CompraDTO = {
    fecha: new Date().toISOString().split('T')[0],
    estado: 'PENDIENTE',
    importe_total: 0,
    importe_descuento: 0,
    proveedorId: 0,
    usuarioId: 0
  };
  
  nuevosDetalles: DetallePedidoCompraDTO[] = [];
  
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
    private materialesService: MaterialesService,
    private authService: AuthService
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
    console.log('Obteniendo proveedores...');
    this.proveedoresService.getProveedores().subscribe(
      data => {
        console.log('Proveedores recibidos:', data);
        this.proveedores = data;
      },
      error => {
        console.error('Error al obtener proveedores:', error);
      }
    );
  }
  
  obtenerMateriales(): void {
    console.log('Obteniendo materiales...');
    this.materialesService.getMateriales().subscribe(
      data => {
        console.log('Materiales recibidos:', data);
        this.materiales = data;
      },
      error => {
        console.error('Error al obtener materiales:', error);
      }
    );
  }
  
  registrarCompra(): void {
    // Obtener el ID del usuario actual
    this.nuevaCompra.usuarioId = this.authService.obtenerUsuarioId();
    
    // Calcular el total basado en los detalles
    let totalCompra = 0;
    this.nuevosDetalles.forEach(detalle => {
      totalCompra += detalle.subtotal;
    });
    
    this.nuevaCompra.importe_total = totalCompra;
    
    this.comprasService.createCompra(this.nuevaCompra).subscribe(response => {
      const compraId = response.data.id;
      
      // Crear los detalles asociados a la compra
      if (this.nuevosDetalles.length > 0) {
        const promesasDetalles = this.nuevosDetalles.map(detalle => {
          detalle.compraId = compraId;
          return this.detallePedidoCompraService.createDetallePedido(detalle).toPromise();
        });
        
        Promise.all(promesasDetalles)
          .then(() => {
            this.obtenerCompras();
            this.cerrarModalRegistroCompra();
            this.limpiarFormularioCompra();
          })
          .catch(error => {
            console.error('Error al guardar los detalles:', error);
          });
      } else {
        this.obtenerCompras();
        this.cerrarModalRegistroCompra();
        this.limpiarFormularioCompra();
      }
    });
  }
  
  actualizarCompra(): void {
    if (!this.compraSeleccionada) return;
    
    const compraDTO: CompraDTO = {
      fecha: this.compraSeleccionada.fecha,
      estado: this.compraSeleccionada.estado,
      importe_total: this.compraSeleccionada.importe_total,
      importe_descuento: this.compraSeleccionada.importe_descuento,
      proveedorId: this.compraSeleccionada.proveedorId,
      usuarioId: this.compraSeleccionada.usuarioId,
      observaciones: this.compraSeleccionada.observaciones
    };
    
    const id = this.compraSeleccionada.id;
    this.comprasService.updateCompra(id, compraDTO).subscribe(() => {
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
    this.detallePedidoCompraService.getDetallesPorCompra(compra.id).subscribe(detalles => {
      this.detallesCompra = detalles;
      this.abrirModalDetalleCompra();
    });
  }
  
  agregarDetalleANuevaCompra(): void {
    this.nuevoDetalle.subtotal = this.nuevoDetalle.cantidad * this.nuevoDetalle.precioUnitario;
    this.nuevosDetalles.push({...this.nuevoDetalle});
    
    // Recalcular el total de la compra
    let total = 0;
    this.nuevosDetalles.forEach(detalle => {
      total += detalle.subtotal;
    });
    this.nuevaCompra.importe_total = total;
    
    this.limpiarFormularioDetalle();
  }
  
  eliminarDetalleDeNuevaCompra(index: number): void {
    this.nuevosDetalles.splice(index, 1);
    
    // Recalcular el total de la compra
    let total = 0;
    this.nuevosDetalles.forEach(detalle => {
      total += detalle.subtotal;
    });
    this.nuevaCompra.importe_total = total;
  }
  
  registrarDetalle(): void {
    if (!this.compraSeleccionada) return;
    
    // Asegurarnos de tener una referencia segura a id
    const compraId = this.compraSeleccionada.id;
    
    this.nuevoDetalle.compraId = compraId;
    this.nuevoDetalle.subtotal = this.nuevoDetalle.cantidad * this.nuevoDetalle.precioUnitario;
    
    this.detallePedidoCompraService.createDetallePedido(this.nuevoDetalle).subscribe(() => {
      // Actualizar el total de la compra
      this.actualizarTotalCompra();
      // Recargar los detalles
      // Verificamos nuevamente que la compra seleccionada exista
      if (this.compraSeleccionada) {
        this.detallePedidoCompraService.getDetallesPorCompra(this.compraSeleccionada.id).subscribe(detalles => {
          this.detallesCompra = detalles;
        });
      }
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
        if (this.compraSeleccionada) {
          this.detallePedidoCompraService.getDetallesPorCompra(this.compraSeleccionada.id).subscribe(detalles => {
            this.detallesCompra = detalles;
          });
        }
      });
    }
  }
  
  actualizarTotalCompra(): void {
    if (!this.compraSeleccionada) return;
    
    // Calcular el total a partir de los detalles
    let total = 0;
    this.detallesCompra.forEach(detalle => {
      total += detalle.subtotal;
    });
    
    // Guardar una referencia segura al ID
    const compraId = this.compraSeleccionada.id;
    
    // Actualizar el campo importe_total de la compra
    const compraActualizada: CompraDTO = {
      fecha: this.compraSeleccionada.fecha,
      estado: this.compraSeleccionada.estado,
      importe_total: total,
      importe_descuento: this.compraSeleccionada.importe_descuento,
      proveedorId: this.compraSeleccionada.proveedorId,
      usuarioId: this.compraSeleccionada.usuarioId,
      observaciones: this.compraSeleccionada.observaciones
    };
    
    this.comprasService.updateCompra(compraId, compraActualizada).subscribe(() => {
      // Actualizar la compra seleccionada con el nuevo total
      if (this.compraSeleccionada) {
        this.compraSeleccionada.importe_total = total;
      }
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
      estado: nuevoEstado,
      importe_total: compra.importe_total,
      importe_descuento: compra.importe_descuento,
      proveedorId: compra.proveedorId,
      usuarioId: compra.usuarioId,
      observaciones: compra.observaciones
    };
    
    this.comprasService.updateCompra(compra.id, compraDTO).subscribe(() => {
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
    this.nuevosDetalles = [];
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
      estado: 'PENDIENTE',
      importe_total: 0,
      importe_descuento: 0,
      proveedorId: 0,
      usuarioId: this.authService.obtenerUsuarioId(),
      observaciones: ''
    };
    this.nuevosDetalles = [];
  }
  
  limpiarFormularioDetalle(): void {
    const compraId = this.compraSeleccionada ? this.compraSeleccionada.id : 0;
    
    this.nuevoDetalle = {
      compraId: compraId,
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