import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { ProductoService } from '../../services/producto.service';

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './productos.component.html',
  styleUrl: './productos.component.css'
})
export class ProductosComponent {
  productos: any[] = [];
  productosFiltrados: any[] = [];
  filtro: string = '';
  cantidadProducida: number = 0;
  disponibilidad: boolean | null = null;

  productoNuevo: any = {
    nombre: '',
    descripcion: '',
    precioUnitario: 0,
    stock: 0,
    stock_minimo: 0,
    imagen: '',
    tiempo: ''
  };

  productoEdit: any = {
    id: 0,
    nombre: '',
    descripcion: '',
    precioUnitario: 0,
    stock: 0,
    stock_minimo: 0,
    imagen: '',
    tiempo: ''
  };

  //Variables para la actualizacion de la imagen o stock
  productoSeleccionado: any = null;
  nuevaImagen: string = '';
  nuevoStock: number = 0;
  editandoStock: boolean = false;
  editandoImagen: boolean = false;
  isModalActualizarOpen: boolean = false;

  // Control de modales
  isModalNuevoOpen: boolean = false;
  isModalEditarOpen: boolean = false;

  constructor(private productoService: ProductoService) { }

  ngOnInit(): void {
    this.obtenerProductos();
  }

  obtenerProductos(): void {
    Swal.fire({ title: 'Cargando productos...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

    this.productoService.getProductos().subscribe({
      next: (data) => {
        this.productos = data;
        this.productosFiltrados = data;
        Swal.close();
      },
      error: (err) => {
        console.error('Error al obtener productos', err);
        Swal.close();
      }
    });
  }

  filtrarProductos(): void {
    const termino = this.filtro.trim().toLowerCase();
    this.productosFiltrados = termino
      ? this.productos.filter(p => p.nombre.toLowerCase().includes(termino))
      : this.productos;
  }

  abrirModalNuevo(): void {
    this.productoNuevo = { nombre: '', descripcion: '', precio: 0, stock: 0, stockMinimo: 1, imagen: '', tiempo: '' };
    this.isModalNuevoOpen = true;
  }

  cerrarModalNuevo(): void {
    this.isModalNuevoOpen = false;
  }

  crearProducto(): void {
    this.productoService.createProducto(this.productoNuevo).subscribe({
      next: () => {
        Swal.fire('¡Registrado!', 'Producto creado exitosamente.', 'success');
        this.obtenerProductos();
        this.cerrarModalNuevo();
      },
      error: (err) => {
        console.error(err);
        Swal.fire('Error', 'No se pudo registrar el producto.', 'error');
      }
    });
  }

  abrirModalEditar(producto: any): void {
    this.productoEdit = { ...producto };
    this.isModalEditarOpen = true;
  }

  cerrarModalEditar(): void {
    this.isModalEditarOpen = false;
  }

  actualizarProducto(): void {
    this.productoService.updateProducto(this.productoEdit.id, this.productoEdit).subscribe({
      next: () => {
        Swal.fire('¡Actualizado!', 'Producto actualizado correctamente.', 'success');
        this.obtenerProductos();
        this.cerrarModalEditar();
      },
      error: (err) => {
        console.error(err);
        Swal.fire('Error', 'No se pudo actualizar el producto.', 'error');
      }
    });
  }

  eliminarProducto(producto: any): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `Eliminarás el producto: ${producto.nombre}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.productoService.deleteProducto(producto.id).subscribe({
          next: () => {
            Swal.fire('¡Eliminado!', 'Producto eliminado exitosamente.', 'success');
            this.obtenerProductos();
          },
          error: (err) => {
            console.error(err);
            Swal.fire('Error', 'No se pudo eliminar el producto.', 'error');
          }
        });
      }
    });
  }

  actualizarImagen(): void {
    if (!this.nuevaImagen.trim()) return;

    this.productoService.updateImageProducto(this.productoSeleccionado.id, this.nuevaImagen).subscribe({
      next: (resp: any) => {
        if (resp) {
          this.obtenerProductos();
          Swal.fire({
            position: "center",
            icon: "success",
            title: "¡Imagen actualizada!",
            showConfirmButton: false,
            timer: 2500
          }).then(() => {
            this.cerrarModalActualizar();
          });
        }
      },
      error: (err) => {
        console.error(err);
        Swal.fire('Error', 'No se pudo actualizar la imagen.', 'error');
      }
    });
  }


  actualizarStock(): void {
    if (this.nuevoStock < 0) return;
    this.productoService.updateStockProducto(this.productoSeleccionado.id, this.nuevoStock).subscribe({
      next: (resp: any) => {
        if (resp) {
          this.obtenerProductos();
          Swal.fire({
            position: "center",
            icon: "success",
            title: "¡Stock actualizado!",
            showConfirmButton: false,
            timer: 2500
          }).then(() => {
            this.cerrarModalActualizar();
          });
        }
      },
      error: (err) => {
        console.error(err);
        Swal.fire('Error', 'No se pudo actualizar el stock.', 'error');
      }
    });
  }

  registrarProduccion(): void {
    if (this.cantidadProducida <= 0) return;

    this.productoService.registerProduction(this.productoSeleccionado.id, this.cantidadProducida).subscribe({
      next: () => {
        Swal.fire('¡Producción registrada!', 'La cantidad producida fue añadida al stock.', 'success');
        this.obtenerProductos();
        //this.cerrarModalProduccion();
      },
      error: (err) => {
        console.error(err);
        Swal.fire('Error', 'No se pudo registrar la producción.', 'error');
      }
    });
  }

  verificarDisponibilidadProducto(producto: any, cantidad: number): void {
    this.productoService.verificarDisponibilidad(producto.id, cantidad).subscribe({
      next: (resp) => {
        this.disponibilidad = resp.disponible;
        Swal.fire({
          title: 'Disponibilidad',
          text: resp.disponible ? 'Producto disponible' : 'Producto NO disponible',
          icon: resp.disponible ? 'success' : 'warning',
          confirmButtonText: 'OK'
        });
      },
      error: (err) => {
        console.error(err);
        Swal.fire('Error', 'No se pudo verificar la disponibilidad.', 'error');
      }
    });
  }

  abrirModalActualizar(producto: any): void {
    this.productoSeleccionado = producto;
    this.editandoImagen = false;
    this.editandoStock = false;
    this.nuevaImagen = producto.imagen || '';
    this.nuevoStock = producto.stock;
    this.isModalActualizarOpen = true;
  }

  cerrarModalActualizar(): void {
    this.isModalActualizarOpen = false;
  }
}
