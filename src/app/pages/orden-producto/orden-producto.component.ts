import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { ProductoService } from '../../services/producto.service';
import { NgxDropzoneModule } from 'ngx-dropzone';
import { map, Observable } from 'rxjs';
import { UserService } from '../../services/user.service';
import { OrdenPreproductoComponent } from '../orden-preproducto/orden-preproducto.component';
import { OrdenPrepreproductoService } from '../../services/orden-preproducto.service';
import { OrdenProductoService } from '../../services/orden-producto.service';
import { AuthService } from '../../services/auth.service';
import { OrdenProducto, OrdenProductoDTO, ESTADOS_ORDEN } from '../../models/orden-producto.model';

@Component({
  selector: 'app-orden-producto',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './orden-producto.component.html',
  styleUrl: './orden-producto.component.css'
})
export class OrdenProductoComponent implements OnInit {
  ordenesPreproductos: any[] = [];
  ordenesProductos: OrdenProducto[] = [];
  productos: any[] = [];
  Filtrados: OrdenProducto[] = [];
  filtro: string = '';
  cantidad: number = 0;
  estadosOrden = ESTADOS_ORDEN;
  productoSeleccionado: any = null;

  ordenNuevo: OrdenProductoDTO = {
    descripcion: '',
    cantidad: 0,
    fecha: new Date().toISOString(),
    estado: 'En proceso',
    usuarioId: 0,
    productoId: 0
  };

  ordenEdit: OrdenProducto = {
    id: 0,
    descripcion: '',
    cantidad: 0,
    fecha: new Date().toISOString(),
    estado: 'En proceso',
    usuarioId: 0,
    productoId: 0
  };

  // Control de modales
  isModalNuevoOpen: boolean = false;
  isModalEditarOpen: boolean = false;

  constructor(
    private productoService: ProductoService,
    private userService: UserService,
    private ordenProductoService: OrdenProductoService,
    private ordenPreproductoService: OrdenPrepreproductoService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.obtenerProductos();
    this.obtenerOrdenes();
  }

  obtenerOrdenes(): void {
    Swal.fire({ title: 'Cargando órdenes...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

    this.ordenProductoService.getOrdenesProductos().subscribe({
      next: (data) => {
        this.ordenesProductos = data;
        this.Filtrados = data;
        Swal.close();
      },
      error: (err) => {
        console.error('Error al obtener las órdenes', err);
        Swal.fire('Error', 'No se pudieron cargar las órdenes', 'error');
      }
    });
  }

  obtenerProductos(): void {
    Swal.fire({ title: 'Cargando productos...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

    this.productoService.getProductos().subscribe({
      next: (data) => {
        this.productos = data;
        Swal.close();
      },
      error: (err) => {
        console.error('Error al obtener productos', err);
        Swal.fire('Error', 'No se pudieron cargar los productos', 'error');
      }
    });
  }

  filtrar(): void {
    const termino = this.filtro.trim().toLowerCase();
    this.Filtrados = termino
      ? this.ordenesProductos.filter(p => p.descripcion.toLowerCase().includes(termino))
      : this.ordenesProductos;
  }

  abrirModalNuevo(): void {
    this.ordenNuevo = {
      descripcion: '',
      cantidad: 0,
      fecha: new Date().toISOString(),
      estado: 'En proceso',
      usuarioId: this.authService.obtenerUsuarioId(),
      productoId: 0
    };
    this.isModalNuevoOpen = true;
  }

  cerrarModalNuevo(): void {
    this.isModalNuevoOpen = false;
  }

  crearOrden(): void {
    if (!this.ordenNuevo.productoId) {
      Swal.fire('Error', 'Debe seleccionar un producto', 'error');
      return;
    }

    Swal.fire({
      title: 'Creando orden...',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    });

    this.ordenProductoService.createOrdenProducto(this.ordenNuevo).subscribe({
      next: (resp) => {
        Swal.fire({
          position: "center",
          icon: "success",
          title: "Orden creada exitosamente!",
          showConfirmButton: false,
          timer: 2500
        });
        this.obtenerOrdenes();
        this.cerrarModalNuevo();
      },
      error: (err) => {
        console.error('Error al crear la orden', err);
        Swal.fire('Error', 'No se pudo crear la orden', 'error');
      }
    });
  }

  abrirModalEditar(orden: OrdenProducto): void {
    this.ordenEdit = { ...orden };
    this.isModalEditarOpen = true;
  }

  cerrarModalEditar(): void {
    this.isModalEditarOpen = false;
  }

  actualizarOrden(): void {
    const ordenActualizada: OrdenProducto = {
      ...this.ordenEdit,
      usuarioId: this.ordenEdit.usuarioId, // Mantenemos el mismo usuario
      productoId: this.ordenEdit.productoId // Mantenemos el mismo producto
    };

    Swal.fire({
      title: 'Actualizando orden...',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    });

    this.ordenProductoService.updateOrdenProducto(ordenActualizada.id, ordenActualizada).subscribe({
      next: () => {
        Swal.fire({
          position: "center",
          icon: "success",
          title: "Orden actualizada exitosamente!",
          showConfirmButton: false,
          timer: 2500
        });
        this.obtenerOrdenes();
        this.cerrarModalEditar();
      },
      error: (err) => {
        console.error('Error al actualizar la orden', err);
        Swal.fire('Error', 'No se pudo actualizar la orden', 'error');
      }
    });
  }
}
